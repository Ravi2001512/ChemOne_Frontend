import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, Settings, Award, Joystick } from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
        setUserName(user.name);
      } catch (e) { }
    }
  }, []);

  const dashboardCards = [
    {
      title: 'View Spot Tests',
      description: 'Access your assigned spot tests and assessments',
      icon: ClipboardList,
      onClick: () => navigate('/student/spot-test'),
      color: 'from-indigo-500 to-purple-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Daily Worksheet',
      description: 'Check today\'s worksheet and submit your answers',
      icon: Users,
      onClick: () => navigate('/student/daily-worksheet'),
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Physical Results',
      description: 'View your class exam history and leaderboard rankings',
      icon: Award,
      onClick: () => navigate('/student/view-physical-results'),
      color: 'from-rose-500 to-rose-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600'
    },
    {
      title: 'Ai Chatbot',
      description: 'Chat with our AI assistant to get help with your studies',
      icon: Users,
      onClick: () => navigate('/student/ai-chatbot'),
      color: 'from-sky-500 to-sky-600',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600'
    },
    {
      title: 'Settings',
      description: 'Manage your profile and account preferences',
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'from-slate-500 to-gray-600',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400'
    },
    {
      title: 'Mind Relaxing',
      description: 'Relax your mind',
      icon: Joystick,
      onClick: () => navigate('/student/games'),
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100 dark:bg-yellow-800',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  const filteredCards = dashboardCards.filter(card => {
    if (userRole === 'guest') {
      return !['View Spot Tests', 'Daily Worksheet', 'Physical Exam Results', 'Settings'].includes(card.title);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-900">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {userName || 'Student'} 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Ready to continue learning? Jump into your latest test, practice with worksheets, and track how far you've come.
          </p>
          <button
            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.joazco.vsper&hl=en_SG', '_blank')}
            className="mt-6 px-6 py-3 w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            View VSPER 3D structures
          </button>
        </div>

        {/* Main Action Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={card.onClick}
                  className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                  <div className="p-6">
                    <div className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                      {card.description}
                    </p>
                    <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                      Open
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;