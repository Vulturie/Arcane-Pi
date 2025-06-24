import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayer, buyPet } from "../services/playerService";
import PETS from "../petData";
import ConfirmationModal from "../components/ConfirmationModal";
import NotificationModal from "../components/NotificationModal";

function SpiritGrove({ character, refreshCharacter }) {
  const navigate = useNavigate();
  const [pie, setPie] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    const loadPie = async () => {
      try {
        const data = await getPlayer(character.owner);
        setPie(data.pie);
      } catch (err) {
        console.error("Failed to load pie", err);
      }
    };
    if (character) loadPie();
  }, [character]);

  const closeModal = () => setSelected(null);

  const handleBuy = (pet) => {
    setConfirmation({
      message: `Buy ${pet.name} for ${pet.cost} ${pet.currency}? This will replace your current pet and reset its duration.`,
      onConfirm: async () => {
        try {
          const data = await buyPet(character._id, pet.id);
          if (data.pie !== undefined) setPie(data.pie);
          refreshCharacter();
        } catch (err) {
          setNotificationMessage(err.message);
          setShowNotification(true);
        }
        setConfirmation(null);
        closeModal();
      },
    });
  };

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/spirit_grove/spirit_grove_background.png)" }}
    >
      <img
        src="/assets/shop/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-12 h-12 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <img
        src="/assets/spirit_grove/spirit_grove_sign.png"
        alt="Spirit Grove"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[240px]"
      />
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 text-white drop-shadow-md">
        <div className="flex items-center gap-1">
          <img src="/assets/spirit_grove/gold_icon.png" alt="Gold" className="w-6" />
          <span className="font-bold">{character.gold}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src="/assets/spirit_grove/pie_icon.png" alt="Pie" className="w-6" />
          <span className="font-bold">{pie}</span>
        </div>
      </div>

      {PETS.map((p) => {
        const positions = {
          dustpaw:
            "absolute left-4 bottom-[25%] sm:left-32 sm:bottom-10 hover:scale-105",
          emberfang:
            "absolute left-[40%] bottom-[50%] sm:bottom-28 hover:scale-105",
          auraflare:
            "absolute right-8 top-[20%] sm:right-16 sm:top-12 hover:scale-105",
        };
        return (
          <img
            key={p.id}
            src={`/assets/spirit_grove/${p.id}.png`}
            alt={p.name}
            className={`w-24 sm:w-32 cursor-pointer transition-transform ${positions[p.id]}`}
            onClick={() => setSelected(p)}
          />
        );
      })}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={closeModal}
        >
          <div className="relative w-[430px] h-[660px]" onClick={(e) => e.stopPropagation()}>
            <img src="/assets/spirit_grove/spirit_grove_window.png" alt="Window" className="w-full h-full" />
            <img
              src="/assets/spirit_grove/exit_button.png"
              alt="Close"
              className="absolute top-4 right-4 w-8 h-8 cursor-pointer z-10"
              onClick={closeModal}
            />
            <div className="absolute inset-0 flex flex-col items-center text-white p-4 pt-16">
              <img src={`/assets/spirit_grove/${selected.id}.png`} alt={selected.name} className="w-28 mb-2" />
              <div className="flex flex-col gap-1 text-sm items-start">
                <div className="flex items-center gap-1">
                  <img src="/assets/spirit_grove/gold_icon.png" alt="Gold" className="w-5" />
                  <span>+{selected.boosts.gold * 100}% Gold</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="/assets/spirit_grove/xp_icon.png" alt="XP" className="w-5" />
                  <span>+{selected.boosts.xp * 100}% XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src="/assets/spirit_grove/time_icon.png" alt="Time" className="w-5" />
                  <span>-{selected.boosts.time * 100}% Quest Time</span>
                </div>
                <span className="text-xs mt-1">Bonuses last 7 days</span>
              </div>
              <p className="text-center text-sm mt-2 px-2 flex-1 overflow-y-auto">{selected.flavor}</p>
              <div className="flex flex-col items-center mt-auto mb-2">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <img
                    src={`/assets/spirit_grove/${selected.currency}_icon.png`}
                    alt={selected.currency}
                    className="w-6"
                  />
                  <span className="text-lg">{selected.cost}</span>
                </div>
                <img
                  src="/assets/spirit_grove/buy_button.png"
                  alt="Buy"
                  className="w-[135px] h-[75px] cursor-pointer"
                  onClick={() => handleBuy(selected)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationModal
        message={notificationMessage}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <ConfirmationModal
        message={confirmation?.message}
        visible={!!confirmation}
        onConfirm={confirmation?.onConfirm}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
}

export default SpiritGrove;
