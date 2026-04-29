import { useState, useEffect } from "react";
import StudentNavbar from "../../components/StudentNavbar";
import API from "../../services/api";
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Lock, FileText, Search, Clock, Eye, Send, Trash2, CheckCircle } from "lucide-react";

const Dailyworksheet = () => {
    const [worksheets, setWorksheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [uploadingId, setUploadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const openModal = (config) => setModal({ ...config, isOpen: true });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleConfirmSubmission = (worksheetId) => {
        openModal({
            title: "Confirm Submission",
            message: "Are you sure? Once confirmed, you cannot change your answer, and the official answer will be revealed.",
            type: "warning",
            confirmText: "Yes, Confirm",
            onConfirm: async () => {
                try {
                    setConfirmingId(worksheetId);
                    const response = await API.post(`/worksheets/${worksheetId}/confirm`);
                    setWorksheets((prev) =>
                        prev.map((ws) =>
                            ws._id === worksheetId ? { ...ws, mySubmission: response.data.data } : ws
                        )
                    );
                    await fetchWorksheets();
                    toast.success("Submission confirmed! Official answer revealed.");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to confirm submission.");
                } finally {
                    setConfirmingId(null);
                }
            }
        });
    };

    const handleDeleteSubmission = (worksheetId) => {
        openModal({
            title: "Delete Answer",
            message: "Are you sure you want to delete your submitted answer? You can re-upload a new one.",
            type: "danger",
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    setDeletingId(worksheetId);
                    await API.delete(`/worksheets/${worksheetId}/submit`);
                    setWorksheets((prev) =>
                        prev.map((ws) =>
                            ws._id === worksheetId ? { ...ws, mySubmission: null } : ws
                        )
                    );
                    toast.success("Answer deleted successfully.");
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to delete answer.");
                } finally {
                    setDeletingId(null);
                }
            }
        });
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
            setWorksheets((prev) =>
                prev.map((ws) =>
                    ws._id === worksheetId ? { ...ws, mySubmission: response.data.data } : ws
                )
            );
            toast.success("Answer submitted successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to submit answer.");
        } finally {
            setUploadingId(null);
            event.target.value = null;
        }
    };

    const now = new Date();
    const currentHour = now.getHours();
    const isWithinTimeRange = currentHour >= 4 && currentHour < 23.59;
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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

    // Calendar Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const [currentCalDate, setCurrentCalDate] = useState(new Date());

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const currentYear = currentCalDate.getFullYear();
    const currentMonth = currentCalDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => setCurrentCalDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentCalDate(new Date(currentYear, currentMonth + 1, 1));

    const isToday = (year, month, day) => {
        const d = new Date();
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    };

    const isDateSelected = (year, month, day) => {
        return selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;
    };

    const hasWorksheet = (year, month, day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return worksheets.some(ws => (ws.date || ws.createdAt.split('T')[0]) === dateStr);
    };

    const hasSubmission = (year, month, day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return worksheets.some(ws => (ws.date || ws.createdAt.split('T')[0]) === dateStr && ws.mySubmission);
    };

    const isTodayAllowed = () => {
        const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        return selectedDateStr === todayStr;
    };

    // Filter Logic
    const filteredWorksheets = worksheets.filter((ws) => {
        const wsDateStr = ws.date || ws.createdAt.split('T')[0];
        const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const isSameDay = wsDateStr === selectedDateStr;
        const term = searchTerm.toLowerCase();
        return isSameDay && (
            ws.fileName?.toLowerCase().includes(term) ||
            ws.notes?.toLowerCase().includes(term)
        );
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "Unknown Date";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black ">
            <StudentNavbar />

            <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-8">
                {/* HEADER SECTION */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm dark:shadow-none border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-50 rounded-full opacity-50 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-4 group ring-1 ring-teal-100">
                            <CalendarIcon className="w-8 h-8 text-teal-600 transition-transform group-hover:rotate-12" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Daily Worksheets</h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">Navigate through your learning journey.</p>
                    </div>

                    <div className="w-full md:w-96 relative z-10">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search worksheets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-semibold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* CALENDAR COLUMN */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm dark:shadow-none border border-slate-100 lg:sticky lg:top-24">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {months[currentMonth]} <span className="text-slate-400 font-medium">{currentYear}</span>
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 transition-colors">
                                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 transition-colors">
                                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {days.map(day => (
                                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-2">
                                        {day}
                                    </div>
                                ))}
                                {[...Array(firstDayOfMonth)].map((_, i) => (
                                    <div key={`empty-${i}`} className="p-2"></div>
                                ))}
                                {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const selected = isDateSelected(currentYear, currentMonth, day);
                                    const today = isToday(currentYear, currentMonth, day);
                                    const highlighted = hasWorksheet(currentYear, currentMonth, day);
                                    const submitted = hasSubmission(currentYear, currentMonth, day);

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                                            className={`
                                                relative p-2 rounded-2xl transition-all duration-300 aspect-square flex flex-col items-center justify-center group
                                                ${selected ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 scale-105 z-10' : 'hover:bg-teal-50'}
                                                ${today && !selected ? 'ring-2 ring-teal-500/20 bg-teal-50/30' : ''}
                                            `}
                                        >
                                            <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>

                                            {highlighted && !selected && (
                                                <div className="absolute bottom-1.5 flex gap-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${submitted ? 'bg-blue-600' : 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] animate-pulse'}`}></div>
                                                </div>
                                            )}

                                            {submitted && selected && (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-200 mt-1" strokeWidth={3} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Available</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Submitted</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT COLUMN */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* SELECT DATE INFO */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm dark:shadow-none border border-slate-100 flex items-center justify-between overflow-hidden relative">
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-3 bg-teal-50 rounded-2xl">
                                    <Clock className="w-6 h-6 text-teal-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formatDate(selectedDate)}</h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{isTodayAllowed() ? "Viewing Today's Content" : "History View"}</p>
                                        {isTodayAllowed() && !isWithinTimeRange && (
                                            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-black border border-rose-100">LOCKED UNTIL 4AM</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!isTodayAllowed() && (
                                <div className="px-5 py-2.5 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-2 group">
                                    <Lock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-black text-amber-600 uppercase tracking-tight">Historical View Only</span>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 h-48"></div>
                                ))}
                            </div>
                        ) : filteredWorksheets.length > 0 ? (
                            <div className="space-y-4">
                                {filteredWorksheets.map((ws) => (
                                    <div
                                        key={ws._id}
                                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 shadow-sm dark:shadow-none hover:shadow-xl hover:border-teal-100 transition-all duration-500 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                                            <FileText className="w-32 h-32 text-teal-900" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-xs font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                            {ws.date ? "Fixed Schedule" : "Standard Entry"}
                                                        </span>
                                                        {ws.mySubmission && (
                                                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> Submitted
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-teal-700 transition-colors">
                                                        {ws.fileName}
                                                    </h3>
                                                    <p className="text-slate-500 leading-relaxed font-medium">
                                                        {ws.notes || "Master the chemistry concepts through this hands-on daily challenge."}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col gap-3 min-w-[200px]">
                                                    {isTodayAllowed() && isWithinTimeRange ? (
                                                        <a
                                                            href={ws.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30 active:scale-95 transition-all duration-300"
                                                        >
                                                            <Eye className="w-5 h-5" /> View Worksheet
                                                        </a>
                                                    ) : (
                                                        <div className="flex flex-col gap-1 items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-4 px-6 rounded-2xl cursor-not-allowed border border-slate-200">
                                                            <div className="flex items-center gap-2">
                                                                <Lock className="w-4 h-4" />
                                                                <span>{isTodayAllowed() && !isWithinTimeRange ? "Closed (4AM-12PM)" : "Access Locked"}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ACTION FOOTER */}
                                            <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4 items-center">
                                                {ws.mySubmission ? (
                                                    <div className="flex flex-wrap items-center gap-3 w-full">
                                                        <a
                                                            href={ws.mySubmission.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-6 py-3 bg-teal-50 text-teal-700 font-bold rounded-2xl hover:bg-teal-100 transition-all"
                                                        >
                                                            <Eye className="w-4 h-4" /> My Submission
                                                        </a>

                                                        {!ws.mySubmission.isConfirmed && (
                                                            <button
                                                                onClick={() => handleDeleteSubmission(ws._id)}
                                                                disabled={deletingId === ws._id}
                                                                className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}

                                                        {!ws.mySubmission.isConfirmed ? (
                                                            <button
                                                                onClick={() => handleConfirmSubmission(ws._id)}
                                                                disabled={confirmingId === ws._id}
                                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                                                            >
                                                                <CheckCircle2 className="w-5 h-5" /> Confirm & Get Key
                                                            </button>
                                                        ) : (
                                                            ws.officialAnswerUrl && (
                                                                <a
                                                                    href={ws.officialAnswerUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all animate-in fade-in slide-in-from-bottom-2"
                                                                >
                                                                    <Send className="w-5 h-5" /> View Official Answer
                                                                </a>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    isTodayAllowed() && isWithinTimeRange ? (
                                                        <div className="w-full">
                                                            <input
                                                                type="file"
                                                                id={`upload-${ws._id}`}
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(e, ws._id)}
                                                                accept=".pdf,image/*"
                                                            />
                                                            <label
                                                                htmlFor={`upload-${ws._id}`}
                                                                className={`w-full flex items-center justify-center gap-3 py-4 px-8 bg-emerald-100 text-emerald-700 font-black rounded-[1.5rem] border-2 border-emerald-200 border-dashed hover:bg-emerald-200 hover:border-emerald-300 transition-all cursor-pointer ${uploadingId === ws._id ? 'opacity-50 pointer-events-none' : ''}`}
                                                            >
                                                                {uploadingId === ws._id ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-700 border-t-transparent" /> : <Send className="w-5 h-5" />}
                                                                {uploadingId === ws._id ? 'SUBMITTING...' : 'UPLOAD YOUR ANSWER'}
                                                            </label>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full py-4 px-8 bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold rounded-[1.5rem] border-2 border-dashed border-slate-200 text-center uppercase tracking-widest text-xs">
                                                            {isTodayAllowed() && !isWithinTimeRange ? "Wait for Available Hours" : "Submissions Closed"}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 border-dashed p-20 text-center flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-teal-50/10 opacity-50"></div>
                                <div className="w-32 h-32 bg-teal-50/50 rounded-full flex items-center justify-center mb-8 relative z-10 group">
                                    <FileText className="w-16 h-16 text-teal-200 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">No Worksheet Found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto font-medium relative z-10">
                                    {isTodayAllowed()
                                        ? "There is no worksheet scheduled for today. Take a breather or review past lessons!"
                                        : "You didn't have any worksheets assigned for this specific date."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

export default Dailyworksheet;
