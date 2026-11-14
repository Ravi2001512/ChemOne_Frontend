import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Wallet,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonth = (month) => {
  const [year, monthNumber] = month.split('-');
  return `${MONTH_NAMES[Number(monthNumber) - 1]} ${year}`;
};

const ManagePaymentSlips = () => {
  const [status, setStatus] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [slipUrls, setSlipUrls] = useState({});
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const res = await API.get('/payments/admin/slips', { params: { status } });
        if (active) setSubmissions(res.data);
      } catch (err) {
        if (active) {
          toast.error(err.response?.data?.message || 'Unable to load payment slips.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSubmissions();
    return () => {
      active = false;
    };
  }, [status, reloadKey]);

  const openSlip = async (id) => {
    setWorkingId(id);
    try {
      const res = await API.get(`/payments/admin/slips/${id}/file`);
      setSlipUrls((current) => ({ ...current, [id]: res.data.url }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to open payment slip.');
    } finally {
      setWorkingId('');
    }
  };

  const reviewSlip = async (id, decision) => {
    setWorkingId(id);
    try {
      const res = await API.patch(`/payments/admin/slips/${id}/review`, {
        decision,
        reviewNote: reviewNotes[id] || '',
      });
      toast.success(res.data.message);
      setReloadKey((key) => key + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to review payment slip.');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-slate-100 pb-16">
      <AdminNavbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acid/10 border border-acid/20 text-acid text-xs font-mono mb-3">
              <Wallet className="w-4 h-4" />
              PAYMENT MANAGEMENT
            </div>
            <h1 className="text-3xl font-bebas tracking-wide text-white">
              Payment <span className="text-acid">Slips</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Review student bank-transfer receipts before marking their months paid.
            </p>
          </div>
          <label className="flex items-center gap-3 text-xs font-mono text-slate-400">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg bg-ink-lighter border border-white/10 px-3 py-2 text-white focus:border-acid focus:outline-none"
            >
              <option value="pending">Awaiting review</option>
              <option value="paid">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All submissions</option>
            </select>
          </label>
        </div>

        <div className="mb-5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-blue-200/80">
          Payment slips are available to admins only. Opened links expire after five minutes.
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-acid animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-ink-lighter border border-white/10">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="font-grotesk text-white">No payment slips found</p>
            <p className="text-xs text-slate-500 mt-1">
              New student uploads will appear here for verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <article
                key={submission.id}
                className="bg-ink-lighter border border-white/10 rounded-2xl p-4 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h2 className="font-grotesk font-bold text-white">
                        {submission.studentName}
                      </h2>
                      <span className="px-2 py-0.5 rounded-md bg-acid/10 border border-acid/20 text-acid text-[10px] font-mono">
                        {submission.indexNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase ${
                          submission.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-300'
                            : submission.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'bg-rose-500/10 text-rose-300'
                        }`}
                      >
                        {submission.status === 'paid' ? 'Approved' : submission.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white/[0.03]">
                        <p className="text-slate-500 mb-1">Months</p>
                        <p className="text-white">
                          {submission.months.map(formatMonth).join(', ')}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03]">
                        <p className="text-slate-500 mb-1">Amount</p>
                        <p className="text-acid font-bold">
                          Rs. {submission.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03]">
                        <p className="text-slate-500 mb-1">Submitted</p>
                        <p className="text-white">
                          {new Date(submission.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {submission.reviewNote && (
                      <p className="mt-3 text-xs text-slate-400">
                        Review note: {submission.reviewNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:w-56">
                    {slipUrls[submission.id] ? (
                      <a
                        href={slipUrls[submission.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-200 text-sm hover:bg-blue-500/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open payment slip
                      </a>
                    ) : (
                      <button
                        onClick={() => openSlip(submission.id)}
                        disabled={workingId === submission.id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white hover:bg-white/5 disabled:opacity-50"
                      >
                        {workingId === submission.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        Get secure slip link
                      </button>
                    )}

                    {submission.status === 'pending' && (
                      <>
                        <textarea
                          value={reviewNotes[submission.id] || ''}
                          onChange={(event) =>
                            setReviewNotes((current) => ({
                              ...current,
                              [submission.id]: event.target.value,
                            }))
                          }
                          maxLength={500}
                          rows={2}
                          placeholder="Optional note for rejection"
                          className="w-full resize-y rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-acid focus:outline-none"
                        />
                        <button
                          onClick={() => reviewSlip(submission.id, 'approve')}
                          disabled={workingId === submission.id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 text-sm hover:bg-emerald-500/25 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve payment
                        </button>
                        <button
                          onClick={() => reviewSlip(submission.id, 'reject')}
                          disabled={workingId === submission.id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm hover:bg-rose-500/20 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject slip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
          className="mt-5 inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh submissions
        </button>
      </main>
    </div>
  );
};

export default ManagePaymentSlips;
