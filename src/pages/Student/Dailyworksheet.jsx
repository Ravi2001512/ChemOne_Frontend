import { useState, useEffect } from "react";
import StudentNavbar from "../../components/StudentNavbar";
import API from "../../services/api";

const Dailyworksheet = () => {
    const [worksheets, setWorksheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [uploadingId, setUploadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);

    const handleConfirmSubmission = async (worksheetId) => {
        if (!window.confirm("Are you sure? Once confirmed, you cannot change your answer, and the official answer will be revealed.")) return;
        try {
            setConfirmingId(worksheetId);
            const response = await API.post(`/worksheets/${worksheetId}/confirm`);
            setWorksheets((prev) =>
                prev.map((ws) =>
                    ws._id === worksheetId ? { ...ws, mySubmission: response.data.data } : ws
                )
            );
            alert("Submission confirmed! You can now view the official answer.");
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to confirm submission.");
        } finally {
            setConfirmingId(null);
        }
    };

    const handleDeleteSubmission = async (worksheetId) => {
        if (!window.confirm("Are you sure you want to delete your submitted answer? You can re-upload a new one.")) return;
        try {
            setDeletingId(worksheetId);
            await API.delete(`/worksheets/${worksheetId}/submit`);
            setWorksheets((prev) =>
                prev.map((ws) =>
                    ws._id === worksheetId ? { ...ws, mySubmission: null } : ws
                )
            );
        } catch (err) {
            console.error(err);
            alert("Failed to delete answer.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleFileUpload = async (event, worksheetId) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadingId(worksheetId);
            const response = await API.post(`/worksheets/${worksheetId}/submit`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Immediately show the new submission in UI
            setWorksheets((prev) =>
                prev.map((ws) =>
                    ws._id === worksheetId ? { ...ws, mySubmission: response.data.data } : ws
                )
            );
            alert("Answer submitted successfully!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to submit answer.");
        } finally {
            setUploadingId(null);
            event.target.value = null; // reset
        }
    };

    const now = new Date();
    const currentHour = now.getHours();
    const isWithinTimeRange = currentHour >= 1 && currentHour < 23; // 6 AM to 11 PM
    const todayStr = new Date().toISOString().split("T")[0];

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
        const isToday = ws.date === todayStr || (!ws.date && formatDate(ws.createdAt) === formatDate(now));
        const term = searchTerm.toLowerCase();
        return isToday && (
            ws.fileName?.toLowerCase().includes(term) ||
            ws.notes?.toLowerCase().includes(term)
        );
    });



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
        <div className="min-h-screen bg-slate-50">
            <StudentNavbar />

            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900">Today's Worksheet</h1>
                        <p className="text-slate-500 mt-2 text-lg">View your daily worksheet.</p>
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
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
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

                {/* TIME RESTRICTION STATE */}
                {!isWithinTimeRange ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Outside Available Hours</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            The daily worksheet is only available between <span className="font-semibold text-slate-700">6:00 AM</span> and <span className="font-semibold text-slate-700">11:00 PM</span>.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* LOADING STATE */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-4"></div>
                                        <div className="h-3 bg-slate-100 rounded-full w-1/2 mb-6"></div>
                                        <div className="h-24 bg-slate-50 rounded-2xl mb-6"></div>
                                        <div className="flex gap-3">
                                            <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
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
                                                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h3 className="font-bold text-slate-900 text-lg mb-1 truncate" title={ws.fileName}>
                                                            {ws.fileName}
                                                        </h3>
                                                        <p className="text-sm font-medium text-slate-500 bg-slate-50 inline-block px-3 py-1 rounded-lg">
                                                            {formatDate(ws.date)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                                                    <p className="text-sm text-slate-600 line-clamp-3">
                                                        {ws.notes || <span className="italic text-slate-400">No notes provided.</span>}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2 mt-auto">
                                                    <a
                                                        href={ws.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 bg-blue-50 text-blue-600 font-semibold py-3 px-2 rounded-xl text-center hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-1 text-sm border border-blue-100"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View
                                                    </a>

                                                    {ws.mySubmission ? (
                                                        <div className="flex flex-col gap-2 flex-1">
                                                            <div className="flex gap-2">
                                                                <a
                                                                    href={ws.mySubmission.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 bg-blue-600 text-white font-semibold py-3 px-2 rounded-xl text-center hover:bg-blue-700 active:scale-95 transition-all shadow-md hover:shadow-blue-500/25 flex items-center justify-center gap-1 text-sm"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    View My Answer
                                                                </a>
                                                                {!ws.mySubmission.isConfirmed && (
                                                                    <button
                                                                        onClick={() => handleDeleteSubmission(ws._id)}
                                                                        disabled={deletingId === ws._id}
                                                                        className="w-10 flex-shrink-0 bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 font-semibold py-3 flex items-center justify-center rounded-xl active:scale-95 transition-all shadow-md"
                                                                        title="Delete Answer"
                                                                    >
                                                                        {deletingId === ws._id ? (
                                                                            <svg className="animate-spin h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {!ws.mySubmission.isConfirmed ? (
                                                                <button
                                                                    onClick={() => handleConfirmSubmission(ws._id)}
                                                                    disabled={confirmingId === ws._id}
                                                                    className="w-full bg-orange-500 text-white font-bold py-3 px-2 rounded-xl text-center hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                                                                >
                                                                    {confirmingId === ws._id ? (
                                                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                    Confirm Submission
                                                                </button>
                                                            ) : (
                                                                ws.officialAnswerUrl && (
                                                                    <a
                                                                        href={ws.officialAnswerUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="w-full bg-emerald-50 text-emerald-600 font-bold py-3 px-2 rounded-xl text-center hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm border border-emerald-200 shadow-sm"
                                                                    >
                                                                        <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        View Official Answer
                                                                    </a>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                id={`upload-${ws._id}`}
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(e, ws._id)}
                                                                accept=".pdf,image/*"
                                                            />
                                                            <label
                                                                htmlFor={`upload-${ws._id}`}
                                                                className={`w-full bg-emerald-600 text-white font-semibold py-3 px-2 rounded-xl text-center hover:bg-emerald-700 active:scale-95 transition-all shadow-md hover:shadow-emerald-500/25 flex items-center justify-center gap-1 text-sm cursor-pointer ${uploadingId === ws._id ? 'opacity-70 pointer-events-none' : ''}`}
                                                            >
                                                                {uploadingId === ws._id ? (
                                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                )}
                                                                {uploadingId === ws._id ? 'Uploading...' : 'Submit Answer'}
                                                            </label>
                                                        </div>
                                                    )}

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* EMPTY STATE */
                                    <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Worksheet Today</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">
                                            There is no daily worksheet uploaded for today yet. Check back later!
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Dailyworksheet;
