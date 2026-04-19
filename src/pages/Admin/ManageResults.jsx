import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";
import toast from 'react-hot-toast';
import { Search, Save, Trophy, BookOpen, ChevronRight, Send } from 'lucide-react';

const ManageResults = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");



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

            // If no exams exist, create a default one automatically
            if (activeExams.length === 0) {
                try {
                    const createRes = await API.post("/physical-exams/create", {
                        title: "Physical Exam Results",
                        date: new Date(),
                        batch: ["all"],
                        totalMarks: 100
                    });
                    if (createRes.data.success) {
                        const newExam = createRes.data.exam;
                        setExams([newExam]);
                        setSelectedExamId(newExam._id);
                    }
                } catch (createErr) {
                    console.error("Error creating default exam:", createErr);
                }
            } else if (!selectedExamId) {
                setSelectedExamId(activeExams[0]._id);
            }

            setStudents(studentsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            toast.error("Failed to load initial data.");
        } finally {
            setLoading(false);
        }
    };

    // When exam changes, load existing physical results
    useEffect(() => {
        if (!selectedExamId) {
            setMarks({});
            return;
        }

        const fetchResults = async () => {
            try {
                const response = await API.get(`/physical-exams/${selectedExamId}/results`);
                if (response.data.success) {
                    const existingMarks = {};
                    response.data.results.forEach(res => {
                        existingMarks[res.student._id] = res.score;
                    });
                    setMarks(existingMarks);
                }
            } catch (err) {
                console.error("Error fetching results:", err);
            }
        };

        fetchResults();
    }, [selectedExamId]);



    const handleMarkChange = (studentId, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSaveResults = async () => {
        if (!selectedExamId) {
            toast.error("No active exam session found. Please try refreshing the page.");
            return;
        }

        const resultsToUpload = Object.entries(marks)
            .filter(([_, score]) => score !== "" && score !== undefined)
            .map(([studentId, score]) => ({
                studentId,
                score: Number(score)
            }));

        if (resultsToUpload.length === 0) {
            toast.error("No marks entered to save.");
            return;
        }

        try {
            setSaving(true);
            const response = await API.post("/physical-exams/upload-results", {
                examId: selectedExamId,
                results: resultsToUpload
            });

            if (response.data.success) {
                toast.success(response.data.message);
            }
        } catch (err) {
            console.error("Error saving marks:", err);
            toast.error("Failed to save results.");
        } finally {
            setSaving(false);
        }
    };

    const handleSendEmails = async () => {
        if (!selectedExamId) return;
        try {
            setSending(true);
            const response = await API.post(`/physical-exams/${selectedExamId}/notify-results`);
            if (response.data.success) {
                toast.success(response.data.message || "Emails sent successfully!");
            }
        } catch (err) {
            console.error("Error sending emails:", err);
            toast.error(err.response?.data?.message || "Failed to send emails.");
        } finally {
            setSending(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const term = searchTerm.toLowerCase();
        return (
            (student.name?.toLowerCase() || "").includes(term) ||
            (student.indexNumber?.toLowerCase() || "").includes(term) ||
            (student.batch?.toLowerCase() || "").includes(term)
        );
    });

    const selectedExam = exams.find(e => e._id === selectedExamId);
    const maxMarks = selectedExam ? selectedExam.totalMarks : 100;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HEADER & CONTROLS */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm dark:shadow-none border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center justify-center p-3 bg-rose-50 rounded-2xl">
                                <Trophy className="w-8 h-8 text-rose-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Physical Exam Results</h1>
                                <p className="text-slate-500 font-medium tracking-tight">Manage scores and view all registered students.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleSendEmails}
                                disabled={sending}
                                className="flex items-center gap-2 px-8 py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-200 disabled:opacity-50"
                            >
                                {sending ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                                <span>{sending ? "Sending..." : "Send Results"}</span>
                            </button>
                            <button
                                onClick={handleSaveResults}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>{saving ? "Saving..." : "Save All Results"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or index number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>



                {/* STUDENT LIST TABLE */}
                {loading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 border border-slate-100 shadow-sm dark:shadow-none flex flex-col items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent mb-4"></div>
                        <p className="text-slate-500 font-bold">Loading students...</p>
                    </div>
                ) : (
                    <div className="space-y-6">


                        <div className="bg-white dark:bg-slate-900 border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Section/Batch</th>
                                            <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Physical Result ({maxMarks} Marks)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr key={student._id} className="hover:bg-slate-50 dark:bg-slate-950/50 transition-colors group">
                                                    <td className="px-8 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm dark:shadow-none">
                                                                {student.name?.charAt(0) || "?"}
                                                            </div>
                                                            <div>
                                                                <div className="font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{student.name}</div>
                                                                <div className="text-xs font-black text-rose-500 tracking-wider uppercase font-mono">{student.indexNumber || "No ID"}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">
                                                            {student.batch}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                                        <div className="inline-flex items-center gap-3">
                                                            <input
                                                                type="number"
                                                                max={maxMarks}
                                                                min="0"
                                                                placeholder="Marks"
                                                                value={marks[student._id] || ""}
                                                                onChange={(e) => handleMarkChange(student._id, e.target.value)}
                                                                className="w-32 px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-rose-600 focus:bg-white dark:bg-slate-900 text-right font-black text-lg text-slate-900 dark:text-white transition-all placeholder:text-slate-300 shadow-sm dark:shadow-none"
                                                            />
                                                            <span className="text-slate-400 font-black text-sm italic">OUT OF {maxMarks}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-full mb-4">
                                                            <Search className="w-8 h-8 text-slate-200" />
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageResults;
