import { useState, useRef, useCallback } from "react";
import AdminNavbar from "../../components/AdminNavbar";

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#16a34a" />
        <path d="M5.5 10.5l3 3 6-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PdfIcon = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.2" />
        <path d="M16 2v5h4" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12h8M8 15h8M8 18h5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="13" y="16" width="11" height="8" rx="1.5" fill="#ef4444" />
        <path d="M15.5 18.5h1.3c.7 0 1.1.3 1.1.9s-.4.9-1.1.9H15.5v1.7" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 18.5h1.2c.9 0 1.3.5 1.3 1.6s-.4 1.6-1.3 1.6H19" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.5 18.5v3.2M22.5 20.2h1.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

const UploadIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 6v16M16 6l-5 5M16 6l5 5" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 23v2a2 2 0 002 2h18a2 2 0 002-2v-2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M5 1.5v3M11 1.5v3M1.5 7h13" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const NotesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M5 6h6M5 9h6M5 12h3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);


export default function DailyWorksheet() {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const inputRef = useRef();
    const progressRef = useRef();

    const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    const simulateUpload = useCallback((f) => {
        setFile(f);
        setUploading(true);
        setUploaded(false);
        setProgress(0);
        let p = 0;
        clearInterval(progressRef.current);
        progressRef.current = setInterval(() => {
            p += Math.random() * 15 + 8;
            if (p >= 100) {
                p = 100;
                clearInterval(progressRef.current);
                setUploading(false);
                setUploaded(true);
            }
            setProgress(Math.min(Math.round(p), 100));
        }, 160);
    }, []);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f && f.type === "application/pdf") simulateUpload(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type === "application/pdf") simulateUpload(f);
    };

    const clearFile = () => {
        clearInterval(progressRef.current);
        setFile(null);
        setProgress(0);
        setUploading(false);
        setUploaded(false);
        setSubmitted(false);
        if (inputRef.current) inputRef.current.value = "";
    };

    const handleSubmit = () => {
        if (!uploaded) return;
        setSubmitted(true);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <path d="M6 14.5l5.5 5.5 10-11" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Worksheet uploaded!</h2>
                    <p className="text-slate-500 text-sm mb-1">{file?.name}</p>
                    <p className="text-slate-400 text-xs mb-8">{today}</p>
                    {notes && (
                        <div className="bg-slate-50 rounded-xl p-4 text-left mb-8">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                            <p className="text-sm text-slate-600">{notes}</p>
                        </div>
                    )}
                    <button
                        onClick={clearFile}
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                        Upload another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminNavbar />

            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-300 w-full max-w-5xl overflow-hidden">

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daily Worksheet</h1>
                        <p className="text-sm text-slate-400 mt-1">{today}</p>
                    </div>


                    <div className="px-8 py-6 space-y-5">

                        {/* Drop Zone */}
                        {!file && (
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragging
                                        ? "border-red-300 bg-red-50"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                    }
              `}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${dragging ? "bg-red-100" : "bg-white border border-slate-200"}`}>
                                    <UploadIcon />
                                </div>
                                <p className="text-sm font-medium text-slate-700 mb-1">
                                    {dragging ? "Drop it here!" : "Drop your PDF here"}
                                </p>
                                <p className="text-xs text-slate-400">
                                    or{" "}
                                    <span className="text-red-500 underline underline-offset-2">browse files</span>
                                </p>
                                <p className="text-xs text-slate-300 mt-3">PDF only · max 20 MB</p>
                            </div>
                        )}

                        {/* File Card */}
                        {file && (
                            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <PdfIcon />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                                    </div>
                                    {uploaded && (
                                        <div className="flex-shrink-0">
                                            <CheckIcon />
                                        </div>
                                    )}
                                    <button
                                        onClick={clearFile}
                                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                                    >
                                        <XIcon />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                {(uploading || uploaded) && (
                                    <div className="mt-3">
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-400 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-1.5">
                                            <p className="text-xs text-slate-400">
                                                {uploading ? "Uploading…" : "Ready to submit"}
                                            </p>
                                            <p className="text-xs text-slate-400">{progress}%</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                                <CalendarIcon />
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-widest mb-2">
                                <NotesIcon />
                                Notes
                                <span className="normal-case tracking-normal font-normal text-slate-300 ml-1">optional</span>
                            </label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this worksheet…"
                                className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all resize-none placeholder-slate-300"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 flex gap-3">
                        <button
                            onClick={clearFile}
                            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!uploaded}
                            className={`
              flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all
              ${uploaded
                                    ? "bg-slate-800 hover:bg-slate-700 active:scale-[0.98]"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }
            `}
                        >
                            Upload worksheet
                        </button>
                    </div>
                </div>
            </div >
        </>
    );
}