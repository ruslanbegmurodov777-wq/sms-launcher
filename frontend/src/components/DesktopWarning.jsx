import { useState, useEffect } from 'react';

// Detect if user is on mobile device
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const DesktopWarning = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setShowWarning(!isMobile());
  }, []);

  if (!showWarning) return null;

  return (
    <div className="desktop-warning">
      ⚠️ This app works best on mobile devices. SMS functionality requires a phone.
    </div>
  );
};

export default DesktopWarning;
