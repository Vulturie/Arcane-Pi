import React, { useEffect, useState } from "react";
import { getQuestStatus, cancelQuest } from "../services/playerService";

const QUESTS = [
  { id: 1, name: "Chase a chicken", duration: 10, xp: 5, gold: 10, energyCost: 10 },
  { id: 2, name: "Clear the rats from the basement", duration: 20, xp: 10, gold: 20, energyCost: 20 },
  { id: 3, name: "Guard the town gate", duration: 30, xp: 15, gold: 30, energyCost: 30 },
];

function Tavern({ player, refreshPlayer }) {
  const [activeQuest, setActiveQuest] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQuestStatus, setLoadingQuestStatus] = useState(true);

  const startQuest = async (quest) => {
    if (player.energy < quest.energyCost) {
      alert(`Not enough energy! You need ${quest.energyCost}, but have ${player.energy}.`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/player/${player.username}/quest/start`, {
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
          startedAt,
        });
        setTimeLeft(quest.duration); // start countdown immediately
        refreshPlayer(); // still update backend state just in case
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
          await cancelQuest(player.username);
          setActiveQuest(null);
          setTimeLeft(0);
          refreshPlayer();
        } catch (err) {
          console.error("Failed to cancel quest:", err);
          alert("Server error cancelling quest.");
        }
      };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await getQuestStatus(player.username);
        if (result.completed) {
          setActiveQuest(null);
          setTimeLeft(0);
          refreshPlayer();
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
  }, [player.username, refreshPlayer]);

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
          <p>Your energy: {player.energy}</p>
          <ul>
            {QUESTS.map((quest) => (
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
