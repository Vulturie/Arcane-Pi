import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatsForClass, deleteCharacter, getXpForNextLevel } from "../services/playerService";
import "./CharacterPage.css";

function getBackground() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20
    ? "/assets/character/character_day_background.png"
    : "/assets/character/character_night_background.png";
}

function CharacterPage({ character, onDelete, onSwitch }) {
  const navigate = useNavigate();
  const [background, setBackground] = useState(getBackground());

  useEffect(() => {
    const interval = setInterval(() => setBackground(getBackground()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!character) return null;

  const stats = getStatsForClass(character.class, character.level);
  const portrait = `/assets/character_creation/${character.class.toLowerCase()}_${character.gender}.png`;
  const classIcon = `/assets/character_creation/${character.class.toLowerCase()}_button.png`;
  const nextXp = getXpForNextLevel(character.level);
  const xpPercent = Math.min((character.xp / nextXp) * 100, 100);

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

  return (
    <div
      className="character-page"
      style={{ backgroundImage: `url(${background})` }}
    >
      <img
        src="/assets/character_creation/back_button.png"
        alt="Back"
        className="back-btn"
        onClick={() => navigate("/")}
      />
      <div className="frame">
        <div className="name">{character.name}</div>
        <div className="header-row">
          <div className="portrait-wrapper">
            <img src={portrait} alt="Character" className="portrait" />
            <img
              src="/assets/character/character_frame.png"
              alt="Frame"
              className="portrait-frame"
            />
          </div>
          <div className="class-info">
            <img src={classIcon} alt={character.class} className="class-icon" />
            <span className="class-name">{character.class}</span>
          </div>
        </div>
        <div className="info-icons">
          <div className="stat">
            <img src="/assets/game_hub/gold_icon.png" alt="Gold" />
            <span>{character.gold}</span>
          </div>
          <div className="stat">
            <img src="/assets/game_hub/pie_icon.png" alt="Pi" />
            <span>0</span>
          </div>
          <div className="stat">
            <img src="/assets/game_hub/level_icon.png" alt="Level" />
            <span>{character.level}</span>
          </div>
          <div className="stat">
            <img src="/assets/character/energy_icon.png" alt="Energy" />
            <span>{`${character.energy}/100`}</span>
          </div>
        </div>
        <div className="xpBar">
          <div className="xpFill" style={{ width: `${xpPercent}%` }} />
          <div className="xpText">{`${character.xp} / ${nextXp} XP`}</div>
          <img src="/assets/game_hub/xp_bar.png" alt="XP" className="xpImage" />
        </div>
        <div className="stats-table">
          <div className="stat-row stat-str">
            <span>STR</span>
            <span className="value">{stats.STR}</span>
          </div>
          <div className="stat-row stat-agi">
            <span>AGI</span>
            <span className="value">{stats.AGI}</span>
          </div>
          <div className="stat-row stat-int">
            <span>INT</span>
            <span className="value">{stats.INT}</span>
          </div>
          <div className="stat-row stat-vit">
            <span>VIT</span>
            <span className="value">{stats.VIT}</span>
          </div>
        </div>
        <div className="bottom-buttons">
          <img
            src="/assets/character/switch_character_button.png"
            alt="Switch"
            className="bottom-button"
            onClick={handleSwitch}
          />
          <img
            src="/assets/ui/buttons/delete_button.png"
            alt="Delete"
            className="bottom-button"
            onClick={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default CharacterPage;