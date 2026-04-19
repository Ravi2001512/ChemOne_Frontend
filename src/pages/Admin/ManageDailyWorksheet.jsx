import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const ManageDailyWorksheet = () => {
    const [worksheets, setWorksheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWorksheet, setSelectedWorksheet] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [uploadingKeyId, setUploadingKeyId] = useState(null);

    // Modal state
    const [modal, setModal] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        onConfirm: () => {},
        type: 'danger'
    });

    const openModal = (config) => setModal({ ...config, isOpen: true });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleUploadKey = async (event, worksheetId) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadingKeyId(worksheetId);
            const response = await API.post(`/worksheets/${worksheetId}/official-answer`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Update local state to reflect successful key upload
            setWorksheets((prev) => prev.map(ws => ws._id === worksheetId ? { ...ws, officialAnswerUrl: response.data.data.officialAnswerUrl } : ws));
            toast.success("Official Answer Key uploaded successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to upload official answer.");
        } finally {
            setUploadingKeyId(null);
            event.target.value = null; // reset input
        }
    };

    const handleViewSubmissions = async (worksheet) => {
        const loadingToast = toast.loading("Loading submissions...");
        setSelectedWorksheet(worksheet);
        setLoadingSubmissions(true);
        try {
            const response = await API.get(`/worksheets/${worksheet._id}/submissions`);
            setSubmissions(response.data);
            toast.dismiss(loadingToast);
        } catch (err) {
            console.error("Error fetching submissions:", err);
            toast.error("Failed to load submissions.", { id: loadingToast });
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const closeSubmissionsModal = () => {
        setSelectedWorksheet(null);
        setSubmissions([]);
    };

    // Fetch Worksheets
    const fetchWorksheets = async () => {
        try {
            setLoading(true);
            const response = await API.get("/worksheets");
            setWorksheets(response.data);
            setError("");
        } catch (err) {
            console.error("Error fetching worksheets:", err);
            setError("Failed to load worksheets. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorksheets();
    }, []);

    // Filter Logic
    const filteredWorksheets = worksheets.filter((ws) => {
        const term = searchTerm.toLowerCase();
        return (
            ws.fileName?.toLowerCase().includes(term) ||
            ws.date?.includes(term) ||
            ws.notes?.toLowerCase().includes(term)
        );
    });

    // Delete Logic
    const handleDelete = (id) => {
        openModal({
            title: "Delete Worksheet",
            message: "Are you sure you want to delete this worksheet? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            onConfirm: async () => {
                const deletingToast = toast.loading("Deleting worksheet...");
                try {
                    await API.delete(`/worksheets/${id}`);
                    setWorksheets(prev => prev.filter((ws) => ws._id !== id));
                    toast.success("Worksheet deleted successfully.", { id: deletingToast });
                } catch (err) {
                    console.error("Error deleting worksheet:", err);
                    toast.error("Failed to delete worksheet.", { id: deletingToast });
                }
            }
        });
    };

    // GCS public URLs work directly for both view and download
    const getDownloadUrl = (url) => {
        if (!url) return "#";
        return url;
    };

    // Date Formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return "Unknown Date";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <AdminNavbar />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-100">
                    <div>
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Worksheets</h1>
                        <p className="text-slate-500 mt-2 text-lg">View, search, and manage uploaded daily worksheets.</p>
                    </div>

                    <div className="w-full md:w-96 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, date or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* ERROR STATE */}
                {error && (
                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-700 flex items-center gap-3">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* LOADING STATE */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 shadow-sm dark:shadow-none">
                                <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-4"></div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 mb-6"></div>
                                <div className="h-24 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-6"></div>
                                <div className="flex gap-3">
                                    <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                                    <div className="h-10 bg-slate-200 rounded-xl w-12"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* WORKSHEETS GRID */}
                        {filteredWorksheets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredWorksheets.map((ws) => (
                                    <div
                                        key={ws._id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 shadow-sm dark:shadow-none hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 truncate" title={ws.fileName}>
                                                    {ws.fileName}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-950 inline-block px-3 py-1 rounded-lg">
                                                    {formatDate(ws.date)}
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                                {ws.notes || <span className="italic text-slate-400">No notes provided.</span>}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 mt-auto">
                                            <div className="flex gap-2">
                                                <a
                                                    href={ws.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 bg-blue-50 text-blue-600 font-semibold py-3 px-2 rounded-xl text-center hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-1 text-sm border border-blue-100"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    View
                                                </a>
                                                <button
                                                    onClick={() => handleViewSubmissions(ws)}
                                                    className="flex-1 bg-indigo-50 text-indigo-600 font-semibold py-3 px-2 rounded-xl text-center hover:bg-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-1 text-sm border border-indigo-100"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Answers
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ws._id)}
                                                    className="w-10 flex-shrink-0 bg-white dark:bg-slate-900 border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 font-semibold py-3 flex items-center justify-center rounded-xl active:scale-95 transition-all"
                                                    title="Delete Worksheet"
                                                >
                                                    <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Key Upload Section */}
                                            <div className="flex">
                                                <input
                                                    type="file"
                                                    id={`upload-key-${ws._id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleUploadKey(e, ws._id)}
                                                    accept=".pdf,image/*"
                                                />
                                                <label
                                                    htmlFor={`upload-key-${ws._id}`}
                                                    className={`w-full bg-emerald-50 text-emerald-600 font-semibold py-3 px-2 rounded-xl text-center hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-1 text-sm border border-emerald-100 cursor-pointer ${uploadingKeyId === ws._id ? 'opacity-70 pointer-events-none' : ''}`}
                                                >
                                                    {uploadingKeyId === ws._id ? (
                                                        <svg className="animate-spin h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    )}
                                                    {uploadingKeyId === ws._id ? 'Uploading...' : (ws.officialAnswerUrl ? 'Update Official Answer' : 'Upload Official Answer')}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* EMPTY STATE */
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-6">
                                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Worksheets Found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    {searchTerm
                                        ? "We couldn't find any worksheets matching your search term. Try a different keyword."
                                        : "There are no daily worksheets uploaded yet. Head over to the upload section to add some."}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Submissions Modal */}
            {selectedWorksheet && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Answers</h2>
                                <p className="text-slate-500 mt-1">{selectedWorksheet.fileName}</p>
                            </div>
                            <button
                                onClick={closeSubmissionsModal}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
                            {loadingSubmissions ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                    <p className="mt-4 text-slate-500 font-medium">Fetching submissions...</p>
                                </div>
                            ) : submissions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {submissions.map((sub, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm dark:shadow-none border border-slate-200 flex flex-col group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{sub.student?.name || "Unknown Student"}</h3>
                                                    <p className="text-indigo-600 font-medium text-sm">Index: {sub.student?.indexNumber || "N/A"}</p>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                    {formatDate(sub.createdAt)}
                                                </span>
                                            </div>
                                            <a
                                                href={sub.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-auto flex items-center justify-center w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Answer
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">No Answers Yet</p>
                                    <p className="text-slate-500 mt-2">Students haven't submitted any answers for this worksheet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                confirmText={modal.confirmText}
            />
        </div>
    );
};

export default ManageDailyWorksheet;
