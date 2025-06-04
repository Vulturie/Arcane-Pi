import React, { useEffect, useState } from "react";
import { getHistory } from "../services/playerService";

function History({ character }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!character) return;
    const load = async () => {
      try {
        const data = await getHistory(character._id);
        setLogs(data.reverse());
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    load();
  }, [character]);

  return (
    <div>
      <h2>Quest & Combat History</h2>
      <ul>
        {logs.map((entry, idx) => (
          <li key={idx}>
            [{new Date(entry.timestamp).toLocaleString()}] {entry.questName} — {entry.result}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default History;