import { useState, useEffect, useMemo } from "react";
import StudentNavbar from "../../components/StudentNavbar";
import API from "../../services/api";
import { Trophy, Award, User, Clock, ChevronRight, BookOpen, Search, TrendingUp, BarChart3, Calendar, Target, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const ViewPhysicalResults = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resultsLoading, setResultsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Performance history
    const [myHistory, setMyHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    // Tabs
    const [activeTab, setActiveTab] = useState("history");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        fetchExams();
        fetchMyHistory();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await API.get("/physical-exams");
            if (response.data.success) {
                const user = JSON.parse(localStorage.getItem('user'));
                const studentBatch = user?.batch;

                const filteredExams = response.data.exams.filter(exam =>
                    exam.batch && (exam.batch.includes('all') || exam.batch.includes(studentBatch))
                );

                setExams(filteredExams);
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

    const fetchMyHistory = async () => {
        try {
            setHistoryLoading(true);
            const response = await API.get("/physical-exams/my-results");
            if (response.data.success) {
                setMyHistory(response.data.results);
            }
        } catch (err) {
            console.error("History fetch error:", err);
        } finally {
            setHistoryLoading(false);
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
    const myRank = results.findIndex(r => r.student?._id === currentUser?.id) + 1;

    // Compute performance stats from history
    const performanceStats = useMemo(() => {
        if (myHistory.length === 0) return null;

        const scores = myHistory
            .filter(r => r.exam)
            .map(r => ({
                score: r.score,
                total: r.exam.totalMarks,
                percentage: (r.score / r.exam.totalMarks) * 100,
                title: r.exam.title,
                date: r.exam.date
            }));

        if (scores.length === 0) return null;

        const percentages = scores.map(s => s.percentage);
        const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;
        const best = Math.max(...percentages);
        const latest = scores[0]?.percentage || 0;
        const previous = scores.length > 1 ? scores[1]?.percentage : null;
        const trend = previous !== null ? latest - previous : 0;

        return { avg, best, latest, trend, totalExams: scores.length, scores };
    }, [myHistory]);

    // Mini chart bar data
    const chartData = useMemo(() => {
        if (!performanceStats?.scores) return [];
        return [...performanceStats.scores].reverse().slice(-8); // Last 8 exams, chronological
    }, [performanceStats]);



    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black ">
            <StudentNavbar />

            <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-8">

                {/* HERO HEADER */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight mb-2">My Performance</h1>
                                <p className="text-slate-400 font-medium text-lg">Track your exam results, rankings, and progress over time.</p>
                            </div>
                            {performanceStats && (
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Exams Taken</p>
                                        <p className="text-2xl font-black">{performanceStats.totalExams}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Average</p>
                                        <p className="text-2xl font-black">{performanceStats.avg.toFixed(0)}%</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Background decorations */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl"></div>
                </div>

                {/* TABS */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit shadow-sm dark:shadow-none">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === "history"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        My History
                    </button>
                    <button
                        onClick={() => setActiveTab("leaderboard")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === "leaderboard"
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                    </button>
                </div>

                {/* ===== HISTORY TAB ===== */}
                {activeTab === "history" && (
                    <div className="space-y-6">
                        {historyLoading ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent mb-4"></div>
                                <p className="text-slate-500 font-bold">Loading your performance data...</p>
                            </div>
                        ) : !performanceStats ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 p-20 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-600 rounded-full flex items-center justify-center mb-6">
                                    <BookOpen className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium">You haven't taken any exams yet. Your performance history will appear here after your first exam.</p>
                            </div>
                        ) : (
                            <>
                                {/* STATS CARDS */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-rose-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Score</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{performanceStats.best.toFixed(0)}%</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{performanceStats.avg.toFixed(0)}%</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latest</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{performanceStats.latest.toFixed(0)}%</p>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-3xl font-black ${performanceStats.trend > 0 ? 'text-emerald-600' : performanceStats.trend < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                                {performanceStats.trend > 0 ? '+' : ''}{performanceStats.trend.toFixed(0)}%
                                            </p>
                                            {performanceStats.trend > 0 ? <ArrowUp className="w-5 h-5 text-emerald-500" /> :
                                                performanceStats.trend < 0 ? <ArrowDown className="w-5 h-5 text-red-500" /> :
                                                    <Minus className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </div>
                                </div>

                                {/* PERFORMANCE CHART */}
                                {chartData.length > 1 && (
                                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Performance Trend</h3>
                                                <p className="text-xs text-slate-400 font-medium">Your scores across recent exams</p>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                                Last {chartData.length} exams
                                            </span>
                                        </div>

                                        {/* Bar Chart */}
                                        <div className="flex items-end gap-2 lg:gap-3 h-48">
                                            {chartData.map((item, idx) => {
                                                const height = (item.percentage / 100) * 100;
                                                const isLatest = idx === chartData.length - 1;
                                                const isAbove70 = item.percentage >= 70;
                                                const isAbove50 = item.percentage >= 50;

                                                return (
                                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                                        {/* Tooltip */}
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                                            {item.score}/{item.total}
                                                        </div>

                                                        {/* Percentage label */}
                                                        <span className={`text-[10px] font-black ${isLatest ? 'text-rose-600' : 'text-slate-400'}`}>
                                                            {item.percentage.toFixed(0)}%
                                                        </span>

                                                        {/* Bar */}
                                                        <div className="w-full relative" style={{ height: '140px' }}>
                                                            <div
                                                                className={`absolute bottom-0 w-full rounded-xl transition-all duration-700 ease-out ${isLatest
                                                                    ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-lg shadow-rose-200 dark:shadow-rose-500/20'
                                                                    : isAbove70
                                                                        ? 'bg-gradient-to-t from-emerald-500 to-emerald-300'
                                                                        : isAbove50
                                                                            ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                                                                            : 'bg-gradient-to-t from-red-400 to-red-300'
                                                                    } group-hover:opacity-80`}
                                                                style={{
                                                                    height: `${height}%`,
                                                                    minHeight: '8px'
                                                                }}
                                                            ></div>
                                                        </div>

                                                        {/* Exam name */}
                                                        <p className="text-[9px] font-bold text-slate-400 text-center truncate w-full leading-tight mt-1">
                                                            {item.title.length > 10 ? item.title.substring(0, 10) + '…' : item.title}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Legend */}
                                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                                                <span className="text-[10px] font-bold text-slate-400">≥70%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded bg-amber-500"></div>
                                                <span className="text-[10px] font-bold text-slate-400">50-69%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded bg-red-400"></div>
                                                <span className="text-[10px] font-bold text-slate-400">&lt;50%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded bg-rose-600"></div>
                                                <span className="text-[10px] font-bold text-slate-400">Latest</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* EXAM HISTORY LIST */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
                                    <div className="px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Exam History</h3>
                                        <p className="text-xs text-slate-400 font-medium">All your past exam results in one place</p>
                                    </div>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {myHistory.filter(r => r.exam).map((result, idx) => {
                                            const percentage = (result.score / result.exam.totalMarks) * 100;
                                            const isAbove70 = percentage >= 70;
                                            const isAbove50 = percentage >= 50;

                                            return (
                                                <div
                                                    key={result._id}
                                                    className="px-6 lg:px-8 py-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-default"
                                                >
                                                    {/* Rank Badge */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${isAbove70
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600'
                                                        : isAbove50
                                                            ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600'
                                                            : 'bg-red-100 dark:bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>

                                                    {/* Exam Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                            {result.exam.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Calendar className="w-3 h-3 text-slate-400" />
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                {new Date(result.exam.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="hidden md:flex items-center gap-3 w-40">
                                                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${isAbove70
                                                                    ? 'bg-emerald-500'
                                                                    : isAbove50
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-red-400'
                                                                    }`}
                                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className={`text-xs font-black ${isAbove70
                                                            ? 'text-emerald-600'
                                                            : isAbove50
                                                                ? 'text-amber-600'
                                                                : 'text-red-500'
                                                            }`}>
                                                            {percentage.toFixed(0)}%
                                                        </span>
                                                    </div>

                                                    {/* Score */}
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{result.score}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">/ {result.exam.totalMarks}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ===== LEADERBOARD TAB ===== */}
                {activeTab === "leaderboard" && (
                    <div className="space-y-6">
                        {/* Exam Selector */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Exam</p>
                            <div className="flex flex-wrap gap-2">
                                {exams.map(exam => (
                                    <button
                                        key={exam._id}
                                        onClick={() => setSelectedExamId(exam._id)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${selectedExamId === exam._id
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                                            }`}
                                    >
                                        {exam.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* My Result Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                                {myResult ? (
                                    <div className="flex items-center gap-6">
                                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-5 rounded-2xl shadow-lg shadow-rose-200 dark:shadow-none">
                                            <Award className="w-10 h-10 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Performance</p>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-4xl font-black text-slate-900 dark:text-white">{myResult.score}</span>
                                                <span className="text-lg font-bold text-slate-400">/ {selectedExam?.totalMarks}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium mt-1">
                                                {((myResult.score / (selectedExam?.totalMarks || 100)) * 100).toFixed(1)}% scored
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-slate-300 dark:text-slate-600">
                                        <Search className="w-10 h-10" />
                                        <div>
                                            <p className="font-black text-sm">No result found for you</p>
                                            <p className="text-xs font-medium">Results may not have been published yet.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center">
                                {myResult ? (
                                    <>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Rank</p>
                                        <h2 className="text-5xl font-black text-slate-900 dark:text-white">#{myRank}</h2>
                                        <p className="text-xs text-slate-400 font-medium mt-1">of {results.length} students</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                                        <h2 className="text-3xl font-black text-slate-300 dark:text-slate-600">—</h2>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Batch Leaderboard</h3>
                                {selectedExam && (
                                    <span className="text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-full uppercase tracking-widest">
                                        Total: {selectedExam.totalMarks} Marks
                                    </span>
                                )}
                            </div>

                            {resultsLoading ? (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-600 border-t-transparent mb-4"></div>
                                    <p className="text-slate-500 font-bold">Loading leaderboard...</p>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-[2.5rem] overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Rank</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                {results.map((res, index) => {
                                                    const isMe = res.student._id === currentUser?.id;
                                                    const rank = index + 1;

                                                    return (
                                                        <tr
                                                            key={res._id}
                                                            className={`transition-all duration-300 ${isMe
                                                                ? 'bg-rose-50 dark:bg-rose-500/5 ring-2 ring-rose-500/10 z-10 relative'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                }`}
                                                        >
                                                            <td className="px-8 py-5">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm dark:shadow-none ${rank === 1 ? 'bg-amber-400 text-white' :
                                                                    rank === 2 ? 'bg-slate-300 text-white' :
                                                                        rank === 3 ? 'bg-amber-700 text-white' :
                                                                            isMe ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                                                    }`}>
                                                                    {rank}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-4">
                                                                    <div>
                                                                        <div className={`font-black text-lg tracking-tight ${isMe ? 'text-rose-900 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                                                            {res.student.name}
                                                                            {isMe && <span className="ml-2 text-[10px] bg-rose-200 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                                                                        </div>
                                                                        <div className={`text-xs font-black uppercase tracking-widest ${isMe ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                            {res.student.indexNumber || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5 text-right">
                                                                <div className="flex flex-col items-end">
                                                                    <div className={`text-3xl font-black ${isMe ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
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
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 p-20 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-600 rounded-full flex items-center justify-center mb-6">
                                        <BookOpen className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto font-medium">Results for this exam haven't been published yet. Check back soon!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewPhysicalResults;
