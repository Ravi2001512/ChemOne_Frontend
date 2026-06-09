import React, { useState, useEffect } from 'react';

const Countdown = ({
    targetDate = "2026-08-10T08:00:00",
}) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num) => String(num).padStart(2, '0');

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50/60 dark:bg-ink-lighter/50 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-md transition-all duration-300">
            {/* Sinhala Title */}
            <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-amber-400 mb-1.5 leading-relaxed font-grotesk">
                    The final countdown <br className="sm:hidden" /> for the 2026 A/L exams
                </h2>
            </div>

            {/* Timer Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 w-full bg-white/40 dark:bg-ink/40 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                {[
                    { label: 'දවස්', en: 'Days', val: timeLeft.days },
                    { label: 'පැය', en: 'Hrs', val: timeLeft.hours },
                    { label: 'විනාඩි', en: 'Min', val: timeLeft.minutes },
                    { label: 'තත්පර', en: 'Sec', val: timeLeft.seconds }
                ].map((item, idx) => (
                    <div key={idx} className="relative flex flex-col items-center justify-center py-1">
                        {/* Number Display */}
                        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-acid font-mono tracking-tight transition-colors duration-300">
                            {formatNumber(item.val)}
                        </span>

                        {/* Labels */}
                        <div className="flex flex-col items-center mt-2">
                            <span className="text-[10px] md:text-xs text-slate-700 dark:text-amber-500/80 font-bold font-grotesk">{item.label}</span>
                            <span className="text-[8px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-mono font-medium mt-0.5">{item.en}</span>
                        </div>

                        {/* Elegant vertical divider lines */}
                        {idx < 3 && (
                            <div className="absolute right-[-6px] md:right-[-8px] top-1/4 h-1/2 w-[1px] bg-gradient-to-b from-transparent via-slate-200 dark:via-white/10 to-transparent hidden sm:block" />
                        )}
                    </div>
                ))}
            </div>

            {/* Motivational Footer */}
            <div className="mt-6 px-4 py-2 bg-indigo-50 dark:bg-acid/10 border border-indigo-100 dark:border-acid/20 rounded-full transition-all duration-300">
                <p className="text-indigo-600 dark:text-acid text-xs font-semibold text-center font-grotesk">
                    🔥 "අත් අරින්න එපා... අන්තිම තත්පරේ දක්වා ගේම ගහමු!"
                </p>
            </div>
        </div>
    );
};

export default Countdown;