import React, { useState } from 'react';
import StudentNavbar from '../../components/StudentNavbar';
import { 
    MapPin, 
    Calendar, 
    Clock, 
    BookOpen, 
    Award, 
    GraduationCap, 
    Users, 
    X, 
    ZoomIn, 
    Phone, 
    UserCheck,
    Share2
} from 'lucide-react';

// Custom SVG Icons safely defined to avoid White Screen runtime errors
const FacebookIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
    </svg>
);

const YoutubeIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

const WhatsappIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);

const About = () => {
    const [isImageOpen, setIsImageOpen] = useState(false);

    const classSchedules = [
        {
            batch: '2027 Revision',
            location: 'Sarasawi - Walasmulla',
            day: 'Thursday',
            time: '8:30 AM - 4:30 PM',
            status: 'Ongoing',
            color: 'from-amber-500 to-orange-600'
        },
        {
            batch: '2027 Theory',
            location: 'Jayamaga - Tangalle',
            day: 'Friday',
            time: '8:30 AM - 4:00 PM',
            status: 'Ongoing',
            color: 'from-green-500 to-emerald-600'
        },
        {
            batch: '2028 Theory',
            location: 'Sarasawi - Walasmulla',
            day: 'Sunday',
            time: '8:30 AM - 11:30 AM',
            status: 'Ongoing',
            color: 'from-sky-500 to-blue-600'
        },
        {
            batch: '2028 Theory',
            location: 'New Samadhi - Middeniya',
            day: 'Thursday',
            time: '6:30 PM - 9:30 PM',
            status: 'Ongoing',
            color: 'from-lime-500 to-teal-600'
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-950 dark:via-black dark:to-slate-950 font-sans text-slate-800 dark:text-slate-100">
            <StudentNavbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 pt-16 pb-24">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                        About <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">ChemBridge</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        At ChemBridge, we combine expert teaching, innovative technology, and comprehensive study resources to help students strengthen their Chemistry knowledge, improve performance, and achieve their academic goals.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">

                {/* Profile & Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

                    {/* Visionary Section (Left) */}
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/80 transition-all hover:shadow-2xl flex flex-col justify-between">
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                            <div className="relative group shrink-0">
                                <div className="absolute inset-0 bg-indigo-600 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300 dark:bg-indigo-400"></div>
                                <img
                                    src="/logo.png"
                                    alt="Founder/Instructor"
                                    className="relative w-44 h-44 object-cover rounded-3xl shadow-lg border-4 border-white dark:border-slate-800 group-hover:-translate-y-1 transition-transform duration-300"
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-800/50">
                                    <BookOpen className="w-4 h-4" /> Leading the Way
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Learn from the Best</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base mb-4">
                                    At ChemBridge, we believe every student can excel in Chemistry. Through expert guidance, interactive learning experiences, and exam-focused resources, we help students build knowledge, confidence, and success.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results Section (Right) */}
                    <div
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800/80 transition-all hover:shadow-2xl overflow-hidden relative group cursor-pointer"
                        onClick={() => setIsImageOpen(true)}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 dark:opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Award className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our First Batch Results</h2>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <ZoomIn className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative shadow-inner min-h-[200px]">
                                <img
                                    src="/results.jpg"
                                    alt="Results Showcase"
                                    className="w-full h-48 sm:h-56 object-cover object-top hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                                    <p className="text-white p-4 font-medium backdrop-blur-sm w-full text-sm sm:text-base">A legacy of excellence.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Social Media & Contact Section */}
                <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-[2rem] p-8 shadow-2xl mb-16 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl"></div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Social Links */}
                        <div>
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
                                <Share2 className="w-5 h-5" />
                                <span>Connect With Us</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated & Join Community</h3>
                            <p className="text-slate-300 text-sm mb-6">
                                Follow our social channels for regular lessons, notifications, and interactive discussions.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="https://www.facebook.com/share/17meyztP1B/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-blue-600 hover:text-white"
                                >
                                    <FacebookIcon className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Facebook</span>
                                </a>

                                <a
                                    href="https://youtube.com/@ashanumayanga-l2e?si=1RnEGRMWwJV6IZ2z"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-red-600 hover:text-white"
                                >
                                    <YoutubeIcon className="w-5 h-5" />
                                    <span className="font-semibold text-sm">YouTube</span>
                                </a>

                                <a
                                    href="https://whatsapp.com/channel/0029Vb8PUqSAYlUFmtarZD3T"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-emerald-600 hover:text-white"
                                >
                                    <WhatsappIcon className="w-5 h-5" />
                                    <span className="font-semibold text-sm">WhatsApp Channel</span>
                                </a>
                            </div>
                        </div>

                        {/* Direct Contacts */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
                            <h4 className="text-xl font-bold text-white flex items-center gap-2">
                                <Phone className="w-5 h-5 text-indigo-400" /> Need Help or Information?
                            </h4>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div>
                                        <p className="text-xs text-indigo-300 font-medium">Instructor</p>
                                        <p className="font-bold text-white text-base">Ashan Sir</p>
                                    </div>
                                    <a 
                                        href="tel:0705520959" 
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors shadow-md"
                                    >
                                        <Phone className="w-4 h-4" /> 070 552 0959
                                    </a>
                                </div>

                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-xs text-indigo-300 font-medium">Contact Admin</p>
                                            <p className="font-bold text-white text-sm">Hasintha Karunasena / Ravindu Deshan</p>
                                        </div>
                                    </div>
                                    <a 
                                        href="tel:0740155058" 
                                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-white/10 transition-colors"
                                    >
                                        <UserCheck className="w-4 h-4 text-emerald-400" /> Call Admin: 074 015 5058
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class Locations & Schedules Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-8 sm:h-10 w-1.5 sm:w-2 bg-indigo-600 rounded-full"></div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            <MapPin className="text-indigo-600 h-6 w-6 sm:h-8 sm:w-8" />
                            Class Locations & Schedules
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {classSchedules.map((schedule, idx) => (
                            <div key={idx} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-1 shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100 dark:border-slate-800 transform hover:-translate-y-1">
                                <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${schedule.color}`}></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                            {schedule.batch}
                                        </h3>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            schedule.status === 'Ongoing'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                        }`}>
                                            {schedule.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {schedule.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Every {schedule.day}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-slate-400" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {schedule.time}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-bold text-slate-500">Join Class</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30">
                                            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            {/* Fullscreen Image Modal */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsImageOpen(false)}
                >
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsImageOpen(false)}
                            className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-slate-800 text-white p-2 rounded-full hover:bg-rose-500 transition-colors z-50 shadow-lg border border-slate-600 hover:border-rose-500 group"
                        >
                            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                        <img
                            src="/results.jpg"
                            alt="Full Results Showcase"
                            className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;