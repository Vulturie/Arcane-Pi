import React, { useEffect, useState } from "react";
import { getQuestStatus, cancelQuest } from "../services/playerService";

// Standard quests that simply reward XP and gold
const SAFE_QUESTS = [
  { id: 1, name: "Chase a chicken", duration: 10, xp: 5, gold: 10, energyCost: 10, isCombat: false },
  { id: 2, name: "Clear the rats from the basement", duration: 20, xp: 10, gold: 20, energyCost: 20, isCombat: false },
  { id: 3, name: "Guard the town gate", duration: 30, xp: 15, gold: 30, energyCost: 30, isCombat: false },
];

// Risky quests which will later trigger combat when completed
const RISKY_QUESTS = [
  { id: 101, name: "Ambush the Bandits", duration: 20, xp: 10, gold: 15, energyCost: 15, isCombat: true },
  { id: 102, name: "Enter the Spider Cave", duration: 30, xp: 15, gold: 25, energyCost: 20, isCombat: true },
  { id: 103, name: "Hunt the Forest Beast", duration: 40, xp: 20, gold: 30, energyCost: 25, isCombat: true },
];

function Tavern({ character, refreshCharacter }) {
  const [activeQuest, setActiveQuest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQuestStatus, setLoadingQuestStatus] = useState(true);

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
            <ul>
              {SAFE_QUESTS.map((quest) => (
                <li key={quest.id}>
                  <strong>{quest.name}</strong> — {quest.duration}s, {quest.xp} XP, {quest.gold} Gold, ⚡ {quest.energyCost} Energy
                  <br />
                  <button onClick={() => startQuest(quest)}>Start Quest</button>
                </li>
              ))}
            </ul>
          <h3>Risky Quests</h3>
          <ul>
            {RISKY_QUESTS.map((quest) => (
              <li key={quest.id}>
                <strong>{quest.name}</strong> — {quest.duration}s, {quest.xp} XP, {quest.gold} Gold, ⚡ {quest.energyCost} Energy
                <br />
                <button onClick={() => startQuest(quest)}>Start Quest</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Tavern;
