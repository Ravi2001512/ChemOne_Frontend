import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      {/* Simple Student Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <BookOpen className="w-5 h-5 text-slate-900" />
              </div>
              <span className="ml-3 font-extrabold text-xl tracking-tight text-slate-100">
                ChemOne Student
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-slate-700 hover:border-slate-600 text-sm font-semibold rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 focus:outline-none transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px] -top-24 -left-24 animate-pulse pointer-events-none"></div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
          Welcome to the Student Hub
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Your assigned spot tests and class materials will appear here once your instructor publishes them.
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;
