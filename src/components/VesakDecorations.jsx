import React, { useMemo } from 'react';
import '../styles/Vesak.css';

const VesakDecorations = ({ children }) => {
  // Traditional Buddhist flag colors (Six colors / Shadvarna, sequence repeated)
  const lanterns = [
    { color: 'blue' }, { color: 'yellow' }, { color: 'red' }, { color: 'white' }, { color: 'orange' },
    { color: 'mixed' },
    { color: 'blue' }, { color: 'yellow' }, { color: 'red' }, { color: 'white' }, { color: 'orange' }
  ];

  // useMemo prevents petals from recalculating and glitching on re-renders
  const petals = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * -20}s`, // Negative delay ensures petals are already falling on load
      duration: `${12 + Math.random() * 18}s`,
      size: `${8 + Math.random() * 12}px`,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <div className="vesak-theme-wrapper">
      {/* Deep, peaceful ambient night background */}
      <div className="vesak-ambient" />

      <div className="vesak-container">
        {/* Poya Full Moon with a soft, divine glow */}
        <div className="vesak-moon">
          <div className="moon-glow" />
        </div>

        {/* Softly drifting lotus petals */}
        <div className="petals">
          {petals.map((p, i) => (
            <div
              key={i}
              className="petal"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Hanging traditional 3D-faceted Vesak lanterns cluster next to the moon */}
        <div className="vesak-lantern-cluster">
          {/* 1. Purple/Lavender Lantern (Top-Left) */}
          <div className="traditional-lantern purple-lantern">
            <div className="lantern-wire-3d" />
            <div className="lantern-glow-3d" />
            
            {/* Sparkles */}
            <div className="sparkles-container">
              <div className="sparkle-star s1" />
              <div className="sparkle-star s2" />
              <div className="sparkle-star s3" />
            </div>

            {/* 3D-Faceted Main Body */}
            <div className="lantern-body-3d">
              <div className="facet facet-c-tl" />
              <div className="facet facet-c-tr" />
              <div className="facet facet-c-br" />
              <div className="facet facet-c-bl" />
              <div className="facet facet-ear-tl" />
              <div className="facet facet-ear-tr" />
              <div className="facet facet-ear-br" />
              <div className="facet facet-ear-bl" />
            </div>

            {/* Organic Breeze-Swaying Wavy Tassels (SVG) */}
            <div className="tassel-side-left">
              <svg viewBox="0 0 40 100" fill="none">
                <path d="M 30 0 C 15 20, 5 40, 10 60 C 12 70, 5 80, 2 95" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 32 0 C 20 25, 10 50, 15 75 C 18 85, 12 90, 8 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 28 0 C 10 15, 0 35, 5 55 C 8 65, 0 75, -2 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
            <div className="tassel-side-right">
              <svg viewBox="0 0 40 100" fill="none">
                <path d="M 10 0 C 25 20, 35 40, 30 60 C 28 70, 35 80, 38 95" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 8 0 C 20 25, 30 50, 25 75 C 22 85, 28 90, 32 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 12 0 C 30 15, 40 35, 35 55 C 32 65, 40 75, 42 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
            <div className="tassel-bottom">
              <svg viewBox="0 0 80 150" fill="none">
                <path d="M 40 0 C 35 30, 20 60, 30 90 C 35 110, 25 130, 20 145" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 36 0 C 25 25, 10 50, 20 80 C 25 100, 15 120, 12 135" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
                <path d="M 44 0 C 45 25, 30 50, 40 75 C 45 95, 35 115, 32 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="tassel-line" />
                <path d="M 38 0 C 20 30, 5 55, 12 85 C 16 105, 5 125, -2 140" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 42 0 C 50 30, 35 60, 45 90 C 50 110, 40 130, 38 148" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="tassel-line" />
                <path d="M 46 0 C 55 25, 45 55, 52 80 C 56 95, 48 115, 45 128" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
                <path d="M 34 0 C 15 20, -5 40, 2 70 C 5 85, -2 105, -5 120" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 48 0 C 60 25, 50 55, 58 85 C 62 100, 55 120, 52 138" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
          </div>

          {/* 2. Orange/Gold Lantern (Top-Right) */}
          <div className="traditional-lantern orange-lantern">
            <div className="lantern-wire-3d" />
            <div className="lantern-glow-3d" />
            
            {/* Sparkles */}
            <div className="sparkles-container">
              <div className="sparkle-star s1" />
              <div className="sparkle-star s2" />
              <div className="sparkle-star s3" />
              <div className="sparkle-star s4" />
            </div>

            {/* 3D-Faceted Main Body */}
            <div className="lantern-body-3d">
              <div className="facet facet-c-tl" />
              <div className="facet facet-c-tr" />
              <div className="facet facet-c-br" />
              <div className="facet facet-c-bl" />
              <div className="facet facet-ear-tl" />
              <div className="facet facet-ear-tr" />
              <div className="facet facet-ear-br" />
              <div className="facet facet-ear-bl" />
            </div>

            {/* Organic Breeze-Swaying Wavy Tassels (SVG) */}
            <div className="tassel-side-left">
              <svg viewBox="0 0 40 100" fill="none">
                <path d="M 30 0 C 15 20, 5 40, 10 60 C 12 70, 5 80, 2 95" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 32 0 C 20 25, 10 50, 15 75 C 18 85, 12 90, 8 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 28 0 C 10 15, 0 35, 5 55 C 8 65, 0 75, -2 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
            <div className="tassel-side-right">
              <svg viewBox="0 0 40 100" fill="none">
                <path d="M 10 0 C 25 20, 35 40, 30 60 C 28 70, 35 80, 38 95" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 8 0 C 20 25, 30 50, 25 75 C 22 85, 28 90, 32 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 12 0 C 30 15, 40 35, 35 55 C 32 65, 40 75, 42 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
            <div className="tassel-bottom">
              <svg viewBox="0 0 80 150" fill="none">
                <path d="M 40 0 C 35 30, 20 60, 30 90 C 35 110, 25 130, 20 145" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 36 0 C 25 25, 10 50, 20 80 C 25 100, 15 120, 12 135" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
                <path d="M 44 0 C 45 25, 30 50, 40 75 C 45 95, 35 115, 32 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="tassel-line" />
                <path d="M 38 0 C 20 30, 5 55, 12 85 C 16 105, 5 125, -2 140" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 42 0 C 50 30, 35 60, 45 90 C 50 110, 40 130, 38 148" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="tassel-line" />
                <path d="M 46 0 C 55 25, 45 55, 52 80 C 56 95, 48 115, 45 128" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
                <path d="M 34 0 C 15 20, -5 40, 2 70 C 5 85, -2 105, -5 120" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 48 0 C 60 25, 50 55, 58 85 C 62 100, 55 120, 52 138" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
          </div>

          {/* 3. Teal/Cyan Lantern (Bottom-Center, Foreground) */}
          <div className="traditional-lantern teal-lantern">
            <div className="lantern-wire-3d" />
            <div className="lantern-glow-3d" />
            
            {/* Sparkles */}
            <div className="sparkles-container">
              <div className="sparkle-star s1" />
              <div className="sparkle-star s2" />
              <div className="sparkle-star s3" />
              <div className="sparkle-star s4" />
              <div className="sparkle-star s5" />
            </div>

            {/* 3D-Faceted Main Body */}
            <div className="lantern-body-3d">
              <div className="facet facet-c-tl" />
              <div className="facet facet-c-tr" />
              <div className="facet facet-c-br" />
              <div className="facet facet-c-bl" />
              <div className="facet facet-ear-tl" />
              <div className="facet facet-ear-tr" />
              <div className="facet facet-ear-br" />
              <div className="facet facet-ear-bl" />
            </div>

            {/* Organic Breeze-Swaying Wavy Tassels (SVG) */}
            <div className="tassel-side-left">
              <svg viewBox="0 0 40 100" fill="none">
                <path d="M 30 0 C 15 20, 5 40, 10 60 C 12 70, 5 80, 2 95" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 32 0 C 20 25, 10 50, 15 75 C 18 85, 12 90, 8 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 28 0 C 10 15, 0 35, 5 55 C 8 65, 0 75, -2 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
            <div className="tassel-side-right">
              <svg viewBox="0 0 40 100" fill="none">
                <path d="M 10 0 C 25 20, 35 40, 30 60 C 28 70, 35 80, 38 95" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 8 0 C 20 25, 30 50, 25 75 C 22 85, 28 90, 32 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 12 0 C 30 15, 40 35, 35 55 C 32 65, 40 75, 42 88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
            <div className="tassel-bottom">
              <svg viewBox="0 0 80 150" fill="none">
                <path d="M 40 0 C 35 30, 20 60, 30 90 C 35 110, 25 130, 20 145" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="tassel-line" />
                <path d="M 36 0 C 25 25, 10 50, 20 80 C 25 100, 15 120, 12 135" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
                <path d="M 44 0 C 45 25, 30 50, 40 75 C 45 95, 35 115, 32 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="tassel-line" />
                <path d="M 38 0 C 20 30, 5 55, 12 85 C 16 105, 5 125, -2 140" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 42 0 C 50 30, 35 60, 45 90 C 50 110, 40 130, 38 148" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="tassel-line" />
                <path d="M 46 0 C 55 25, 45 55, 52 80 C 56 95, 48 115, 45 128" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="tassel-line" />
                <path d="M 34 0 C 15 20, -5 40, 2 70 C 5 85, -2 105, -5 120" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="tassel-line" />
                <path d="M 48 0 C 60 25, 50 55, 58 85 C 62 100, 55 120, 52 138" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="tassel-line" />
              </svg>
            </div>
          </div>
        </div>

      </div>

      {/* Content Layer */}
      <div className="vesak-content">
        {children}
      </div>
    </div>
  );
};

export default VesakDecorations;
