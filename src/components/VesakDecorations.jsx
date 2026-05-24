import React, { useMemo } from 'react';
import '../styles/Vesak.css';

const VesakDecorations = ({ children }) => {

  /* Floating petals */
  const petals = useMemo(() => {
    return Array.from({ length: 25 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * -20}s`,
      duration: `${12 + Math.random() * 18}s`,
      size: `${8 + Math.random() * 12}px`,
      opacity: 0.4 + Math.random() * 0.5,
    }));
  }, []);

  /* High-fidelity traditional tassels grouped by attachment points */
  const tasselsLeft = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      left: `${i * 3.2}px`,
      height: `${80 + Math.random() * 45}px`,
      width: `${3 + Math.random() * 2}px`,
      delay: `${i * -0.15 - Math.random() * 0.4}s`,
      rotate: `${-10 + Math.random() * 20}deg`,
      opacity: 0.65 + Math.random() * 0.35,
    }));
  }, []);

  const tasselsRight = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      left: `${i * 3.2}px`,
      height: `${80 + Math.random() * 45}px`,
      width: `${3 + Math.random() * 2}px`,
      delay: `${i * -0.15 - Math.random() * 0.4}s`,
      rotate: `${-10 + Math.random() * 20}deg`,
      opacity: 0.65 + Math.random() * 0.35,
    }));
  }, []);

  const tasselsBottom = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const baseHeight = 155 + Math.sin(i * 0.2) * 20;
      const height = baseHeight + Math.random() * 30;
      return {
        left: `${i * 4.4}px`,
        height: `${height}px`,
        width: `${4.5 + Math.random() * 3.5}px`, // Wide flat paper ribbons like the reference photo
        delay: `${i * -0.07 - Math.random() * 0.3}s`,
        rotate: `${-6 + Math.random() * 12}deg`,
        opacity: 0.75 + Math.random() * 0.25,
      };
    });
  }, []);

  return (
    <div className="vesak-theme-wrapper">

      {/* Ambient background */}
      <div className="vesak-ambient" />

      <div className="vesak-container">

        {/* Moon */}
        <div className="vesak-moon">
          <div className="moon-glow" />
        </div>

        {/* Falling petals */}
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
                opacity: p.opacity
              }}
            />
          ))}
        </div>

        {/* Vesak Lantern */}
        <div className="large-traditional-lantern">

          {/* Hanging wire */}
          <div className="large-lantern-wire" />

          {/* Lantern glow */}
          <div className="large-lantern-glow" />

          {/* Sparkles */}
          <div className="large-sparkles-container">
            <div className="sparkle-star s1" />
            <div className="sparkle-star s2" />
            <div className="sparkle-star s3" />
            <div className="sparkle-star s4" />
            <div className="sparkle-star s5" />
          </div>

          {/* Lantern body - Styled as the Traditional Sri Lankan rotated cube with ears */}
          <div className="large-lantern-body traditional-vesak-body">

            <svg viewBox="0 0 220 220" className="large-lantern-svg">

              <defs>
                {/* Glowing gradients matching the warm paper texture of the photo */}
                <radialGradient id="traditionalGlow" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#ffff85" />
                  <stop offset="75%" stopColor="#ffda16" />
                  <stop offset="100%" stopColor="#bf7c00" />
                </radialGradient>
                <linearGradient id="earGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffda0" />
                  <stop offset="65%" stopColor="#ffe42e" />
                  <stop offset="100%" stopColor="#a36600" />
                </linearGradient>
              </defs>

              {/* Central Diamond (Rotated Square Face) */}
              <polygon
                points="110,45 170,105 110,165 50,105"
                fill="url(#traditionalGlow)"
                stroke="#8d230f"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />

              {/* Wooden frame outline divisions inside center diamond (Red/brown crossing diagonals) */}
              <line
                x1="110"
                y1="45"
                x2="110"
                y2="165"
                stroke="#8d230f"
                strokeWidth="2.2"
              />
              <line
                x1="50"
                y1="105"
                x2="170"
                y2="105"
                stroke="#8d230f"
                strokeWidth="2.2"
              />

              {/* Ears (Four outer triangular panels) */}
              {/* Top-Left Ear */}
              <polygon points="110,45 50,105 40,35" fill="url(#earGlow)" stroke="#8d230f" strokeWidth="2.8" strokeLinejoin="round" />
              {/* Top-Right Ear */}
              <polygon points="110,45 170,105 180,35" fill="url(#earGlow)" stroke="#8d230f" strokeWidth="2.8" strokeLinejoin="round" />
              {/* Bottom-Left Ear */}
              <polygon points="50,105 110,165 40,175" fill="url(#earGlow)" stroke="#8d230f" strokeWidth="2.8" strokeLinejoin="round" />
              {/* Bottom-Right Ear */}
              <polygon points="170,105 110,165 180,175" fill="url(#earGlow)" stroke="#8d230f" strokeWidth="2.8" strokeLinejoin="round" />

              {/* Top wire connector cap */}
              <polygon points="110,45 95,15 125,15" fill="url(#earGlow)" stroke="#8d230f" strokeWidth="2.2" strokeLinejoin="round" />

            </svg>

          </div>

          {/* Left Ear Tassels (Hanging from left corner of the diamond body) */}
          <div className="large-tassels-left">
            {tasselsLeft.map((t, i) => (
              <div
                key={i}
                className="hex-tassel"
                style={{
                  left: t.left,
                  height: t.height,
                  width: t.width,
                  opacity: t.opacity,
                  animationDelay: t.delay,
                  transform: `rotate(${t.rotate})`
                }}
              />
            ))}
          </div>

          {/* Right Ear Tassels (Hanging from right corner of the diamond body) */}
          <div className="large-tassels-right">
            {tasselsRight.map((t, i) => (
              <div
                key={i}
                className="hex-tassel"
                style={{
                  left: t.left,
                  height: t.height,
                  width: t.width,
                  opacity: t.opacity,
                  animationDelay: t.delay,
                  transform: `rotate(${t.rotate})`
                }}
              />
            ))}
          </div>

          {/* Main Bottom Tassels Curtain (Densely hanging from the bottom panels of the body) */}
          <div className="large-tassels-bottom">
            {tasselsBottom.map((t, i) => (
              <div
                key={i}
                className="hex-tassel"
                style={{
                  left: t.left,
                  height: t.height,
                  width: t.width,
                  opacity: t.opacity,
                  animationDelay: t.delay,
                  transform: `rotate(${t.rotate})`
                }}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Content */}
      <div className="vesak-content">
        {children}
      </div>

    </div>
  );
};

export default VesakDecorations;