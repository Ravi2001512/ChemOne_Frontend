import React, { useMemo } from 'react';
import '../styles/Decorations.css';

const Decorations = ({ children }) => {


  // useMemo prevents bo leaves from recalculating and glitching on re-renders
  const boLeaves = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * -20}s`, // Negative delay ensures leaves are already falling on load
      duration: `${12 + Math.random() * 18}s`,
      size: `${12 + Math.random() * 16}px`,
      opacity: 0.6 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="vesak-theme-wrapper">
      {/* Poson Background Layer */}
      <div className="poson-scene">
        <img src="/poson.png" alt="Poson Festival Background" className="poson-image" />
      </div>

      {/* Deep, peaceful ambient night background */}
      <div className="vesak-ambient" />

      <div className="vesak-container">
        {/* Poya Full Moon with a soft, divine glow */}
        <div className="vesak-moon">
          <div className="moon-glow" />
        </div>

        {/* Softly drifting bo leaves */}
        <div className="bo-leaves">
          <svg style={{ width: 0, height: 0, position: 'absolute' }}>
            <defs>
              <linearGradient id="bo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </svg>
          {boLeaves.map((p, i) => (
            <div
              key={i}
              className="bo-leaf"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
              }}
            >
              <svg viewBox="0 0 32 32" width="100%" height="100%" style={{ filter: 'drop-shadow(0px 2px 4px rgba(74, 222, 128, 0.4))' }}>
                <path d="M16 32 C 15 22, 3 17, 3 9 C 3 4, 7.5 1, 11.5 1 C 14.5 1, 16 4, 16 4 C 16 4, 17.5 1, 20.5 1 C 24.5 1, 29 4, 29 9 C 29 17, 17 22, 16 32 Z" fill="url(#bo-grad)" />
              </svg>
            </div>
          ))}
        </div>

      </div>

      {/* Content Layer */}
      <div className="vesak-content">
        {children}
      </div>
    </div>
  );
};

export default Decorations;
