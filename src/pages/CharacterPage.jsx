import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatsForClass, deleteCharacter, getXpForNextLevel } from "../services/playerService";

function getBackground() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20
    ? "/assets/character/character_day_background.png"
    : "/assets/character/character_night_background.png";
}

function CharacterPage({ character, onDelete, onSwitch }) {
  const navigate = useNavigate();
  const [background, setBackground] = useState(getBackground());

  useEffect(() => {
    const interval = setInterval(() => setBackground(getBackground()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!character) return null;

  const stats = getStatsForClass(character.class, character.level);
  const portrait = `/assets/character_creation/${character.class.toLowerCase()}_${character.gender}.png`;
  const classIcon = `/assets/character_creation/${character.class.toLowerCase()}_button.png`;
  const nextXp = getXpForNextLevel(character.level);
  const xpPercent = Math.min((character.xp / nextXp) * 100, 100);

  const handleDelete = async () => {
    if (!window.confirm("Delete this character?")) return;
    try {
      await deleteCharacter(character._id);
      if (onDelete) await onDelete();
      navigate("/character-select");
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    }
  };

  const handleSwitch = () => {
    if (onSwitch) onSwitch();
    navigate("/character-select");
  };

  return (
    <div
      className="w-screen h-screen relative bg-no-repeat bg-cover bg-center flex justify-center items-start font-[Cinzel] text-white"
      style={{ backgroundImage: `url(${background})` }}
    >
      <img
        src="/assets/character_creation/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
        onClick={() => navigate("/")}
      />
      <div className="w-full max-w-[600px] h-full pt-12 px-4 pb-4 bg-[url('/assets/character/character_page_frame.png')] bg-no-repeat bg-contain bg-center flex flex-col items-center justify-start">
        <div className="font-bold text-[20px] drop-shadow-md mb-2 mt-32">{character.name}</div>
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="relative w-[180px] h-[180px] mt-2">
            <img src={portrait} alt="Character" className="w-full h-auto mt-8" />
            <img
              src="/assets/character/character_frame.png"
              alt="Frame"
              className="absolute -top-[6px] -left-[10px] w-[180%] h-[180%] object-contain pointer-events-none mt-8"
            />
          </div>
          <div className="flex items-center gap-2 drop-shadow-sm mt-8">
            <img src={classIcon} alt={character.class} className="w-12 h-auto" />
            <span className="text-base font-bold">{character.class}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm justify-items-center text-center drop-shadow-sm">
          <div className="flex items-center gap-1">
            <img src="/assets/game_hub/gold_icon.png" alt="Gold" className="w-6" />
            <span>{character.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/assets/game_hub/pie_icon.png" alt="Pi" className="w-6" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/assets/game_hub/level_icon.png" alt="Level" className="w-6" />
            <span>{character.level}</span>
          </div>
          <div className="flex items-center gap-1">
            <img src="/assets/character/energy_icon.png" alt="Energy" className="w-6" />
            <span>{`${character.energy}/100`}</span>
          </div>
        </div>
        <div className="w-4/5 h-10 relative mt-4 flex items-center justify-center overflow-hidden rounded-xl">
          <div className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-[#ffcf33] to-[#ffe884] rounded-md z-10 [clip-path:inset(8%_round_8px)]" style={{ width: `${xpPercent}%` }} />
          <div className="text-sm text-black drop-shadow-md font-bold z-20">{`${character.xp} / ${nextXp} XP`}</div>
          <img src="/assets/game_hub/xp_bar.png" alt="XP" className="absolute inset-0 w-full h-full object-contain z-20" />
        </div>
        <div className="w-[320px] h-[180px] bg-[url('/assets/character/stats_table.png')] bg-no-repeat bg-contain mt-8 mx-auto relative">
          <div className="absolute w-[35%] left-[30px] flex justify-between items-center px-2 text-lg font-bold text-white drop-shadow-md top-[26px]">
            <span>STR</span>
            <span className="text-yellow-300 min-w-[30px] text-right">{stats.STR}</span>
          </div>
          <div className="absolute w-[35%] left-[30px] flex justify-between items-center px-2 text-lg font-bold text-white drop-shadow-md top-[60px]">
            <span>AGI</span>
            <span className="text-yellow-300 min-w-[30px] text-right">{stats.AGI}</span>
          </div>
          <div className="absolute w-[35%] left-[30px] flex justify-between items-center px-2 text-lg font-bold text-white drop-shadow-md top-[96px]">
            <span>INT</span>
            <span className="text-yellow-300 min-w-[30px] text-right">{stats.INT}</span>
          </div>
          <div className="absolute w-[35%] left-[30px] flex justify-between items-center px-2 text-lg font-bold text-white drop-shadow-md top-[128px]">
            <span>VIT</span>
            <span className="text-yellow-300 min-w-[30px] text-right">{stats.VIT}</span>
          </div>
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
    </div>
  );
}

export default CharacterPage;