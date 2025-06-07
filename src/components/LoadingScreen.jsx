import React, { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

const loadingImages = [
  "/assets/loading/loading_one.png",
  "/assets/loading/loading_two.png",
];

function LoadingScreen() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingImages.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <img
        src="/assets/loading/background.png"
        className={styles.background}
        alt="Loading background"
      />
      <img
        src="/assets/loading/logo_arcane-pi.png"
        className={styles.logo}
        alt="Arcane Pi logo"
      />
      <img
        src={loadingImages[index]}
        className={styles.loadingText}
        alt="Loading"
      />
      <img
        src="/assets/loading/loading_bar.png"
        className={styles.loadingBar}
        alt="Loading bar"
      />
    </div>
  );
}

export default LoadingScreen;