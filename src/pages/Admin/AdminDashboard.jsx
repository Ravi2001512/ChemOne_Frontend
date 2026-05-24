import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, BarChart3, Settings, FileText, Bell, BookOpen, ArrowRight, QrCode } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';

/* ─── Main Component ──────────────────────────────────────────── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const dashboardCards = [
    {
      title: 'Manage Spot Tests',
      description: 'Create, edit, and manage spot tests for students',
      icon: ClipboardList,
      onClick: () => navigate('/admin/manage-spot-test'),
      color: 'indigo',
      tag: 'Tests',
    },
    {
      title: 'Manage Daily Worksheet',
      description: 'View and manage the daily worksheet assignments',
      icon: BookOpen,
      onClick: () => navigate('/admin/manage-daily-worksheet'),
      color: 'emerald',
      tag: 'Worksheets',
    },
    {
      title: 'All Students',
      description: 'Browse and manage all enrolled student accounts',
      icon: Users,
      onClick: () => navigate('/admin/students'),
      color: 'orange',
      tag: 'Students',
    },
    {
      title: 'Upload Exam Results',
      description: 'Manually input and manage exam scores for students',
      icon: BarChart3,
      onClick: () => navigate('/admin/manage-results'),
      color: 'rose',
      tag: 'Results',
    },
    {
      title: 'Chat with AI',
      description: 'Get instant answers and help from the ChemOne AI assistant',
      icon: Bell,
      onClick: () => navigate('/admin/chat-with-ai'),
      color: 'acid',
      tag: 'AI',
    },
    {
      title: 'Manage Knowledge',
      description: 'Upload and manage PDF documents for AI training',
      icon: FileText,
      onClick: () => navigate('/admin/manage-knowledge'),
      color: 'sky',
      tag: 'Knowledge',
    },
    {
      title: 'Settings',
      description: 'Configure system settings and account preferences',
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'violet',
      tag: 'System',
    },
    {
      title: 'QR Scanner',
      description: 'Scan  qr code of students',
      icon: QrCode,
      onClick: () => navigate('/admin/qr-scanner'),
      color: 'yellow',
      tag: 'QR',
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-ink transition-colors duration-300">
      <AdminNavbar />

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
              // Admin Portal
            </p>
            <h1 className="font-grotesk text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
              Admin{' '}
              <span className="text-indigo-600 dark:text-acid transition-colors duration-300">
                Dashboard
              </span>{' '}
              ⚙️
            </h1>
            <p className="font-grotesk text-lg text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed transition-colors duration-300">
              Manage spot tests, worksheets, student records, and exam results
              all from one place.
            </p>
          </div>
        </div>

        {/*SECTION LABEL*/}
        <div className="flex items-center gap-4 mb-8">
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-slate-400 dark:text-zinc-500 whitespace-nowrap transition-colors duration-300">
            // Quick Actions
          </p>
          <div className="flex-1 h-px bg-slate-200 dark:bg-white/10 transition-colors duration-300" />
        </div>

        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <ActionCard key={index} card={card} />
          ))}
        </div>
      </main>
    </div>
  );
};

/* Individual Card Component */
const ActionCard = ({ card }) => {
  const Icon = card.icon;

  const colorConfig = {
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
    rose: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10',
    acid: 'text-acid bg-acid/10 border-acid/20 shadow-acid/10',
    sky: 'text-sky-500 bg-sky-500/10 border-sky-500/20 shadow-sky-500/10',
    violet: 'text-violet-500 bg-violet-500/10 border-violet-500/20 shadow-violet-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-yellow-500/10',
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

export default AdminDashboard;