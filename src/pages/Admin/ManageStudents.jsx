import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";

const ManageStudents = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Modal states
    const [deleteModal, setDeleteModal] = useState({ open: false, student: null });
    const [blockModal, setBlockModal] = useState({ open: false, student: null });
    const [perfModal, setPerfModal] = useState({ open: false, student: null, data: null });
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch Students
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await API.get("/auth/students");
            setStudents(response.data);
            setError("");
        } catch (err) {
            console.error("Error fetching students:", err);
            setError("Failed to load students. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Auto-dismiss success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Delete Student
    const handleDelete = async () => {
        if (!deleteModal.student) return;
        setActionLoading(true);
        try {
            await API.delete(`/auth/students/${deleteModal.student._id}`);
            setStudents((prev) => prev.filter((s) => s._id !== deleteModal.student._id));
            setSuccessMessage(`${deleteModal.student.name}'s account has been permanently deleted.`);
            setDeleteModal({ open: false, student: null });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete student.");
        } finally {
            setActionLoading(false);
        }
    };

    // Toggle Block/Unblock
    const handleToggleBlock = async () => {
        if (!blockModal.student) return;
        setActionLoading(true);
        try {
            const res = await API.patch(`/auth/students/${blockModal.student._id}/block`);
            setStudents((prev) =>
                prev.map((s) =>
                    s._id === blockModal.student._id
                        ? { ...s, isBlocked: res.data.student.isBlocked, blockedAt: res.data.student.blockedAt }
                        : s
                )
            );
            setSuccessMessage(res.data.message);
            setBlockModal({ open: false, student: null });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update student status.");
        } finally {
            setActionLoading(false);
        }
    };

    // Filter Logic
    const filteredStudents = students.filter((student) => {
        const term = searchTerm.toLowerCase();
        return (
            student.name?.toLowerCase().includes(term) ||
            student.batch?.toLowerCase().includes(term) ||
            student.indexNumber?.toLowerCase().includes(term) ||
            student.email?.toLowerCase().includes(term)
        );
    });

    // Fetch Student Performance
    const fetchPerformance = async (student) => {
        try {
            setActionLoading(true);
            const response = await API.get(`/physical-exams/my-results?studentId=${student._id}`);
            if (response.data.success) {
                setPerfModal({ open: true, student, data: response.data.results });
            }
        } catch (err) {
            console.error("Error fetching performance:", err);
            //setError("Failed to load performance data.");
        } finally {
            setActionLoading(false);
        }
    };

    // Stats
    const totalStudents = students.length;
    const blockedStudents = students.filter((s) => s.isBlocked).length;
    const activeStudents = totalStudents - blockedStudents;

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <div className="w-full">
                        <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl sm:rounded-2xl mb-4 text-blue-600">
                            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Manage Students</h1>
                        <p className="text-slate-500 mt-2 text-base sm:text-lg">View, search, block, or remove student accounts.</p>
                        <button
                            onClick={() => navigate("/signup")}
                            className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Account
                        </button>
                    </div>

                    <div className="w-full md:w-96 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, index, batch or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalStudents}</p>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-600">{activeStudents}</p>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 dark:bg-red-950/50 rounded-xl">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-500">{blockedStudents}</p>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Blocked</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUCCESS MESSAGE */}
                {successMessage && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl text-emerald-700 dark:text-emerald-400 flex items-center gap-3 animate-fade-in">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-sm">{successMessage}</p>
                        <button onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-500 hover:text-emerald-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* ERROR STATE */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-2xl text-red-700 dark:text-red-400 flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium text-sm">{error}</p>
                        <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* CONTENT AREA */}
                {loading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none animate-pulse space-y-4">
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
                        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Index Number</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Registered On</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr key={student._id} className={`transition-colors group ${student.isBlocked ? "bg-red-50/50 dark:bg-red-950/10" : "hover:bg-slate-50 dark:hover:bg-slate-950/50"}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${student.isBlocked ? "bg-red-100 dark:bg-red-950/50 text-red-600" : "bg-blue-100 dark:bg-blue-950/50 text-blue-600"}`}>
                                                            {student.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className={`font-semibold ${student.isBlocked ? "text-slate-500 dark:text-slate-500 line-through" : "text-slate-900 dark:text-white"}`}>{student.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                                                        {student.indexNumber || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Batch {student.batch || "N/A"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {student.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.isBlocked ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(student.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {/* Performance Button */}
                                                        <button
                                                            onClick={() => fetchPerformance(student)}
                                                            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all duration-200"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            Stats
                                                        </button>

                                                        {/* Block / Unblock Button */}
                                                        <button
                                                            onClick={() => setBlockModal({ open: true, student })}
                                                            className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${student.isBlocked
                                                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                                                                : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/60"
                                                                }`}
                                                        >
                                                            {student.isBlocked ? (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                                    </svg>
                                                                    Unblock
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                    </svg>
                                                                    Block
                                                                </>
                                                            )}
                                                        </button>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, student })}
                                                            className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/60 transition-all duration-200"
                                                        >
                                                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                    <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No students found</p>
                                                    <p className="text-sm">Try adjusting your search term.</p>
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

            {/* ═══════════════════════════════════ DELETE CONFIRMATION MODAL ═══════════════════════════════════ */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-fade-slide"
                    >
                        {/* Red header zone */}
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Delete Student Account</h3>
                            <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 font-bold text-lg">
                                    {deleteModal.student?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{deleteModal.student?.name}</p>
                                    <p className="text-sm text-slate-500">{deleteModal.student?.email}</p>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                Are you sure you want to <span className="font-semibold text-red-600">permanently delete</span> this student's account?
                                All associated data including test submissions, scores, and progress will be lost.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteModal({ open: false, student: null })}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                                >
                                    {actionLoading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Permanently
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════ BLOCK / UNBLOCK MODAL ═══════════════════════════════════ */}
            {blockModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-fade-slide"
                    >
                        {/* Header zone */}
                        <div className={`p-6 text-center bg-gradient-to-br ${blockModal.student?.isBlocked ? "from-emerald-500 to-emerald-600" : "from-amber-500 to-orange-500"}`}>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
                                {blockModal.student?.isBlocked ? (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {blockModal.student?.isBlocked ? "Unblock Student" : "Block Student"}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">
                                {blockModal.student?.isBlocked ? "Restore access to this account" : "Temporarily restrict access"}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${blockModal.student?.isBlocked ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600" : "bg-amber-100 dark:bg-amber-950/50 text-amber-600"}`}>
                                    {blockModal.student?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{blockModal.student?.name}</p>
                                    <p className="text-sm text-slate-500">{blockModal.student?.email}</p>
                                    {blockModal.student?.isBlocked && blockModal.student?.blockedAt && (
                                        <p className="text-xs text-red-500 mt-0.5">
                                            Blocked since {new Date(blockModal.student.blockedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                {blockModal.student?.isBlocked ? (
                                    <>
                                        Are you sure you want to <span className="font-semibold text-emerald-600">unblock</span> this student?
                                        They will regain full access to their account and all platform features.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to <span className="font-semibold text-amber-600">temporarily block</span> this student?
                                        They won't be able to log in until unblocked. Their data will be preserved.
                                    </>
                                )}
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setBlockModal({ open: false, student: null })}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleToggleBlock}
                                    disabled={actionLoading}
                                    className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${blockModal.student?.isBlocked
                                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
                                        : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/25"
                                        }`}
                                >
                                    {actionLoading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : blockModal.student?.isBlocked ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                            Unblock Student
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            Block Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PERFORMANCE DETAILS MODAL */}
            {perfModal.open && perfModal.data && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-slide">

                        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-rose-900/20">
                                    {perfModal.student?.name?.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight">{perfModal.student?.name}</h2>
                                    <div className="flex items-center gap-3 mt-1 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        <span>Index: {perfModal.student?.indexNumber}</span>
                                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                        <span>Batch: {perfModal.student?.batch}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setPerfModal({ open: false, student: null, data: null })}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Classroom Exams</p>
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">{perfModal.data.length}</div>
                                </div>
                                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2">Average Percentage</p>
                                    <div className="text-4xl font-black text-rose-600">
                                        {perfModal.data.length > 0
                                            ? (perfModal.data.reduce((acc, curr) => acc + (curr.score / (curr.exam?.totalMarks || 100)), 0) / perfModal.data.length * 100).toFixed(1)
                                            : 0}%
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Classroom Exam History</h4>
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Title</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {perfModal.data.map((res, i) => (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                        {new Date(res.exam?.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-slate-800 dark:text-slate-100">{res.exam?.title}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="font-black text-slate-900 dark:text-white">
                                                            {res.score} <span className="text-slate-400 text-[10px]">/ {res.exam?.totalMarks}</span>
                                                        </div>
                                                        <div className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">
                                                            {((res.score / (res.exam?.totalMarks || 100)) * 100).toFixed(0)}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setPerfModal({ open: false, student: null, data: null })}
                                className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudents;
