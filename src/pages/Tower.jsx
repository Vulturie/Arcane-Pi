import React, { useEffect, useState, useCallback } from "react";
import {
  getTowerStatus,
  attemptTowerLevel,
  getTowerLeaderboard,
} from "../services/playerService";
import { getRarityLabel } from "../rarity";

function Tower({ character, refreshCharacter }) {
  const [status, setStatus] = useState(null);
  const [combat, setCombat] = useState(null);
  const [error, setError] = useState("");
  const [showBoard, setShowBoard] = useState(false);
  const [boardData, setBoardData] = useState({ results: [], total: 0, myRank: null, lastUpdated: null });
  const [page, setPage] = useState(1);

  const loadStatus = useCallback(async () => {
    if (!character || character.level < 10) return;
    try {
      const data = await getTowerStatus(character._id);
      setStatus(data);
    } catch (err) {
      console.error("Failed to load tower status", err);
    }
  }, [character]);

  const loadLeaderboard = useCallback(async (p = page) => {
    if (!character) return;
    try {
      const data = await getTowerLeaderboard(p, 10, character._id);
      setBoardData(data);
      setPage(p);
    } catch (err) {
      console.error("Failed to load leaderboard", err);
    }
  }, [character, page]);

  useEffect(() => {
    if (character.level >= 10) {
      loadStatus();
    }
  }, [character, loadStatus]);

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

  if (character.level < 10) {
    return (
      <div>
        <h2>The Tower</h2>
        <p>Unlocks at level 10</p>
      </div>
    );
  }

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
      <button onClick={() => { setShowBoard(true); loadLeaderboard(1); }}>View Leaderboard</button>
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
      {showBoard && (
        <div className="modal" onClick={() => setShowBoard(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Tower Leaderboard</h3>
            {boardData.lastUpdated && (
              <p>Last updated: {new Date(boardData.lastUpdated).toLocaleString()}</p>
            )}
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Level</th>
                  <th>Tower</th>
                </tr>
              </thead>
              <tbody>
                {boardData.results.map((entry, idx) => {
                  const rank = (page - 1) * 10 + idx + 1;
                  const highlight = entry._id === character._id;
                  return (
                    <tr key={entry._id} className={highlight ? "leaderboard-highlight" : ""}>
                      <td>{rank}</td>
                      <td>{entry.name}</td>
                      <td>{entry.class}</td>
                      <td>{entry.level}</td>
                      <td>{entry.towerProgress}</td>
                    </tr>
                  );
                })}
                {boardData.myRank &&
                  boardData.myRank > page * 10 && (
                    <tr className="leaderboard-highlight">
                      <td>{boardData.myRank}</td>
                      <td>{character.name}</td>
                      <td>{character.class}</td>
                      <td>{character.level}</td>
                      <td>{character.towerProgress}</td>
                    </tr>
                  )}
              </tbody>
            </table>
            <div>
              <button onClick={() => loadLeaderboard(page - 1)} disabled={page === 1}>Prev</button>
              <span> Page {page} </span>
              <button
                onClick={() => loadLeaderboard(page + 1)}
                disabled={page * 10 >= boardData.total}
              >
                Next
              </button>
            </div>
            <button onClick={() => setShowBoard(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tower;