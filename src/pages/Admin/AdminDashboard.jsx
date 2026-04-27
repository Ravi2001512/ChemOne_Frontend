import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { ClipboardList, Users, BarChart3, Settings, FileText, Bell } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';


const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Manage Spot Tests',
      description: 'Create, edit, and manage spot tests for students',
      icon: ClipboardList,
      onClick: () => navigate('/admin/manage-spot-test'),
      color: 'from-indigo-500 to-purple-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Manage Daily Worksheet',
      description: 'View and manage daily worksheet',
      icon: Users,
      onClick: () => navigate('/admin/manage-daily-worksheet'),
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'All Students',
      description: 'View all students',
      icon: Users,
      onClick: () => navigate('/admin/students'),
      color: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Chat with AI',
      description: 'Chat with AI',
      icon: FileText,
      onClick: () => navigate('/admin/chat-with-ai'),
      color: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Upload Exam Results',
      description: 'Manually input and manage scores for students',
      icon: BarChart3,
      onClick: () => navigate('/admin/manage-results'),
      color: 'from-pink-500 to-rose-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'from-slate-500 to-gray-600',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Manage and monitor admin activity.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  onClick={card.onClick}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                >
                  <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                  <div className="p-6">
                    <div className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
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

export default AdminDashboard;