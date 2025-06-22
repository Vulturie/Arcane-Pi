import React, { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import {
  getQuestStatus,
  cancelQuest,
  acknowledgeQuestResult,
  skipQuest,
  buyEnergy,
  getPlayer,
} from "../services/playerService";
import NotificationModal from "../components/NotificationModal";
import ConfirmationModal from "../components/ConfirmationModal";

function Tavern({ character, refreshCharacter, spendEnergy }) {
  const navigate = useNavigate();

  const [activeQuest, setActiveQuest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showStandard, setShowStandard] = useState(false);
  const [showRisky, setShowRisky] = useState(false);
  const [questResult, setQuestResult] = useState(null);
  const [isFrameOpen, setIsFrameOpen] = useState(false);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [pie, setPie] = useState(0);
  const [skipping, setSkipping] = useState(false);
  const [buyingEnergyState, setBuyingEnergyState] = useState(false);
  const [showEnergyFull, setShowEnergyFull] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const startQuest = async (quest, force = false) => {
    if (character.energy < quest.energyCost) {
      setNotificationMessage(
        `Not enough energy! You need ${quest.energyCost}, but have ${character.energy}.`,
      );
      setShowNotification(true);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/characters/${character._id}/quest/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...quest, force }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        const startedAt = new Date(); // local time of quest start
        setActiveQuest({
          id: quest.id,
          name: quest.name,
          duration: quest.duration,
          xp: quest.xp,
          gold: quest.gold,
          isCombat: quest.isCombat,
          path: quest.path,
          startedAt,
        });
        setTimeLeft(quest.duration); // start countdown immediately
        if (spendEnergy) spendEnergy(quest.energyCost);
        refreshCharacter();
      } else if (data.inventoryFull && !force) {
        setConfirmation({
          message: "Inventory is full. Start quest anyway?",
          onConfirm: () => startQuest(quest, true),
        });
      } else {
        setNotificationMessage(`❌ ${data.error}`);
        setShowNotification(true);
      }
    } catch (err) {
      console.error("Failed to start quest:", err);
      setNotificationMessage("Server error starting quest.");
      setShowNotification(true);
    }
  };

  const handleCancelQuest = () => {
    setConfirmation({
      message: "Are you sure you want to cancel the quest?",
      onConfirm: async () => {
        try {
          await cancelQuest(character._id);
          setActiveQuest(null);
          setTimeLeft(0);
          refreshCharacter();
        } catch (err) {
          console.error("Failed to cancel quest:", err);
          setNotificationMessage("Server error cancelling quest.");
          setShowNotification(true);
        }
      },
    });
  };

  const handleSkipQuest = async () => {
    if (skipping) return;
    setSkipping(true);
    try {
      const data = await skipQuest(character._id);
      setQuestResult(data.questResult);
      setIsShowingResult(true);
      setActiveQuest(null);
      setTimeLeft(0);
      setPie(data.pie);
      refreshCharacter();
    } catch (err) {
      setNotificationMessage(err.message);
      setShowNotification(true);
    }
    setSkipping(false);
  };

  const handleBuyEnergy = async () => {
    if (buyingEnergyState) return;
    if (character.energy >= 100) {
      setShowEnergyFull(true);
      return;
    }
    setBuyingEnergyState(true);
    try {
      const data = await buyEnergy(character._id);
      setPie(data.pie);
      refreshCharacter();
    } catch (err) {
      if (err.message.includes("Energy already full")) {
        setShowEnergyFull(true);
      } else {
        setNotificationMessage(err.message);
        setShowNotification(true);
      }
    }
    setBuyingEnergyState(false);
  };

  const checkQuestStatus = useCallback(async () => {
    try {
      const result = await getQuestStatus(character._id);
      if (result.questResult) {
        setQuestResult(result.questResult);
        setIsShowingResult(true);
        setActiveQuest(null);
        setTimeLeft(0);
        refreshCharacter();
      } else if (result.completed) {
        const info = activeQuest;
        setActiveQuest(null);
        setTimeLeft(0);
        refreshCharacter();
        if (info) {
          const res = {
            questName: info.name,
            questType: info.path,
            outcome: "success",
            xp: info.xp,
            gold: info.gold,
            loot: result.loot || null,
            log: result.combat ? result.combat.log : null,
          };
          setQuestResult(res);
          setIsShowingResult(true);
        }
      } else if (result.quest) {
        setActiveQuest(result.quest);
        setTimeLeft(result.timeLeft);
      } else {
        setActiveQuest(null);
        setTimeLeft(0);
      }
    } catch (err) {
      console.error("Quest status check failed", err);
    }
  }, [character._id, activeQuest, refreshCharacter]);

  useEffect(() => {
    checkQuestStatus();
    const interval = setInterval(checkQuestStatus, 3000);
    return () => clearInterval(interval);
  }, [character._id, checkQuestStatus]);

// Keep character state (energy, gold, etc.) up-to-date while in the Tavern
  useEffect(() => {
    refreshCharacter();
    const interval = setInterval(() => {
      refreshCharacter();
    }, 5000); // match GameHub refresh rate
    return () => clearInterval(interval);
  }, [refreshCharacter]);

  useEffect(() => {
    const loadPie = async () => {
      try {
        const data = await getPlayer(character.owner);
        setPie(data.pie);
      } catch (err) {
        console.error("Failed to load pie", err);
      }
    };
    loadPie();
    const pInterval = setInterval(loadPie, 5000);
    return () => clearInterval(pInterval);
  }, [character.owner]);

  useEffect(() => {
    if (!activeQuest) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuest]);

  const renderQuestInfo = (quest, risky) => (
    <div key={quest.id} className="flex items-center justify-between px-8">
      <div className="flex flex-col text-xs text-white drop-shadow-sm">
        <span className="text-outline text-xs">
          {quest.name}
          {quest.rare ? " (Rare)" : ""}
        </span>
        <div className="flex gap-2 mt-1">
          <div className="flex items-center gap-1">
            <img src="/assets/tavern/xp_icon.png" alt="XP" className="w-4" />
            <span>{quest.xp}</span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="/assets/tavern/time_icon.png"
              alt="Time"
              className="w-4"
            />
            <span>{quest.duration}s</span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="/assets/tavern/gold_icon.png"
              alt="Gold"
              className="w-4"
            />
            <span>{quest.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <img
              src="/assets/tavern/energy_icon.png"
              alt="Energy"
              className="w-4"
            />
            <span className="text-red-500">-{quest.energyCost}</span>
          </div>{" "}
          {quest.lootChance > 0 && (
            <img
              src="/assets/tavern/loot_icon.png"
              alt="Loot"
              className="w-4"
            />
          )}
        </div>
      </div>
      <img
        onClick={() => startQuest(quest)}
        src={`/assets/tavern/${risky ? "start_risky_button.png" : "start_standard_button.png"}`}
        alt="Start"
        className="w-7 cursor-pointer transition-all hover:scale-105"
      />
    </div>
  );

  const renderQuestWindow = (quests, risky, onClose) => (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-30"
      onClick={isShowingResult ? () => {} : onClose}
    >
      <div
        className="relative max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`/assets/tavern/${risky ? "risky_quests_window.png" : "standard_quests_window.png"}`}
          alt="Window"
          className="w-full h-auto"
        />
        <div className="absolute inset-0 flex flex-col gap-4 pt-24 pb-4 px-12 overflow-y-auto">
          {isShowingResult && questResult ? (
            <div className="flex flex-col gap-2 text-white text-sm items-center mt-20">
              {questResult.log && (
                <div className="max-h-40 overflow-y-auto flex flex-col gap-1 w-full">
                  {questResult.log.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
              <div className="text-center text-outline text-lg">
                {questResult.outcome === "success" ? "Victory" : "Defeat"}
              </div>
              <div className="text-center text-outline">
                XP: {questResult.xp}
              </div>
              <div className="text-center text-outline">
                Gold: {questResult.gold}
              </div>
              {questResult.loot && (
                <div className="text-center text-outline">
                  Loot: {questResult.loot.name}
                </div>
              )}
              <img
                src="/assets/tavern/continue_button.png"
                alt="Continue"
                className="w-28 mt-4 cursor-pointer hover:scale-105 transition-all"
                onClick={async () => {
                  try {
                    await acknowledgeQuestResult(character._id);
                  } catch (err) {
                    console.error(err);
                  }
                  setQuestResult(null);
                  setIsShowingResult(false);
                  refreshCharacter();
                }}
              />
            </div>
          ) : activeQuest ? (
            <div className="flex flex-col items-center gap-2 mt-20 text-white">
              <span className="text-outline text-lg text-center">
                {activeQuest.name}
              </span>
              <span>⏳ {timeLeft}s</span>
              <span>You can leave and return later to complete it.</span>
              <img
                src="/assets/tavern/cancel_quest_button.png"
                alt="Cancel Quest"
                className="w-40 mt-4 cursor-pointer hover:scale-105 transition-all"
                onClick={handleCancelQuest}
              />
              <img
                src="/assets/tavern/skip_button.png"
                alt="Skip Quest"
                className="w-32 mt-2 cursor-pointer hover:scale-105 transition-all"
                onClick={handleSkipQuest}
                style={{ opacity: skipping ? 0.5 : 1 }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-20">
              {quests.map((q) => renderQuestInfo(q, risky))}
              <img
                src="/assets/tavern/more_energy_button.png"
                alt="More Energy"
                className="w-32 mt-2 self-center cursor-pointer hover:scale-105 transition-all"
                onClick={handleBuyEnergy}
                style={{ opacity: buyingEnergyState ? 0.5 : 1 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/tavern/tavern_background.png)" }}
    >
      <img
        src="/assets/tavern/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-[4.5rem] cursor-pointer hover:scale-105 transition-all"
        onClick={() => navigate("/")}
      />
      <div className="absolute top-4 right-4 flex items-center gap-2 drop-shadow-md">
        <img
          src="/assets/tavern/energy_icon.png"
          alt="Energy"
          className="w-10"
        />
        <span className="text-outline text-lg">{`${character.energy}/100`}</span>
        <img src="/assets/pie_shop/pie_icon.png" alt="Pie" className="w-8 ml-2" />
        <span className="text-outline text-lg">{pie}</span>
      </div>

      <img
        src="/assets/tavern/tavernkeeper.png"
        alt="Tavernkeeper"
        className="absolute bottom-40 right-5 w-44 sm:w-48"
      />

      <div
        className={`fixed bottom-0 left-0 w-full h-[320px] bg-no-repeat bg-contain bg-center flex items-start justify-center gap-8 pt-[90px] z-40 transition-transform duration-300 ${isFrameOpen ? "translate-y-0" : "translate-y-[160px]"}`}
        style={{ backgroundImage: "url(/assets/tavern/bottom_frame.png)" }}
        onClick={() => setIsFrameOpen(!isFrameOpen)}
      >
        <img
          src="/assets/tavern/standard_quest_button.png"
          alt="Standard"
          className="w-16 cursor-pointer transition-all hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            setShowStandard(true);
            setQuestResult(null);
            setIsShowingResult(false);
          }}
        />
        <img
          src="/assets/tavern/risky_quest_button.png"
          alt="Risky"
          className="w-16 cursor-pointer transition-all hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            setShowRisky(true);
            setQuestResult(null);
            setIsShowingResult(false);
          }}
        />
      </div>

      {showStandard &&
        renderQuestWindow(character.safeQuestPool, false, () =>
          setShowStandard(false),
        )}
      {showRisky &&
        renderQuestWindow(character.riskyQuestPool, true, () =>
          setShowRisky(false),
        )}
      {showEnergyFull && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowEnergyFull(false)}
        >
          <div
            className="bg-gray-800 p-4 rounded text-center border-4 border-yellow-600"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4">You are already at full energy!</p>
            <button
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              onClick={() => setShowEnergyFull(false)}
            >
              OK
            </button>
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
        onConfirm={async () => {
          if (confirmation?.onConfirm) {
            await confirmation.onConfirm();
          }
          setConfirmation(null);
        }}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
}

export default Tavern;
