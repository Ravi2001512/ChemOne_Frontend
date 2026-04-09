import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, Users, Settings, LogOut, Beaker } from 'lucide-react';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Create Spot Test', path: '/admin/spot-test/create', icon: FileEdit },
    { name: 'Daily Work Sheet', path: '/admin/daily-worksheet', icon: FileEdit },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/admin')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Beaker className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 tracking-tight">
                ChemOne Admin
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all duration-200 ${isActive
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-200'
                      }`}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User & Logout */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
