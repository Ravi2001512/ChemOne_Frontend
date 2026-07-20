import React from 'react';
import '../styles/Decorations.css';

const Decorations = ({ children }) => {



  return (
    <div className="festival-theme-wrapper">
      {/* Event Background Layer */}
      <div className="event-scene">
        {/* Desktop Video */}
        <video
          className="event-image hidden md:block"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/bg_poster.png"
          onCanPlay={() => setVideoLoaded(true)}
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>

        {/* Mobile Video */}
        <video
          className="event-image block md:hidden"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/bg_poster2.png"
          onCanPlay={() => setVideoLoaded(true)}
        >
          <source src="/bg2.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Deep, peaceful ambient night background */}
      <div className="festival-ambient" />

      {/* Content Layer */}
      <div className="festival-content">
        {children}
      </div>
    </div>
  );
};

export default Decorations;
