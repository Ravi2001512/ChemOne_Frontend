import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, Search, Layout, CheckCircle2, Flag, LogOut } from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';
import API from '../../services/api';

const ViewSpotTest = () => {
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
        setError(error.response?.data?.message || error.message || "Could not connect to assessment server");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(test.batch) ? test.batch.join(' ').toLowerCase() : test.batch.toLowerCase()).includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-black ">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl sm:truncate tracking-tight flex items-center gap-3">
              <BookOpen className="text-indigo-600 h-10 w-10" />
              Available Spot Tests
            </h2>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              Quickly assess your knowledge with these recent assignments from your instructors.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl bg-white dark:bg-slate-900 shadow-sm dark:shadow-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
            placeholder="Search by title or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-10 bg-rose-50 border border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-700 animate-in fade-in slide-in-from-top-4">
            <div className="bg-rose-500 text-white p-2 rounded-xl">
              <LogOut className="h-5 w-5" />
            </div>
            <p className="font-bold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 shadow-sm dark:shadow-none">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-500 font-medium">Fetching assessments...</p>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className={`group bg-white dark:bg-slate-900 rounded-3xl border ${test.isSubmitted ? 'border-green-100' : 'border-slate-100'} shadow-sm dark:shadow-none hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden ${test.isSubmitted ? 'cursor-default' : 'cursor-pointer'} flex flex-col`}
                onClick={() => !test.isSubmitted && navigate(`/student/spot-test/${test._id}`)}
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${test.isSubmitted ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'} transition-colors duration-300`}>
                      {test.testType === 'image' ? <Flag className="h-6 w-6" /> : <Layout className="h-6 w-6" />}
                    </div>
                    {test.isSubmitted ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {test.testType === 'image' ? 'VIEWED' : 'COMPLETED'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {Array.isArray(test.batch)
                          ? (test.batch.includes('all') ? 'ALL STUDENTS' : test.batch.join('/'))
                          : test.batch}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xl font-bold ${test.isSubmitted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'} mb-2 group-hover:text-indigo-600 transition-colors`}>
                    {test.title}
                  </h3>
                  {test.isSubmitted && test.testType === 'mcq' ? (
                    <div className="bg-green-50/50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Your Result</p>
                      <p className="text-2xl font-black text-green-600">{test.score} / {test.totalMarks}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                      {test.description || (test.testType === 'image' ? "Reference material uploaded by your instructor." : "No description provided.")}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                    {test.testType === 'mcq' && test.duration > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{test.duration} mins</span>
                      </div>
                    )}
                    {test.testType === 'mcq' && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>{test.questions.length} Questions</span>
                      </div>
                    )}
                    {test.testType === 'image' && (
                      <div className="flex items-center gap-1.5">
                        <Layout className="h-4 w-4 text-slate-400" />
                        <span>Image Resource</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`px-6 py-4 ${test.isSubmitted ? 'bg-green-50/30' : 'bg-slate-50 dark:bg-slate-950 group-hover:bg-indigo-50'} transition-colors flex items-center justify-between`}>
                  <span className={`${test.isSubmitted ? 'text-green-700' : 'text-indigo-600'} font-bold text-sm`}>
                    {test.isSubmitted
                      ? (test.testType === 'image' ? "Viewed" : "Submission Received")
                      : (test.testType === 'image' ? "View Resource" : "Start Test")}
                  </span>
                  {!test.isSubmitted && <ChevronRight className="h-5 w-5 text-indigo-600 transform group-hover:translate-x-1 transition-transform" />}
                  {test.isSubmitted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-full mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Spot Tests Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Any spot tests assigned to your batch will appear here. Check back later!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewSpotTest;
