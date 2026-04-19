import { useState, useEffect } from "react";
import StudentNavbar from "../../components/StudentNavbar";
import API from "../../services/api";
import { Trophy, Award, User, Clock, ChevronRight, BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewPhysicalResults = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchExams();
        // Load user from local storage to identify them in the list
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await API.get("/physical-exams");
            if (response.data.success) {
                const user = JSON.parse(localStorage.getItem('user'));
                const studentBatch = user?.batch;
                
                // Filter to only show exams available for the student's batch
                const filteredExams = response.data.exams.filter(exam => 
                    exam.batch && (exam.batch.includes('all') || exam.batch.includes(studentBatch))
                );

                setExams(filteredExams);
                // Auto select first exam if available
                if (filteredExams.length > 0) {
                    setSelectedExamId(filteredExams[0]._id);
                }
            }
        } catch (err) {
            toast.error("Failed to load exams list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedExamId) return;

        const fetchResults = async () => {
            try {
                setResultsLoading(true);
                const response = await API.get(`/physical-exams/student-results/${selectedExamId}`);
                if (response.data.success) {
                    setResults(response.data.results);
                }
            } catch (err) {
                console.error("Results fetch error:", err);
                toast.error("Could not load leaderboard for this exam.");
                setResults([]);
            } finally {
                setResultsLoading(false);
            }
        };

        fetchResults();
    }, [selectedExamId]);

    const selectedExam = exams.find(e => e._id === selectedExamId);
    const myResult = results.find(r => r.student._id === currentUser?.id);
    const myRank = results.findIndex(r => r.student._id === currentUser?.id) + 1;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <StudentNavbar />

            <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HERO STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h1 className="text-4xl font-black tracking-tight mb-2">Class Performance</h1>
                            <p className="text-slate-400 font-medium text-lg">Track your progress and rankings in physically held exams.</p>
                            
                            {selectedExam && (
                                <div className="mt-8 inline-flex items-center gap-4 bg-white dark:bg-slate-900/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                    <div className="p-3 bg-rose-500 rounded-xl">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-300">Viewing Statistics For</p>
                                        <h3 className="text-xl font-bold">{selectedExam.title}</h3>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Abstract background shapes */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 left-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center text-center group cursor-default transition-all hover:border-rose-200">
                        {myResult ? (
                            <>
                                <div className="mx-auto bg-rose-50 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                                    <Award className="w-10 h-10 text-rose-600" />
                                </div>
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest mb-1">Your Rank</p>
                                <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white">#{myRank}</h2>
                                <p className="text-slate-500 mt-2 font-bold">out of {results.length} students</p>
                            </>
                        ) : (
                            <div className="text-slate-300">
                                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="font-black uppercase text-xs tracking-widest">No Record Found</p>
                                <p className="text-sm font-medium mt-2">No results available for you yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* RESULTS LEADERBOARD */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Batch Performance Leaderboard</h3>
                            {selectedExam && (
                                <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                                    Total: {selectedExam.totalMarks} Marks
                                </span>
                            )}
                        </div>

                        {resultsLoading ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 shadow-sm dark:shadow-none flex flex-col items-center justify-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent mb-4"></div>
                                <p className="text-slate-500 font-bold">Synchronizing leaderboard...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2.5rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-100">
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Rank</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {results.map((res, index) => {
                                                const isMovingOne = res.student._id === currentUser?.id;
                                                const rank = index + 1;
                                                
                                                return (
                                                    <tr 
                                                        key={res._id} 
                                                        className={`transition-all duration-300 ${
                                                            isMovingOne 
                                                            ? 'bg-rose-50 ring-2 ring-rose-500/10 z-10 relative scale-[1.01] shadow-xl shadow-rose-900/5' 
                                                            : 'hover:bg-slate-50 dark:bg-slate-950/50'
                                                        }`}
                                                    >
                                                        <td className="px-8 py-6">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm dark:shadow-none ${
                                                                rank === 1 ? 'bg-amber-400 text-white' : 
                                                                rank === 2 ? 'bg-slate-300 text-white' :
                                                                rank === 3 ? 'bg-amber-700 text-white' :
                                                                isMovingOne ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-400'
                                                            }`}>
                                                                {rank}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div>
                                                                    <div className={`font-black text-lg tracking-tight ${isMovingOne ? 'text-rose-900' : 'text-slate-800 dark:text-slate-100'}`}>
                                                                        {res.student.name}
                                                                        {isMovingOne && <span className="ml-2 text-[10px] bg-rose-200 text-rose-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                                                                    </div>
                                                                    <div className={`text-xs font-black uppercase tracking-widest ${isMovingOne ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                        {res.student.indexNumber || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex flex-col items-end">
                                                                <div className={`text-3xl font-black ${isMovingOne ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                                                                    {res.score}
                                                                </div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                                    / {selectedExam?.totalMarks} Marks
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 text-slate-200 rounded-full flex items-center justify-center mb-6">
                                    <BookOpen className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium">Results for this exam session haven't been published yet. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPhysicalResults;
