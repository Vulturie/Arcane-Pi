import React from "react";
import { getRarityLabel } from "../rarity";

function QuestResultModal({ result, onClose }) {
  if (!result) return null;

  const { questName, questType, outcome, xp, gold, loot, message, log } = result;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{questName} - {questType === "risky" ? "Risky" : "Safe"}</h3>
        <h4>{outcome === "success" ? "Success" : "Failure"}</h4>
        {outcome === "success" ? (
          <>
            <p>XP Gained: {xp}</p>
            <p>Gold Gained: {gold}</p>
            {loot && (
              <p>
                Looted: <span className={`rarity-${loot.rarity}`}>{loot.name} ({getRarityLabel(loot.rarity)})</span>
              </p>
            )}
          </>
        ) : (
          <p>{message || "The quest failed."}</p>
        )}
        {log && log.length > 0 && (
          <>
            <h4>Combat Log</h4>
            <ul>
              {log.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </>
        )}
        <button onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}

export default QuestResultModal;
