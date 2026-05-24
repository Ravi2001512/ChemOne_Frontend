import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { QrCode, Download, ArrowLeft } from 'lucide-react';
import StudentNavbar from '../../components/StudentNavbar';

const Qr = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const [indexNumber, setIndexNumber] = useState(user?.indexNumber || "");
    const [qrCodeUrl, setQrCodeUrl] = useState(
        user?.indexNumber 
            ? `https://api.qrserver.com/v1/create-qr-code/?data=ID:${user.indexNumber}&size=300x300` 
            : ""
    );

    const handleGenerate = (e) => {
        e.preventDefault();
        const trimmed = indexNumber.trim();
        if (!trimmed) {
            toast.error("Please enter a valid Index Number");
            return;
        }
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?data=ID:${trimmed}&size=300x300`);
        toast.success("QR Code generated successfully!");
    };

    const handleDownload = async () => {
        if (!qrCodeUrl) return;
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `QR_Code_${indexNumber.trim() || 'student'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            toast.success("QR Code download started!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to download QR code. You can right-click the image to save it.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-ink transition-colors duration-300">
            <StudentNavbar />
            
            <main className="max-w-4xl mx-auto px-6 pt-28 pb-12 text-slate-900 dark:text-slate-100 flex flex-col items-center">
                
                {/* Header Section */}
                <div className="w-full max-w-md mb-6 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-acid transition-colors group bg-none border-none outline-none cursor-pointer"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Back
                    </button>
                    <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-acid dark:bg-acid/10 dark:border-acid/20">
                        QR Generator
                    </span>
                </div>

                {/* Card Component */}
                <div className="w-full max-w-md bg-white dark:bg-ink-lighter border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all duration-300">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 dark:bg-acid/10 blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:bg-acid/10 dark:border-acid/20 dark:text-acid flex items-center justify-center flex-shrink-0">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Student QR Code</h2>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">Generate a unique QR code for attendance & index verification</p>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                                Index Number
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Index Number (e.g. ST-1002)"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-acid focus:ring-1 focus:ring-indigo-500 dark:focus:ring-acid outline-none transition-all font-mono"
                                value={indexNumber}
                                onChange={(e) => setIndexNumber(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-acid dark:hover:bg-acid/90 text-white dark:text-ink font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 dark:shadow-acid/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer border-none outline-none"
                        >
                            Generate QR Code
                        </button>
                    </form>

                    {/* QR Code Output Section */}
                    {qrCodeUrl && (
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
                            <div className="p-4 bg-white rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                <img
                                    src={qrCodeUrl}
                                    alt={`QR Code for ${indexNumber}`}
                                    className="w-48 h-48 rounded-lg select-none pointer-events-none"
                                />
                            </div>
                            <p className="mt-3 font-mono text-sm font-bold text-slate-700 dark:text-zinc-300">
                                {indexNumber}
                            </p>
                            
                            <button
                                onClick={handleDownload}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-acid dark:hover:text-acid/80 transition-colors border border-indigo-500/20 dark:border-acid/20 rounded-xl bg-indigo-500/5 dark:bg-acid/5 cursor-pointer outline-none"
                            >
                                <Download size={14} />
                                Download QR Code
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Qr;
