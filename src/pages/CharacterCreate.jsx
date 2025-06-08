import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter } from "../services/playerService";
import "./CharacterCreate.css";

function CharacterCreate({ owner, refresh }) {
  const [gender, setGender] = useState("male");
  const [cls, setCls] = useState("Warrior");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name) return alert("Enter a name");
    try {
      await createCharacter(owner, name, cls, gender);
      refresh();
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const genderButton = (g) => (
    <img
      src={`/assets/character_creation/${g}_button.png`}
      alt={g}
      className={`gender-btn ${gender === g ? "selected" : ""}`}
      onClick={() => setGender(g)}
    />
  );

  const classButton = (c) => (
    <img
      key={c}
      src={`/assets/character_creation/${c.toLowerCase()}_button.png`}
      alt={c}
      className={`class-btn ${cls === c ? "selected" : ""}`}
      onClick={() => setCls(c)}
    />
  );

  const previewSrc = `/assets/character_creation/${cls.toLowerCase()}_${gender}.png`;

  return (
    <div
      className="character-create"
      style={{
        backgroundImage: "url(/assets/character_creation/creation_background.png)",
      }}
    >
      <img
        src="/assets/character_creation/back_button.png"
        alt="Back"
        className="back-btn"
        onClick={() => navigate("/")}
      />
      <div
        className="panel"
        style={{
          background:
            "url(/assets/character_creation/creation_panel.png) no-repeat center/contain",
        }}
      >
        <div
          className="name-input"
          style={{
            background:
              "url(/assets/character_creation/character_name.png) no-repeat center/contain",
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="gender-select">
          {genderButton("male")}
          {genderButton("female")}
        </div>
        <div className="class-select">
          {classButton("Warrior")}
          {classButton("Mage")}
          {classButton("Rogue")}
          {classButton("Assassin")}
        </div>
        <img src={previewSrc} alt="Preview" className="preview" />
        <img
          src="/assets/character_creation/create_character_button.png"
          alt="Create"
          className="create-btn"
          onClick={handleCreate}
        />
      </div>
    </div>
  );
}

export default CharacterCreate;