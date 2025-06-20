import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

function LoadingScreenWrapper({ isInitializing, showLogin }) {
  const [visible, setVisible] = useState(isInitializing || showLogin);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isInitializing && !showLogin) {
      setIsFadingOut(true);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setIsFadingOut(false);
    }
  }, [isInitializing, showLogin]);

  if (!visible) return null;

  return <LoadingScreen fadingOut={isFadingOut} showLogin={showLogin} />;
}

export default LoadingScreenWrapper;
