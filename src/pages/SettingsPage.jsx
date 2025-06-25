import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";

function SettingsPage() {
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);

  const clearCache = async () => {
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch (err) {
      console.error("Failed to clear cache", err);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center font-['SS_Homero'] text-white flex flex-col items-center"
      style={{ backgroundImage: 'url(/assets/settings/settings_background.png)' }}
    >
      <img
        src="/assets/settings/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-20 h-10 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <img
        src="/assets/settings/settings_sign.png"
        alt="Settings"
        className="mt-4 w-60 object-contain drop-shadow-md"
      />
      <div className="mt-8 text-center space-y-2 text-outline">
        <p>Discord: <a href="https://discord.gg/8bWM6653uB" className="underline" target="_blank" rel="noopener noreferrer">https://discord.gg/8bWM6653uB</a></p>
        <p>E-mail: <a href="mailto:info@arcanepi.com" className="underline">info@arcanepi.com</a></p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-end pb-28 w-full">
        <button
          className="px-6 py-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow-md"
          onClick={() => setConfirmClear(true)}
        >
          Clear Cache
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          className="px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow-md"
          onClick={() => (window.location.href = '/privacy-policy.html')}
        >
          Privacy Policy
        </button>
        <button
          className="px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600 shadow-md"
          onClick={() => (window.location.href = '/terms-of-service.html')}
        >
          Terms of Service
        </button>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs opacity-70">
        App Version: {process.env.REACT_APP_VERSION}
      </div>

      <ConfirmationModal
        message="Are you sure you want to clear the asset cache? This will reload app assets and may cause a refresh."
        visible={confirmClear}
        onConfirm={() => {
          setConfirmClear(false);
          clearCache();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

export default SettingsPage;
