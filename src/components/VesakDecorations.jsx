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
                opacity: p.opacity
              }}
            />
          ))}
        </div>

        {/* Hanging lanterns line */}
        <div className="lantern-string">
          {lanterns.map((l, index) => (
            <div key={index} className={`lantern-node ${l.color}`}>
              <div className="lantern-wire" />
              <div className="lantern-body">
                <div className="lantern-inner-glow" />
                <div className="lantern-details" />
              </div>
              <div className="lantern-tassels">
                <div className="tassel" />
                <div className="tassel" />
                <div className="tassel" />
              </div>
            </div>
          ))}
        </div>

        {/* Traditional Clay Lamps (Vesak Pahan) at the bottom */}
        <div className="vesak-lamps">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="paha-lamp">
              <div className="lamp-flame">
                <div className="flame-inner" />
              </div>
              <div className="lamp-wick" />
              <div className="lamp-clay" />
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

export default VesakDecorations;