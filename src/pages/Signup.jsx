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

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes glitch1 {
    0%,100%{ clip-path:inset(0 0 98% 0); transform:translate(-2px,0); }
    20%    { clip-path:inset(30% 0 50% 0); transform:translate(2px,0); }
    40%    { clip-path:inset(70% 0 5% 0);  transform:translate(-1px,0); }
    60%    { clip-path:inset(15% 0 75% 0); transform:translate(1px,0); }
    80%    { clip-path:inset(55% 0 20% 0); transform:translate(-2px,0); }
  }
  @keyframes glitch2 {
    0%,100%{ clip-path:inset(50% 0 30% 0); transform:translate(2px,0); opacity:0; }
    25%    { clip-path:inset(10% 0 80% 0); transform:translate(-2px,0); opacity:0.7; }
    50%    { clip-path:inset(80% 0 5% 0);  transform:translate(1px,0);  opacity:0.5; }
    75%    { clip-path:inset(25% 0 60% 0); transform:translate(-1px,0); opacity:0.8; }
  }
  @keyframes fadeSlide {
    from{ opacity:0; transform:translateY(16px); }
    to  { opacity:1; transform:translateY(0); }
  }
  @keyframes blink {
    0%,49%{ opacity:1; } 50%,100%{ opacity:0; }
  }
  @keyframes pulseAcid {
    0%,100%{ box-shadow: 0 0 0 0 var(--acid-glow); }
    50%    { box-shadow: 0 0 0 8px rgba(200,242,48,0); }
  }
  @keyframes spinCW { to { transform:rotate(360deg); } }
  @keyframes checkIn {
    from{ stroke-dashoffset:80; opacity:0; }
    to  { stroke-dashoffset:0;  opacity:1; }
  }
  @keyframes successPop {
    0%  { transform:scale(0.8); opacity:0; }
    60% { transform:scale(1.05); }
    100%{ transform:scale(1);   opacity:1; }
  }
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    15%,45%,75%{ transform:translateX(-5px); }
    30%,60%,90%{ transform:translateX(5px); }
  }
  @keyframes ticker {
    0%  { transform:translateX(0); }
    100%{ transform:translateX(-50%); }
  }
  @keyframes floatOrb {
    0%,100%{ transform:translate(0,0) scale(1); }
    33%    { transform:translate(40px,-60px) scale(1.1); }
    66%    { transform:translate(-30px,30px) scale(0.9); }
  }

  .font-bebas { font-family:'Bebas Neue',sans-serif; }
  .font-grotesk{ font-family:'Space Grotesk',sans-serif; }
  .font-mono  { font-family:'JetBrains Mono',monospace; }

  .anim-fadeslide { animation:fadeSlide .5s cubic-bezier(.22,.68,0,1.15) both; }
  .anim-shake { animation:shake .45s ease both; }
  .anim-success { animation:successPop .55s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-spin { animation:spinCW .7s linear infinite; }
  .anim-check {
    stroke-dasharray:80;
    animation:checkIn .5s .2s ease forwards;
  }

  .ticker-wrap { overflow:hidden; white-space:nowrap; }
  .ticker-inner { display:inline-flex; animation:ticker 22s linear infinite; }

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

  .strength-bar {
    height:2px;
    border-radius:99px;
    flex:1;
    background:var(--muted);
    transition:background .3s;
  }

  .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:floatOrb 18s ease-in-out infinite; }
`;

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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: mono ? "'JetBrains Mono',monospace" : "'Space Grotesk',sans-serif",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--sub)",
      }}>
        {mono ? `// ${label}` : label}
      </label>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
          fontSize: "0.82rem", opacity: 0.4, pointerEvents: "none", userSelect: "none",
        }}>{icon}</span>
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

  /* ── SUCCESS ── */
  if (success) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div className="font-grotesk" style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--ink)", flexDirection: "column", gap: 24,
        }}>
          <div className="anim-success" style={{ textAlign: "center" }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="42" fill="none" stroke="var(--acid)" strokeWidth="1.5" opacity=".3" />
              <circle cx="45" cy="45" r="42" fill="none" stroke="var(--acid)" strokeWidth="1.5"
                strokeDasharray="264" strokeDashoffset="264"
                style={{ animation: "checkIn .8s .1s ease forwards" }} />
              <polyline points="27,47 40,60 64,33" fill="none"
                stroke="var(--acid)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className="anim-check" />
            </svg>
            <div className="font-bebas" style={{ fontSize: "3.5rem", color: "var(--acid)", letterSpacing: ".05em", marginTop: 16 }}>
              ACCOUNT CREATED
            </div>
            <div className="font-mono" style={{ color: "var(--sub)", fontSize: 12, marginTop: 4 }}>
              redirecting to login<span style={{ animation: "blink 1s step-end infinite" }}>_</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── MAIN ── */
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

        {/* Noise grain overlay */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: .025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }} />

        {/* Top Right Login Navigation */}
        <div style={{
          position: "absolute",
          top: 24,
          right: 32,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 16
        }}>
          <span className="font-mono hidden sm:block" style={{ color: "var(--sub)", fontSize: 11, letterSpacing: ".05em" }}>
            ALREADY REGISTERED?
          </span>
          <button
            onClick={() => navigate("/login")}
            className="font-bebas"
            style={{
              padding: "8px 24px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "#fff",
              fontSize: "1.1rem",
              letterSpacing: ".08em",
              cursor: "pointer",
              transition: "all .2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--acid)";
              e.currentTarget.style.color = "var(--acid)";
              e.currentTarget.style.background = "rgba(200,242,48,0.05)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "var(--surface)";
            }}
          >
            SIGN IN
          </button>
        </div>

        {/* Card */}
        <div className="anim-fadeslide" style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 920,
          height: "100%", maxHeight: "calc(100vh - 32px)", /* Keep it within viewport */
          borderRadius: 16,
          border: "1px solid var(--border)",
          overflow: "hidden",
          display: "flex",
          boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>

          {/* ═══ LEFT PANEL ═══ */}
          <div style={{
            width: "44%",
            display: "none",
            flexDirection: "column",
            background: "#0d0d0d",
            borderRight: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
            className="left-panel"
          >
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

            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 36px", position: "relative", zIndex: 1 }}>

              {/* Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", background: "var(--acid)",
                  boxShadow: "0 0 10px var(--acid-glow)",
                  animation: "pulseAcid 2s ease-in-out infinite",
                }} />
                <span className="font-mono" style={{ fontSize: 11, color: "var(--sub)", letterSpacing: ".1em" }}>ChemBridge // v2.0</span>
              </div>

              {/* Main headline */}
              <div>
                <div className="font-bebas" style={{
                  fontSize: "5.5rem", lineHeight: 0.88, color: "#fff", letterSpacing: ".02em",
                  marginBottom: 24,
                }}>
                  <div>Chem</div>
                  <div style={{ color: "var(--acid)", textShadow: "0 0 40px var(--acid-glow)" }}>Bridge</div>
                </div>

                {/* Photo */}
                <div style={{ position: "relative", marginBottom: 28 }}>
                  <div style={{
                    position: "absolute", inset: -3,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, var(--acid), transparent, var(--acid))",
                    opacity: .5,
                  }} />
                  <img
                    src="/ashan.jpeg"
                    alt="Ashan Umayanga"
                    style={{
                      position: "relative", zIndex: 1,
                      width: "100%", borderRadius: 8,
                      objectFit: "cover",
                      maxHeight: 220,
                      filter: "contrast(1.05) brightness(0.95)",
                    }}
                  />
                  {/* Scanline overlay */}
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

              {/* Stats row */}
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
            height: "100%", /* Fill constrained parent */
            overflowY: "auto", /* Allow independent scrolling if content is tall */
          }}>

            {/* Ticker */}
            <div style={{
              marginBottom: 32,
              overflow: "hidden",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border)",
              padding: "7px 0",
              marginLeft: -40, marginRight: -40,
            }}>
              <div className="ticker-inner" style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: "0.72rem",
                letterSpacing: ".15em",
                color: "var(--sub)",
                gap: 0,
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
                  CREATE ACCOUNT
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--acid)", letterSpacing: ".1em", paddingBottom: 4 }}>
                  _01
                </span>
              </div>
              <p className="font-grotesk" style={{ color: "var(--sub)", fontSize: 13 }}>
                Start your chemistry journey today
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="anim-shake font-mono" style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                fontSize: 12,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 20,
                letterSpacing: ".02em",
              }}>
                <span style={{ opacity: .7, flexShrink: 0 }}>!</span>
                <span>{error}</span>
              </div>
            )}

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Name */}
                <Field label="Full Name" icon="◈" mono>
                  <input
                    className="input-acid"
                    type="text" name="name"
                    placeholder="Ravindu Deshan"
                    value={form.name} onChange={change}
                    autoComplete="name"
                  />
                </Field>

                {/* Email */}
                <Field label="Email Address" icon="◉" mono>
                  <input
                    className="input-acid"
                    type="email" name="email"
                    placeholder="ravi@gmail.com"
                    value={form.email} onChange={change}
                    autoComplete="email"
                  />
                </Field>

                {/* Passwords side by side */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label className="font-mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--sub)" }}>
                    // Password
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { key: "password", placeholder: "Password", show: showPw, toggle: () => setShowPw(!showPw) },
                      { key: "confirmPassword", placeholder: "Confirm", show: showCpw, toggle: () => setShowCpw(!showCpw) },
                    ].map(({ key, placeholder, show, toggle }) => (
                      <div key={key} style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: "0.82rem", opacity: .4, pointerEvents: "none" }}>⬡</span>
                        <input
                          className="input-acid"
                          style={{ paddingRight: 36 }}
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
                          style={{
                            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: 12, opacity: .35, color: "#fff", padding: 0,
                            transition: "opacity .15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = ".75"}
                          onMouseLeave={e => e.currentTarget.style.opacity = ".35"}
                        >
                          {show ? "●" : "○"}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Strength indicator */}
                  {pw && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="strength-bar"
                          style={{ background: i <= pw.bars ? pw.color : "var(--muted)" }}
                        />
                      ))}
                      <span className="font-mono" style={{ fontSize: 9, color: pw.color, letterSpacing: ".1em", minWidth: 64, textAlign: "right" }}>
                        {pw.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Role & Batch */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: form.role === "student" ? "1fr 1fr" : "1fr",
                  gap: 12,
                }}>
                  <Field label="I Am A…" icon="◇" mono>
                    <select
                      className="input-acid"
                      style={{ appearance: "none", cursor: "pointer", paddingRight: 32 }}
                      name="role" value={form.role} onChange={change}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                    <span style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      color: "var(--sub)", fontSize: 10, pointerEvents: "none",
                    }}>▾</span>
                  </Field>

                  {form.role === "student" && (
                    <Field label="Batch Year" icon="◈" mono>
                      <select
                        className="input-acid"
                        style={{ appearance: "none", cursor: "pointer", paddingRight: 32 }}
                        name="batch" value={form.batch} onChange={change}
                      >
                        <option value="">Select Batch</option>
                        {[2026, 2027, 2028, 2029, 2030].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <span style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        color: "var(--sub)", fontSize: 10, pointerEvents: "none",
                      }}>▾</span>
                    </Field>
                  )}
                </div>

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
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
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

            <p className="font-grotesk" style={{ textAlign: "center", color: "var(--sub)", fontSize: 13 }}>
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{
                  color: "var(--acid)", cursor: "pointer",
                  fontWeight: 600, textDecoration: "none",
                  transition: "opacity .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".7"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Sign in ↗
              </span>
            </p>

            {/* Footer */}
            <p className="font-mono" style={{ textAlign: "center", color: "#222", fontSize: 10, marginTop: 20, letterSpacing: ".08em" }}>
              © 2026 CHEMONE — ALL RIGHTS RESERVED
            </p>
          </div>
        </div>

        {/* Show left panel on md+ */}
        <style>{`
          @media(min-width:768px){
            .left-panel{ display:flex !important; }
          }
          @keyframes blink { 0%,49%{opacity:1;} 50%,100%{opacity:0;} }
          @keyframes pulseAcid {
            0%,100%{ box-shadow: 0 0 0 0 rgba(200,242,48,0.35); }
            50%    { box-shadow: 0 0 0 8px rgba(200,242,48,0); }
          }
        `}</style>
      </div>
    </>
  );
}