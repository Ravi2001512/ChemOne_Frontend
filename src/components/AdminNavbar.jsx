import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, Users, Settings, LogOut, Beaker, Menu, X, BarChart3 } from 'lucide-react';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Create Spot Test', path: '/admin/spot-test/create', icon: FileEdit },
    { name: 'Daily Work Sheet', path: '/admin/daily-worksheet', icon: FileEdit },
    { name: 'AI ChatBot', path: '/admin/chat-with-ai', icon: FileEdit },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-ink/90 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/admin')}>
              <div className="w-9 h-9 rounded-xl bg-acid flex items-center justify-center shadow-lg shadow-acid/20">
                <img src="/logo.png" alt="ChemOne Logo" />
              </div>
              <span className="ml-3 font-bebas text-xl sm:text-2xl text-white tracking-wider whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                ChemBridge <span className="text-acid [text-shadow:0_0_20px_rgba(200,242,48,0.3)]">ADMIN</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-[13px] font-mono tracking-wider uppercase transition-all duration-200 ${isActive
                      ? 'border-acid text-acid'
                      : 'border-transparent text-slate-400 hover:border-white/40 hover:text-white'
                      }`}
                  >
                    <Icon className={`w-3.5 h-3.5 mr-2 ${isActive ? 'text-acid' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User & Logout */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <button
              onClick={handleLogout}
              className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:bg-white/5 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-ink border-t border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-xl text-sm font-mono tracking-widest uppercase transition-colors ${isActive
                    ? 'bg-acid/10 text-acid'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-acid' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-mono tracking-widest uppercase text-rose-500 hover:bg-rose-500/5 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;

