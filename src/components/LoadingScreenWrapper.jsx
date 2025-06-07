import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

function LoadingScreenWrapper({ isInitializing }) {
  const [visible, setVisible] = useState(isInitializing);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      setIsFadingOut(true);
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setIsFadingOut(false);
    }
  }, [isInitializing]);

  if (!visible) return null;

  return <LoadingScreen fadingOut={isFadingOut} />;
}

export default LoadingScreenWrapper;