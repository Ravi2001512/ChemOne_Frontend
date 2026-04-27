import { useState, useEffect, Fragment } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";
import toast from 'react-hot-toast';
import { Search, Save, Trophy, Send, Plus, Trash2, X, Calendar, Hash, Users, BarChart3, Edit3, AlertTriangle, CheckSquare, Square } from 'lucide-react';

const ManageResults = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamIds, setSelectedExamIds] = useState([]);
    const [students, setStudents] = useState([]);
    const [marksByExam, setMarksByExam] = useState({}); // { [examId]: { [studentId]: score } }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("All Batches");
    const [isMultiSelect, setIsMultiSelect] = useState(false);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);

    const [creating, setCreating] = useState(false);

    // Exam creation state
    const [newDateForExam, setNewDateForExam] = useState(new Date().toISOString().split('T')[0]);
    const [selectedPaperType, setSelectedPaperType] = useState("Walasmulla Paper");

    const paperTypes = [
        "Walasmulla Paper",
        "Tangalle Paper",
        "Middeniya Paper",
        "Model Paper",
        "Unit Test",
        "Special Mock",
        "Other"
    ];

    // Get unique batches
    const batches = ["All Batches", ...new Set(students.map(s => s.batch).filter(Boolean).sort())];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [examsRes, studentsRes] = await Promise.all([
                API.get("/physical-exams"),
                API.get("/auth/students")
            ]);

            let activeExams = [];
            if (examsRes.data.success) {
                activeExams = examsRes.data.exams;
                setExams(activeExams);
            }

            if (activeExams.length > 0 && selectedExamIds.length === 0) {
                setSelectedExamIds([activeExams[0]._id]);
            }

            setStudents(studentsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to load initial data.");
        } finally {
            setLoading(false);
        }
    };

    // When selected exams change, load results for each
    useEffect(() => {
        if (selectedExamIds.length === 0) {
            setMarksByExam({});
            return;
        }

        const fetchAllResults = async () => {
            const newMarksByExam = { ...marksByExam };
            let updated = false;

            for (const examId of selectedExamIds) {
                if (!newMarksByExam[examId]) {
                    try {
                        const response = await API.get(`/physical-exams/${examId}/results`);
                        if (response.data.success) {
                            const examMarks = {};
                            response.data.results.forEach(res => {
                                examMarks[res.student._id] = res.score;
                            });
                            newMarksByExam[examId] = examMarks;
                            updated = true;
                        }
                    } catch (err) {
                        console.error(`Error fetching results for exam ${examId}:`, err);
                    }
                }
            }

            // Cleanup exams no longer selected
            Object.keys(newMarksByExam).forEach(id => {
                if (!selectedExamIds.includes(id)) {
                    delete newMarksByExam[id];
                    updated = true;
                }
            });

            if (updated) {
                setMarksByExam(newMarksByExam);
            }
        };

        fetchAllResults();
    }, [selectedExamIds]);

    const toggleExamSelection = (examId) => {
        if (isMultiSelect) {
            setSelectedExamIds(prev =>
                prev.includes(examId)
                    ? prev.filter(id => id !== examId)
                    : [...prev, examId]
            );
        } else {
            setSelectedExamIds([examId]);
        }
    };

    const handleCreateExam = async () => {
        if (!newDateForExam) {
            toast.error("Please select a date.");
            return;
        }
        try {
            setCreating(true);
            const response = await API.post("/physical-exams/create", {
                title: selectedPaperType,
                date: new Date(newDateForExam),
                batch: ["all"],
                totalMarks: 100
            });
            if (response.data.success) {
                toast.success(`${selectedPaperType} created successfully!`);
                const created = response.data.exam;
                setExams(prev => [created, ...prev]);
                if (isMultiSelect) {
                    setSelectedExamIds(prev => [...prev, created._id]);
                } else {
                    setSelectedExamIds([created._id]);
                }
            }
        } catch (err) {
            toast.error("Failed to create exam session.");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteExam = async () => {
        if (!examToDelete) return;
        try {
            const response = await API.delete(`/physical-exams/${examToDelete._id}`);
            if (response.data.success) {
                toast.success("Exam deleted successfully.");
                setExams(prev => prev.filter(e => e._id !== examToDelete._id));
                setSelectedExamIds(prev => prev.filter(id => id !== examToDelete._id));
                setShowDeleteModal(false);
                setExamToDelete(null);
            }
        } catch (err) {
            toast.error("Failed to delete exam.");
        }
    };

    const handleMarkChange = (examId, studentId, value) => {
        setMarksByExam(prev => ({
            ...prev,
            [examId]: {
                ...(prev[examId] || {}),
                [studentId]: value
            }
        }));
    };

    const handleSaveResults = async () => {
        if (selectedExamIds.length === 0) {
            toast.error("No active exam session selected.");
            return;
        }

        try {
            setSaving(true);
            let successCount = 0;

            for (const examId of selectedExamIds) {
                const examMarks = marksByExam[examId] || {};
                const resultsToUpload = Object.entries(examMarks)
                    .filter(([studentId, score]) => {
                        if (score === "" || score === undefined) return false;
                        if (selectedBatch !== "All Batches") {
                            const student = students.find(s => s._id === studentId);
                            return student && student.batch === selectedBatch;
                        }
                        return true;
                    })
                    .map(([studentId, score]) => ({
                        studentId,
                        score: Number(score)
                    }));

                if (resultsToUpload.length > 0) {
                    const response = await API.post("/physical-exams/upload-results", {
                        examId,
                        results: resultsToUpload
                    });
                    if (response.data.success) successCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Results saved for ${successCount} exam(s).`);
            } else {
                toast.error("No marks entered to save.");
            }
        } catch (err) {
            console.error("Error saving marks:", err);
            toast.error("Failed to save some results.");
        } finally {
            setSaving(false);
        }
    };

    const handleSendEmails = async () => {
        if (selectedExamIds.length === 0) return;
        try {
            setSending(true);
            let successCount = 0;
            for (const examId of selectedExamIds) {
                const response = await API.post(`/physical-exams/${examId}/notify-results`, {
                    batch: selectedBatch
                });
                if (response.data.success) successCount++;
            }
            toast.success(`Emails sent for ${successCount} exam(s).`);
        } catch (err) {
            console.error("Error sending emails:", err);
            toast.error("Failed to send some emails.");
        } finally {
            setSending(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            (student.name?.toLowerCase() || "").includes(term) ||
            (student.indexNumber?.toLowerCase() || "").includes(term) ||
            (student.batch?.toLowerCase() || "").includes(term)
        );
        const matchesBatch = selectedBatch === "All Batches" || student.batch === selectedBatch;
        return matchesSearch && matchesBatch;
    });

    const selectedExams = exams.filter(e => selectedExamIds.includes(e._id));

    // Aggregated stats
    const totalSelectedMarks = selectedExams.reduce((sum, e) => sum + e.totalMarks, 0);
    let totalMarkedCount = 0;
    let totalScoreSum = 0;
    let globalHighest = 0;

    selectedExams.forEach(exam => {
        const examMarks = marksByExam[exam._id] || {};
        filteredStudents.forEach(student => {
            const score = examMarks[student._id];
            if (score !== undefined && score !== "") {
                totalMarkedCount++;
                totalScoreSum += Number(score);
                if (Number(score) > globalHighest) globalHighest = Number(score);
            }
        });
    });

    const avgScore = totalMarkedCount > 0 ? (totalScoreSum / totalMarkedCount).toFixed(1) : "—";
    const highestScore = totalMarkedCount > 0 ? globalHighest : "—";

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HEADER */}
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl sm:rounded-2xl">
                                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Manage Results</h1>
                                <p className="text-sm sm:text-base text-slate-500 font-medium tracking-tight">Create exams, enter marks, and notify students.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTIVE EXAM SESSIONS */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none overflow-hidden">
                    <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">Active Exam Sessions</h2>
                                    <p className="text-xs text-slate-400 font-medium">Select sessions to manage results</p>
                                </div>

                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => {
                                            setIsMultiSelect(false);
                                            if (selectedExamIds.length > 1) setSelectedExamIds([selectedExamIds[0]]);
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isMultiSelect ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Single
                                    </button>
                                    <button
                                        onClick={() => setIsMultiSelect(true)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMultiSelect ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        Multi
                                    </button>
                                </div>
                            </div>

                            {/* EXAM CREATION CONTROLS IN HEADER */}
                            <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50">
                                {/* Paper Type Select */}
                                <div className="relative">
                                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <select
                                        className="pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none text-slate-900 dark:text-white appearance-none cursor-pointer w-48"
                                        value={selectedPaperType}
                                        onChange={(e) => setSelectedPaperType(e.target.value)}
                                    >
                                        {paperTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 pointer-events-none" />
                                </div>

                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="date"
                                        className="pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none text-slate-900 dark:text-white w-40"
                                        value={newDateForExam}
                                        onChange={(e) => setNewDateForExam(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleCreateExam}
                                    disabled={creating}
                                    className="px-5 py-2 bg-rose-600 text-white font-black rounded-xl text-xs hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-200 dark:shadow-none flex items-center gap-2 whitespace-nowrap"
                                >
                                    {creating ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Plus className="w-3.5 h-3.5" />
                                    )}
                                    <span>Add {selectedPaperType.split(' ')[0]} Paper</span>
                                </button>
                                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-xl uppercase tracking-widest">
                                    {selectedExamIds.length} Selected
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* HORIZONTAL SCROLL BAR FOR SELECT */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 p-6 lg:p-8">
                        <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
                            {exams.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                    <p className="text-slate-400 font-bold text-sm tracking-tight">No active exam sessions available</p>
                                </div>
                            )}
                            {exams.map(exam => {
                                const isSelected = selectedExamIds.includes(exam._id);
                                return (
                                    <div
                                        key={exam._id}
                                        onClick={() => toggleExamSelection(exam._id)}
                                        className={`relative group cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 min-w-[200px] flex-shrink-0 ${isSelected
                                            ? 'border-rose-500 bg-white dark:bg-rose-500/10 shadow-lg shadow-rose-200/50 dark:shadow-rose-500/10 ring-1 ring-rose-500/20'
                                            : 'border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-rose-200 dark:hover:border-rose-900/50 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="absolute top-3 right-3">
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-rose-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-100 dark:text-slate-800 group-hover:text-rose-100" />
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExamToDelete(exam);
                                                setShowDeleteModal(true);
                                            }}
                                            className="absolute bottom-3 right-3 p-1.5 text-slate-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        <div className={`inline-flex items-center justify-center p-2.5 rounded-xl mb-3 transition-all ${isSelected
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'
                                            }`}>
                                            <Trophy className="w-4 h-4" />
                                        </div>

                                        <h3 className={`font-black text-xs truncate mb-1 transition-colors ${isSelected ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                                            {exam.title}
                                        </h3>

                                        <div className="flex flex-col gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Hash className="w-3 h-3" />
                                                {exam.totalMarks} marks
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* QUICK STATS BAR */}
                {selectedExamIds.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[1.5rem] p-5 text-white shadow-lg shadow-rose-200 dark:shadow-none">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 opacity-70" />
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Marks Entered</p>
                            </div>
                            <h2 className="text-3xl font-black">{totalMarkedCount}</h2>
                            <p className="text-[10px] font-medium opacity-60">across all selected sessions</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-2 mb-1">
                                <BarChart3 className="w-4 h-4 text-indigo-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</p>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{avgScore}</h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-2 mb-1">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Highest</p>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{highestScore}</h2>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-teal-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions</p>
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedExamIds.length} Active</h2>
                        </div>
                    </div>
                )}

                {/* ACTION BAR */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Filter Batch:</span>
                            <div className="flex flex-wrap gap-2">
                                {batches.map(batch => (
                                    <button
                                        key={batch}
                                        onClick={() => setSelectedBatch(batch)}
                                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition-all border ${selectedBatch === batch
                                            ? "bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-200 dark:shadow-none"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-rose-200 hover:text-rose-500"
                                            }`}
                                    >
                                        {batch}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
                            <button
                                onClick={handleSendEmails}
                                disabled={sending || selectedExamIds.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-200 dark:shadow-none disabled:opacity-50 text-sm"
                            >
                                {sending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                <span>{sending ? "Sending..." : "Notify"}</span>
                            </button>
                            <button
                                onClick={handleSaveResults}
                                disabled={saving || selectedExamIds.length === 0}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200 dark:shadow-none disabled:opacity-50 text-sm"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saving ? "Saving..." : "Save All"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or index number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent mb-4"></div>
                        <p className="text-slate-500 font-bold">Loading students...</p>
                    </div>
                ) : selectedExamIds.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 p-20 flex flex-col items-center text-center">
                        <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-full mb-6">
                            <Plus className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Exam Selected</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium mb-6">Select one or more active sessions to manage marks.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden">
                        <div className="overflow-x-auto p-1">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap min-w-[300px]">Student Details</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Batch</th>
                                        {selectedExams.map(exam => (
                                            <th key={exam._id} className="px-8 py-6 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest text-right whitespace-nowrap">
                                                <div className="flex flex-col items-end">
                                                    <span>{exam.title}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">({exam.totalMarks} Marks)</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredStudents.length > 0 ? (
                                        (() => {
                                            const grouped = filteredStudents.reduce((acc, student) => {
                                                const batch = student.batch || "Unspecified";
                                                if (!acc[batch]) acc[batch] = [];
                                                acc[batch].push(student);
                                                return acc;
                                            }, {});

                                            return Object.entries(grouped).map(([batch, batchStudents]) => (
                                                <Fragment key={batch}>
                                                    <tr className="bg-slate-50/80 dark:bg-slate-950/40 border-y border-slate-100 dark:border-slate-800 text-slate-400">
                                                        <td colSpan={2 + selectedExams.length} className="px-8 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                                <span className="text-xs font-black uppercase tracking-widest">
                                                                    Batch: <span className="text-rose-600">{batch}</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    {batchStudents.map((student) => {
                                                        return (
                                                            <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                                <td className="px-8 py-5 whitespace-nowrap">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-black text-sm group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                                            {student.name?.charAt(0) || "?"}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{student.name}</div>
                                                                            <div className="text-xs font-black text-rose-500 tracking-wider uppercase font-mono">{student.indexNumber || "No ID"}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-5 whitespace-nowrap text-center">
                                                                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 uppercase tracking-wider">
                                                                        {student.batch}
                                                                    </span>
                                                                </td>
                                                                {selectedExams.map(exam => {
                                                                    const examMarks = marksByExam[exam._id] || {};
                                                                    const score = examMarks[student._id] ?? "";
                                                                    return (
                                                                        <td key={exam._id} className="px-8 py-5 whitespace-nowrap text-right min-w-[150px]">
                                                                            <div className="inline-flex items-center gap-2">
                                                                                <input
                                                                                    type="number"
                                                                                    max={exam.totalMarks}
                                                                                    min="0"
                                                                                    placeholder="—"
                                                                                    value={score}
                                                                                    onChange={(e) => handleMarkChange(exam._id, student._id, e.target.value)}
                                                                                    className="w-24 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-rose-600 text-right font-black text-base text-slate-900 dark:text-white transition-all shadow-sm"
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </Fragment>
                                            ));
                                        })()
                                    ) : (
                                        <tr>
                                            <td colSpan={2 + selectedExams.length} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                                                        <Search className="w-8 h-8 text-slate-200 dark:text-slate-600" />
                                                    </div>
                                                    <p className="text-slate-500 font-bold">No students found matching "{searchTerm}"</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>



            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && examToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-full mb-5">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Exam?</h3>
                            <p className="text-slate-500 font-medium mb-2">
                                This will permanently delete <span className="font-black text-slate-700 dark:text-slate-300">"{examToDelete.title}"</span> and all associated student results.
                            </p>
                            <p className="text-xs text-red-500 font-bold">This action cannot be undone.</p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => { setShowDeleteModal(false); setExamToDelete(null); }}
                                className="flex-1 px-6 py-3.5 text-slate-600 dark:text-slate-400 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteExam}
                                className="flex-1 px-6 py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 active:scale-95 transition-all"
                            >
                                Delete Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageResults;
