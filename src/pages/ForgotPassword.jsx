import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import API from "../services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      setError("");
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the 6-digit OTP sent to your email.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const res = await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-grotesk min-h-screen flex items-center justify-center bg-ink p-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="animate-float-orb w-[500px] h-[500px] absolute -top-[180px] -left-[150px] rounded-full blur-[80px] pointer-events-none bg-acid/5" />
      <div className="animate-float-orb w-[380px] h-[380px] absolute -bottom-[120px] -right-[100px] rounded-full blur-[80px] pointer-events-none bg-indigo-500/10 [animation-delay:-7s]" />

      {/* Main Card */}
      <div className="animate-fade-slide relative z-10 w-full max-w-[440px] bg-ink/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
        
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-2 h-2 rounded-full bg-acid shadow-[0_0_10px_rgba(200,242,48,0.35)] animate-pulse-acid" />
          <span className="font-mono text-[11px] text-sub tracking-widest uppercase">Security Portal // 03</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="font-bebas text-[3rem] text-white tracking-wider leading-none mb-2">
            {success ? "SUCCESS" : "RESET PASS"}
          </h2>
          <p className="text-sub text-[13px]">
            {success 
              ? "Your access has been restored." 
              : step === 1 
                ? "Recover your chemistry dashboard" 
                : "Enter the code sent to your email"}
          </p>
        </div>

        {error && (
          <div className="animate-shake font-mono flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[12px] rounded-lg p-3.5 mb-6">
            <span className="opacity-70 shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-acid/10 border border-acid/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-acid" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Verification Complete</h3>
            <p className="text-sub text-sm mb-8">Password has been updated. Secure protocols active.</p>
            <div className="font-mono text-[10px] text-acid animate-pulse tracking-widest uppercase">
              Redirecting to sign in...
            </div>
          </div>
        ) : (
          <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="flex flex-col gap-5">
            {step === 1 ? (
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-sub">
                  // email_address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sub group-focus-within:text-acid transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-acid"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-sub">
                    // security_otp
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sub group-focus-within:text-acid transition-colors" />
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="input-acid text-center tracking-[0.5em] font-mono"
                      placeholder="000000"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-sub">
                    // new_password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sub group-focus-within:text-acid transition-colors" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-acid"
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[10px] font-semibold tracking-widest uppercase text-sub">
                    // confirm_password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sub group-focus-within:text-acid transition-colors" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-acid"
                      placeholder="Repeat password"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-acid mt-2">
              <div className="flex items-center justify-center gap-2.5 relative z-10">
                {loading && <span className="animate-spin-cw w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full" />}
                {loading ? "PROCESSING..." : step === 1 ? "SEND OTP →" : "UPDATE PASSWORD →"}
              </div>
            </button>
            
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-mono text-[10px] text-sub hover:text-acid transition-colors flex items-center justify-center gap-1.5 uppercase tracking-widest"
              >
                <ArrowLeft className="w-3 h-3" /> back to email
              </button>
            )}
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <Link
            to="/login"
            className="text-sub hover:text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
