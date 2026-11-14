import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Receipt,
  Wallet,
  Calendar,
  Shield,
  Copy,
  Check,
  Banknote,
  ArrowRight,
  Sparkles,
  Info,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  FileText,
  UserRound,
  Fingerprint,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ───────────────────────── constants ───────────────────────── */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CLASS_FEE = 2500; // LKR per month

/* ───────────────────────── component ───────────────────────── */
const OnlinePayment = () => {
  const navigate = useNavigate();

  /* ── auth ── */
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  }, []);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token || !currentUser) {
      navigate('/login', { replace: true });
    } else if (currentUser.role !== 'student') {
      navigate('/admin', { replace: true });
    }
  }, [token, currentUser, navigate]);

  /* ── state ── */
  const [paidMonths, setPaidMonths] = useState([]);
  const [pendingMonths, setPendingMonths] = useState([]);
  const [rejectedMonths, setRejectedMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [monthlyFee, setMonthlyFee] = useState(CLASS_FEE);
  const [paymentSlipStorageEnabled, setPaymentSlipStorageEnabled] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    branch: '',
    accountName: '',
    accountNumber: '',
  });
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [copied, setCopied] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [studentDetails, setStudentDetails] = useState({
    studentName: currentUser?.name || '',
    indexNumber: currentUser?.indexNumber || '',
  });
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [slipPreview, setSlipPreview] = useState('');
  const [mounted, setMounted] = useState(false);

  /* ── generate month list (current year) ── */
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-indexed

  const monthList = useMemo(() => {
    return MONTH_NAMES.map((name, idx) => {
      const key = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
      return {
        key,
        name,
        index: idx,
        isPaid: paidMonths.includes(key),
        isPending: pendingMonths.includes(key),
        isRejected: rejectedMonths.includes(key),
        isPast: idx < currentMonth,
        isCurrent: idx === currentMonth,
        isFuture: idx > currentMonth,
      };
    });
  }, [paidMonths, pendingMonths, rejectedMonths, currentMonth, currentYear]);

  const paidCount = monthList.filter((m) => m.isPaid).length;
  const pendingCount = monthList.filter((m) => m.isPending).length;
  const unpaidCount = monthList.filter(
    (m) => !m.isPaid && !m.isPending && !m.isFuture
  ).length;

  /* ── fetch paid months ── */
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await API.get('/payments/config');
        setMonthlyFee(res.data.monthlyFee);
        setBankDetails(res.data.bankDetails);
        setPaidMonths(res.data.paidMonths || []);
        setPendingMonths(res.data.pendingMonths || []);
        setRejectedMonths(res.data.rejectedMonths || []);
        setPaymentSlipStorageEnabled(res.data.paymentSlipStorageEnabled);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load payment settings.');
      } finally {
        setLoading(false);
        requestAnimationFrame(() => setMounted(true));
      }
    };
    fetchPayments();
  }, []);

  /* ── toggle month selection ── */
  const toggleMonth = (key) => {
    setSelectedMonths((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  /* ── copy to clipboard ── */
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSlipUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Payment slip must be 5MB or smaller.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      toast.error('Upload a JPG, PNG, WebP, or PDF payment slip.');
      return;
    }
    setPaymentSlip(file);
    setSlipPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : '');
  };

  useEffect(() => () => {
    if (slipPreview) URL.revokeObjectURL(slipPreview);
  }, [slipPreview]);

  const handleSlipSubmit = async (event) => {
    event.preventDefault();
    if (selectedMonths.length === 0) {
      toast.error('Please select at least one month');
      return;
    }
    if (!paymentSlip) {
      toast.error('Upload your payment slip to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('months', JSON.stringify(selectedMonths));
      formData.append('studentName', studentDetails.studentName);
      formData.append('indexNumber', studentDetails.indexNumber);
      formData.append('slip', paymentSlip);
      const res = await API.post('/payments/slips', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message || 'Payment slip submitted for review.');
      setPendingMonths((months) => [...new Set([...months, ...selectedMonths])]);
      setShowPayModal(false);
      setSelectedMonths([]);
      setPaymentSlip(null);
      setSlipPreview('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit payment slip.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSelected = selectedMonths.length * monthlyFee;

  if (!token || !currentUser) return null;

  return (
    <div className="min-h-screen bg-ink text-slate-100 pb-16 sm:pb-20">
      <StudentNavbar />

      <main
        className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 transition-all duration-500 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Wallet className="w-3 h-3 mr-1" />
                PAYMENT CENTER
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                ChemBridge Academy
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-bebas tracking-wide text-white">
              Online <span className="text-acid">Payments</span>
            </h1>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid: {paidCount}
            </div>
            {pendingCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl border bg-blue-500/10 border-blue-500/30 text-xs font-mono text-blue-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                In review: {pendingCount}
              </div>
            )}
            {unpaidCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Due: {unpaidCount}
              </div>
            )}
            <div className="px-3 py-1.5 rounded-xl border bg-white/5 border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Rs. {monthlyFee.toLocaleString()} / month
            </div>
          </div>
        </div>

        {!loading && !paymentSlipStorageEnabled && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              Payment slip uploads are temporarily unavailable. Please contact the academy.
            </span>
          </div>
        )}

        {/* ── INFO BANNER ────────────────────────────────────── */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-ink-lighter to-acid/5 border border-blue-500/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-acid/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-grotesk font-bold text-white mb-1">
                Upload your payment slip
              </h3>
              <p className="text-xs font-grotesk text-slate-400 leading-relaxed">
                Select unpaid months, transfer the fee to the bank account below,
                then upload your payment slip with your registered name and index
                number. An admin will review it before your payment status updates.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN: MONTH GRID ─────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-ink-lighter border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-bebas tracking-wide text-white">
                    Monthly Fees — {currentYear}
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Select unpaid months to make payment
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono text-slate-400">
                    {MONTH_NAMES[currentMonth]}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-mono text-slate-400">
                    Loading payment status...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {monthList.map((month) => {
                    const isSelected = selectedMonths.includes(month.key);
                    const isSelectable =
                      !month.isPaid && !month.isPending && !month.isFuture;

                    return (
                      <button
                        key={month.key}
                        disabled={month.isPaid || month.isPending || month.isFuture}
                        onClick={() => isSelectable && toggleMonth(month.key)}
                        className={`relative group p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          month.isPaid
                            ? 'bg-emerald-500/5 border-emerald-500/30 cursor-default'
                            : month.isFuture
                            ? 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-40'
                            : month.isPending
                            ? 'bg-blue-500/5 border-blue-500/30 cursor-default'
                            : isSelected
                            ? 'bg-acid/10 border-acid shadow-lg shadow-acid/10 ring-1 ring-acid/50'
                            : month.isRejected
                            ? 'bg-rose-500/5 border-rose-500/30 hover:border-acid/50 hover:bg-acid/5 cursor-pointer'
                            : month.isCurrent
                            ? 'bg-amber-500/5 border-amber-500/30 hover:border-acid/50 hover:bg-acid/5 cursor-pointer'
                            : 'bg-white/[0.02] border-white/10 hover:border-acid/50 hover:bg-acid/5 cursor-pointer'
                        }`}
                      >
                        {/* Status indicator dot */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              month.isPaid
                                ? 'bg-emerald-400'
                                : month.isPending
                                ? 'bg-blue-400'
                                : month.isCurrent
                                ? 'bg-amber-400 animate-pulse'
                                : month.isFuture
                                ? 'bg-slate-600'
                                : 'bg-red-400'
                            }`}
                          />
                          {month.isPaid && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-acid flex items-center justify-center">
                              <Check className="w-3 h-3 text-ink" />
                            </div>
                          )}
                          {month.isCurrent &&
                            !month.isPaid &&
                            !month.isPending &&
                            !month.isRejected &&
                            !isSelected && (
                            <span className="text-[9px] font-mono tracking-wider uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              NOW
                            </span>
                          )}
                        </div>

                        {/* Month name */}
                        <p
                          className={`font-grotesk font-bold text-sm ${
                            month.isPaid
                              ? 'text-emerald-300'
                              : month.isPending
                              ? 'text-blue-300'
                              : isSelected
                              ? 'text-acid'
                              : month.isRejected
                              ? 'text-rose-300'
                              : month.isFuture
                              ? 'text-slate-600'
                              : 'text-white'
                          }`}
                        >
                          {month.name}
                        </p>

                        {/* Status label */}
                        <p
                          className={`text-[10px] font-mono mt-1 ${
                            month.isPaid
                              ? 'text-emerald-400/70'
                              : month.isPending
                              ? 'text-blue-400/70'
                              : isSelected
                              ? 'text-acid/70'
                              : month.isRejected
                              ? 'text-rose-400/70'
                              : month.isFuture
                              ? 'text-slate-600'
                              : month.isCurrent
                              ? 'text-amber-400/70'
                              : 'text-red-400/70'
                          }`}
                        >
                          {month.isPaid
                            ? '✓ Paid'
                            : month.isPending
                            ? 'Under review'
                            : month.isRejected
                            ? 'Slip rejected — resubmit'
                            : month.isFuture
                            ? 'Upcoming'
                            : isSelected
                            ? 'Selected'
                            : month.isCurrent
                            ? 'Current'
                            : 'Unpaid'}
                        </p>

                        {/* Price */}
                        {!month.isPaid && !month.isFuture && (
                          <p className="text-[11px] font-mono text-slate-500 mt-1">
                            Rs. {monthlyFee.toLocaleString()}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Selection Summary Bar ── */}
              {selectedMonths.length > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-acid/5 border border-acid/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-grotesk font-bold text-white">
                      {selectedMonths.length} month
                      {selectedMonths.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      Total:{' '}
                      <span className="text-acid font-bold">
                        Rs. {totalSelected.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPayModal(true)}
                    disabled={!paymentSlipStorageEnabled}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-acid text-ink rounded-xl font-grotesk font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-acid/20 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Banknote className="w-4 h-4" />
                    Upload payment slip
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: BANK DETAILS & SUMMARY ───────── */}
          <div className="space-y-5">
            {/* Bank Transfer Details Card */}
            <div className="bg-ink-lighter border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="w-full flex items-center justify-between mb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-grotesk font-bold text-white">
                      Bank Transfer Details
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Click to {showBankDetails ? 'hide' : 'show'}
                    </p>
                  </div>
                </div>
                {showBankDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showBankDetails && (
                <div className="mt-4 space-y-3 animate-in slide-in-from-top duration-200">
                  {[
                    { label: 'Bank', value: bankDetails.bankName, field: 'bank' },
                    { label: 'Branch', value: bankDetails.branch, field: 'branch' },
                    {
                      label: 'Account Name',
                      value: bankDetails.accountName,
                      field: 'name',
                    },
                    {
                      label: 'Account No.',
                      value: bankDetails.accountNumber,
                      field: 'account',
                    },
                  ].map((item) => (
                    <div
                      key={item.field}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <div>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        <p className="text-sm font-grotesk font-semibold text-white">
                          {item.value}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.value, item.field)}
                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-acid"
                      >
                        {copied === item.field ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}

                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] font-mono text-amber-300/80">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Include your Index Number (
                    <span className="text-amber-200 font-bold">
                      {currentUser?.indexNumber || 'N/A'}
                    </span>
                    ) as the payment reference.
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary Card */}
            <div className="bg-ink-lighter border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/30 flex items-center justify-center text-acid">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-grotesk font-bold text-white">
                    Payment Summary
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    {currentYear} academic year
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03]">
                  <span className="text-xs font-mono text-slate-400">
                    Student ID
                  </span>
                  <span className="text-xs font-mono text-acid font-bold">
                    {currentUser?.indexNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03]">
                  <span className="text-xs font-mono text-slate-400">Batch</span>
                  <span className="text-xs font-mono text-white font-semibold">
                    {currentUser?.batch || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03]">
                  <span className="text-xs font-mono text-slate-400">
                    Monthly Fee
                  </span>
                  <span className="text-xs font-mono text-white font-semibold">
                    Rs. {monthlyFee.toLocaleString()}
                  </span>
                </div>

                <div className="h-px bg-white/10 my-1" />

                <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-xs font-mono text-emerald-300">
                    Total Paid
                  </span>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    Rs. {(paidCount * monthlyFee).toLocaleString()}
                  </span>
                </div>

                {unpaidCount > 0 && (
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-red-500/5 border border-red-500/20">
                    <span className="text-xs font-mono text-red-300">
                      Outstanding
                    </span>
                    <span className="text-xs font-mono text-red-300 font-bold">
                      Rs. {(unpaidCount * monthlyFee).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <Shield className="w-5 h-5 text-acid/50 flex-shrink-0" />
              <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                Only signed-in students can upload payment slips. Uploaded slips
                are reviewed by an admin before months are marked paid.
              </p>
            </div>
          </div>
        </div>

        {/* ── PAYMENT PROGRESS BAR ────────────────────────── */}
        <div className="mt-8 bg-ink-lighter border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-grotesk font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-acid" />
              Annual Payment Progress
            </h3>
            <span className="text-xs font-mono text-acid font-bold">
              {Math.round((paidCount / 12) * 100)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-acid/80 to-acid transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              style={{ width: `${(paidCount / 12) * 100}%` }}
            />
          </div>

          {/* Mini month dots */}
          <div className="flex items-center gap-1.5 justify-between">
            {monthList.map((month) => (
              <div key={month.key} className="flex flex-col items-center gap-1">
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border transition-all ${
                    month.isPaid
                      ? 'bg-emerald-400 border-emerald-400/50 shadow-sm shadow-emerald-400/30'
                      : month.isPending
                      ? 'bg-blue-400 border-blue-400/50'
                      : month.isCurrent
                      ? 'bg-amber-400 border-amber-400/50 animate-pulse'
                      : month.isFuture
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-red-400/30 border-red-400/30'
                  }`}
                  title={`${month.name} — ${
                    month.isPaid ? 'Paid' : month.isPending ? 'Under review' : 'Unpaid'
                  }`}
                />
                <span className="text-[8px] sm:text-[9px] font-mono text-slate-600 hidden sm:block">
                  {month.name.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── PAYMENT MODAL ────────────────────────────────── */}
      {showPayModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPayModal(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-slip-title"
            className="relative bg-ink-lighter border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
          >
            <div className="sticky top-0 z-10 bg-ink-lighter border-b border-white/10 p-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/30 flex items-center justify-center text-acid">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="payment-slip-title" className="text-lg font-grotesk font-bold text-white">
                    Upload payment slip
                  </h2>
                  <p className="text-[10px] font-mono text-slate-400">
                    Submit your bank transfer for admin review
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                aria-label="Close upload form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSlipSubmit}>
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                    Paying for
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonths.map((key) => {
                      const [year, month] = key.split('-');
                      const monthIdx = parseInt(month, 10) - 1;
                      return (
                        <span
                          key={key}
                          className="px-3 py-1.5 rounded-lg bg-acid/10 border border-acid/30 text-xs font-mono text-acid font-semibold"
                        >
                          {MONTH_NAMES[monthIdx]} {year}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      Total amount
                    </span>
                    <span className="text-xl font-grotesk font-bold text-acid">
                      Rs. {totalSelected.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">
                    {selectedMonths.length} × Rs. {monthlyFee.toLocaleString()}/month
                  </p>
                </div>

                <label className="block">
                  <span className="block text-xs font-mono text-slate-400 mb-1.5">
                    <UserRound className="inline w-3.5 h-3.5 mr-1" />
                    Student name
                  </span>
                  <input
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={studentDetails.studentName}
                    onChange={(event) =>
                      setStudentDetails((details) => ({
                        ...details,
                        studentName: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-acid focus:outline-none"
                    required
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-mono text-slate-400 mb-1.5">
                    <Fingerprint className="inline w-3.5 h-3.5 mr-1" />
                    Student index number
                  </span>
                  <input
                    type="text"
                    maxLength={50}
                    value={studentDetails.indexNumber}
                    onChange={(event) =>
                      setStudentDetails((details) => ({
                        ...details,
                        indexNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:border-acid focus:outline-none"
                    required
                  />
                </label>

                <div>
                  <p className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                    Payment slip
                  </p>
                  {paymentSlip ? (
                    <div className="relative rounded-xl border border-white/10 p-3 flex items-center gap-3">
                      {slipPreview ? (
                        <img
                          src={slipPreview}
                          alt="Payment slip preview"
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-acid flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{paymentSlip.name}</p>
                        <p className="text-xs text-slate-400">
                          {(paymentSlip.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSlip(null);
                          setSlipPreview('');
                        }}
                        className="ml-auto p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                        aria-label="Remove payment slip"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-7 rounded-xl border-2 border-dashed border-white/10 hover:border-acid/30 hover:bg-acid/5 transition-all cursor-pointer">
                      <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-xs font-mono text-slate-300 text-center">
                        Choose a payment slip
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">
                        JPG, PNG, WebP, or PDF · up to 5MB
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleSlipUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="mt-2 text-[10px] text-slate-500">
                    Upload the receipt after transferring the displayed amount to the academy account.
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 z-10 bg-ink-lighter border-t border-white/10 p-5 flex flex-col sm:flex-row gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-mono text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-acid text-ink rounded-xl font-grotesk font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-acid/20 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit for verification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlinePayment;
