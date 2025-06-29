import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteCharacter,
  getXpForNextLevel,
} from "../services/playerService";
import NotificationModal from "../components/NotificationModal";
import ConfirmationModal from "../components/ConfirmationModal";
import PETS from "../petData";

function getBackground() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20
    ? "/assets/character/character_day_background.png"
    : "/assets/character/character_night_background.png";
}

function CharacterPage({ character, onDelete, onSwitch }) {
  const navigate = useNavigate();
  const [background, setBackground] = useState(getBackground());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setBackground(getBackground()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!character) return null;

  const portrait = `/assets/character_creation/${character.class.toLowerCase()}_${character.gender}.png`;
  const classIcon = `/assets/character_creation/${character.class.toLowerCase()}_button.png`;
  const nextXp = getXpForNextLevel(character.level);
  const xpPercent = Math.min((character.xp / nextXp) * 100, 100);

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const confirmDeleteAction = async () => {
    try {
      await deleteCharacter(character._id);
      if (onDelete) await onDelete();
      navigate("/character-select");
    } catch (err) {
      console.error(err);
      setNotificationMessage("Failed to delete profile");
      setShowNotification(true);
    }
    setConfirmDelete(false);
  };

  const handleSwitch = () => {
    if (onSwitch) onSwitch();
    navigate("/character-select");
  };

  return (
    <div
      className="w-screen h-screen relative bg-no-repeat bg-cover bg-center flex justify-center items-start font-['SS_Homero'] text-white"
      style={{ backgroundImage: `url(${background})` }}
    >
      <img
        src="/assets/character_creation/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
        onClick={() => navigate("/")}
      />
      <div
        className="w-full max-w-[600px] h-full pt-10 px-4 pb-4 bg-no-repeat bg-contain bg-center flex flex-col items-center justify-start"
        style={{
          backgroundImage: "url(/assets/character/character_page_frame.png)",
        }}
      >
        <div className="text-outline text-[20px] mb-2 mt-32">
          {character.name}
        </div>
        <div className="flex flex-row items-center justify-center gap-6">
          <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] mt-10">
            <img
              src={portrait}
              alt="Character"
              className="w-full h-full object-contain z-10"
            />
            <img
              src="/assets/character/character_frame.png"
              alt="Frame"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none scale-[1.8] z-20"
            />
          </div>
          <div className="flex items-center gap-2 drop-shadow-sm mt-8">
            <img
              src={classIcon}
              alt={character.class}
              className="w-12 h-auto"
            />
            <span className="text-base font-bold">{character.class}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm justify-items-center text-center drop-shadow-sm">
          <div className="flex items-center gap-1">
            <img
              src="/assets/game_hub/gold_icon.png"
              alt="Gold"
              className="w-6"
            />
            <span>{character.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/assets/game_hub/pie_icon.png" alt="Pi" className="w-6" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="/assets/game_hub/level_icon.png"
              alt="Level"
              className="w-6"
            />
            <span>{character.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="/assets/character/energy_icon.png"
              alt="Energy"
              className="w-6"
            />
            <span>{`${character.energy}/100`}</span>
          </div>
        </div>
        <div className="w-full max-w-[300px] h-10 mt-4 relative rounded-xl overflow-hidden">
          {/* Background bar image */}
          <img
            src="/assets/game_hub/xp_bar.png"
            alt="XP"
            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
          />

          {/* Fill container clipped naturally by overflow */}
          <div className="absolute inset-3 z-0 overflow-hidden rounded-xl">
            <div
              className="h-full bg-gradient-to-r from-[#ffcf33] to-[#ffe884]"
              style={{ width: `${xpPercent}%` }}
            />
          </div>

          {/* XP text */}
        <div className="absolute inset-0 flex items-center justify-center z-20 text-sm font-bold text-black drop-shadow-md">
          {`${character.xp} / ${nextXp} XP`}
        </div>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-start gap-4 w-full">
        {character.pet && (() => {
          const info = PETS.find((p) => p.id === character.pet.id);
          return (
            <div className="flex flex-col items-center gap-1 text-white drop-shadow-md mx-auto sm:mx-0">
              <img src={`/assets/spirit_grove/${character.pet.id}.png`} alt="Pet" className="w-16" />
              <span className="text-outline text-sm capitalize">{info?.name || character.pet.id}</span>
              {info && (
                <span className="text-xs text-center">
                  +{info.boosts.gold * 100}% Gold / +{info.boosts.xp * 100}% XP
                </span>
              )}
            </div>
          );
        })()}
      </div>
      <div className="mt-auto flex flex-row items-center justify-center gap-3">
          <img
            src="/assets/character/switch_character_button.png"
            alt="Switch"
            className="w-[120px] cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
            onClick={handleSwitch}
          />
          <img
            src="/assets/ui/buttons/delete_button.png"
            alt="Delete"
            className="w-[120px] cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
            onClick={handleDelete}
          />
        </div>
      </div>
      <NotificationModal
        message={notificationMessage}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <ConfirmationModal
        message="Delete this character?"
        visible={confirmDelete}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default CharacterPage;
