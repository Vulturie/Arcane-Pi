import React, { useEffect, useState } from "react";
import { getTowerStatus, attemptTowerLevel } from "../services/playerService";
import { getRarityLabel } from "../rarity";

function Tower({ character, refreshCharacter }) {
  const [status, setStatus] = useState(null);
  const [combat, setCombat] = useState(null);
  const [error, setError] = useState("");

  const loadStatus = async () => {
    if (!character) return;
    try {
      const data = await getTowerStatus(character._id);
      setStatus(data);
    } catch (err) {
      console.error("Failed to load tower status", err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [character]);

  const handleAttempt = async () => {
    try {
      const data = await attemptTowerLevel(character._id);
      if (data.result === "win") {
        refreshCharacter();
      }
      setCombat(data);
      loadStatus();
    } catch (err) {
      if (err.message.includes("Inventory full")) setError("Inventory full");
      else console.error(err);
    }
  };

  if (!status) return <p>Loading...</p>;

  return (
    <div>
      <h2>The Tower</h2>
      <p>Highest Level Cleared: {status.progress}</p>
      <h3>Next Challenge - Level {status.nextLevel}</h3>
      <p>Enemy: {status.enemy.name}</p>
      <p>Reward: <span className={`rarity-${status.reward.rarity}`}>{status.reward.name} ({getRarityLabel(status.reward.rarity)})</span></p>
      {error && <p style={{color:"red"}}>{error}</p>}
      <button onClick={handleAttempt}>Start Level</button>
      {combat && (
        <div className="modal" onClick={() => setCombat(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{combat.result === "win" ? "Victory" : "Defeat"}</h3>
            <ul>
              {combat.combat.log.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
            {combat.result === "win" && (
              <p>You received: <span className={`rarity-${combat.reward.rarity}`}>{combat.reward.name} ({getRarityLabel(combat.reward.rarity)})</span></p>
            )}
            {combat.result === "loss" && (
              <>
                <button onClick={() => {setCombat(null); handleAttempt();}}>Retry</button>
                <button onClick={() => {setCombat(null);}}>Quit</button>
              </>
            )}
            {combat.result === "win" && (
              <button onClick={() => setCombat(null)}>Continue</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Tower;