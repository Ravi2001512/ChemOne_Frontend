import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  @keyframes blobA {
    0%,100%{ transform:translate(0,0) scale(1); }
    40%    { transform:translate(50px,-40px) scale(1.12); }
    70%    { transform:translate(-25px,30px) scale(.9); }
  }
  @keyframes blobB {
    0%,100%{ transform:translate(0,0) scale(1); }
    35%    { transform:translate(-60px,25px) scale(.93); }
    65%    { transform:translate(35px,-50px) scale(1.07); }
  }
  @keyframes fadeUp {
    from{ opacity:0; transform:translateY(20px); }
    to  { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%  { background-position:-200% center; }
    100%{ background-position: 200% center; }
  }
  @keyframes spinR { to{ transform:rotate(360deg); } }
  @keyframes checkDraw {
    from{ stroke-dashoffset:60; }
    to  { stroke-dashoffset:0;  }
  }
  @keyframes pulseRing {
    0%  { transform:scale(1);   opacity:.6; }
    70% { transform:scale(1.4); opacity:0;  }
    100%{ transform:scale(1.4); opacity:0;  }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }

  .font-syne { font-family:'Syne',sans-serif; }
  .font-dm   { font-family:'DM Sans',sans-serif; }
  .blob-a    { animation:blobA 16s ease-in-out infinite; }
  .blob-b    { animation:blobB 20s ease-in-out infinite; }
  .card-in   { animation:fadeUp .65s cubic-bezier(.22,.68,0,1.2) both; }
  .animate-shake { animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both; }
  .success-in{ animation:fadeUp .55s ease both; }
  .shimmer-layer {
    background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%);
    background-size:200% auto;
    animation:shimmer 2.4s linear infinite;
  }
  .spinner   { animation:spinR .65s linear infinite; }
  .check-draw{
    stroke-dasharray:60;
    stroke-dashoffset:60;
    animation:checkDraw .5s .25s ease forwards;
  }
  .pulse-ring{ animation:pulseRing 1.5s ease-out infinite; }

  .feature-item { animation:fadeUp .45s ease both; }
  .feature-item:nth-child(1){ animation-delay:.08s; }
  .feature-item:nth-child(2){ animation-delay:.16s; }
  .feature-item:nth-child(3){ animation-delay:.24s; }
  .feature-item:nth-child(4){ animation-delay:.32s; }
`;

/* ── password strength ── */
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return [
    null,
    { label: "Weak", bar: "bg-red-500", text: "text-red-400" },
    { label: "Fair", bar: "bg-orange-400", text: "text-orange-400" },
    { label: "Good", bar: "bg-yellow-400", text: "text-yellow-400" },
    { label: "Strong", bar: "bg-emerald-400", text: "text-emerald-400" },
    { label: "Excellent", bar: "bg-sky-400", text: "text-sky-400" },
  ][Math.max(1, Math.min(s, 5))];
}

/* shared input class */
const inp =
  "w-full pl-9 pr-4 py-[11px] rounded-xl bg-slate-950 border border-white/[.07] text-slate-100 text-sm font-dm placeholder-slate-600 outline-none transition-all duration-200 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/[.18] focus:bg-[#080c14]";

/* ── Field wrapper ── */
function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-dm text-[10.5px] font-semibold tracking-[.11em] uppercase text-slate-600">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[.85rem] opacity-35 pointer-events-none select-none">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════ COMPONENT ═══════════════════ */
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email address.");
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
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      console.error("Signup error:", err);
      const msg = err.response?.data?.message || err.message || "An unexpected server error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pw = getStrength(form.password);

  /* ── SUCCESS ── */
  if (success) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div className="min-h-screen flex items-center justify-center bg-[#07080f] font-dm">
          <div className="success-in text-center px-6">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="pulse-ring absolute inset-0 rounded-full bg-emerald-400/20" />
              <svg viewBox="0 0 80 80" className="relative z-10 w-20 h-20">
                <circle cx="40" cy="40" r="36"
                  className="fill-emerald-400/10 stroke-emerald-400" strokeWidth="1.8" />
                <polyline points="24,42 35,53 57,30"
                  className="check-draw fill-none stroke-emerald-400"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-syne text-3xl font-extrabold text-white tracking-tight mb-2">
              You're in!
            </h2>
            <p className="text-slate-500 text-sm">Account created — redirecting to login…</p>
          </div>
        </div>
      </>
    );
  }

  /* ── MAIN ── */
  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="font-dm min-h-screen flex items-center justify-center bg-[#07080f] p-4 relative overflow-hidden">

        {/* ── Blobs ── */}
        <div className="blob-a absolute -top-32 -left-36 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 opacity-[.13] blur-[90px] pointer-events-none" />
        <div className="blob-b absolute -bottom-28 -right-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-violet-500 to-pink-500 opacity-[.12] blur-[80px] pointer-events-none" />
        <div className="blob-a absolute top-1/2 left-1/2 w-60 h-60 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 opacity-[.07] blur-[70px] pointer-events-none" />

        {/* ── Card ── */}
        <div className="card-in relative z-10 flex w-full max-w-[960px] min-h-[580px] rounded-3xl overflow-hidden border border-white/[.06] shadow-[0_32px_80px_rgba(0,0,0,.6)]">

          {/* ════ LEFT ════ */}
          <div
            className="hidden md:flex flex-col justify-between w-[46%] p-10 relative overflow-hidden border-r border-white/[.06]"
            style={{ background: "linear-gradient(145deg,#0d1226 0%,#111827 50%,#0a0f1e 100%)" }}
          >
            {/* grid */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            {/* glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 20% 25%,rgba(99,102,241,.2) 0%,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(167,139,250,.14) 0%,transparent 50%)",
              }}
            />

            {/* Body */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
              <h2 className="font-syne text-[1.85rem] font-extrabold leading-[1.15] text-white tracking-tight mb-8">
                මේක{" "}
                <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                  වෙනමම
                </span>
                <br />chemistryයක්
              </h2>
              <div className="relative w-full max-w-xs mx-auto">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                {/* The actual image */}
                <img
                  src="/ashan.jpeg"
                  alt="ChemOne Profile"
                  className="relative z-10 w-full object-cover rounded-2xl shadow-2xl border border-white/10 transition-transform hover:scale-105 duration-300"
                />
              </div>
            </div>
            <h2 className="font-syne text-[1.85rem] font-extrabold leading-[1.15] text-white tracking-tight mb-8">
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent position-center">
                ASHAN UMAYANGA
              </span>
            </h2>

            <p className="relative z-10 text-[.72rem] text-slate-700">
              © 2026 ChemOne. All rights reserved.
            </p>
          </div>

          {/* ════ RIGHT ════ */}
          <div className="flex-1 bg-[#0e1018] px-8 py-10 md:px-10 flex flex-col justify-center overflow-y-auto">

            <div className="mb-7">
              <h2 className="font-syne text-[1.7rem] font-extrabold tracking-tight text-white">
                Create Account
              </h2>
              <p className="text-slate-500 text-sm mt-1">Start your chemistry journey today</p>
            </div>

            {/* Error */}
            {error && (
              <div className="animate-shake flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3.5 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <span className="text-lg">⚠️</span>
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">

              {/* Name */}
              <Field label="Full Name" icon="👤">
                <input className={inp} type="text" name="name"
                  placeholder="Jane Doe" value={form.name} onChange={change} autoComplete="name" />
              </Field>

              {/* Email */}
              <Field label="Email" icon="✉">
                <input className={inp} type="email" name="email"
                  placeholder="jane@example.com" value={form.email} onChange={change} autoComplete="email" />
              </Field>

              {/* Passwords */}
              <div className="flex flex-col gap-1.5">
                <label className="font-dm text-[10.5px] font-semibold tracking-[.11em] uppercase text-slate-600">
                  Password
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[.85rem] opacity-35 pointer-events-none">🔒</span>
                    <input className={`${inp} pr-9`} type={showPw ? "text" : "password"}
                      name="password" placeholder="Password"
                      value={form.password} onChange={change} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-35 hover:opacity-75 transition-opacity">
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[.85rem] opacity-35 pointer-events-none">🔒</span>
                    <input className={`${inp} pr-9`} type={showCpw ? "text" : "password"}
                      name="confirmPassword" placeholder="Confirm"
                      value={form.confirmPassword} onChange={change} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowCpw(!showCpw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm opacity-35 hover:opacity-75 transition-opacity">
                      {showCpw ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Strength */}
                {form.password && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i}
                        className={`flex-1 h-[3px] rounded-full transition-all duration-300 ${i <= pw.level ? pw.bar : "bg-slate-800"
                          }`}
                      />
                    ))}
                    <span className={`font-dm text-[.7rem] font-semibold tracking-wide min-w-[52px] text-right ${pw.text}`}>
                      {pw.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Role & Batch */}
              <div className={form.role === "student" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "w-full"}>
                <Field label="I am a…" icon="🎓">
                  <select
                    className={`${inp} appearance-none cursor-pointer pr-8`}
                    name="role" value={form.role} onChange={change}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">▾</span>
                </Field>

                {form.role === "student" && (
                  <Field label="Batch" icon="📅">
                    <select
                      className={`${inp} appearance-none cursor-pointer pr-8`}
                      name="batch" value={form.batch} onChange={change}
                    >
                      <option value="">Select Batch</option>
                      <option value="2026">2026 Batch</option>
                      <option value="2027">2027 Batch</option>
                      <option value="2028">2028 Batch</option>
                      <option value="2029">2029 Batch</option>
                      <option value="2030">2030 Batch</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">▾</span>
                  </Field>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative mt-2 w-full py-3.5 rounded-xl font-syne font-bold text-[.95rem] tracking-wide text-white overflow-hidden transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(99,102,241,.55)] active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg,#3b82f6 0%,#6366f1 55%,#8b5cf6 100%)",
                  boxShadow: "0 4px 20px rgba(99,102,241,.38)",
                }}
              >
                <span className="shimmer-layer absolute inset-0 rounded-xl" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading && (
                    <span className="spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" />
                  )}
                  {loading ? "Creating Account…" : "Create Account →"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5 text-slate-700 text-xs font-dm">
              <div className="flex-1 h-px bg-white/[.06]" />
              or
              <div className="flex-1 h-px bg-white/[.06]" />
            </div>

            <p className="text-center font-dm text-slate-500 text-sm">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-sky-400 hover:text-sky-300 cursor-pointer hover:underline transition-colors font-medium"
              >
                Sign in
              </span>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}