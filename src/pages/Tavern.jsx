import React, { useEffect, useState } from "react";
import { getQuestStatus, cancelQuest } from "../services/playerService";

// Quests are organised into three tiers for both safe and risky paths.
// Each tier contains ten quests with one marked as rare for better loot.
const SAFE_QUEST_TIERS = [
  [
    { id: 1, name: "Chase a Chicken", duration: 10, xp: 5, gold: 10, energyCost: 10, isCombat: false },
    { id: 2, name: "Gather Herbs", duration: 15, xp: 8, gold: 12, energyCost: 12, isCombat: false },
    { id: 3, name: "Clear the Rats", duration: 20, xp: 10, gold: 20, energyCost: 20, isCombat: false },
    { id: 4, name: "Guard the Town Gate", duration: 30, xp: 15, gold: 30, energyCost: 30, isCombat: false },
    { id: 5, name: "Tend the Farm", duration: 25, xp: 12, gold: 18, energyCost: 20, isCombat: false },
    { id: 6, name: "Help the Blacksmith", duration: 20, xp: 10, gold: 22, energyCost: 18, isCombat: false },
    { id: 7, name: "Collect Apples", duration: 15, xp: 7, gold: 14, energyCost: 12, isCombat: false },
    { id: 8, name: "Escort the Merchant", duration: 35, xp: 18, gold: 28, energyCost: 30, isCombat: false },
    { id: 9, name: "Sweep the Stables", duration: 18, xp: 9, gold: 16, energyCost: 15, isCombat: false },
    { id: 10, name: "Find the Lost Ring", duration: 40, xp: 25, gold: 40, energyCost: 35, isCombat: false, rare: true },
  ],
  [
    { id: 11, name: "Deliver Trade Goods", duration: 40, xp: 22, gold: 40, energyCost: 25, isCombat: false },
    { id: 12, name: "Patrol the Woods", duration: 45, xp: 26, gold: 44, energyCost: 30, isCombat: false },
    { id: 13, name: "Mend the Bridge", duration: 50, xp: 30, gold: 48, energyCost: 35, isCombat: false },
    { id: 14, name: "Help with Harvest", duration: 55, xp: 34, gold: 52, energyCost: 36, isCombat: false },
    { id: 15, name: "Assist the Healer", duration: 45, xp: 28, gold: 46, energyCost: 32, isCombat: false },
    { id: 16, name: "Repair the Watchtower", duration: 60, xp: 36, gold: 55, energyCost: 40, isCombat: false },
    { id: 17, name: "Gather Rare Flowers", duration: 50, xp: 32, gold: 50, energyCost: 34, isCombat: false },
    { id: 18, name: "Escort the Caravan", duration: 65, xp: 40, gold: 60, energyCost: 45, isCombat: false },
    { id: 19, name: "Herd Wayward Cattle", duration: 55, xp: 34, gold: 54, energyCost: 38, isCombat: false },
    { id: 20, name: "Rescue the Stolen Child", duration: 70, xp: 50, gold: 80, energyCost: 50, isCombat: false, rare: true },
  ],
  [
    { id: 21, name: "Chart the Wilds", duration: 70, xp: 45, gold: 70, energyCost: 45, isCombat: false },
    { id: 22, name: "Inspect Ancient Ruins", duration: 80, xp: 55, gold: 80, energyCost: 55, isCombat: false },
    { id: 23, name: "Broker Peace Talks", duration: 90, xp: 60, gold: 85, energyCost: 60, isCombat: false },
    { id: 24, name: "Train the Militia", duration: 75, xp: 48, gold: 72, energyCost: 50, isCombat: false },
    { id: 25, name: "Oversee Construction", duration: 85, xp: 58, gold: 82, energyCost: 55, isCombat: false },
    { id: 26, name: "Collect Taxes", duration: 80, xp: 52, gold: 78, energyCost: 50, isCombat: false },
    { id: 27, name: "Deliver Royal Decree", duration: 90, xp: 60, gold: 86, energyCost: 60, isCombat: false },
    { id: 28, name: "Organise Festival", duration: 95, xp: 65, gold: 90, energyCost: 62, isCombat: false },
    { id: 29, name: "Map the Catacombs", duration: 100, xp: 70, gold: 95, energyCost: 65, isCombat: false },
    { id: 30, name: "Retrieve the Ancient Tome", duration: 110, xp: 90, gold: 120, energyCost: 70, isCombat: false, rare: true },
  ],
];

const RISKY_QUEST_TIERS = [
  [
    { id: 101, name: "Ambush the Bandits", duration: 20, xp: 10, gold: 15, energyCost: 15, isCombat: true },
    { id: 102, name: "Enter the Spider Cave", duration: 30, xp: 15, gold: 25, energyCost: 20, isCombat: true },
    { id: 103, name: "Hunt the Forest Beast", duration: 40, xp: 20, gold: 30, energyCost: 25, isCombat: true },
    { id: 104, name: "Track the Wolf Pack", duration: 35, xp: 18, gold: 28, energyCost: 22, isCombat: true },
    { id: 105, name: "Battle the Grave Robbers", duration: 45, xp: 24, gold: 35, energyCost: 28, isCombat: true },
    { id: 106, name: "Clear the Haunted Mine", duration: 40, xp: 22, gold: 32, energyCost: 26, isCombat: true },
    { id: 107, name: "Protect the Wagon", duration: 30, xp: 16, gold: 26, energyCost: 20, isCombat: true },
    { id: 108, name: "Eliminate the Poachers", duration: 38, xp: 20, gold: 30, energyCost: 24, isCombat: true },
    { id: 109, name: "Stop the Smugglers", duration: 42, xp: 22, gold: 32, energyCost: 26, isCombat: true },
    { id: 110, name: "Defeat the Rogue Mage", duration: 55, xp: 35, gold: 50, energyCost: 35, isCombat: true, rare: true },
  ],
  [
    { id: 111, name: "Purge the Necromancers", duration: 60, xp: 40, gold: 55, energyCost: 38, isCombat: true },
    { id: 112, name: "Destroy Cult Relics", duration: 65, xp: 42, gold: 58, energyCost: 40, isCombat: true },
    { id: 113, name: "Raid the Orc Camp", duration: 70, xp: 45, gold: 60, energyCost: 42, isCombat: true },
    { id: 114, name: "Slay the Swamp Hydra", duration: 80, xp: 55, gold: 75, energyCost: 50, isCombat: true },
    { id: 115, name: "Intercept Dark Messengers", duration: 72, xp: 48, gold: 65, energyCost: 46, isCombat: true },
    { id: 116, name: "Storm the Pirate Cove", duration: 78, xp: 52, gold: 70, energyCost: 48, isCombat: true },
    { id: 117, name: "Break the Siege", duration: 85, xp: 58, gold: 78, energyCost: 52, isCombat: true },
    { id: 118, name: "Capture the Outlaw", duration: 75, xp: 50, gold: 72, energyCost: 48, isCombat: true },
    { id: 119, name: "Cleanse the Ruined Shrine", duration: 82, xp: 54, gold: 76, energyCost: 50, isCombat: true },
    { id: 120, name: "Face the Cursed Knight", duration: 95, xp: 70, gold: 100, energyCost: 60, isCombat: true, rare: true },
  ],
  [
    { id: 121, name: "Assault the Demon Gate", duration: 100, xp: 80, gold: 110, energyCost: 65, isCombat: true },
    { id: 122, name: "Subdue the Rampaging Golem", duration: 110, xp: 85, gold: 120, energyCost: 70, isCombat: true },
    { id: 123, name: "Destroy the Lich", duration: 120, xp: 90, gold: 130, energyCost: 75, isCombat: true },
    { id: 124, name: "Cleanse the Forbidden Library", duration: 105, xp: 82, gold: 115, energyCost: 68, isCombat: true },
    { id: 125, name: "Halt the Elemental Uprising", duration: 115, xp: 88, gold: 125, energyCost: 72, isCombat: true },
    { id: 126, name: "Recover the Dragon Egg", duration: 125, xp: 94, gold: 135, energyCost: 78, isCombat: true },
    { id: 127, name: "Enter the Abyssal Rift", duration: 130, xp: 98, gold: 140, energyCost: 80, isCombat: true },
    { id: 128, name: "Quell the Undead Army", duration: 140, xp: 105, gold: 150, energyCost: 85, isCombat: true },
    { id: 129, name: "Challenge the Warlock", duration: 135, xp: 100, gold: 145, energyCost: 82, isCombat: true },
    { id: 130, name: "Seal the Demon Lord", duration: 150, xp: 130, gold: 200, energyCost: 90, isCombat: true, rare: true },
  ],
];

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
          {SAFE_QUEST_TIERS.map((tier, idx) => (
            <div key={`s${idx}`}>
              <h4>Tier {idx + 1}</h4>
              <ul>
                {tier.map((quest) => (
                  <li key={quest.id}>
                    <strong>{quest.name}</strong>{quest.rare && " (Rare)"} — {quest.duration}s, {quest.xp}XP, {quest.gold} Gold, ⚡ {quest.energyCost} Energy
                    <br />
                    <button onClick={() => startQuest(quest)}>Start Quest</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <h3>Risky Quests</h3>
          {RISKY_QUEST_TIERS.map((tier, idx) => (
            <div key={`r${idx}`}>
              <h4>Tier {idx + 1}</h4>
              <ul>
                {tier.map((quest) => (
                  <li key={quest.id}>
                    <strong>{quest.name}</strong>{quest.rare && " (Rare)"} — {quest.duration}s, {quest.xp} XP, {quest.gold} Gold, ⚡ {quest.energyCost} Energy
                    <br />
                    <button onClick={() => startQuest(quest)}>Start Quest</button>
                  </li>
                ))}
              </ul>
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
