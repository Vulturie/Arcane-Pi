import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RARITY_MULTIPLIER } from "../rarity";
import {
  CLASS_BASE_STATS,
  getStatsForClass,
  getEquipment,
  setPlayerClass,
  setAccountClass,
  deleteCharacter,
} from "../services/playerService";
import "./Character.css";

function Character({ character, refreshCharacter, username, onDelete, onSwitch }) {
  const [chosenClass, setChosenClass] = useState("Warrior");
  const [equipped, setEquipped] = useState({});
  const navigate = useNavigate();

  const getBonus = (item, stat) => {
    if (!item || !item.statBonus) return 0;
    const mult = RARITY_MULTIPLIER[item.rarity] || 1;
    const value = (item.statBonus[stat] || 0) * mult;
    return Math.round(value * 10) / 10;
  };

    useEffect(() => {
      if (!character) return;
      const load = async () => {
        try {
          const data = await getEquipment(character._id);
          setEquipped(data);
        } catch (err) {
          console.error("Failed to load equipment", err);
        }
      };
      load();
    }, [character]);

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
    if (!window.confirm("Delete this character?")) return;
    try {
      await deleteCharacter(character._id);
      if (onDelete) await onDelete();
      navigate("/character-select");
    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    }
  };

  const handleSwitch = () => {
    if (onSwitch) onSwitch();
    navigate("/character-select");
  };

  const stats = getStatsForClass(character.class, character.level);
  if (stats && equipped) {
    Object.values(equipped).forEach((item) => {
      if (item && item.statBonus) {
        Object.keys(item.statBonus).forEach((k) => {
          stats[k] = (stats[k] || 0) + getBonus(item, k);
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
            <div className="character-actions">
              <button className="character-action-button" onClick={handleDelete}>Delete Character</button>
              <button className="character-action-button" onClick={handleSwitch}>Switch Character</button>
            </div>
    </div>
  );
}

export default Character;