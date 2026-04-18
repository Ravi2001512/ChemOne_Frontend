import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";
import toast from 'react-hot-toast';
import { Search, Save, Trophy, Users, BookOpen, ChevronRight, Plus, X } from 'lucide-react';

const ManageResults = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({}); // { studentId: score }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // New Exam Form State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newExamData, setNewExamData] = useState({
        title: "",
        batch: ["all"],
        totalMarks: 100
    });

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
            
            if (examsRes.data.success) {
                setExams(examsRes.data.exams);
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

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await API.post("/physical-exams/create", newExamData);
            if (response.data.success) {
                toast.success("Exam record created!");
                setExams([response.data.exam, ...exams]);
                setSelectedExamId(response.data.exam._id);
                setShowCreateForm(false);
                setNewExamData({ title: "", batch: ["all"], totalMarks: 100 });
            }
        } catch (err) {
            toast.error("Failed to create exam record.");
        } finally {
            setSaving(false);
        }
    }

    const handleMarkChange = (studentId, value) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: value
        }));
    };

    const handleSaveResults = async () => {
        if (!selectedExamId) {
            toast.error("Please select a physical exam record.");
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

    const filteredStudents = students.filter(student => {
        const term = searchTerm.toLowerCase();
        return (
            student.name?.toLowerCase().includes(term) ||
            student.indexNumber?.toLowerCase().includes(term) ||
            student.batch?.toLowerCase().includes(term)
        );
    });

    const selectedExam = exams.find(e => e._id === selectedExamId);
    const maxMarks = selectedExam ? selectedExam.totalMarks : 100;

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="inline-flex items-center justify-center p-3 bg-rose-50 rounded-2xl">
                                <Trophy className="w-8 h-8 text-rose-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Physical Exam Results</h1>
                                <p className="text-slate-500 font-medium tracking-tight">Manage scores for paper-based held exams.</p>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex items-end gap-4">
                            <div className="flex-1 max-w-sm">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Exam Session</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <select
                                        value={selectedExamId}
                                        onChange={(e) => setSelectedExamId(e.target.value)}
                                        className="block w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose an exam record...</option>
                                        {exams.map(exam => (
                                            <option key={exam._id} value={exam._id}>{exam.title} ({new Date(exam.date).toLocaleDateString()})</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 rotate-90 pointer-events-none" />
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowCreateForm(true)}
                                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                title="Add New Exam Record"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-96 space-y-4">
                         <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name/id..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-500 transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={handleSaveResults}
                            disabled={saving || !selectedExamId}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {saving ? "Saving..." : "Save All Results"}
                        </button>
                    </div>
                </div>

                {/* CREATE EXAM FORM MODAL (Overlay) */}
                {showCreateForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">New Physical Exam</h3>
                                <button onClick={() => setShowCreateForm(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateExam} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Exam Title</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="e.g. Monthly Common Test - SEP"
                                        value={newExamData.title}
                                        onChange={e => setNewExamData({...newExamData, title: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all outline-none font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Marks</label>
                                    <input 
                                        required
                                        type="number"
                                        value={newExamData.totalMarks}
                                        onChange={e => setNewExamData({...newExamData, totalMarks: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all outline-none font-bold"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg text-lg"
                                >
                                    {saving ? "Creating..." : "Create Record"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* STUDENT LIST TABLE */}
                {loading ? (
                    <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent mb-4"></div>
                        <p className="text-slate-500 font-bold">Loading students...</p>
                    </div>
                ) : !selectedExamId ? (
                    <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Select an Exam Session</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">Please choose an exam record or create a new one to start entering student marks.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Section/Batch</th>
                                        <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Physical Result ({maxMarks} Marks)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.map((student) => (
                                        <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 group-hover:text-rose-600 transition-colors">{student.name}</div>
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
                                                        className="w-32 px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-rose-600 focus:bg-white text-right font-black text-lg text-slate-900 transition-all placeholder:text-slate-300 shadow-sm"
                                                    />
                                                    <span className="text-slate-400 font-black text-sm italic">OUT OF {maxMarks}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageResults;
