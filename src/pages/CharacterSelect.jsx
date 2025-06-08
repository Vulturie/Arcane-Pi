import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCharacter } from "../services/playerService";
import "./CharacterSelect.css";

function CharacterSelect({ owner, characters, onSelect, refresh }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const portraitForCharacter = (c) =>
    `/assets/character_creation/${c.class.toLowerCase()}_${c.gender}.png`;

  const handleSelect = (id) => {
    const char = characters.find((c) => c._id === id);
    if (char) setSelected(char);
  };

  const handleContinue = () => {
    if (selected) onSelect(selected);
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
                onClick={() => handleSelect(c._id)}
              >
                <div className="character-header">
                  <div className="portrait-wrapper">
                    <img
                      src={portraitForCharacter(c)}
                      alt={`${c.class} ${c.gender}`}
                      className="character-portrait"
                    />
                  </div>
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
                </div>
                <div className="character-buttons">
                  <img
                    src="/assets/ui/buttons/select_button.png"
                    alt="Select"
                    className="select-btn image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(c._id);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c._id);
                    }}
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
            <div className="create-button-wrapper">
              <img
                src="/assets/character_creation/+_create_character_button.png"
                alt="Create"
                className="create-new-btn"
                onClick={() => navigate("/create-character")}
              />
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