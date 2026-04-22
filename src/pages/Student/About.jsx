import React, { useState } from 'react';
import StudentNavbar from '../../components/StudentNavbar';
import { MapPin, Calendar, Clock, BookOpen, Award, GraduationCap, Users, X, ZoomIn } from 'lucide-react';

const About = () => {
    const [isImageOpen, setIsImageOpen] = useState(false);

    // Placeholder data for schedules - User can easily modify this
    const classSchedules = [
        {
            batch: '2026 Revision',
            location: 'Sarasawi - Walasmulla',
            day: 'Thursday',
            time: '8.30 am - 5:00 PM',
            status: 'Ongoing',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            batch: '2026 Paper Class & Speed Revision',
            location: ' Sarasawi - Walasmulla',
            day: 'Friday',
            time: '8:30 AM - 5:00 PM',
            status: 'Ongoing',
            color: 'from-emerald-500 to-teal-600'
        },
        {
            batch: ' 2027 Theory',
            location: 'New Samadhi - Middeniya ',
            day: 'Friday',
            time: '6:00 PM - 10:30 PM',
            status: 'Ongoing',
            color: 'from-purple-500 to-pink-600'
        },
        {
            batch: '2027 Theory',
            location: 'Sarasawi - Walasmulla',
            day: 'Sunday',
            time: '1:30 PM - 9:00 PM',
            status: 'Ongoing',
            color: 'from-amber-500 to-orange-600'
        },
        {
            batch: '2028 Theory',
            location: 'Sarasawi - Walasmulla',
            day: 'Sunday',
            time: '8:30 AM - 11:30 PM',
            status: 'Ongoing',
            color: 'from-sky-500 to-orange-600'
        },
        {
            batch: '2028 Theory',
            location: 'New Samadhi - Middeniya',
            day: 'Friday',
            time: '2:30 PM - 5:30 PM',
            status: 'Ongoing',
            color: 'from-lime-500 to-orange-600'
        },
        {
            batch: '2027 Theory',
            location: ' Nex Gen - Tangalle',
            day: 'Saturday',
            time: '7:30 AM - 10:00 AM',
            status: 'Ongoing',
            color: 'from-green-500 to-orange-600'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            <StudentNavbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-16 pb-24">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
                    <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
                        About <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ChemBridge</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Empowering students to achieve excellence through cutting-edge learning platforms, dedicated mentorship, and proven strategies.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">

                {/* Profile & Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

                    {/* Visionary Section (Left) */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl">
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <img
                                    src="/ashan.jpeg"
                                    alt="Founder/Instructor"
                                    className="relative w-48 h-48 object-cover rounded-3xl shadow-lg border-4 border-white dark:border-slate-800 group-hover:-translate-y-1 transition-transform duration-300"
                                />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider mb-4">
                                    <BookOpen className="w-4 h-4" /> Leading the Way
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Learn from the Best</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                    Our platform is driven by individuals who are passionate about education and committed to bringing out the fullest potential in every chemistry student.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results Section (Right) */}
                    <div
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl overflow-hidden relative group cursor-pointer"
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
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    <ZoomIn className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center relative shadow-inner">
                                <img
                                    src="/results.jpg"
                                    alt="Results Showcase"
                                    className="w-full h-48 sm:h-56 object-cover object-top hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                    <p className="text-white p-4 font-medium backdrop-blur-sm w-full">A legacy of excellence.</p>
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
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-md hover:shadow-xl transition-all duration-300 group border border-slate-100 dark:border-slate-800 transform hover:-translate-y-1">
                                <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${schedule.color}`}></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                            {schedule.batch}
                                        </h3>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${schedule.status === 'Ongoing'
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