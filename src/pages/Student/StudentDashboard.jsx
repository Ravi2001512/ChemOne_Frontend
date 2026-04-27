import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  BookOpen,
  Award,
  Bot,
  Settings,
  Gamepad2,
  ArrowRight,
  Atom,
  Zap,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

/* ─── Theme Token Helper ─────────────────────────────────────── */
const getTokens = (dark) => ({
  // backgrounds
  pageBg: dark ? '#0a0a0a' : '#f1f5f9',
  heroBg: dark ? 'linear-gradient(135deg,#111 0%,#181818 100%)' : 'linear-gradient(135deg,#fff 0%,#f8fafc 100%)',
  heroBorder: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  cardBg: dark ? '#111111' : '#ffffff',
  cardBgHov: dark ? '#141414' : '#f8faff',
  cardBorder: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
  statBg: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
  statBorder: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
  divider: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
  // text
  heading: dark ? '#ffffff' : '#0f172a',
  headingHov: dark ? '#ffffff' : '#1e293b',
  body: dark ? '#666666' : '#64748b',
  bodyHov: dark ? '#888888' : '#475569',
  label: dark ? '#555555' : '#94a3b8',
  statLabel: dark ? '#888888' : '#64748b',
  statValue: dark ? '#ffffff' : '#0f172a',
  // accent (acid-green in dark, indigo in light)
  accent: dark ? '#c8f230' : '#6366f1',
  accentBg: dark ? 'rgba(200,242,48,0.10)' : 'rgba(99,102,241,0.08)',
  accentGlow: dark ? 'rgba(200,242,48,0.30)' : 'rgba(99,102,241,0.20)',
  accentText: dark ? '#0a0a0a' : '#ffffff',
  tag: dark ? '#c8f230' : '#6366f1',
  tagBg: dark ? 'rgba(200,242,48,0.10)' : 'rgba(99,102,241,0.08)',
  tagBorder: dark ? 'rgba(200,242,48,0.25)' : 'rgba(99,102,241,0.25)',
  glow: dark ? 'radial-gradient(circle,rgba(200,242,48,0.12) 0%,transparent 70%)'
    : 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)',
});

/* ─── Main Component ──────────────────────────────────────────── */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  /* Watch for theme toggles (the navbar toggles .dark on <html>) */
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
        setUserName(user.name);
      } catch (e) { }
    }
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const t = getTokens(isDark);

  const dashboardCards = [
    {
      title: 'Spot Tests',
      description: 'Access your assigned spot tests and timed assessments',
      icon: ClipboardList,
      onClick: () => navigate('/student/spot-test'),
      accent: '#6366f1',
      glowColor: 'rgba(99,102,241,0.25)',
      tag: 'Assessment',
    },
    {
      title: 'Daily Worksheet',
      description: "Today's worksheet — complete and submit your answers",
      icon: BookOpen,
      onClick: () => navigate('/student/daily-worksheet'),
      accent: '#10b981',
      glowColor: 'rgba(16,185,129,0.25)',
      tag: 'Practice',
    },
    {
      title: 'Physical Results',
      description: 'View class exam history and leaderboard rankings',
      icon: Award,
      onClick: () => navigate('/student/results'),
      accent: '#f43f5e',
      glowColor: 'rgba(244,63,94,0.25)',
      tag: 'Results',
    },
    {
      title: 'AI Chatbot',
      description: 'Get instant help from your AI chemistry tutor',
      icon: Bot,
      onClick: () => navigate('/student/ai-chatbot'),
      accent: '#0ea5e9',
      glowColor: 'rgba(14,165,233,0.25)',
      tag: 'AI Tutor',
    },
    {
      title: 'Settings',
      description: 'Manage your profile and account preferences',
      icon: Settings,
      onClick: () => navigate('/settings'),
      accent: '#8b5cf6',
      glowColor: 'rgba(139,92,246,0.25)',
      tag: 'Account',
    },
    {
      title: 'Mind Relaxing',
      description: 'Take a break and play chemistry-themed mini-games',
      icon: Gamepad2,
      onClick: () => navigate('/student/games'),
      accent: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.25)',
      tag: 'Games',
    },
  ];

  const filteredCards = dashboardCards.filter((card) => {
    if (userRole === 'guest') {
      return !['Spot Tests', 'Daily Worksheet', 'Physical Results', 'Settings'].includes(card.title);
    }
    return true;
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.pageBg,
        transition: 'background 0.3s ease',
      }}
    >
      <StudentNavbar />

      <main
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* ── HERO BANNER ─────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '2.5rem',
            background: t.heroBg,
            border: `1px solid ${t.heroBorder}`,
            padding: '2.5rem 2rem',
            boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.06)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Decorative glow blob */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: t.glow,
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: t.accent,
                marginBottom: '0.5rem',
                transition: 'color 0.3s ease',
              }}
            >
              // Student Portal
            </p>
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 800,
                color: t.heading,
                lineHeight: 1.15,
                marginBottom: '0.75rem',
                transition: 'color 0.3s ease',
              }}
            >
              Welcome back,{' '}
              <span style={{ color: t.accent, transition: 'color 0.3s ease' }}>
                {userName || 'Student'}
              </span>{' '}
              👋
            </h1>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1rem',
                color: t.body,
                maxWidth: '520px',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
                transition: 'color 0.3s ease',
              }}
            >
              Ready to continue your chemistry journey? Jump into your latest
              test, practice with worksheets, and track your progress.
            </p>

            {/* CTA Button */}
            <button
              onClick={() =>
                window.open(
                  'https://play.google.com/store/apps/details?id=com.joazco.vsper&hl=en_SG',
                  '_blank'
                )
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.7rem 1.4rem',
                background: t.accent,
                color: t.accentText,
                border: 'none',
                borderRadius: '10px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease',
                boxShadow: `0 0 20px ${t.accentGlow}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 0 32px ${t.accentGlow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 0 20px ${t.accentGlow}`;
              }}
            >
              <ExternalLink size={15} />
              View VSPER 3D Structures
            </button>
          </div>
        </div>

        {/* ── SECTION LABEL ───────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: t.label,
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease',
            }}
          >
            // Quick Actions
          </p>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: t.divider,
              transition: 'background 0.3s ease',
            }}
          />
        </div>

        {/* ── ACTION CARDS ─────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}
        >
          {filteredCards.map((card, index) => (
            <ActionCard key={index} card={card} index={index} tokens={t} isDark={isDark} />
          ))}
        </div>
      </main>
    </div>
  );
};

/* ─── Individual Card Component ───────────────────────────────── */
const ActionCard = ({ card, index, tokens: t, isDark }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <div
      onClick={card.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? t.cardBgHov : t.cardBg,
        border: hovered
          ? `1px solid ${card.accent}55`
          : `1px solid ${t.cardBorder}`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 12px 40px ${card.glowColor}`
          : isDark
            ? 'none'
            : '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${card.accent}, transparent)`,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Background glow on hover */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${card.glowColor} 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Tag badge */}
      <div style={{ marginBottom: '1rem' }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: card.accent,
            background: `${card.accent}18`,
            border: `1px solid ${card.accent}33`,
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {card.tag}
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${card.accent}18`,
          border: `1px solid ${card.accent}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          transition: 'transform 0.25s ease',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <Icon size={22} style={{ color: card.accent }} />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.05rem',
          fontWeight: 700,
          color: hovered ? t.headingHov : t.heading,
          marginBottom: '0.4rem',
          transition: 'color 0.2s ease',
        }}
      >
        {card.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.825rem',
          color: hovered ? t.bodyHov : t.body,
          lineHeight: 1.55,
          marginBottom: '1.25rem',
          transition: 'color 0.2s ease',
        }}
      >
        {card.description}
      </p>

      {/* Footer link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: hovered ? '10px' : '6px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: card.accent,
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.2s ease, gap 0.2s ease',
        }}
      >
        Open
        <ArrowRight size={13} />
      </div>
    </div>
  );
};

export default StudentDashboard;