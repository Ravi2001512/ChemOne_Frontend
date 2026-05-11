import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  BookOpen,
  Award,
  Bot,
  Settings,
  Gamepad2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

/* ─── Main Component ──────────────────────────────────────────── */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [mounted, setMounted] = useState(false);

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

  const dashboardCards = [
    {
      title: 'Spot Tests',
      description: 'Access your assigned spot tests and timed assessments',
      icon: ClipboardList,
      onClick: () => navigate('/student/spot-test'),
      color: 'indigo',
      tag: 'Assessment',
    },
    {
      title: 'Daily Worksheet',
      description: "Today's worksheet — complete and submit your answers",
      icon: BookOpen,
      onClick: () => navigate('/student/daily-worksheet'),
      color: 'emerald',
      tag: 'Practice',
    },
    {
      title: 'Physical Results',
      description: 'View class exam history and leaderboard rankings',
      icon: Award,
      onClick: () => navigate('/student/results'),
      color: 'rose',
      tag: 'Results',
    },
    {
      title: 'AI Chatbot',
      description: 'Get instant help from your AI chemistry tutor',
      icon: Bot,
      onClick: () => navigate('/student/ai-chatbot'),
      color: 'sky',
      tag: 'AI Tutor',
    },
    {
      title: 'Settings',
      description: 'Manage your profile and account preferences',
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'violet',
      tag: 'Account',
    },
    {
      title: 'Mind Relaxing',
      description: 'Take a break and play chemistry-themed mini-games',
      icon: Gamepad2,
      onClick: () => navigate('/student/games'),
      color: 'amber',
      tag: 'Games',
    },
  ];

  const filteredCards = dashboardCards.filter((card) => {
    if (userRole === 'guest') {
      return !['Spot Tests', 'Daily Worksheet', 'Physical Results', 'Settings', 'AI Chatbot'].includes(card.title);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-ink transition-colors duration-300">
      <StudentNavbar />

      <main
        className={`max-w-7xl mx-auto px-6 py-10 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
      >
        {/* ── HERO BANNER ─────────────────────────────────────── */}
        <div className="relative rounded-[24px] overflow-hidden mb-10 bg-white dark:bg-ink-lighter border border-black/5 dark:border-white/10 p-8 md:p-12 shadow-sm dark:shadow-none transition-all duration-300">
          {/* Decorative glow blob */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/10 dark:bg-acid/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-indigo-600 dark:text-acid mb-3 transition-colors duration-300">
              // Student Portal
            </p>
            <h1 className="font-grotesk text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
              Welcome back,{' '}
              <span className="text-indigo-600 dark:text-acid transition-colors duration-300">
                {userName || 'Student'}
              </span>{' '}
              👋
            </h1>
            <p className="font-grotesk text-lg text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed mb-8 transition-colors duration-300">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-acid text-white dark:text-ink rounded-xl font-grotesk font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/20 dark:shadow-acid/20"
            >
              <ExternalLink size={16} />
              View VSPER 3D Structures
            </button>
          </div>
        </div>

        {/* ── SECTION LABEL ───────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-slate-400 dark:text-zinc-500 whitespace-nowrap transition-colors duration-300">
            // Quick Actions
          </p>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10 transition-colors duration-300" />
        </div>

        {/* ── ACTION CARDS ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card, index) => (
            <ActionCard key={index} card={card} />
          ))}
        </div>
      </main>
    </div>
  );
};

/* ─── Individual Card Component ───────────────────────────────── */
const ActionCard = ({ card }) => {
  const Icon = card.icon;

  const colorConfig = {
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10',
    sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20 shadow-sky-500/10',
    violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20 shadow-violet-500/10',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
  };

  const config = colorConfig[card.color] || colorConfig.indigo;

  return (
    <div
      onClick={card.onClick}
      className="group relative bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-none hover:border-indigo-500/30 dark:hover:border-acid/30"
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-current to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300 ${config.split(' ')[0]}`}
      />

      {/* Background glow on hover */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-current ${config.split(' ')[0]}`}
      />

      {/* Tag badge */}
      <div className="mb-4">
        <span
          className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-md border ${config}`}
        >
          {card.tag}
        </span>
      </div>

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${config}`}
      >
        <Icon size={22} />
      </div>

      {/* Title */}
      <h3 className="font-grotesk text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-acid transition-colors duration-200 mb-1.5">
        {card.title}
      </h3>

      {/* Description */}
      <p className="font-grotesk text-sm text-slate-500 dark:text-zinc-400 leading-relaxed mb-6 transition-colors duration-200">
        {card.description}
      </p>

      {/* Footer link */}
      <div
        className={`flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase transition-all duration-300 group-hover:gap-3 ${config.split(' ')[0]}`}
      >
        <span>Open</span>
        <ArrowRight size={14} />
      </div>
    </div>
  );
};

export default StudentDashboard;