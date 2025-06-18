import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/playerService";

function Journal({ character }) {
  const navigate = useNavigate();
  const [tavernJournalEntries, setTavernJournalEntries] = useState([]);
  const [arenaJournalEntries, setArenaJournalEntries] = useState([]);
  const [towerJournalEntries, setTowerJournalEntries] = useState([]);
  const [showTavern, setShowTavern] = useState(false);
  const [showArena, setShowArena] = useState(false);
  const [showTower, setShowTower] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!character) return;
      try {
        const data = await getHistory(character._id);
        const tavern = [];
        const arena = [];
        const tower = [];
        data
          .slice(-20)
          .reverse()
          .forEach((entry) => {
            if (entry.questType === "tower") tower.push(entry);
            else if (entry.questType === "arena") arena.push(entry);
            else tavern.push(entry);
          });
        setTavernJournalEntries(tavern);
        setArenaJournalEntries(arena);
        setTowerJournalEntries(tower);
      } catch (err) {
        console.error("Failed to load journal", err);
      }
    };
    load();
  }, [character]);

  const renderTavernEntries = () => (
    <div className="absolute inset-x-0 top-40 bottom-32 px-24 overflow-y-auto text-sm space-y-1">
      {tavernJournalEntries.map((entry, idx) => (
        <div key={idx} className="grid grid-cols-3 items-center py-1">
          <span className="font-bold text-left truncate">{entry.questName}</span>
          <div className="flex items-center gap-1 justify-end">
            <img src="/assets/journal/gold_icon.png" alt="Gold" className="w-5" />
            <span>{entry.gold}</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <img src="/assets/journal/xp_icon.png" alt="XP" className="w-5" />
            <span>{entry.xp}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderArenaEntries = () => (
    <div className="absolute inset-x-0 top-40 bottom-32 px-24 overflow-y-auto text-sm space-y-1">
      {arenaJournalEntries.map((entry, idx) => (
        <div
          key={idx}
          className="grid grid-cols-3 items-center py-1 hover:bg-black hover:bg-opacity-10"
        >
          <span className="truncate">{entry.opponentName}</span>
          <img
            src={`/assets/journal/${entry.result === "win" ? "wins_icon.png" : "losses_icon.png"}`}
            alt={entry.result}
            className="w-6 mx-auto"
          />
          <div className="flex items-center gap-1 justify-end">
            <img src="/assets/journal/mmr_icon.png" alt="MMR" className="w-5" />
            <span className={entry.mmrChange >= 0 ? "text-green-400" : "text-red-400"}>
              {entry.mmrChange}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTowerEntries = () => (
    <div className="absolute inset-x-0 top-40 bottom-10 px-28 overflow-y-auto text-sm space-y-1">
      {towerJournalEntries.map((entry, idx) => (
        <div key={idx} className="grid grid-cols-2 items-center py-1">
          <span className="truncate">
            {entry.floorName || `Floor ${entry.level}`}
          </span>
          <img
            src={`/assets/journal/${entry.result === "win" ? "wins_icon.png" : "losses_icon.png"}`}
            alt={entry.result}
            className="w-6 mx-auto"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative w-screen h-screen font-[Cinzel] text-white overflow-hidden">
      <img
        src="/assets/journal/journal_background.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <img
        src="/assets/journal/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <img
        src="/assets/journal/journal_sign.png"
        alt="Journal"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] drop-shadow-md"
      />
      <div className="absolute bottom-4 left-1 flex gap-1">
        <img
          src="/assets/journal/tavern_journal_button.png"
          alt="Tavern"
          className="w-32 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setShowTavern(true)}
        />
        <img
          src="/assets/journal/arena_journal_button.png"
          alt="Arena"
          className="w-32 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setShowArena(true)}
        />
        <img
          src="/assets/journal/tower_journal_button.png"
          alt="Tower"
          className="w-32 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setShowTower(true)}
        />
      </div>

      {showTavern && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowTavern(false)}
        >
          <div className="relative w-[660px] sm:w-[540px]" onClick={(e) => e.stopPropagation()}>
            <img
              src="/assets/journal/tavern_journal_window.png"
              alt="Tavern Journal"
              className="w-full h-auto"
            />
            <img
              src="/assets/journal/exit_button.png"
              alt="Close"
              className="absolute top-6 right-6 w-6 cursor-pointer hover:scale-105 transition-transform z-10"
              onClick={() => setShowTavern(false)}
            />
            {renderTavernEntries()}
          </div>
        </div>
      )}

      {showArena && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowArena(false)}
        >
          <div className="relative w-[660px] sm:w-[540px]" onClick={(e) => e.stopPropagation()}>
            <img
              src="/assets/journal/arena_journal_window.png"
              alt="Arena Journal"
              className="w-full h-auto"
            />
            <img
              src="/assets/journal/exit_button.png"
              alt="Close"
              className="absolute top-6 right-6 w-6 cursor-pointer hover:scale-105 transition-transform z-10"
              onClick={() => setShowArena(false)}
            />
            {renderArenaEntries()}
          </div>
        </div>
      )}

      {showTower && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowTower(false)}
        >
          <div className="relative w-[660px] sm:w-[540px]" onClick={(e) => e.stopPropagation()}>
            <img
              src="/assets/journal/tower_journal_window.png"
              alt="Tower Journal"
              className="w-full h-auto"
            />
            <img
              src="/assets/journal/exit_button.png"
              alt="Close"
              className="absolute top-6 right-6 w-6 cursor-pointer hover:scale-105 transition-transform z-10"
              onClick={() => setShowTower(false)}
            />
            {renderTowerEntries()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;