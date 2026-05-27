import React, { useState, useEffect, useRef } from "react";
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
    Award
} from "lucide-react";

import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";

const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

const QRscanner = () => {
    const navigate = useNavigate();

    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState("scan");

    // Scanner
    const [isScanning, setIsScanning] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");
    const [scannerError, setScannerError] = useState("");

    // Student
    const [searchIndex, setSearchIndex] = useState("");
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [togglingMonth, setTogglingMonth] = useState(null);

    const qrScannerRef = useRef(null);

    const scannerContainerId = "qr-reader";

    useEffect(() => {
        requestAnimationFrame(() => setMounted(true));

        initCameras();

        return () => {
            stopScanning();
        };
    }, []);

    // =========================
    // SUCCESS BEEP
    // =========================
    const playSuccessBeep = () => {
        try {
            const audioCtx = new (window.AudioContext ||
                window.webkitAudioContext)();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.frequency.value = 880;
            osc.type = "sine";

            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioCtx.currentTime + 0.2
            );

            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } catch (err) {
            console.warn(err);
        }
    };

    // =========================
    // LOAD CAMERAS
    // =========================
    const initCameras = async () => {
        try {
            setScannerError("");

            const devices = await Html5Qrcode.getCameras();

            if (devices && devices.length > 0) {
                setCameras(devices);
                setSelectedCameraId(devices[0].id);
            } else {
                setScannerError("No cameras found.");
            }
        } catch (err) {
            console.error(err);

            setScannerError(
                "Camera permission denied or camera unavailable."
            );
        }
    };

    // =========================
    // START SCANNER
    // =========================
    const startScanning = async () => {
        try {
            setScannerError("");

            if (!selectedCameraId) {
                toast.error("No camera selected");
                return;
            }

            // stop old scanner first
            if (qrScannerRef.current) {
                await stopScanning();
            }

            const scanner = new Html5Qrcode(scannerContainerId);

            qrScannerRef.current = scanner;

            await scanner.start(
                selectedCameraId,
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    playSuccessBeep();
                    handleQRDetected(decodedText);
                },
                () => { }
            );

            setIsScanning(true);

        } catch (err) {
            console.error(err);

            setScannerError(
                "Failed to start camera scanner."
            );

            setIsScanning(false);
        }
    };

    // =========================
    // STOP SCANNER
    // =========================
    const stopScanning = async () => {
        try {
            if (qrScannerRef.current) {
                await qrScannerRef.current.stop();
                await qrScannerRef.current.clear();

                qrScannerRef.current = null;
            }
        } catch (err) {
            console.error("Stop scanner error:", err);
        }

        setIsScanning(false);
    };

    // =========================
    // SWITCH CAMERA
    // =========================
    const handleCameraChange = async (e) => {
        const nextCameraId = e.target.value;

        setSelectedCameraId(nextCameraId);

        if (isScanning) {
            await stopScanning();

            setTimeout(() => {
                startScanning();
            }, 300);
        }
    };

    // =========================
    // QR DETECTED
    // =========================
    const handleQRDetected = async (decodedText) => {
        await stopScanning();

        let indexNo = decodedText.trim();

        if (indexNo.startsWith("ID:")) {
            indexNo = indexNo.replace("ID:", "");
        }

        toast.success(`QR Detected: ${indexNo}`);

        fetchStudentDetails(indexNo);
    };

    // =========================
    // FETCH STUDENT
    // =========================
    const fetchStudentDetails = async (indexNo) => {
        try {
            setLoading(true);

            const response = await API.get(
                `/auth/students/search/${indexNo.trim()}`
            );

            setStudent(response.data);

            toast.success(`Loaded ${response.data.name}`);

        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Student not found."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // MANUAL SEARCH
    // =========================
    const handleManualSearch = (e) => {
        e.preventDefault();

        if (!searchIndex.trim()) {
            toast.error("Enter index number");
            return;
        }

        fetchStudentDetails(searchIndex);
    };

    // =========================
    // TOGGLE PAYMENT
    // =========================
    const togglePayment = async (monthName) => {
        if (!student) return;

        const isPaid =
            student.paidMonths?.includes(monthName);

        setTogglingMonth(monthName);

        try {
            const res = await API.post(
                `/auth/students/${student._id}/payment`,
                {
                    month: monthName,
                    isPaid: !isPaid
                }
            );

            setStudent((prev) => ({
                ...prev,
                paidMonths: res.data.paidMonths
            }));

            toast.success(
                !isPaid
                    ? `${monthName} marked paid`
                    : `${monthName} marked unpaid`
            );

        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Failed updating payment"
            );

        } finally {
            setTogglingMonth(null);
        }
    };

    const totalPaidMonths =
        student?.paidMonths?.length || 0;

    const paymentRatio = (
        (totalPaidMonths / 12) *
        100
    ).toFixed(0);

    return (
        <div className="min-h-screen bg-blue-50 dark:bg-black">

            <AdminNavbar />

            <main
                className={`max-w-7xl mx-auto px-4 py-28 transition-all duration-500 ${mounted
                        ? "opacity-100"
                        : "opacity-0"
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
                <div className="bg-white rounded-3xl p-8 shadow-xl mb-10">

                    <div className="flex flex-col md:flex-row justify-between gap-6">

                        <div>
                            <h1 className="text-4xl font-black flex items-center gap-3">
                                QR Payment Board
                                <Sparkles
                                    className="text-yellow-500"
                                    size={24}
                                />
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Scan student QR codes instantly.
                            </p>
                        </div>

                        {/* TABS */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl">

                            <button
                                onClick={() => {
                                    setActiveTab("scan");
                                }}
                                className={`px-5 py-2 rounded-xl text-xs font-bold ${activeTab === "scan"
                                        ? "bg-white shadow"
                                        : ""
                                    }`}
                            >
                                Camera
                            </button>

                            <button
                                onClick={() => {
                                    stopScanning();
                                    setActiveTab("manual");
                                }}
                                className={`px-5 py-2 rounded-xl text-xs font-bold ${activeTab === "manual"
                                        ? "bg-white shadow"
                                        : ""
                                    }`}
                            >
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
                            <div className="bg-white rounded-3xl p-8 shadow-xl">

                                <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                                    <Camera size={18} />
                                    Camera Scanner
                                </h3>

                                <p className="text-xs text-slate-500 mb-6">
                                    Scan student QR code
                                </p>

                                {/* SCANNER */}
                                <div className="relative w-full min-h-[320px] rounded-2xl overflow-hidden border bg-black">

                                    <div
                                        id={scannerContainerId}
                                        className="w-full h-full"
                                    />

                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">

                                            <QrCode size={48} />

                                            <p className="mt-4 text-sm font-bold">
                                                Scanner inactive
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* ERROR */}
                                {scannerError && (
                                    <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                                        {scannerError}
                                    </div>
                                )}

                                {/* CAMERA SELECT */}
                                {cameras.length > 1 && (
                                    <div className="mt-5">

                                        <label className="block text-xs font-bold mb-2">
                                            Camera Device
                                        </label>

                                        <select
                                            value={selectedCameraId}
                                            onChange={handleCameraChange}
                                            className="w-full border rounded-xl px-3 py-3"
                                        >
                                            {cameras.map((cam, index) => (
                                                <option
                                                    key={cam.id}
                                                    value={cam.id}
                                                >
                                                    {cam.label ||
                                                        `Camera ${index + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* BUTTONS */}
                                <div className="mt-6">

                                    {!isScanning ? (
                                        <button
                                            onClick={startScanning}
                                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                                        >
                                            Start Scanner
                                        </button>
                                    ) : (
                                        <button
                                            onClick={stopScanning}
                                            className="w-full py-3 rounded-xl bg-black text-white font-bold"
                                        >
                                            Stop Scanner
                                        </button>
                                    )}
                                </div>
                            </div>

                        ) : (
                            // MANUAL SEARCH
                            <div className="bg-white rounded-3xl p-8 shadow-xl">

                                <h3 className="text-lg font-black mb-5">
                                    Manual Search
                                </h3>

                                <form
                                    onSubmit={handleManualSearch}
                                    className="space-y-4"
                                >

                                    <input
                                        type="text"
                                        value={searchIndex}
                                        onChange={(e) =>
                                            setSearchIndex(e.target.value)
                                        }
                                        placeholder="STU-26-0001"
                                        className="w-full border rounded-xl px-4 py-3"
                                    />

                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold"
                                    >
                                        Search Student
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-7">

                        {loading ? (
                            <div className="bg-white rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center min-h-[400px]">

                                <RefreshCw
                                    size={40}
                                    className="animate-spin mb-4"
                                />

                                <p className="font-bold">
                                    Loading student...
                                </p>
                            </div>

                        ) : student ? (
                            <div className="space-y-6">

                                {/* PROFILE */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl">

                                    <div className="flex items-center justify-between flex-wrap gap-6">

                                        <div className="flex items-center gap-4">

                                            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-black">
                                                {student.name?.charAt(0)}
                                            </div>

                                            <div>
                                                <h2 className="text-2xl font-black">
                                                    {student.name}
                                                </h2>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    {student.indexNumber}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-3xl font-black">
                                                {paymentRatio}%
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                Payment Complete
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* MONTH GRID */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                                    {MONTHS.map((month) => {

                                        const isPaid =
                                            student.paidMonths?.includes(month);

                                        const isToggling =
                                            togglingMonth === month;

                                        return (
                                            <div
                                                key={month}
                                                onClick={() =>
                                                    !isToggling &&
                                                    togglePayment(month)
                                                }
                                                className={`rounded-2xl p-5 border cursor-pointer transition-all ${isPaid
                                                        ? "bg-emerald-100 border-emerald-300"
                                                        : "bg-white border-slate-200"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">

                                                    <span className="text-xs font-bold uppercase">
                                                        Month
                                                    </span>

                                                    {isToggling ? (
                                                        <RefreshCw
                                                            size={14}
                                                            className="animate-spin"
                                                        />
                                                    ) : isPaid ? (
                                                        <CheckCircle
                                                            size={18}
                                                            className="text-emerald-600"
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={18}
                                                            className="text-slate-300"
                                                        />
                                                    )}
                                                </div>

                                                <div className="mt-5">

                                                    <h4 className="text-lg font-black">
                                                        {month}
                                                    </h4>

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {isPaid
                                                            ? "Paid"
                                                            : "Click to pay"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CLEAR */}
                                <button
                                    onClick={() => {
                                        setStudent(null);
                                        setSearchIndex("");
                                    }}
                                    className="w-full py-3 rounded-xl bg-slate-200 font-bold"
                                >
                                    Clear Student
                                </button>
                            </div>

                        ) : (
                            // EMPTY STATE
                            <div className="bg-white rounded-3xl p-10 shadow-xl flex flex-col items-center justify-center min-h-[450px]">

                                <UserCheck
                                    size={48}
                                    className="text-slate-300"
                                />

                                <h3 className="text-xl font-black mt-5">
                                    Waiting for Student
                                </h3>

                                <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">
                                    Scan a QR code or search manually
                                    to display payment records.
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