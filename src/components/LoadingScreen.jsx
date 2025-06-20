import React, { useEffect, useState } from "react";
import PiLoginButton from "./PiLoginButton";

const loadingImages = [
  "/assets/loading/loading_one.png",
  "/assets/loading/loading_two.png",
];

function LoadingScreen({ fadingOut = false, showLogin = false }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingImages.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = `fixed inset-0 z-[9999] w-screen h-screen overflow-hidden bg-black/70 flex justify-center items-center ${fadingOut ? "opacity-0 transition-opacity duration-500 pointer-events-none" : ""}`;

  return (
    <div className={containerClasses}>
      <img
        src="/assets/loading/background.png"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Loading background"
      />
      <div className="relative flex flex-col items-center">
        <img
          src="/assets/loading/logo_arcane-pi.png"
          className="w-[60%] max-w-[300px] mb-8"
          alt="Arcane Pi logo"
        />
        {showLogin ? (
          <PiLoginButton />
        ) : (
          <>
            <img
              src={loadingImages[index]}
              className="w-1/2 max-w-[200px] mb-4"
              alt="Loading"
            />
            <img
              src="/assets/loading/loading_bar.png"
              className="w-[80%] max-w-[300px]"
              alt="Loading bar"
            />
          </>
        )}
      </div>
    </div>
  );
}

export default LoadingScreen;
