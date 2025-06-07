import React, { useState } from "react";
import {
  CLASS_BASE_STATS,
  createCharacter,
  deleteCharacter,
} from "../services/playerService";
import "./CharacterSelect.css";

function CharacterSelect({ owner, characters, onSelect, refresh }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("Warrior");
  const [selected, setSelected] = useState(null);

  const bannerForClass = (c) =>
    `/assets/ui/banners/${c.class.toLowerCase()}_banner.png`;

  const handlePlay = (char) => {
    setSelected(char);
  };

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  const handleCreate = async () => {
    if (!name) return alert("Enter a name");
    try {
      await createCharacter(owner, name, cls);
      setName("");
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this character?")) return;
    try {
      await deleteCharacter(id);
      refresh();
    } catch (err) {
      alert("Failed to delete character");
    }
  };

  return (
    <div
      className="character-select"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/ui/backgrounds/selection_background.png)`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
      }}
    >
      <img
        src="/assets/ui/buttons/back_button.png"
        alt="Back"
        className="back-button"
        onClick={() => window.location.reload()}
      />
      <ul className="characters-list">
        {characters.map((c) => (
          <li
            key={c._id}
            className={`character-item ${
              selected && selected._id === c._id ? "selected" : ""
            }`}
          >
            <div className="character-info">
              <span className="character-name">{c.name}</span>
              <span className="character-level">Lvl {c.level}</span>
            </div>
            <img
              src={bannerForClass(c)}
              alt={`${c.class} banner`}
              className="class-banner"
            />
            <div className="character-buttons">
              <img
                src="/assets/ui/buttons/select_button.png"
                alt="Play"
                onClick={() => handlePlay(c)}
              />
              <img
                src="/assets/ui/buttons/delete_button.png"
                alt="Delete"
                onClick={() => handleDelete(c._id)}
              />
            </div>
            {selected && selected._id === c._id && (
              <img
                src="/assets/ui/buttons/select_indicator.png"
                alt="Selected"
                className="select-indicator"
              />
            )}
          </li>
        ))}
      </ul>
      {selected && (
        <img
          src="/assets/ui/buttons/continue_button.png"
          alt="Continue"
          className="continue-button"
          onClick={handleContinue}
        />
      )}
      {characters.length < 4 && (
        <div className="create-section">
          <h3>Create New</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <select value={cls} onChange={(e) => setCls(e.target.value)}>
            {Object.keys(CLASS_BASE_STATS).map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          <button onClick={handleCreate}>Create</button>
        </div>
      )}
    </div>
  );
}

export default CharacterSelect;