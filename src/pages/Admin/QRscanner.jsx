import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    QrCode,
    ArrowLeft,
    Search,
    Camera,
    CheckCircle,
    XCircle,
    RefreshCw,
    User as UserIcon,
    Calendar,
    Sparkles,
    CreditCard,
    UserCheck,
    Award,
    History
} from "lucide-react";

import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";

const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

const SCANNER_ID = "qr-reader";

const QRscanner = () => {
    const navigate = useNavigate();

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState(() => {
        try {
            return localStorage.getItem("qr_scanner_active_tab") || "scan";
        } catch (e) {
            return "scan";
        }
    });

    // Scanner
    const [isScanning, setIsScanning] = useState(false);
    const [scannerError, setScannerError] = useState("");

    // Student
    const [searchIndex, setSearchIndex] = useState(() => {
        try {
            return localStorage.getItem("qr_scanner_search_index") || "";
        } catch (e) {
            return "";
        }
    });
    const [student, setStudent] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [togglingMonth, setTogglingMonth] = useState(null);

    const scannerRef = useRef(null);
    const isProcessingRef = useRef(false); // Prevent duplicate scans

    useEffect(() => {
        try {
            localStorage.setItem("qr_scanner_active_tab", activeTab);
        } catch (e) {
            console.error("Failed to save activeTab to localStorage", e);
        }
    }, [activeTab]);

    useEffect(() => {
        try {
            if (searchIndex) {
                localStorage.setItem("qr_scanner_search_index", searchIndex);
            } else {
                localStorage.removeItem("qr_scanner_search_index");
            }
        } catch (e) {
            console.error("Failed to save searchIndex to localStorage", e);
        }
    }, [searchIndex]);

    // CLEANUP SCANNER (safe)
    const cleanupScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                // State 2 = SCANNING, State 3 = PAUSED
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.warn("Cleanup warning:", err);
            }
            scannerRef.current = null;
        }
        isProcessingRef.current = false;
    }, []);

    // SCAN SESSION FETCH & POLL
    const fetchScanSession = useCallback(async () => {
        try {
            const response = await API.get("/auth/scan-session");
            const session = response.data;

            setStudent((prev) => {
                const prevId = prev?._id || null;
                const nextId = session.activeStudent?._id || null;
                if (prevId !== nextId) {
                    return session.activeStudent;
                }
                const prevPaid = prev?.paidMonths || [];
                const nextPaid = session.activeStudent?.paidMonths || [];
                if (prevPaid.length !== nextPaid.length || !prevPaid.every(m => nextPaid.includes(m))) {
                    return session.activeStudent;
                }
                return prev;
            });

            setHistory((prev) => {
                const prevHistoryStr = JSON.stringify(prev);
                const nextHistoryStr = JSON.stringify(session.history || []);
                if (prevHistoryStr !== nextHistoryStr) {
                    return session.history || [];
                }
                return prev;
            });
        } catch (err) {
            console.error("Failed to fetch scan session:", err);
        }
    }, []);

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));
        fetchScanSession();

        const intervalId = setInterval(() => {
            fetchScanSession();
        }, 2000);

        return () => {
            clearInterval(intervalId);
            cleanupScanner();
        };
    }, [fetchScanSession]);

    // ============================
    // SUCCESS BEEP
    // ============================
    const playSuccessBeep = () => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            // ignore
        }
    };

    // ============================
    // START SCANNER
    // ============================
    const startScanning = async () => {
        setScannerError("");
        isProcessingRef.current = false;

        // Make sure old instance is fully gone
        await cleanupScanner();

        // Small delay to ensure DOM element is clean
        await new Promise((r) => setTimeout(r, 300));

        try {
            const html5QrCode = new Html5Qrcode(SCANNER_ID, { verbose: false });
            scannerRef.current = html5QrCode;

            // Use environment facing camera (back camera on phones), fallback to any camera
            const cameraConfig = { facingMode: "environment" };

            await html5QrCode.start(
                cameraConfig,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    disableFlip: false,
                },
                (decodedText) => {
                    // Guard: only process once
                    if (isProcessingRef.current) return;
                    isProcessingRef.current = true;

                    playSuccessBeep();
                    handleQRDetected(decodedText);
                },
                () => {
                    // Error callback (fires every failed frame — ignore)
                }
            );

            setIsScanning(true);
        } catch (err) {
            console.error("Start scanning failed:", err);

            // If environment camera fails, try with user-facing camera
            try {
                const html5QrCode = new Html5Qrcode(SCANNER_ID, { verbose: false });
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "user" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        disableFlip: false,
                    },
                    (decodedText) => {
                        if (isProcessingRef.current) return;
                        isProcessingRef.current = true;
                        playSuccessBeep();
                        handleQRDetected(decodedText);
                    },
                    () => { }
                );

                setIsScanning(true);
            } catch (err2) {
                console.error("Fallback camera also failed:", err2);
                setScannerError(
                    "Could not access any camera. Please allow camera permission and make sure no other app is using it."
                );
                setIsScanning(false);
            }
        }
    };

    // STOP SCANNER
    const stopScanning = async () => {
        await cleanupScanner();
        setIsScanning(false);
    };

    // QR DETECTED
    const handleQRDetected = async (decodedText) => {
        // Stop camera immediately
        await cleanupScanner();
        setIsScanning(false);

        let indexNo = decodedText.trim();
        if (indexNo.startsWith("ID:")) {
            indexNo = indexNo.replace("ID:", "");
        }

        toast.success(`QR Detected: ${indexNo}`);
        fetchStudentDetails(indexNo);
    };

    // FETCH STUDENT
    const fetchStudentDetails = async (indexNo) => {
        setLoading(true);
        try {
            const response = await API.post("/auth/scan-session", { indexNumber: indexNo.trim() });
            const session = response.data;
            if (session.activeStudent) {
                setStudent(session.activeStudent);
                toast.success(`Loaded: ${session.activeStudent.name}`);
            }
            if (session.history) {
                setHistory(session.history);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Student not found.");
        } finally {
            setLoading(false);
        }
    };

    // MANUAL SEARCH
    const handleManualSearch = (e) => {
        e.preventDefault();
        if (!searchIndex.trim()) {
            toast.error("Please enter an Index Number");
            return;
        }
        fetchStudentDetails(searchIndex);
    };

    // TOGGLE PAYMENT
    const togglePayment = async (monthName) => {
        if (!student) return;

        const isPaid = student.paidMonths?.includes(monthName);
        setTogglingMonth(monthName);

        try {
            const res = await API.post(`/auth/students/${student._id}/payment`, {
                month: monthName,
                isPaid: !isPaid
            });

            setStudent((prev) => ({
                ...prev,
                paidMonths: res.data.paidMonths
            }));

            toast.success(!isPaid ? `${monthName} marked paid` : `${monthName} marked unpaid`);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed updating payment");
        } finally {
            setTogglingMonth(null);
        }
    };

    const totalPaidMonths = student?.paidMonths?.length || 0;
    const paymentRatio = ((totalPaidMonths / 12) * 100).toFixed(0);

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black">
            <style>{`
                /* Force html5-qrcode video to fill our container properly */
                #${SCANNER_ID} {
                    position: relative !important;
                    padding: 0 !important;
                    border: none !important;
                }
                #${SCANNER_ID} video {
                    width: 100% !important;
                    height: auto !important;
                    border-radius: 12px !important;
                    object-fit: contain !important;
                }
                #${SCANNER_ID} img[alt="Info icon"] {
                    display: none !important;
                }
                #${SCANNER_ID}__scan_region {
                    min-height: 280px !important;
                }
                #${SCANNER_ID}__scan_region > br {
                    display: none !important;
                }
                #${SCANNER_ID}__dashboard_section,
                #${SCANNER_ID}__dashboard_section_swaplink,
                #${SCANNER_ID}__status_span,
                #${SCANNER_ID}__header_message,
                #${SCANNER_ID} > div:last-child {
                    display: none !important;
                }
            `}</style>

            <AdminNavbar />

            <main
                className={`max-w-7xl mx-auto px-4 py-28 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"
                    }`}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-600">
                        QR Scanner Portal
                    </span>
                </div>

                {/* HERO */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl mb-10 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                                QR Payment Board
                                <Sparkles className="text-yellow-500" size={24} />
                            </h1>
                            <p className="text-slate-500 mt-2">
                                Scan student QR codes instantly.
                            </p>
                        </div>

                        {/* TABS */}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start">
                            <button
                                onClick={() => setActiveTab("scan")}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "scan"
                                    ? "bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-white"
                                    : "text-slate-500"
                                    }`}
                            >
                                <Camera size={14} className="inline mr-1" />
                                Camera
                            </button>

                            <button
                                onClick={() => {
                                    stopScanning();
                                    setActiveTab("manual");
                                }}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "manual"
                                    ? "bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-white"
                                    : "text-slate-500"
                                    }`}
                            >
                                <Search size={14} className="inline mr-1" />
                                Manual
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT */}
                    <div className="lg:col-span-5">
                        {activeTab === "scan" ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-black flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
                                    <Camera size={18} className="text-indigo-600" />
                                    Camera Scanner
                                </h3>

                                <p className="text-xs text-slate-500 mb-6">
                                    Point your camera at the student's QR code.
                                </p>

                                {/* SCANNER CONTAINER - Always in DOM */}
                                <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-black min-h-[300px]">
                                    <div id={SCANNER_ID} className="w-full" />

                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/80 z-10">
                                            <QrCode size={48} className="mb-3 opacity-50" />
                                            <p className="text-sm font-bold">Scanner Inactive</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Press Start to activate
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* ERROR */}
                                {scannerError && (
                                    <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                                        <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                                        <span>{scannerError}</span>
                                    </div>
                                )}

                                {/* BUTTONS */}
                                <div className="mt-6">
                                    {!isScanning ? (
                                        <button
                                            onClick={startScanning}
                                            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <Camera size={16} />
                                            Start Scanner
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopScanning}
                                            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            Stop Scanner
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // MANUAL SEARCH
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-black mb-5 text-slate-900 dark:text-white flex items-center gap-2">
                                    <Search size={18} className="text-indigo-600" />
                                    Manual Search
                                </h3>

                                <form onSubmit={handleManualSearch} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                            Student Index Number
                                        </label>
                                        <input
                                            type="text"
                                            value={searchIndex}
                                            onChange={(e) => setSearchIndex(e.target.value)}
                                            placeholder="STU-26-0001"
                                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <Search size={16} />
                                        Search Student
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* SCANNED HISTORY */}
                        {history.length > 0 && (
                            <div className="mt-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                        <History size={16} className="text-indigo-600" />
                                        Scan History
                                    </h3>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await API.delete("/auth/scan-session/history");
                                                setHistory([]);
                                            } catch (err) {
                                                console.error("Failed to clear scan history:", err);
                                                toast.error("Failed to clear scan history.");
                                            }
                                        }}
                                        className="text-xs text-red-500 hover:text-red-600 font-semibold"
                                    >
                                        Clear History
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[240px] overflow-y-auto pr-1">
                                    {history.map((indexNo) => (
                                        <div
                                            key={indexNo}
                                            onClick={() => fetchStudentDetails(indexNo)}
                                            className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl cursor-pointer transition-all group"
                                        >
                                            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-semibold">
                                                {indexNo}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:underline">
                                                Load Details →
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-7">
                        {loading ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center min-h-[400px] border border-slate-100 dark:border-slate-800">
                                <RefreshCw size={40} className="animate-spin mb-4 text-indigo-600" />
                                <p className="font-bold text-slate-700 dark:text-white">Loading student...</p>
                            </div>
                        ) : student ? (
                            <div className="space-y-6">
                                {/* PROFILE */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between flex-wrap gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 text-2xl font-black">
                                                {student.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {student.name}
                                                </h2>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-mono">
                                                    <span>{student.indexNumber}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                    <span>Batch {student.batch}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                            <p className="text-3xl font-black text-slate-900 dark:text-white">
                                                {totalPaidMonths}<span className="text-sm text-slate-400">/12</span>
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                                Paid ({paymentRatio}%)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-6">
                                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${paymentRatio}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* MONTH GRID */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {MONTHS.map((month) => {
                                        const isPaid = student.paidMonths?.includes(month);
                                        const isToggling = togglingMonth === month;

                                        return (
                                            <div
                                                key={month}
                                                onClick={() => !isToggling && togglePayment(month)}
                                                className={`rounded-2xl p-5 border cursor-pointer transition-all active:scale-[0.97] select-none ${isPaid
                                                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                        Month
                                                    </span>

                                                    {isToggling ? (
                                                        <RefreshCw size={14} className="animate-spin text-slate-400" />
                                                    ) : isPaid ? (
                                                        <CheckCircle size={18} className="text-emerald-600" />
                                                    ) : (
                                                        <XCircle size={18} className="text-slate-300" />
                                                    )}
                                                </div>

                                                <div className="mt-4">
                                                    <h4 className={`text-lg font-black ${isPaid ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                                                        {month}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {isPaid ? "Paid ✓" : "Click to pay"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CLEAR */}
                                <button
                                    onClick={async () => {
                                        try {
                                            await API.delete("/auth/scan-session/active");
                                            setStudent(null);
                                            setSearchIndex("");
                                        } catch (err) {
                                            console.error("Failed to clear active student:", err);
                                            toast.error("Failed to clear active student.");
                                        }
                                    }}
                                    className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-white transition-all text-sm"
                                >
                                    Clear & Scan Next Student
                                </button>
                            </div>
                        ) : (
                            // EMPTY STATE
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center min-h-[450px] border border-slate-100 dark:border-slate-800">
                                <UserCheck size={48} className="text-slate-300 dark:text-slate-600" />
                                <h3 className="text-xl font-black mt-5 text-slate-800 dark:text-white">
                                    Waiting for Student
                                </h3>
                                <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
                                    Scan a QR code or search manually to display payment records.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default QRscanner;