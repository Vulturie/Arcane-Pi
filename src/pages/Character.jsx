import React, { useState } from "react";
import {
  CLASS_BASE_STATS,
  getStatsForClass,
  setPlayerClass,
  deletePlayer,
} from "../services/playerService";

function Character({ player, refreshPlayer }) {
  const [chosenClass, setChosenClass] = useState("Warrior");

  const handleChoose = async () => {
    try {
      await setPlayerClass(player.username, chosenClass);
      await refreshPlayer();
    } catch (err) {
      console.error(err);
      alert("Failed to set class");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlayer(player.username);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    }
  };

  const stats = getStatsForClass(player.class, player.level);

  return (
    <div>
      <h2>Character Info</h2>
      <p>Name: {player.username}</p>
      <p>Class: {player.class}</p>
      <p>Level: {player.level}</p>
      {player.class === "Novice" ? (
              <div>
                <h3>Select Class</h3>
                <select value={chosenClass} onChange={(e) => setChosenClass(e.target.value)}>
                  {Object.keys(CLASS_BASE_STATS).map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <button onClick={handleChoose}>Choose</button>
              </div>
            ) : (
              <div>
                <h3>Stats</h3>
                {stats && (
                  <ul>
                    <li>STR: {stats.STR}</li>
                    <li>AGI: {stats.AGI}</li>
                    <li>INT: {stats.INT}</li>
                    <li>VIT: {stats.VIT}</li>
                  </ul>
                )}
              </div>
            )}
            <button onClick={handleDelete}>Delete Profile</button>
    </div>
  );
}

export default Character;