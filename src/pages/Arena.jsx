import React, { useEffect, useState, useCallback } from "react";
import {
  getArenaProfile,
  getArenaOpponents,
  refreshArenaOpponents,
  challengeArenaOpponent,
  getArenaLeaderboard,
} from "../services/playerService";

function Arena({ character, refreshCharacter }) {
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [opponents, setOpponents] = useState([]);
  const [refreshRemaining, setRefreshRemaining] = useState(3);
  const [showBoard, setShowBoard] = useState(false);
  const [boardData, setBoardData] = useState({ results: [], total: 0, myRank: null, lastUpdated: null });
  const [page, setPage] = useState(1);

  const loadProfile = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getArenaProfile(character._id);
      setProfile(data);
      if (typeof data.refreshesRemaining === "number") {
        setRefreshRemaining(data.refreshesRemaining);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [character]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loadOpponents = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getArenaOpponents(character._id);
      setOpponents(data);
    } catch (err) {
      setError(err.message);
    }
  }, [character]);

  useEffect(() => {
    loadOpponents();
  }, [loadOpponents]);

  const handleChallenge = async (oppId) => {
    try {
      const data = await challengeArenaOpponent(character._id, oppId);
      setResult(data);
      await refreshCharacter();
      loadProfile();
      loadOpponents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRefreshOpponents = async () => {
    try {
      const data = await refreshArenaOpponents(character._id);
      setOpponents(data.opponents);
      if (typeof data.refreshesRemaining === "number") {
        setRefreshRemaining(data.refreshesRemaining);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadLeaderboard = useCallback(async (p = page) => {
    if (!character) return;
    try {
      const data = await getArenaLeaderboard(p, 10, character._id);
      setBoardData(data);
      setPage(p);
    } catch (err) {
      console.error("Failed to load leaderboard", err);
    }
  }, [character, page]);

  return (
    <div>
      <h2>Arena</h2>
      {profile ? (
        <>
          <p>MMR: {profile.mmr}</p>
          <p>
            Record: {profile.wins}W / {profile.losses}L
          </p>
          <p>Combat Score: {profile.combatScore}</p>
          <p>Fights Remaining: {profile.fightsRemaining}</p>
          <p>Opponent Refreshes Left: {refreshRemaining}</p>
          <button
            onClick={handleRefreshOpponents}
            disabled={refreshRemaining <= 0}
          >
            Refresh Opponents
          </button>
          <button onClick={() => { setShowBoard(true); loadLeaderboard(1); }}>View Leaderboard</button>
          {profile.fightsRemaining === 0 && (
            <p style={{ color: "red" }}>
              You’ve reached your daily Arena battle limit. Come back tomorrow!
            </p>
          )}
          {opponents.length > 0 && !result && (
            <ul>
              {opponents.map((o) => (
                <li key={o.id}>
                  {o.name} - lvl {o.level} {o.class} | Score: {o.combatScore} |
                  MMR: {o.mmr}
                  <button
                    onClick={() => handleChallenge(o.id)}
                    disabled={profile.fightsRemaining === 0}
                  >
                    Challenge
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
      {result && (
        <div className="modal" onClick={() => setResult(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{result.result === "win" ? "Victory" : "Defeat"}</h3>
            <p>Your MMR: {result.player.mmr}</p>
            <p>
              Your Score: {result.player.combatScore} vs {result.opponent.name}
              's Score: {result.opponent.combatScore}
            </p>
            <ul>
              {result.log.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <button onClick={() => setResult(null)}>Close</button>
          </div>
        </div>
      )}
      {showBoard && (
        <div className="modal" onClick={() => setShowBoard(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Arena Leaderboard</h3>
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
                  <th>MMR</th>
                  <th>W/L</th>
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
                      <td>{entry.mmr}</td>
                      <td>{entry.arenaWins || 0} / {entry.arenaLosses || 0}</td>
                    </tr>
                  );
                })}
                {boardData.myRank && boardData.myRank > page * 10 && (
                  <tr className="leaderboard-highlight">
                    <td>{boardData.myRank}</td>
                    <td>{character.name}</td>
                    <td>{character.class}</td>
                    <td>{character.level}</td>
                    <td>{profile ? profile.mmr : ""}</td>
                    <td>{profile ? `${profile.wins}/${profile.losses}` : ""}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div>
              <button onClick={() => loadLeaderboard(page - 1)} disabled={page === 1}>Prev</button>
              <span> Page {page} </span>
              <button onClick={() => loadLeaderboard(page + 1)} disabled={page * 10 >= boardData.total}>Next</button>
            </div>
            <button onClick={() => setShowBoard(false)}>Close</button>
          </div>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Arena;