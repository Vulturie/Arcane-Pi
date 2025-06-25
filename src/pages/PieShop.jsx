import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getPiPrice, getPlayer } from "../services/playerService";
import Pi from "../piSdk";
import { API_BASE_URL } from "../config";
import NotificationModal from "../components/NotificationModal";

function PieShop({ username, accessToken }) {
  const navigate = useNavigate();
  const [priceUSD, setPriceUSD] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pie, setPie] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const loadPlayer = useCallback(async () => {
    try {
      const data = await getPlayer(username, accessToken);
      setPie(data.pie);
    } catch (err) {
      console.error("Failed to load player", err);
    }
  }, [username, accessToken]);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPiPrice();
      setPriceUSD(data.priceUSD);
    } catch (err) {
      console.error("Failed to fetch price", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrice();
    loadPlayer();
    const priceInterval = setInterval(fetchPrice, 900000);
    return () => clearInterval(priceInterval);
  }, [fetchPrice, loadPlayer]);

  const packages = [
    { amount: 100, img: "/assets/pie_shop/buy_pie_100.png" },
    { amount: 525, img: "/assets/pie_shop/buy_pie_525.png" },
    { amount: 1120, img: "/assets/pie_shop/buy_pie_1120.png" },
  ];

  const calcPrice = (amt) => {
    if (!priceUSD) return "...";
    const totalUSD = amt / 100;
    const pi = totalUSD / priceUSD;
    return pi.toFixed(4);
  };

  const handleBuy = (pack) => {
    if (!priceUSD || !window.Pi || !window.Pi.createPayment) return;
    const totalUSD = pack.amount / 100;
    const piAmount = parseFloat((totalUSD / priceUSD).toFixed(4));
    Pi.createPayment(
      {
        amount: piAmount,
        memo: `Buy ${pack.amount} Pie`,
        metadata: { type: "buy_pie", amount: pack.amount },
      },
      {
        onReadyForServerApproval: async (paymentId) => {
          await fetch(`${API_BASE_URL}/api/pi/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ paymentId }),
          });
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          const res = await fetch(`${API_BASE_URL}/api/pi/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ paymentId, txid, username, metadata: { type: "buy_pie", amount: pack.amount } }),
          });
          if (res.ok) {
            setNotificationMessage(`You purchased ${pack.amount} Pie`);
            setShowNotification(true);
            loadPlayer();
          } else {
            console.error("Payment completion failed");
          }
        },
        onCancel: (paymentId) => {
          console.log("Payment cancelled", paymentId);
        },
        onError: (error) => {
          console.error("Payment error", error);
        },
      }
    );
  };

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center font-['SS_Homero']"
      style={{ backgroundImage: "url(/assets/pie_shop/pie_shop_background.png)" }}
    >
      <img
        src="/assets/pie_shop/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer z-10"
        onClick={() => navigate("/")}
      />
      <div className="absolute top-4 right-4 flex items-center gap-1 text-white drop-shadow-md">
        <img src="/assets/pie_shop/pie_icon.png" alt="Pie" className="w-6" />
        <span className="font-bold">{pie}</span>
      </div>
      {loading && (
        <div className="absolute top-20 right-4">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 ml-[-90px]">
        {packages.map((pack) => (
          <div key={pack.amount} className="relative">
            <img
              src={pack.img}
              alt={`Buy ${pack.amount}`}
              className="w-40 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleBuy(pack)}
            />
            <div className="absolute top-24 right-[-100px] -translate-y-1/2 flex items-center gap-2 text-white">
              <img src="/assets/pie_shop/pi_logo.png" alt="Pi" className="w-10" />
              <span>{calcPrice(pack.amount)}</span>
            </div>
          </div>
        ))}
      </div>
      <NotificationModal
        message={notificationMessage}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default PieShop;
