import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Clock, Layout, Trash2, Search, ArrowRight, MessageSquareCheck, FileEdit, Send, EyeOff } from 'lucide-react';
import AdminNavbar from '../../components/AdminNavbar';
import API from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await API.get('/tests');
        if (response.data.success) {
          setTests(response.data.tests);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
        setError("Failed to fetch published tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await API.delete(`/tests/${id}`);
      setTests(prev => prev.filter(t => t._id !== id));
    } catch (error) {
      alert("Failed to delete test.");
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const response = await API.patch(`/tests/${id}/publish`, { isPublished: !currentStatus });
      if (response.data.success) {
        setTests(prev => prev.map(t => t._id === id ? { ...t, isPublished: !currentStatus } : t));
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      alert("Failed to update publication status.");
    }
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(test.batch) ? test.batch.join(' ').toLowerCase() : test.batch.toLowerCase()).includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header section */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl sm:truncate tracking-tight flex items-center gap-3">
              <Layout className="text-indigo-600 h-10 w-10" />
              Manage Spot Tests
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Manage all assessments and monitor student performance.
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
              <Layout className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Assessments</p>
              <p className="text-2xl font-black text-slate-900">{tests.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
              <MessageSquareCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Live Assessments</p>
              <p className="text-2xl font-black text-slate-900">{tests.filter(t => t.isPublished).length}</p>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 transition-all font-medium"
              placeholder="Search tests or batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
            <Trash2 className="h-5 w-5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-500 font-medium font-dm">Syncing dashboard data...</p>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-slate-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 tracking-wider">
                        {Array.isArray(test.batch)
                          ? (test.batch.includes('all') ? 'ALL STUDENTS' : test.batch.join('/'))
                          : test.batch}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${test.isPublished ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {test.isPublished ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {test.title}
                  </h3>

                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                    {test.description || "No description provided."}
                  </p>

                  <div className="flex items-center gap-4 text-sm font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>{test.duration} MIN</span>
                    </div>
                    <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <Layout className="h-4 w-4 text-indigo-500" />
                      <span>{test.questions.length} QUES</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 group-hover:bg-indigo-50 transition-colors flex items-center justify-between border-t border-slate-100">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleTogglePublish(test._id, test.isPublished)}
                      className={`p-2 rounded-xl transition-all ${
                        test.isPublished 
                          ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50' 
                          : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                      title={test.isPublished ? 'Unpublish Test' : 'Publish Now'}
                    >
                      {test.isPublished ? <EyeOff className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/spot-test/edit/${test._id}`)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit Test"
                    >
                      <FileEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Test"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6 text-slate-300">
              <BookOpen className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Assessments Published</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-dm">
              Get started by creating your first spot test for your students.
            </p>
            <button
              onClick={() => navigate('/admin/spot-test/create')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
            >
              Launch First Assessment
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
