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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans relative overflow-hidden px-4 md:px-0">
      {/* Background Orbs */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] -top-24 -left-24 animate-pulse"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] -bottom-12 -right-12 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-500/30">
          C1
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 tracking-tight">
          Forgot Password
        </h2>
        <p className="text-slate-400 text-center mb-8 text-sm">
          {step === 1 ? "Enter your email to reset password." : "Create your new secure password."}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Password Reset Successful</h3>
            <p className="text-slate-400 text-sm mb-6">You can now login with your new password.</p>
            <p className="text-slate-500 text-xs">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={step === 1 ? handleSendOTP : handleResetPassword} className="space-y-5">
            {step === 1 ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1 animate-in slide-in-from-right-4 duration-300">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                    6-Digit OTP
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm tracking-widest text-center"
                      placeholder="123456"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 ml-1 mt-1">Check your email for the code</p>
                </div>

                <div className="space-y-1 animate-in slide-in-from-right-4 duration-300 delay-75 fill-mode-both">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                
                <div className="space-y-1 animate-in slide-in-from-right-4 duration-300 delay-75 fill-mode-both">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-white dark:bg-slate-900/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative flex items-center">
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : step === 1 ? (
                    "Continue"
                  ) : (
                    "Reset Password"
                  )}
                  {step === 1 && !loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </div>
            
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
            )}
          </form>
        )}

        <p className="text-center text-slate-400 mt-8 text-sm">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
