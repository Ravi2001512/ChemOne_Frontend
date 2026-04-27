import { useState, useRef } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";

const DailyWorksheet = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [notes, setNotes] = useState("");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [error, setError] = useState("");

    const inputRef = useRef();

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // 📂 handle file select
    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f) {
            if (f.type === "application/pdf") {
                if (f.size > 20 * 1024 * 1024) {
                    setError("File size must be under 20MB");
                    return;
                }
                setFile(f);
                setUploaded(true);
                setError("");
            } else {
                setError("Please select a PDF file only");
            }
        }
    };

    // 📥 drag & drop
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) {
            if (f.type === "application/pdf") {
                if (f.size > 20 * 1024 * 1024) {
                    setError("File size must be under 20MB");
                    return;
                }
                setFile(f);
                setUploaded(true);
                setError("");
            } else {
                setError("Please drop a PDF file only");
            }
        }
    };

    // ❌ clear file
    const clearFile = () => {
        setFile(null);
        setProgress(0);
        setUploading(false);
        setUploaded(false);
        setSubmitted(false);
        setError("");
        setNotes("");
        if (inputRef.current) inputRef.current.value = "";
    };

    // 🚀 REAL upload to backend
    const handleSubmit = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("date", date);
        formData.append("notes", notes);

        try {
            setUploading(true);
            setError("");

            await API.post("/worksheets", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (event) => {
                    const percent = Math.round(
                        (event.loaded * 100) / event.total
                    );
                    setProgress(percent);
                },
            });

            setUploading(false);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError("Upload failed. Please try again.");
            setUploading(false);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    // ✅ SUCCESS SCREEN
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl max-w-md w-full border border-white/50">
                    <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Uploaded Successfully!
                    </h2>
                    <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl">
                        {file?.name}
                    </p>

                    <button
                        onClick={clearFile}
                        className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-medium hover:from-slate-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        📄 Upload Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-slate-950">
            <AdminNavbar />

            <div className="min-h-screen bg-blue-50 dark:bg-slate-950 flex justify-center p-6">
                <div className="bg-white dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl w-full max-w-2xl shadow-2xl border border-white/50">

                    {/* HEADER */}
                    <div className="p-8 border-b border-slate-200/50 bg-white rounded-t-3xl dark:bg-black">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent dark:text-white">
                                    Daily Worksheet
                                </h1>
                                <p className="text-sm text-slate-500 font-medium">
                                    {today}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">

                        {/* ERROR */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* DROP ZONE */}
                        {!file && (
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`group relative border-2 border-dashed p-12 text-center rounded-3xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl ${dragging
                                    ? "border-blue-400 bg-blue-50/80 scale-[1.02]"
                                    : "border-slate-200 hover:border-slate-300 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-50 dark:bg-slate-950"
                                    }`}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <div className="space-y-3">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 mb-1">
                                            Drop your PDF here
                                        </p>
                                        <p className="text-sm text-slate-500">
                                            or click to browse (Max 20MB)
                                        </p>
                                    </div>
                                </div>
                                {dragging && (
                                    <div className="absolute inset-0 bg-blue-500/10 rounded-3xl animate-pulse flex items-center justify-center">
                                        <svg className="w-12 h-12 text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FILE CARD */}
                        {file && (
                            <div className="border-2 border-slate-200 p-6 rounded-3xl bg-gradient-to-r from-slate-50 to-blue-50/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-900 truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={clearFile}
                                        className="p-2 hover:bg-red-100 rounded-2xl text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* PROGRESS */}
                                {uploading && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uploading...</span>
                                            <span className="text-sm font-bold text-blue-600">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-2xl h-3 overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg transition-all duration-500 ease-out flex items-center justify-center"
                                                style={{
                                                    width: `${progress}%`,
                                                }}
                                            >
                                                {progress === 100 && (
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DATE */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Worksheet Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border-2 border-slate-200 p-4 rounded-2xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 shadow-sm dark:shadow-none hover:shadow-md bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300"
                            />
                        </div>

                        {/* NOTES */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional notes about this worksheet..."
                                maxLength={500}
                                rows={4}
                                className="w-full border-2 border-slate-200 p-4 rounded-2xl resize-vertical focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 transition-all duration-200 shadow-sm dark:shadow-none hover:shadow-md bg-white dark:bg-slate-900/50"
                            ></textarea>
                            <p className="text-xs text-slate-500 mt-1">{notes.length}/500</p>
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={clearFile}
                                className="flex-1 bg-gradient-to-r from-slate-100 to-slate-200 py-4 px-6 rounded-2xl font-semibold text-slate-700 dark:text-slate-600 hover:from-slate-200 hover:to-slate-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                                disabled={uploading}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={!file || uploading}
                                className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 py-4 px-6 rounded-2xl font-semibold text-white hover:from-slate-800 hover:to-slate-700 disabled:from-slate-400 disabled:to-slate-300 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Upload Worksheet
                                    </>
                                )}
                            </button>
                        </div>
                    </div >
                </div >
            </div >
        </div >
    );
}

export default DailyWorksheet;