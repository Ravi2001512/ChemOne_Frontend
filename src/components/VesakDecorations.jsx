import React from 'react';
import '../styles/Vesak.css';

const VesakDecorations = () => {
  const lanterns = [
    { color: 'blue' },
    { color: 'yellow' },
    { color: 'red' },
    { color: 'white' },
    { color: 'orange' },
    { color: 'blue' },
    { color: 'yellow' },
    { color: 'red' },
    { color: 'white' },
    { color: 'orange' },
  ];

  // Generate some random petals
  const petals = Array.from({ length: 15 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 20}s`,
    size: `${5 + Math.random() * 10}px`,
  }));

  return (
    <>
      <div className="vesak-ambient" />
      <div className="vesak-container">
        <div className="vesak-moon" />
        
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
                height: p.size
              }} 
            />
          ))}
        </div>

        <div className="lantern-string">
          {lanterns.map((l, index) => (
            <div key={index} className={`lantern ${l.color}`}>
              <div className="lantern-body">
                <div className="lantern-inner-glow" />
              </div>
              <div className="lantern-tassels">
                <div className="tassel" />
                <div className="tassel" />
                <div className="tassel" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default VesakDecorations;
