import { useState } from "react";
import axios from "axios";
import { API } from "../services/api";
import { useNavigate } from "react-router-dom";



function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-sub">
        {`// ${label}`}
      </label>
      <div className="relative">
        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-[0.82rem] opacity-40 pointer-events-none select-none">{icon}</span>
        {children}
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/api/auth/login`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "instructor") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("token", "guest-token");
    localStorage.setItem("user", JSON.stringify({ name: "Guest User", role: "guest", email: "guest@chembridge.com" }));
    navigate("/student");
  };

  return (
    <div className="font-grotesk min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="animate-float-orb w-[500px] h-[500px] absolute -top-[180px] -left-[150px] rounded-full blur-[80px] pointer-events-none bg-acid/5" />
      <div className="animate-float-orb w-[380px] h-[380px] absolute -bottom-[120px] -right-[100px] rounded-full blur-[80px] pointer-events-none bg-indigo-500/10 [animation-delay:-7s]" />
      <div className="animate-float-orb w-[260px] h-[260px] absolute top-[40%] right-[25%] rounded-full blur-[80px] pointer-events-none bg-acid/5 [animation-delay:-12s]" />

      {/* Noise grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.025] bg-[url('data:image/svg+xml,%3Csvg_viewBox=%270_0_256_256%27_xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter_id=%27n%27%3E%3CfeTurbulence_type=%27fractalNoise%27_baseFrequency=%270.9%27_numOctaves=%274%27_stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect_width=%27100%25%27_height=%27100%25%27_filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-[length:256px_256px]" />

      {/* Card */}
      <div className="animate-fade-slide relative z-10 w-full max-w-[920px] h-full max-h-[calc(100vh-32px)] rounded-2xl border border-white/10 overflow-hidden flex shadow-[0_40px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.05)]">

        {/* LEFT PANEL */}
        <div className="hidden md:flex w-[44%] flex-col bg-[#0d0d0d] border-r border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(200,242,48,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(200,242,48,0.04)_1px,transparent_1px)] bg-[length:36px_36px]" />

          <div className="absolute top-5 left-5 w-5 h-5 border-t-[1.5px] border-l-[1.5px] border-acid" />
          <div className="absolute top-5 right-5 w-5 h-5 border-t-[1.5px] border-r-[1.5px] border-acid" />
          <div className="absolute bottom-5 left-5 w-5 h-5 border-b-[1.5px] border-l-[1.5px] border-acid" />
          <div className="absolute bottom-5 right-5 w-5 h-5 border-b-[1.5px] border-r-[1.5px] border-acid" />

          <div className="flex-1 flex flex-col justify-between p-9 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-acid shadow-[0_0_10px_rgba(200,242,48,0.35)] animate-pulse-acid" />
              <span className="font-mono text-[11px] text-sub tracking-widest">CHEMONE // v2.0</span>
            </div>

            <div>
              <div className="font-bebas text-[5.5rem] leading-[0.88] text-white tracking-wider mb-6">
                <div>WELCOME</div>
                <div className="text-acid [text-shadow:0_0_40px_rgba(200,242,48,0.35)]">BACK</div>
              </div>

              <div className="relative mb-7">
                <div className="absolute -inset-[3px] rounded-[10px] bg-gradient-to-br from-acid via-transparent to-acid opacity-50" />
                <img src="/ashan.jpeg" alt="Ashan Umayanga" className="relative z-10 w-full rounded-lg object-cover max-h-[220px] contrast-[1.05] brightness-95" />
                <div className="absolute inset-0 z-20 rounded-lg pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_4px)]" />
              </div>

              <div className="font-bebas text-[1.45rem] tracking-[0.12em] text-acid">ASHAN UMAYANGA</div>
              <div className="font-mono text-[11px] text-sub mt-1">// chemistry educator</div>
            </div>

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
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 bg-ink/85 backdrop-blur-[20px] h-full overflow-y-auto">


          <div className="mb-7">
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="font-bebas text-[3rem] text-white tracking-wider leading-none">SIGN IN</span>
              <span className="font-mono text-[10px] text-acid tracking-widest pb-1">_02</span>
            </div>
            <p className="text-sub text-[13px]">Continue your chemistry journey</p>
          </div>

          {error && (
            <div className="animate-shake font-mono flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[12px] rounded-lg p-3.5 mb-5 tracking-tight">
              <span className="opacity-70 shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email Address" icon="◉">
              <input
                className="input-acid"
                type="email" name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </Field>

            <Field label="Password" icon="⬡">
              <div className="relative">
                <input
                  className="input-acid pr-9"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[12px] opacity-35 text-white p-0 transition-opacity hover:opacity-75"
                >
                  {showPassword ? "●" : "○"}
                </button>
              </div>
            </Field>

            <button type="submit" className="btn-acid mt-1.5" disabled={loading}>
              <div className="flex items-center justify-center gap-2.5 relative z-10">
                {loading && <span className="animate-spin-cw w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full" />}
                {loading ? "SIGNING IN..." : "SIGN IN →"}
              </div>
            </button>
          </form>

          <div className="flex items-center gap-3 my-5 text-muted">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="font-mono text-[10px] tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full p-4 border border-acid rounded-lg bg-transparent text-acid font-bebas text-lg tracking-widest cursor-pointer transition-all hover:bg-acid/5 mb-4"
          >
            LOGIN AS GUEST →
          </button>

          <div className="flex flex-col gap-2.5 items-center">
            <p className="text-[#a19f9fff] text-[13px] m-0">
              Forgot password?{" "}
              <span
                onClick={() => navigate("/forgot-password")}
                className="text-[#a19f9fff] cursor-pointer font-medium transition-colors underline decoration-muted hover:text-[#c6e077ff]"
              >
                Reset Password ↗
              </span>
            </p>
          </div>

          <p className="font-mono text-center text-[#e5e4e4ff] text-[10px] mt-5 tracking-widest">
            © 2026 ChemBridge — ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}