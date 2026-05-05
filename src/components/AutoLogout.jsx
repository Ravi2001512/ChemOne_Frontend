import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AUTO_LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

const AutoLogout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // Only set up the timer if there is a user logged in
    const user = localStorage.getItem('user');
    if (!user) return;

    // Don't run the timer on login, signup, or forgot-password pages
    const publicPaths = ['/login', '/signup', '/forgot-password'];
    if (publicPaths.includes(location.pathname)) {
      return;
    }

    let timer;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, AUTO_LOGOUT_TIME);
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Initial timer set
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleLogout, location.pathname]);

  return null;
};

export default AutoLogout;
