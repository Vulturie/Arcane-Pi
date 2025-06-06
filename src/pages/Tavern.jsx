import React, { useEffect, useState, useCallback } from "react";
import { getQuestStatus, cancelQuest } from "../services/playerService";

function Tavern({ character, refreshCharacter, onQuestResult }) {
  const [activeQuest, setActiveQuest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQuestStatus, setLoadingQuestStatus] = useState(true);

  const startQuest = async (quest, force = false) => {
    if (character.energy < quest.energyCost) {
      alert(`Not enough energy! You need ${quest.energyCost}, but have ${character.energy}.`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/characters/${character._id}/quest/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...quest, force }),
      });

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
        refreshCharacter();
      } else if (data.inventoryFull && !force) {
        if (window.confirm("Inventory is full. Start quest anyway?")) {
          startQuest(quest, true);
        }
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error("Failed to start quest:", err);
      alert("Server error starting quest.");
    }
  };

  const handleCancelQuest = async () => {
    if (!window.confirm("Are you sure you want to cancel the quest?")) return;
    try {
      await cancelQuest(character._id);
      setActiveQuest(null);
      setTimeLeft(0);
      refreshCharacter();
    } catch (err) {
      console.error("Failed to cancel quest:", err);
      alert("Server error cancelling quest.");
    }
  };

  const checkQuestStatus = useCallback(async () => {
    try {
      const result = await getQuestStatus(character._id);
      if (result.questResult) {
        onQuestResult(result.questResult);
        setActiveQuest(null);
        setTimeLeft(0);
        refreshCharacter();
      } else if (result.completed) {
        const info = activeQuest;
        setActiveQuest(null);
        setTimeLeft(0);
        refreshCharacter();
        if (info) {
          onQuestResult({
            questName: info.name,
            questType: info.path,
            outcome: "success",
            xp: info.xp,
            gold: info.gold,
            loot: result.loot || null,
            log: result.combat ? result.combat.log : null,
          });
        }
      } else if (result.quest) {
        setActiveQuest(result.quest);
        setTimeLeft(result.timeLeft);
      } else {
        setActiveQuest(null);
        setTimeLeft(0);
      }
      setLoadingQuestStatus(false);
    } catch (err) {
      console.error("Quest status check failed", err);
    }
  }, [character._id, activeQuest, onQuestResult, refreshCharacter]);

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
    if (!activeQuest) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000); // every second

    return () => clearInterval(timer);
  }, [activeQuest]);

  return (
    <div>
      <h2>Welcome to the Tavern</h2>

      {loadingQuestStatus ? (
        <p>Checking for active quest...</p>
      ) : activeQuest ? (
        <div>
          <p><strong>Quest in progress:</strong> {activeQuest.name}</p>
          <p>⏳ Time left: {timeLeft}s</p>
          <p>You can leave and return later to complete it.</p>
          <button onClick={handleCancelQuest}>Cancel Quest</button>
        </div>
      ) : (
        <>
          <p>Your energy: {character.energy}</p>
          <h3>Standard Quests</h3>
          {character.safeQuestPool.map((quest, idx) => (
            <div key={`s${idx}`}>
              <h4>Tier {quest.tier}</h4>
              <p>
                <strong>{quest.name}</strong>{quest.rare && " (Rare)"} — {quest.duration}s, {quest.xp}XP, {quest.gold} Gold, ⚡ {quest.energyCost} Energy
              </p>
              <button onClick={() => startQuest(quest)}>Start Quest</button>
            </div>
          ))}
          <h3>Risky Quests</h3>
          {character.riskyQuestPool.map((quest, idx) => (
            <div key={`r${idx}`}>
              <h4>Tier {quest.tier}</h4>
              <p>
                <strong>{quest.name}</strong>{quest.rare && " (Rare)"} — {quest.duration}s, {quest.xp} XP, {quest.gold} Gold, ⚡ {quest.energyCost} Energy
              </p>
              <button onClick={() => startQuest(quest)}>Start Quest</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Tavern;
