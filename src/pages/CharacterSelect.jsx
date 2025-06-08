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

  const handleSelect = (id) => {
    const char = characters.find((c) => c._id === id);
    if (char) setSelected(char);
  };

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  const handleCreate = async () => {
    if (!name) return alert("Enter a name");
    try {
      await createCharacter(owner, name, cls, "male");
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

  const addGlow = (e) => {
    e.currentTarget.classList.add("pressed");
  };

  const removeGlow = (e) => {
    e.currentTarget.classList.remove("pressed");
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
      <div className="character-select-wrapper">
        <div className="character-scroll-area">
          <ul className="character-grid">
            {characters.map((c) => (
              <li
                key={c._id}
                className={`character-item ${
                  selected && selected._id === c._id ? "selected" : ""
                }`}
              >
                <div className="character-header">
                  <div className="character-info">
                    <span
                      className={`character-name ${
                        selected && selected._id === c._id ? "selected" : ""
                      }`}
                    >
                      {c.name}
                    </span>
                    <span
                      className={`character-level ${
                        selected && selected._id === c._id ? "selected" : ""
                      }`}
                    >
                      Lvl {c.level}
                    </span>
                  </div>
                  <img
                    src={bannerForClass(c)}
                    alt={`${c.class} banner`}
                    className="class-banner"
                  />
                </div>
                <div className="character-buttons">
                  <img
                    src="/assets/ui/buttons/select_button.png"
                    alt="Select"
                    className="select-btn image-btn"
                    onClick={() => handleSelect(c._id)}
                    onMouseDown={addGlow}
                    onMouseUp={removeGlow}
                    onMouseLeave={removeGlow}
                    onTouchStart={addGlow}
                    onTouchEnd={removeGlow}
                  />
                  <img
                    src="/assets/ui/buttons/delete_button.png"
                    alt="Delete"
                    className="delete-btn image-btn"
                    onClick={() => handleDelete(c._id)}
                    onMouseDown={addGlow}
                    onMouseUp={removeGlow}
                    onMouseLeave={removeGlow}
                    onTouchStart={addGlow}
                    onTouchEnd={removeGlow}
                  />
                </div>
                {/* selection indicator removed */}
              </li>
            ))}
          </ul>
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
        {selected && (
          <div className="fixed-continue-button">
            <img
              src="/assets/ui/buttons/continue_button.png"
              alt="Continue"
              className="continue-button"
              onClick={handleContinue}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterSelect;