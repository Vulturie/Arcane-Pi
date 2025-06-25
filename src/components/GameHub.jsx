import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getXpForNextLevel, getPlayer } from "../services/playerService";
import logStat from "../utils/logStat";

function getBackground() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20
    ? "/assets/game_hub/hub_day_background.png"
    : "/assets/game_hub/hub_night_background.png";
}

function GameHub({ character, refreshCharacter, username, accessToken }) {
  const [background, setBackground] = useState(getBackground());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pie, setPie] = useState(0);
  const [lockedFeature, setLockedFeature] = useState(null);

  useEffect(() => {
    const bgInterval = setInterval(() => setBackground(getBackground()), 60000);
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshCharacter();
      }
    }, 10000);
    return () => {
      clearInterval(bgInterval);
      clearInterval(refreshInterval);
    };
  }, [refreshCharacter]);

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        const data = await getPlayer(username, accessToken);
        setPie(data.pie);
      } catch (err) {
        console.error("Failed to load player");
      }
    };
    loadPlayer();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') loadPlayer();
    }, 10000);
    return () => clearInterval(interval);
  }, [username, accessToken]);

  if (!character) return null;

  const portrait = `/assets/character_creation/${character.class.toLowerCase()}_${character.gender}.png`;
  const nextXp = getXpForNextLevel(character.level);
  const xpPercent = Math.min((character.xp / nextXp) * 100, 100);

  const handleArenaClick = (e) => {
    if (character.level < 20) {
      e.preventDefault();
      setLockedFeature('arena');
      return;
    }
    logStat({ type: 'ui_interaction', area: 'hub', button: 'arena' });
  };

  const handleTowerClick = (e) => {
    if (character.level < 10) {
      e.preventDefault();
      setLockedFeature('tower');
      return;
    }
    logStat({ type: 'ui_interaction', area: 'hub', button: 'tower' });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-['SS_Homero']">
      <img
        src={background}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div
        className="absolute top-0 left-0 z-10 w-full h-[120px] flex items-center justify-start px-8 bg-no-repeat bg-center bg-contain"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/assets/game_hub/top_frame.png)`,
        }}
      >
        <Link to="/character">
          <img
            src={portrait}
            alt="Character"
            className="w-16 cursor-pointer self-center mt-2"
          />
        </Link>
        <div className="flex flex-col items-center justify-center flex-1 ml-2 mt-[14px]">
          <div className="text-outline text-sm mb-0.5">{character.name}</div>
          <div className="flex items-center gap-2 text-white drop-shadow text-xs">
            <div className="flex items-center">
              <img
                src="/assets/game_hub/gold_icon.png"
                alt="Gold"
                className="w-6 mr-1"
              />
              <span className="text-white text-outline">{character.gold}</span>
            </div>
            <div className="flex items-center">
              <img
                src="/assets/game_hub/pie_icon.png"
                alt="Pi"
                className="w-6 mr-1"
              />
              <span className="text-white text-outline">{pie}</span>
            </div>
            <div className="flex items-center">
              <img
                src="/assets/game_hub/level_icon.png"
                alt="Level"
                className="w-6 mr-1"
              />
              <span className="text-outline text-xs">{character.level}</span>
            </div>
            <div className="flex items-center">
              <img
                src="/assets/character/energy_icon.png"
                alt="Energy"
                className="w-6 mr-1"
              />
              <span className="text-white text-outline">{`${character.energy}/100`}</span>
            </div>
          </div>
          <div className="relative w-full h-10 mt-1 flex items-center justify-center overflow-hidden rounded-xl">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ffcf33] to-[#ffe884] rounded-[6px] z-[1]"
              style={{
                width: `${xpPercent}%`,
                clipPath: "inset(6% round 8px)",
              }}
            />
            <div className="z-[2] text-outline text-sm">{`${character.xp} / ${nextXp} XP`}</div>
            <img
              src="/assets/game_hub/xp_bar.png"
              alt="XP"
              className="absolute inset-0 w-full h-full object-contain z-[2]"
            />
          </div>
        </div>
      </div>

      <div
        className={`absolute left-0 bottom-0 z-10 w-full h-[320px] pt-[60px] pb-[50px] bg-no-repeat bg-center bg-contain transition-transform flex flex-wrap justify-center items-center gap-2 mb-0 ${drawerOpen ? "translate-y-3" : "translate-y-[160px]"}`}
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/assets/game_hub/bottom_frame.png)`,
        }}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <Link
          to="/tavern"
          onClick={() =>
            logStat({ type: "ui_interaction", area: "hub", button: "tavern" })
          }
        >
          <img
            src="/assets/game_hub/tavern_button.png"
            alt="Tavern"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link
          to="/inventory"
          onClick={() =>
            logStat({
              type: "ui_interaction",
              area: "hub",
              button: "inventory",
            })
          }
        >
          <img
            src="/assets/game_hub/inventory_button.png"
            alt="Inventory"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/arena" onClick={handleArenaClick}>
          <img
            src="/assets/game_hub/arena_button.png"
            alt="Arena"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link
          to="/shop"
          onClick={() =>
            logStat({ type: "ui_interaction", area: "hub", button: "shop" })
          }
        >
          <img
            src="/assets/game_hub/shop_button.png"
            alt="Shop"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/tower" onClick={handleTowerClick}>
          <img
            src="/assets/game_hub/tower_icon.png"
            alt="Tower"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/spirit-grove">
          <img
            src="/assets/game_hub/spirit_grove_button.png"
            alt="Spirit Grove"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <img
          src="/assets/game_hub/gate_icon.png"
          alt="Gate"
          className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
        />
        <Link
          to="/journal"
          onClick={() =>
            logStat({ type: "ui_interaction", area: "hub", button: "journal" })
          }
        >
          <img
            src="/assets/game_hub/journal_button.png"
            alt="Journal"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/pie-shop">
          <img
            src="/assets/game_hub/pie_shop_button.png"
            alt="Pie Shop"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
        <Link to="/settings">
          <img
            src="/assets/game_hub/settings_button.png"
            alt="Settings"
            className="w-16 sm:w-20 cursor-pointer transition-transform hover:scale-105"
          />
        </Link>
      </div>

      {lockedFeature && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setLockedFeature(null)}
        >
          <div
            className="bg-gray-800 p-4 rounded text-center border-4 border-yellow-600"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4">
              {lockedFeature === 'tower'
                ? 'The Tower unlocks at level 10.'
                : 'The Arena unlocks at level 20.'}
            </p>
            <button
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              onClick={() => setLockedFeature(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameHub;
