import React, { useState, useEffect } from "react";
import {
  CLASS_BASE_STATS,
  getStatsForClass,
  getEquipment,
  setPlayerClass,
  setAccountClass,
  deleteCharacter,
} from "../services/playerService";

function Character({ character, refreshCharacter, username }) {
  const [chosenClass, setChosenClass] = useState("Warrior");
  const [equipped, setEquipped] = useState({});

    useEffect(() => {
      if (!username) return;
      const load = async () => {
        try {
          const data = await getEquipment(username);
          setEquipped(data);
        } catch (err) {
          console.error("Failed to load equipment", err);
        }
      };
      load();
    }, [username]);

  const handleChoose = async () => {
    try {
      await setPlayerClass(character._id, chosenClass);
      if (username) {
        await setAccountClass(username, chosenClass);
      }
      await refreshCharacter();
    } catch (err) {
      console.error(err);
      alert("Failed to set class");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCharacter(character._id);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    }
  };

  const stats = getStatsForClass(character.class, character.level);
  if (stats && equipped) {
      Object.values(equipped).forEach((item) => {
        if (item && item.statBonus) {
          Object.entries(item.statBonus).forEach(([k, v]) => {
            stats[k] = (stats[k] || 0) + v;
          });
        }
      });
    }

  return (
    <div>
      <h2>Character Info</h2>
      <p>Name: {character.name}</p>
            <p>Class: {character.class}</p>
            <p>Level: {character.level}</p>
            {character.class === "Novice" ? (
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
            <button onClick={handleDelete}>Delete Character</button>
    </div>
  );
}

export default Character;