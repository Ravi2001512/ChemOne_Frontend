import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --acid: #c8f230;
    --acid-dim: rgba(200,242,48,0.12);
    --acid-glow: rgba(200,242,48,0.35);
    --ink: #0a0a0a;
    --ink2: #111111;
    --surface: rgba(255,255,255,0.03);
    --border: rgba(255,255,255,0.07);
    --muted: #3a3a3a;
    --sub: #555;
  }

  @keyframes floatOrb {
    0%,100%{ transform:translate(0,0) scale(1); }
    33%    { transform:translate(40px,-60px) scale(1.1); }
    66%    { transform:translate(-30px,30px) scale(0.9); }
  }
  @keyframes fadeSlide {
    from{ opacity:0; transform:translateY(16px); }
    to  { opacity:1; transform:translateY(0); }
  }
  @keyframes spinCW { to { transform:rotate(360deg); } }
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    15%,45%,75%{ transform:translateX(-5px); }
    30%,60%,90%{ transform:translateX(5px); }
  }
  @keyframes ticker {
    0%  { transform:translateX(0); }
    100%{ transform:translateX(-50%); }
  }
  @keyframes pulseAcid {
    0%,100%{ box-shadow: 0 0 0 0 rgba(200,242,48,0.35); }
    50%    { box-shadow: 0 0 0 8px rgba(200,242,48,0); }
  }
  @keyframes blink { 0%,49%{opacity:1;} 50%,100%{opacity:0;} }
  @keyframes revealDown {
    from{ opacity:0; transform:translateY(-8px); max-height:0; }
    to  { opacity:1; transform:translateY(0);    max-height:120px; }
  }
  @keyframes scanline {
    0%  { transform: translateY(-100%); }
    100%{ transform: translateY(300%); }
  }

  .font-bebas  { font-family:'Bebas Neue',sans-serif; }
  .font-grotesk{ font-family:'Space Grotesk',sans-serif; }
  .font-mono   { font-family:'JetBrains Mono',monospace; }

  .anim-fadeslide { animation:fadeSlide .5s cubic-bezier(.22,.68,0,1.15) both; }
  .anim-shake     { animation:shake .45s ease both; }
  .anim-spin      { animation:spinCW .7s linear infinite; }
  .anim-reveal    { animation:revealDown .3s cubic-bezier(.22,.68,0,1.1) both; }

  .ticker-inner { display:inline-flex; animation:ticker 22s linear infinite; }

  .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:floatOrb 18s ease-in-out infinite; }

  .input-acid {
    width:100%;
    padding: 13px 14px 13px 42px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #fff;
    font-family: 'Space Grotesk',sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
    caret-color: var(--acid);
    box-sizing: border-box;
  }
  .input-acid::placeholder { color: var(--sub); }
  .input-acid:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.14); }
  .input-acid:focus {
    border-color: var(--acid);
    background: rgba(200,242,48,0.04);
    box-shadow: 0 0 0 3px var(--acid-dim), inset 0 1px 0 rgba(200,242,48,0.06);
  }
  select.input-acid option { background:#111; color:#fff; }

  .btn-acid {
    position:relative;
    width:100%;
    padding: 15px;
    border:none;
    border-radius:8px;
    background: var(--acid);
    color: #0a0a0a;
    font-family:'Bebas Neue',sans-serif;
    font-size:1.05rem;
    letter-spacing:.1em;
    cursor:pointer;
    overflow:hidden;
    transition: transform .15s, box-shadow .15s, opacity .2s;
  }
  .btn-acid::before {
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.35) 50%,transparent 60%);
    transform:translateX(-100%);
    transition:transform .4s ease;
  }
  .btn-acid:hover::before { transform:translateX(100%); }
  .btn-acid:hover {
    transform:translateY(-2px);
    box-shadow:0 8px 32px var(--acid-glow), 0 0 60px rgba(200,242,48,0.15);
  }
  .btn-acid:active { transform:translateY(0); }
  .btn-acid:disabled { opacity:.55; cursor:not-allowed; transform:none; }

  .checkbox-acid {
    appearance:none;
    -webkit-appearance:none;
    width:16px; height:16px;
    border:1px solid var(--border);
    border-radius:4px;
    background:var(--surface);
    cursor:pointer;
    flex-shrink:0;
    position:relative;
    transition:border-color .2s, background .2s;
  }
  .checkbox-acid:checked {
    background:var(--acid);
    border-color:var(--acid);
  }
  .checkbox-acid:checked::after {
    content:'';
    position:absolute;
    left:4px; top:1.5px;
    width:5px; height:9px;
    border:2px solid #000;
    border-top:none; border-left:none;
    transform:rotate(45deg);
  }
`;

const TICKER_ITEMS = ["CHEMONE", "A-LEVELS", "SIGN IN", "CHEMISTRY", "ASHAN UMAYANGA", "Best Educator", "A-LEVELS", "SIGN IN", "CHEMISTRY", "ASHAN UMAYANGA", "Best Educator"];

function Field({ label, icon, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="font-mono" style={{
        fontSize: 10, fontWeight: 600, letterSpacing: ".14em",
        textTransform: "uppercase", color: "var(--sub)",
      }}>
        {`// ${label}`}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
          fontSize: "0.82rem", opacity: .4, pointerEvents: "none", userSelect: "none",
        }}>{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Login() {
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
      const res = await API.post("/auth/login", formData);
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

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="font-grotesk" style={{
        minHeight: "100vh",
        background: "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 500, height: 500, top: -180, left: -150, background: "rgba(200,242,48,0.06)", animationDelay: "0s" }} />
        <div className="orb" style={{ width: 380, height: 380, bottom: -120, right: -100, background: "rgba(99,102,241,0.1)", animationDelay: "-7s" }} />
        <div className="orb" style={{ width: 260, height: 260, top: "40%", right: "25%", background: "rgba(200,242,48,0.04)", animationDelay: "-12s" }} />

        {/* Noise grain */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: .025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }} />

        {/* Card */}
        <div className="anim-fadeslide" style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 920,
          borderRadius: 16,
          border: "1px solid var(--border)",
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>

          {/* ═══ LEFT PANEL ═══ */}
          <div className="left-panel" style={{
            width: "44%",
            display: "none",
            flexDirection: "column",
            background: "#0d0d0d",
            borderRight: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Grid lines */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `
                linear-gradient(rgba(200,242,48,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200,242,48,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "36px 36px",
            }} />

            {/* Corner brackets */}
            {[
              { top: 20, left: 20, borderTop: "1.5px solid var(--acid)", borderLeft: "1.5px solid var(--acid)", width: 20, height: 20 },
              { top: 20, right: 20, borderTop: "1.5px solid var(--acid)", borderRight: "1.5px solid var(--acid)", width: 20, height: 20 },
              { bottom: 20, left: 20, borderBottom: "1.5px solid var(--acid)", borderLeft: "1.5px solid var(--acid)", width: 20, height: 20 },
              { bottom: 20, right: 20, borderBottom: "1.5px solid var(--acid)", borderRight: "1.5px solid var(--acid)", width: 20, height: 20 },
            ].map((s, i) => <div key={i} style={{ position: "absolute", ...s }} />)}

            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 36px", position: "relative", zIndex: 1 }}>
              {/* Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: "var(--acid)",
                  boxShadow: "0 0 10px var(--acid-glow)",
                  animation: "pulseAcid 2s ease-in-out infinite",
                }} />
                <span className="font-mono" style={{ fontSize: 11, color: "var(--sub)", letterSpacing: ".1em" }}>CHEMONE // v2.0</span>
              </div>

              {/* Main headline */}
              <div>
                <div className="font-bebas" style={{
                  fontSize: "5.5rem", lineHeight: .88, color: "#fff", letterSpacing: ".02em", marginBottom: 24,
                }}>
                  <div>WELCOME</div>
                  <div style={{ color: "var(--acid)", textShadow: "0 0 40px var(--acid-glow)" }}>BACK</div>
                </div>

                {/* Photo */}
                <div style={{ position: "relative", marginBottom: 28 }}>
                  <div style={{
                    position: "absolute", inset: -3, borderRadius: 10,
                    background: "linear-gradient(135deg, var(--acid), transparent, var(--acid))",
                    opacity: .5,
                  }} />
                  <img
                    src="/ashan.jpeg"
                    alt="Ashan Umayanga"
                    style={{
                      position: "relative", zIndex: 1,
                      width: "100%", borderRadius: 8,
                      objectFit: "cover", maxHeight: 220,
                      filter: "contrast(1.05) brightness(0.95)",
                    }}
                  />
                  {/* Scanline */}
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 2, borderRadius: 8, pointerEvents: "none",
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                  }} />
                </div>

                <div className="font-bebas" style={{ fontSize: "1.45rem", letterSpacing: ".12em", color: "var(--acid)" }}>
                  ASHAN UMAYANGA
                </div>
                <div className="font-mono" style={{ fontSize: 11, color: "var(--sub)", marginTop: 4 }}>
                  // chemistry educator
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 20, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
                {[["A/L", "CHEMISTRY"], ["🏆", "TOP RESULTS"]].map(([v, l], i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div className="font-bebas" style={{ fontSize: "1.4rem", color: "var(--acid)", letterSpacing: ".05em" }}>{v}</div>
                    <div className="font-mono" style={{ fontSize: 9, color: "var(--sub)", letterSpacing: ".1em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT PANEL ═══ */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "44px 40px",
            background: "rgba(10,10,10,0.85)",
            backdropFilter: "blur(20px)",
            maxHeight: "100vh",
            overflowY: "auto",
          }}>

            {/* Ticker */}
            <div style={{
              marginBottom: 32, overflow: "hidden",
              borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
              padding: "7px 0", marginLeft: -40, marginRight: -40,
            }}>
              <div className="ticker-inner font-bebas" style={{
                fontSize: "0.72rem", letterSpacing: ".15em", color: "var(--sub)", gap: 0,
              }}>
                {TICKER_ITEMS.concat(TICKER_ITEMS).map((t, i) => (
                  <span key={i} style={{ paddingRight: 32 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <span className="font-bebas" style={{ fontSize: "3rem", color: "#fff", letterSpacing: ".04em", lineHeight: 1 }}>
                  SIGN IN
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--acid)", letterSpacing: ".1em", paddingBottom: 4 }}>
                  _02
                </span>
              </div>
              <p style={{ color: "var(--sub)", fontSize: 13 }}>
                Continue your chemistry journey
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="anim-shake font-mono" style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171", fontSize: 12, borderRadius: 8,
                padding: "12px 14px", marginBottom: 20, letterSpacing: ".02em",
              }}>
                <span style={{ opacity: .7, flexShrink: 0 }}>!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
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

              {/* Password */}
              <Field label="Password" icon="⬡">
                <input
                  className="input-acid"
                  style={{ paddingRight: 36 }}
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
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, opacity: .35, color: "#fff", padding: 0,
                    transition: "opacity .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
                  onMouseLeave={e => e.currentTarget.style.opacity = ".35"}
                >
                  {showPassword ? "●" : "○"}
                </button>
              </Field>

              {/* Submit */}
              <button
                type="submit"
                className="btn-acid"
                disabled={loading}
                style={{ marginTop: 6 }}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, position: "relative", zIndex: 1 }}>
                  {loading && (
                    <span className="anim-spin" style={{
                      display: "inline-block", width: 14, height: 14,
                      border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#000",
                      borderRadius: "50%",
                    }} />
                  )}
                  {loading ? "SIGNING IN..." : "SIGN IN →"}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px",
              color: "var(--muted)",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span className="font-mono" style={{ fontSize: 10, letterSpacing: ".1em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
              <p style={{ color: "var(--sub)", fontSize: 13, margin: 0 }}>
                Forgot password?{" "}
                <span
                  onClick={() => navigate("/forgot-password")}
                  style={{ color: "var(--sub)", cursor: "pointer", fontWeight: 500, transition: "color .15s", textDecoration: "underline", textDecorationColor: "var(--muted)" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#c6e077ff"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--sub)"}
                >
                  Reset Password ↗
                </span>
              </p>
            </div>

            {/* Footer */}
            <p className="font-mono" style={{ textAlign: "center", color: "#222", fontSize: 10, marginTop: 20, letterSpacing: ".08em" }}>
              © 2026 ChemBridge  — ALL RIGHTS RESERVED
            </p>
          </div>
        </div>

        <style>{`
          @media(min-width:768px){
            .left-panel{ display:flex !important; }
          }
          @keyframes pulseAcid {
            0%,100%{ box-shadow: 0 0 0 0 rgba(200,242,48,0.35); }
            50%    { box-shadow: 0 0 0 8px rgba(200,242,48,0); }
          }
        `}</style>
      </div>
    </>
  );
}

export default Login;