import { useEffect, useState } from 'react';
import { CreditCard, Landmark, Loader2, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../services/api';

const EMPTY_SETTINGS = {
  classFees: {
    theory: '2500',
    revision: '2500',
    paper: '2500',
  },
  bankDetails: {
    bankName: '',
    branch: '',
    accountName: '',
    accountNumber: '',
  },
};

const PaymentSettings = () => {
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [paymentSlipStorageEnabled, setPaymentSlipStorageEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await API.get('/payments/config');
        setSettings({
          classFees: Object.fromEntries(
            ['theory', 'revision', 'paper'].map((classType) => [
              classType,
              String(res.data.classFees?.[classType] ?? res.data.monthlyFee ?? 2500),
            ])
          ),
          bankDetails: res.data.bankDetails,
        });
        setPaymentSlipStorageEnabled(res.data.paymentSlipStorageEnabled);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load payment settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateBankDetail = (field, value) => {
    setSettings((current) => ({
      ...current,
      bankDetails: { ...current.bankDetails, [field]: value },
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/payments/settings', {
        classFees: settings.classFees,
        bankDetails: settings.bankDetails,
      });
      setSettings({
        classFees: Object.fromEntries(
          ['theory', 'revision', 'paper'].map((classType) => [
            classType,
            String(res.data.classFees[classType]),
          ])
        ),
        bankDetails: res.data.bankDetails,
      });
      toast.success(res.data.message || 'Payment settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save payment settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-slate-100 pb-16">
      <AdminNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acid/10 border border-acid/20 text-acid text-xs font-mono mb-3">
            <CreditCard className="w-4 h-4" />
            PAYMENT MANAGEMENT
          </div>
          <h1 className="text-3xl font-bebas tracking-wide text-white">
            Payment <span className="text-acid">Settings</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
          Set each class fee and the bank account shown on the student payment page.
          </p>
        </div>

        <div
          className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
            paymentSlipStorageEnabled
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              {paymentSlipStorageEnabled
                ? 'Payment slip storage is configured'
                : 'Payment slip storage is not configured'}
            </p>
            {!paymentSlipStorageEnabled && (
              <p className="mt-1 text-xs opacity-80">
                Set PAYMENT_SLIPS_BUCKET_NAME to a private Google Cloud Storage bucket in the backend environment, and configure credentials with access to that bucket. Restart the backend after updating its environment.
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={saveSettings}
          className="bg-ink-lighter border border-white/10 rounded-2xl p-5 sm:p-7 space-y-7"
        >
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center text-acid">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-grotesk font-bold text-white">Class fees</h2>
                <p className="text-xs text-slate-400">Students pay only for the class options they select.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                ['theory', 'Theory'],
                ['revision', 'Revision'],
                ['paper', 'Paper'],
              ].map(([classType, label]) => (
                <label key={classType}>
                  <span className="block text-xs font-mono text-slate-400 mb-1.5">
                    {label} fee (LKR)
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    max="10000000"
                    step="0.01"
                    required
                    disabled={loading}
                    value={settings.classFees[classType]}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        classFees: {
                          ...current.classFees,
                          [classType]: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:border-acid focus:outline-none disabled:opacity-50"
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="h-px bg-white/10" />

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-grotesk font-bold text-white">Bank transfer account</h2>
                <p className="text-xs text-slate-400">All account details are required and displayed as the manual payment option for students.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['bankName', 'Bank name'],
                ['branch', 'Branch'],
                ['accountName', 'Account name'],
                ['accountNumber', 'Account number'],
              ].map(([field, label]) => (
                <label key={field}>
                  <span className="block text-xs font-mono text-slate-400 mb-1.5">
                    {label}
                  </span>
                  <input
                    type="text"
                    maxLength={100}
                    required
                    required
                    disabled={loading}
                    value={settings.bankDetails[field]}
                    onChange={(event) => updateBankDetail(field, event.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-white focus:border-acid focus:outline-none disabled:opacity-50"
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end border-t border-white/10 pt-5">
            <button
              type="submit"
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-acid text-ink font-grotesk font-bold text-sm shadow-lg shadow-acid/20 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save payment settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PaymentSettings;
