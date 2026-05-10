import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, Settings, LogOut, Beaker, FileText, Info, Menu, X, Sun, Moon } from 'lucide-react';

const StudentNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            try {
                setUserRole(JSON.parse(storedUser).role);
            } catch (e) { }
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const allNavItems = [
        { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
        { name: 'Spot Test', path: '/student/spot-test', icon: FileEdit },
        { name: 'Daily Worksheet', path: '/student/daily-worksheet', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Results', path: '/student/results', icon: Beaker },
        { name: 'About', path: '/student/about', icon: Info },
    ];

    const navItems = allNavItems.filter(item => {
        if (userRole === 'guest') {
            return !['Spot Test', 'Daily Worksheet', 'Results', 'Settings'].includes(item.name);
        }
        return true;
    });

    return (
        <nav className="bg-ink/90 border-b border-white/5 sticky top-0 z-50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 flex items-center cursor-pointer transition-transform hover:scale-105"
                            onClick={() => navigate('/student')}
                        >
                            <div className="w-9 h-9 rounded-xl bg-acid flex items-center justify-center shadow-lg shadow-acid/20">
                                <img src="/logo.png" alt="ChemOne Logo" />
                            </div>
                            <span className="ml-3 font-bebas text-xl sm:text-2xl text-white tracking-wider whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                ChemBridge
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-[13px] font-mono tracking-wider uppercase transition-all duration-200 ${isActive
                                            ? 'border-acid text-acid'
                                            : 'border-transparent text-slate-400 hover:border-white/40 hover:text-white'
                                            }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 mr-2 ${isActive ? 'text-acid' : 'text-slate-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden md:flex md:items-center md:gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg text-slate-400 hover:text-acid transition-colors"
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="font-mono text-[11px] tracking-widest uppercase px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg text-slate-400 hover:text-acid"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-white/5 focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-ink border-t border-white/5 animate-in slide-in-from-top duration-300">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center px-3 py-3 rounded-xl text-sm font-mono tracking-widest uppercase transition-colors ${isActive
                                        ? 'bg-acid/10 text-acid'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-acid' : 'text-slate-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-mono tracking-widest uppercase text-rose-500 hover:bg-rose-500/5 transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default StudentNavbar;