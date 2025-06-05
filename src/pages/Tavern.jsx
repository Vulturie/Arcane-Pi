import React, { useEffect, useState } from "react";
import { getQuestStatus, cancelQuest } from "../services/playerService";

function Tavern({ character, refreshCharacter }) {
  const [activeQuest, setActiveQuest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQuestStatus, setLoadingQuestStatus] = useState(true);
  const [combatResult, setCombatResult] = useState(null);

  const startQuest = async (quest) => {
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
        body: JSON.stringify(quest),
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
          startedAt,
        });
        setTimeLeft(quest.duration); // start countdown immediately
        refreshCharacter();
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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await getQuestStatus(character._id);
        if (result.completed) {
          setActiveQuest(null);
          setTimeLeft(0);
          refreshCharacter();
          if (result.combat) setCombatResult({ ...result.combat, loot: result.loot });
        } else if (result.quest) {
          setActiveQuest(result.quest);
          setTimeLeft(result.timeLeft);
        } else {
          setActiveQuest(null);
          setTimeLeft(0);
        }
        setLoadingQuestStatus(false); // ✅ finished checking
      } catch (err) {
        console.error("Quest status check failed", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [character._id, refreshCharacter]);

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
      {combatResult && (
        <div className="modal" onClick={() => setCombatResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {combatResult.result === "win" ? "Victory!" : "Defeat"}
            </h3>
            <p>Player HP: {combatResult.playerHP}</p>
            <p>Enemy HP: {combatResult.enemyHP}</p>
            <h4>Turn Log</h4>
            <ul>
              {combatResult.log.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
            {combatResult.loot && (
              <p>You obtained: {combatResult.loot.name}</p>
            )}
            <button onClick={() => setCombatResult(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tavern;
