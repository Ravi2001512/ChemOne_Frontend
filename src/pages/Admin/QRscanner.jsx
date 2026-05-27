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
  const [activeTab, setActiveTab] = useState("scan"); // "scan" | "manual"
  
  // Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [scannerError, setScannerError] = useState("");
  
  // Student & Payment States
  const [searchIndex, setSearchIndex] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [togglingMonth, setTogglingMonth] = useState(null); // stores month name when toggling

  const qrScannerRef = useRef(null);
  const scannerContainerId = "qr-reader-viewport";

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    return () => {
      stopScanning();
    };
  }, []);

  // Web Audio API Sound Generator for Success Scan
  const playSuccessBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Chime note 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      // Chime note 2 (slightly delayed and higher pitch for sweet chime sound)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 80);
    } catch (e) {
      console.warn("Web Audio API is not supported or blocked by browser policies:", e);
    }
  };

  // Get available cameras
  const initCameras = async () => {
    try {
      setScannerError("");
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCameraId(devices[0].id);
        return devices[0].id;
      } else {
        setScannerError("No cameras detected. Please make sure camera is connected.");
        return null;
      }
    } catch (err) {
      console.error("Camera listing error:", err);
      setScannerError("Camera permissions denied or blocked. Please enable permissions.");
      return null;
    }
  };

  // Start QR Scanning
  const startScanning = async () => {
    setIsScanning(true);
    setScannerError("");
    
    // Ensure cameras list is loaded
    let cameraId = selectedCameraId;
    if (!cameraId) {
      cameraId = await initCameras();
    }

    if (!cameraId) {
      setIsScanning(false);
      return;
    }

    // Short delay to let the DOM element mount properly
    setTimeout(() => {
      try {
        if (qrScannerRef.current) {
          stopScanning();
        }

        const html5QrCode = new Html5Qrcode(scannerContainerId);
        qrScannerRef.current = html5QrCode;

        const config = {
          fps: 20, // Increase frame rate for ultra-responsive scans
          qrbox: { width: 240, height: 240 } // Robust fixed bounding box
        };

        html5QrCode.start(
          cameraId,
          config,
          (decodedText) => {
            // Success Callback
            playSuccessBeep();
            handleQRDetected(decodedText);
          },
          (errorMessage) => {
            // Verbose error logging omitted to avoid flooding console
          }
        ).catch((err) => {
          console.error("Failed to start QR scanner:", err);
          setScannerError("Unable to open camera stream. It may be used by another application.");
          setIsScanning(false);
        });
      } catch (err) {
        console.error("Scanner setup error:", err);
        setScannerError("Internal scanner initialization error.");
        setIsScanning(false);
      }
    }, 150);
  };

  // Stop QR Scanning
  const stopScanning = () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          qrScannerRef.current.stop().then(() => {
            qrScannerRef.current = null;
          }).catch(err => console.error("Error stopping scanner:", err));
        } else {
          qrScannerRef.current = null;
        }
      } catch (e) {
        console.error("Error cleaning scanner:", e);
      }
    }
    setIsScanning(false);
  };

  // Handle camera switch
  const handleCameraChange = async (e) => {
    const nextId = e.target.value;
    setSelectedCameraId(nextId);
    if (isScanning) {
      stopScanning();
      setTimeout(() => {
        setIsScanning(true);
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        qrScannerRef.current = html5QrCode;
        html5QrCode.start(
          nextId,
          { fps: 12, qrbox: (w, h) => ({ width: Math.min(w, h)*0.7, height: Math.min(w, h)*0.7 }), aspectRatio: 1.0 },
          (decodedText) => {
            playSuccessBeep();
            handleQRDetected(decodedText);
          },
          () => {}
        ).catch((err) => {
          console.error("Camera switch start failed", err);
          setScannerError("Failed to open the selected camera.");
          setIsScanning(false);
        });
      }, 200);
    }
  };

  // QR Decoded Handler
  const handleQRDetected = (decodedText) => {
    // Stop scanning immediately to prevent duplicate triggers
    stopScanning();
    
    // Parse decodedText. Format from Qr.jsx is: "ID:STU-YY-XXXX"
    let indexNo = decodedText.trim();
    if (indexNo.startsWith("ID:")) {
      indexNo = indexNo.replace("ID:", "");
    }
    
    toast.success(`QR Detected! Searching index: ${indexNo}`);
    fetchStudentDetails(indexNo);
  };

  // Fetch Student Profile by Index Number
  const fetchStudentDetails = async (indexNo) => {
    setLoading(true);
    try {
      const response = await API.get(`/auth/students/search/${indexNo.trim()}`);
      setStudent(response.data);
      toast.success(`Details loaded for ${response.data.name}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Student not found. Please double-check the Index Number.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Form Search
  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!searchIndex.trim()) {
      toast.error("Please enter a student Index Number.");
      return;
    }
    fetchStudentDetails(searchIndex);
  };

  // Toggle Month Payment Status
  const togglePayment = async (monthName) => {
    if (!student) return;
    
    const isCurrentlyPaid = student.paidMonths?.includes(monthName);
    setTogglingMonth(monthName);
    
    try {
      const res = await API.post(`/auth/students/${student._id}/payment`, {
        month: monthName,
        isPaid: !isCurrentlyPaid
      });
      
      setStudent(prev => ({
        ...prev,
        paidMonths: res.data.paidMonths
      }));
      
      toast.success(
        !isCurrentlyPaid 
          ? `Marked ${monthName} as PAID for ${student.name}`
          : `Marked ${monthName} as UNPAID for ${student.name}`
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update payment status.");
    } finally {
      setTogglingMonth(null);
    }
  };

  // Stats calculation
  const totalPaidMonths = student?.paidMonths?.length || 0;
  const paymentRatio = ((totalPaidMonths / 12) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-ink transition-colors duration-300">
      <style>{`
        @keyframes scanAnimation {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          position: absolute;
          animation: scanAnimation 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        /* html5-qrcode injected video and layout overrides */
        #qr-reader-viewport video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 16px;
        }
        #qr-reader-viewport__scan_region {
          border: 2px solid rgba(99, 102, 241, 0.5) !important;
          border-radius: 20px !important;
          box-shadow: 0 0 25px rgba(99, 102, 241, 0.25) !important;
        }
        #qr-reader-viewport__scan_region svg {
          display: none !important; /* Hide ugly default scanner guidelines */
        }
      `}</style>
      <AdminNavbar />

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 py-28 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* ── HEADER NAVIGATION ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/admin")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-acid transition-colors bg-none border-none outline-none cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <span className="font-mono text-[10px] tracking-widest uppercase px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-acid dark:bg-acid/10 dark:border-acid/20">
            QR Scanner Portal
          </span>
        </div>

        {/* ── HERO HEADER ─────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden mb-10 bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 p-6 sm:p-10 shadow-xl relative transition-all duration-300">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/10 dark:bg-acid/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-grotesk text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight transition-colors duration-300 flex items-center gap-3">
                QR Payment Card Board
                <Sparkles className="text-yellow-500 dark:text-acid animate-pulse" size={24} />
              </h1>
              <p className="font-grotesk text-base text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed mt-2 transition-colors duration-300">
                Scan a student's card QR code or search manually to fetch student payment history and instantly mark payments.
              </p>
            </div>
            
            {/* Tab Controllers */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
              <button
                onClick={() => { setActiveTab("scan"); stopScanning(); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-none outline-none ${
                  activeTab === "scan" 
                    ? "bg-white dark:bg-ink-lighter text-indigo-600 dark:text-acid shadow-md" 
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <Camera size={14} />
                Live Scan Camera
              </button>
              <button
                onClick={() => { setActiveTab("manual"); stopScanning(); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border-none outline-none ${
                  activeTab === "manual" 
                    ? "bg-white dark:bg-ink-lighter text-indigo-600 dark:text-acid shadow-md" 
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <Search size={14} />
                Manual Lookup
              </button>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN MAIN PANEL ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: SCANNER OR MANUAL INPUT */}
          <div className="lg:col-span-5 space-y-6">
            {activeTab === "scan" ? (
              <div className="bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 leading-none flex items-center gap-2">
                  <Camera className="text-indigo-600 dark:text-acid" size={18} />
                  Camera Viewport
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">Point your camera at the generated QR code.</p>

                {/* Viewport Frame */}
                <div className="relative aspect-square w-full max-w-sm mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center">
                  
                  {/* Scanner Grid and pulsating red/acid line */}
                  {isScanning && (
                    <>
                      {/* Top corners decoration */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-600 dark:border-acid z-10 rounded-tl" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-600 dark:border-acid z-10 rounded-tr" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-600 dark:border-acid z-10 rounded-bl" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-600 dark:border-acid z-10 rounded-br" />
                      
                      {/* Pulsating scanning line */}
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 dark:via-acid to-transparent shadow-lg dark:shadow-acid/30 z-20 animate-scan-line" style={{ top: "0%" }} />
                      
                      {/* Glowing center area */}
                      <div className="absolute inset-8 border border-white/10 rounded-xl bg-indigo-500/[0.02] dark:bg-acid/[0.01] pointer-events-none" />
                    </>
                  )}

                  {/* html5-qrcode renderer viewport */}
                  <div 
                    id={scannerContainerId} 
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isScanning ? "opacity-100" : "opacity-0 absolute pointer-events-none"}`} 
                  />

                  {/* Placeholder overlay when not scanning */}
                  {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/40 dark:bg-black/40 backdrop-blur-[2px]">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-acid/10 border border-indigo-500/20 dark:border-acid/20 flex items-center justify-center text-indigo-500 dark:text-acid mb-4 animate-bounce">
                        <QrCode size={30} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Scanner Inactive</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-[200px]">Click Start below to activate camera scanning.</p>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {scannerError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                    <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{scannerError}</span>
                  </div>
                )}

                {/* Scanner Controls */}
                <div className="mt-6 space-y-4">
                  {/* Camera dropdown selector */}
                  {cameras.length > 1 && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Device</label>
                      <select
                        value={selectedCameraId}
                        onChange={handleCameraChange}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-zinc-300 outline-none focus:border-indigo-500 dark:focus:border-acid font-medium"
                      >
                        {cameras.map(cam => (
                          <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cameras.indexOf(cam)+1}`}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Toggle button */}
                  {!isScanning ? (
                    <button
                      onClick={startScanning}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-acid dark:hover:bg-acid/90 text-white dark:text-ink font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 dark:shadow-acid/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-none outline-none text-sm"
                    >
                      <Camera size={16} />
                      Start Scanner
                    </button>
                  ) : (
                    <button
                      onClick={stopScanning}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-none outline-none text-sm"
                    >
                      <XCircle size={16} />
                      Stop Scanner
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* MANUAL SEARCH PANEL */
              <div className="bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 leading-none flex items-center gap-2">
                  <Search className="text-indigo-600 dark:text-acid" size={18} />
                  Manual Search
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6">Retrieve records using index number prefix or full ID.</p>

                <form onSubmit={handleManualSearch} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Index Number</label>
                    <input
                      type="text"
                      placeholder="e.g. STU-26-0001"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-acid focus:ring-1 focus:ring-indigo-500 dark:focus:ring-acid outline-none transition-all font-mono"
                      value={searchIndex}
                      onChange={(e) => setSearchIndex(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-acid dark:hover:bg-acid/90 text-white dark:text-ink font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 dark:shadow-acid/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 border-none outline-none text-sm"
                  >
                    <Search size={16} />
                    Search Student
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: STUDENT CARD & MONTHS BOARD */}
          <div className="lg:col-span-7">
            {loading ? (
              <div className="bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[400px] animate-pulse">
                <RefreshCw size={40} className="text-indigo-600 dark:text-acid animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">Searching records...</p>
              </div>
            ) : student ? (
              /* STUDENT LOADED VIEWER */
              <div className="space-y-6">
                
                {/* Profile Card Header */}
                <div className="bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/10 dark:bg-acid/10 blur-xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-acid/10 border border-indigo-500/20 dark:border-acid/20 text-indigo-600 dark:text-acid flex items-center justify-center font-black text-xl">
                        {student.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                          {student.name}
                          {student.isBlocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 border border-red-200 dark:border-red-900">Blocked</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-900">Active</span>
                          )}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono uppercase tracking-wider">
                          <span className="flex items-center gap-1"><UserIcon size={12} /> {student.indexNumber}</span>
                          <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full" />
                          <span className="flex items-center gap-1"><Calendar size={12} /> Batch {student.batch}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 rounded-2xl p-4 flex items-center gap-4 self-start sm:self-auto min-w-[160px]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-acid flex items-center justify-center font-bold">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalPaidMonths}<span className="text-xs text-slate-400 dark:text-zinc-600 font-bold">/12</span></p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Months Paid ({paymentRatio}%)</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Ratio Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      <span>Annual Payment Card Progress</span>
                      <span>{paymentRatio}% Complete</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-acid dark:to-emerald-500 rounded-full transition-all duration-500 shadow-inner"
                        style={{ width: `${paymentRatio}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Grid Title */}
                <div className="flex items-center gap-4">
                  <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                    // Payments Card Dashboard
                  </p>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                </div>

                {/* 12 Months Payment Board Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {MONTHS.map((month) => {
                    const isPaid = student.paidMonths?.includes(month);
                    const isToggling = togglingMonth === month;
                    
                    return (
                      <div
                        key={month}
                        onClick={() => !isToggling && togglePayment(month)}
                        className={`group relative rounded-2xl p-4 cursor-pointer overflow-hidden border transition-all duration-300 active:scale-[0.98] select-none flex flex-col justify-between min-h-[100px] ${
                          isPaid 
                            ? "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-acid dark:bg-acid/10 dark:hover:bg-acid/15 dark:border-acid/20" 
                            : "bg-white hover:bg-slate-50 dark:bg-ink-lighter dark:hover:bg-slate-900 border-slate-200 hover:border-slate-300 dark:border-white/5 dark:hover:border-white/10"
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-400 dark:text-zinc-500">
                            Month
                          </span>
                          
                          {isToggling ? (
                            <RefreshCw size={14} className="animate-spin text-slate-400" />
                          ) : isPaid ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:bg-acid/20 dark:text-acid flex items-center justify-center">
                              <CheckCircle size={12} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-zinc-700 flex items-center justify-center group-hover:scale-115 transition-transform">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-800" />
                            </div>
                          )}
                        </div>

                        {/* Month Info */}
                        <div className="mt-4">
                          <h5 className={`text-base font-extrabold transition-colors leading-none ${isPaid ? "text-emerald-700 dark:text-acid" : "text-slate-900 dark:text-white"}`}>
                            {month}
                          </h5>
                          <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 mt-1 leading-none">
                            {isPaid ? "Paid" : "Click to pay"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset / Search another */}
                <button
                  onClick={() => { setStudent(null); setSearchIndex(""); }}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-zinc-300 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-none outline-none text-xs"
                >
                  Clear & Scan Next Student
                </button>
              </div>
            ) : (
              /* AWAITING SCAN PLACEHOLDER STATE */
              <div className="bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[440px] text-center relative overflow-hidden transition-all duration-300">
                <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-indigo-500/5 dark:bg-acid/5 blur-2xl pointer-events-none" />
                
                <div className="w-20 h-20 rounded-3xl bg-indigo-500/5 dark:bg-acid/5 border border-indigo-500/10 dark:border-acid/10 flex items-center justify-center text-slate-400 dark:text-zinc-600 mb-6">
                  <UserCheck size={36} />
                </div>
                
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-zinc-200">Awaiting Student Records</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-sm mt-2 leading-relaxed">
                  Start the live scanning camera or type a student's Index Number manually to display their monthly payment cards.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                  <div className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 rounded-2xl flex flex-col items-center">
                    <Award size={18} className="text-slate-400 dark:text-zinc-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
                  </div>
                  <div className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-900 rounded-2xl flex flex-col items-center">
                    <CreditCard size={18} className="text-slate-400 dark:text-zinc-600 mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payments</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>

      </main>
    </div>
  );
};

export default QRscanner;