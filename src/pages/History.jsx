import React, { useEffect, useState } from "react";
import { getHistory } from "../services/playerService";
import { getRarityLabel } from "../rarity";

function History({ character }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!character) return;
    const load = async () => {
      try {
        const data = await getHistory(character._id);
        setLogs(data.slice(-20).reverse());
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    load();
  }, [character]);

  return (
    <div>
      <h2>Quest History</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Quest</th>
            <th>Type</th>
            <th>Result</th>
            <th>XP</th>
            <th>Gold</th>
            <th>Loot</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((entry, idx) => (
            <tr key={idx}>
              <td>{new Date(entry.timestamp).toLocaleString()}</td>
              <td>{entry.questName}</td>
              <td>{entry.questType === "risky" ? "Risky" : "Safe"}</td>
              <td>{entry.result === "success" ? "Success" : "Failure"}</td>
              <td>{entry.xp}</td>
              <td>{entry.gold}</td>
              <td>
                {entry.loot ? (
                  <span className={`rarity-${entry.loot.rarity}`}>{entry.loot.name} ({getRarityLabel(entry.loot.rarity)})</span>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;