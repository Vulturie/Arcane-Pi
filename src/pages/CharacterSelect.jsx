import React, { useState } from "react";
import {
  CLASS_BASE_STATS,
  createCharacter,
  deleteCharacter,
} from "../services/playerService";

function CharacterSelect({ owner, characters, onSelect, refresh }) {
  const [name, setName] = useState("");
  const [cls, setCls] = useState("Warrior");

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
    <div>
      <h2>Select Character</h2>
      <ul>
        {characters.map((c) => (
          <li key={c._id}>
            {c.name} (lvl {c.level} {c.class})
            <button onClick={() => onSelect(c)}>Play</button>
            <button onClick={() => handleDelete(c._id)}>Delete</button>
          </li>
        ))}
      </ul>
      {characters.length < 4 && (
        <div>
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