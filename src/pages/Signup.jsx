import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    null,
    { label: "WEAK", color: "#ef4444", bars: 1 },
    { label: "FAIR", color: "#f97316", bars: 2 },
    { label: "GOOD", color: "#eab308", bars: 3 },
    { label: "STRONG", color: "#22c55e", bars: 4 },
    { label: "EXCELLENT", color: "#c8f230", bars: 5 },
  ];
  return levels[Math.max(1, Math.min(s, 5))];
}

function Field({ label, icon, children, mono }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[10px] font-semibold tracking-[0.14em] uppercase text-sub ${mono ? "font-mono" : "font-grotesk"}`}>
        {mono ? `// ${label}` : label}
      </label>
      <div className="relative">
        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[0.82rem] opacity-40 pointer-events-none select-none">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

const TICKER_ITEMS = ["CHEMISTRY", "A/L", "ASHAN UMAYANGA", "Best Educator", "ChemBridge", "CHEMISTRY", "A/L", "ASHAN UMAYANGA", "Best Educator", "ChemBridge"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "student", batch: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  


  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const validate = () => {
    if (!form.name.trim()) return setError("Full name is required.");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) return setError("Enter a valid real email address.");
    
    // Ensure the email is a Google Mail account
    const emailDomain = form.email.split('@')[1]?.toLowerCase();
    if (emailDomain !== 'gmail.com') {
      return setError("Only real Google Mail (@gmail.com) accounts are allowed.");
    }
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (form.role === "student" && !form.batch) return setError("Please select your batch.");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError("");
    try {
      const { confirmPassword, ...payload } = form;
      await API.post("/auth/register", payload);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pw = form.password ? getStrength(form.password) : null;

  if (success) {
    return (
      <div className="font-grotesk min-h-screen flex flex-col items-center justify-center bg-ink gap-6">
        <div className="animate-success text-center">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-acid opacity-30" />
            <circle cx="45" cy="45" r="42" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeDasharray="264" strokeDashoffset="264"
              className="text-acid animate-[checkIn_.8s_.1s_ease_forwards]" />
            <polyline points="27,47 40,60 64,33" fill="none"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              className="text-acid stroke-dashoffset-[80] animate-[checkIn_.5s_.2s_ease_forwards]" />
          </svg>
          <div className="font-bebas text-[3.5rem] text-acid tracking-wider mt-4 leading-none">
            ACCOUNT CREATED
          </div>
          <div className="font-mono text-sub text-[12px] mt-1">
            redirecting to login<span className="animate-blink">_</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-grotesk min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="animate-float-orb w-[500px] h-[500px] absolute -top-[180px] -left-[150px] rounded-full blur-[80px] pointer-events-none bg-acid/5" />
      <div className="animate-float-orb w-[380px] h-[380px] absolute -bottom-[120px] -right-[100px] rounded-full blur-[80px] pointer-events-none bg-indigo-500/10 [animation-delay:-7s]" />
      <div className="animate-float-orb w-[260px] h-[260px] absolute top-[40%] right-[25%] rounded-full blur-[80px] pointer-events-none bg-acid/5 [animation-delay:-12s]" />

      {/* Noise grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_256_256%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27n%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-[length:256px_256px]" />

      {/* Top Right Login Navigation */}
      <div className="absolute top-6 right-8 z-50 flex items-center gap-4">
        <span className="font-mono hidden sm:block text-sub text-[11px] tracking-wider">
          ALREADY REGISTERED?
        </span>
        <button
          onClick={() => navigate("/login")}
          className="font-bebas px-6 py-2 bg-surface border border-white/10 rounded-lg text-white text-[1.1rem] tracking-wider cursor-pointer transition-all hover:border-acid hover:text-acid hover:bg-acid/5"
        >
          SIGN IN
        </button>
      </div>

      {/* Card */}
      <div className="animate-fade-slide relative z-10 w-full max-w-[920px] h-full max-h-[calc(100vh-32px)] rounded-2xl border border-white/10 overflow-hidden flex shadow-[0_40px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]">
        
        {/* LEFT PANEL */}
        <div className="hidden md:flex w-[44%] flex-col bg-[#0d0d0d] border-r border-white/10 relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(200,242,48,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,242,48,0.04)_1px,transparent_1px)] bg-[length:36px_36px]" />

          {/* Corner brackets */}
          <div className="absolute top-5 left-5 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-acid" />
          <div className="absolute top-5 right-5 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-acid" />
          <div className="absolute bottom-5 left-5 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-acid" />
          <div className="absolute bottom-5 right-5 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-acid" />

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between p-9 relative z-10">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-acid shadow-[0_0_10px_rgba(200,242,48,0.35)] animate-pulse-acid" />
              <span className="font-mono text-[11px] text-sub tracking-widest">ChemBridge // v2.0</span>
            </div>

            {/* Main headline */}
            <div>
              <div className="font-bebas text-[5.5rem] leading-[0.88] text-white tracking-wider mb-6">
                <div>Chem</div>
                <div className="text-acid [text-shadow:0_0_40px_rgba(200,242,48,0.35)]">Bridge</div>
              </div>

              {/* Photo */}
              <div className="relative mb-7">
                <div className="absolute -inset-[3px] rounded-[10px] bg-gradient-to-br from-acid via-transparent to-acid opacity-50" />
                <img
                  src="/ashan.jpeg"
                  alt="Ashan Umayanga"
                  className="relative z-10 w-full rounded-lg object-cover max-h-[220px] contrast-[1.05] brightness-95"
                />
                {/* Scanline overlay */}
                <div className="absolute inset-0 z-20 rounded-lg pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)]" />
              </div>

              <div className="font-bebas text-[1.45rem] tracking-[0.12em] text-acid">
                ASHAN UMAYANGA
              </div>
              <div className="font-mono text-[11px] text-sub mt-1">// chemistry educator</div>
            </div>

            {/* Stats row */}
            <div className="flex gap-5 border-t border-white/10 pt-6">
              {[["A/L", "CHEMISTRY"], ["🏆", "TOP RESULTS"]].map(([v, l], i) => (
                <div key={i} className="flex-1">
                  <div className="font-bebas text-[1.4rem] text-acid tracking-wider">{v}</div>
                  <div className="font-mono text-[9px] text-sub tracking-widest">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col justify-center p-10 bg-ink/85 backdrop-blur-[20px] h-full overflow-y-auto">
          {/* Ticker */}
          <div className="mb-8 overflow-hidden border-y border-white/10 py-1.5 -mx-10 px-10 ticker-wrap">
            <div className="animate-ticker font-bebas text-[0.72rem] tracking-[0.15em] text-sub gap-0">
              {TICKER_ITEMS.concat(TICKER_ITEMS).map((t, i) => (
                <span key={i} className="pr-8 inline-block">{t}</span>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="font-bebas text-[3rem] text-white tracking-wider leading-none">
                CREATE ACCOUNT
              </span>
              <span className="font-mono text-[10px] text-acid tracking-widest pb-1">_01</span>
            </div>
            <p className="font-grotesk text-sub text-[13px]">
              Start your chemistry journey today
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="animate-shake font-mono flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[12px] rounded-lg p-3.5 mb-5 tracking-tight">
              <span className="opacity-70 shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Full Name" icon="◈" mono>
              <input
                className="input-acid"
                type="text" name="name"
                placeholder="Ravindu Deshan"
                value={form.name} onChange={change}
                autoComplete="name"
              />
            </Field>

            <Field label="Email Address" icon="◉" mono>
              <input
                className="input-acid"
                type="email" name="email"
                placeholder="ravi@gmail.com"
                value={form.email} onChange={change}
                autoComplete="email"
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-sub">
                // Password
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: "password", placeholder: "Password", show: showPw, toggle: () => setShowPw(!showPw) },
                  { key: "confirmPassword", placeholder: "Confirm", show: showCpw, toggle: () => setShowCpw(!showCpw) },
                ].map(({ key, placeholder, show, toggle }) => (
                  <div key={key} className="relative">
                    <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[0.82rem] opacity-40 pointer-events-none">⬡</span>
                    <input
                      className="input-acid pr-9"
                      type={show ? "text" : "password"}
                      name={key}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={change}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[12px] opacity-35 text-white p-0 transition-opacity hover:opacity-75"
                    >
                      {show ? "●" : "○"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Strength indicator */}
              {pw && (
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-0.5 rounded-full flex-1 transition-colors"
                      style={{ background: i <= pw.bars ? pw.color : "var(--muted)" }}
                    />
                  ))}
                  <span className="font-mono text-[9px] tracking-widest min-w-[64px] text-right" style={{ color: pw.color }}>
                    {pw.label}
                  </span>
                </div>
              )}
            </div>

            <div className={`grid gap-3 ${form.role === "student" ? "grid-cols-2" : "grid-cols-1"}`}>
              <Field label="I Am A…" icon="◇" mono>
                <div className="relative">
                  <select
                    className="input-acid appearance-none cursor-pointer pr-8"
                    name="role" value={form.role} onChange={change}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sub text-[10px] pointer-events-none">▾</span>
                </div>
              </Field>

              {form.role === "student" && (
                <Field label="Batch Year" icon="◈" mono>
                  <div className="relative">
                    <select
                      className="input-acid appearance-none cursor-pointer pr-8"
                      name="batch" value={form.batch} onChange={change}
                    >
                      <option value="">Select Batch</option>
                      {[2026, 2027, 2028, 2029, 2030].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sub text-[10px] pointer-events-none">▾</span>
                  </div>
                </Field>
              )}
            </div>

            <button
              type="submit"
              className="btn-acid mt-1.5"
              disabled={loading}
            >
              <div className="flex items-center justify-center gap-2.5 relative z-10">
                {loading && (
                  <span className="animate-spin-cw w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full" />
                )}
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 text-muted">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="font-mono text-[10px] tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <p className="font-grotesk text-center text-sub text-[13px]">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-acid cursor-pointer font-semibold transition-opacity hover:opacity-70"
            >
              Sign in ↗
            </span>
          </p>

          <p className="font-mono text-center text-ink-lighter text-[10px] mt-5 tracking-widest">
            © 2026 CHEMONE — ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}