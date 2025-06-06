import React, { useEffect, useState, useCallback } from "react";
import {
  getArenaProfile,
  getArenaOpponents,
  refreshArenaOpponents,
  challengeArenaOpponent,
} from "../services/playerService";

function Arena({ character, refreshCharacter }) {
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [opponents, setOpponents] = useState([]);
  const [refreshRemaining, setRefreshRemaining] = useState(3);

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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Arena;