import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { deleteCharacter } from "../services/playerService";

function CharacterSelect({ owner, characters, onSelect, refresh }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const username = user?.username || owner || "";
  const [selected, setSelected] = useState(null);

  const portraitForCharacter = (c) => {
    const cls = c.class ? c.class.toLowerCase() : "novice";
    const gender = c.gender ? c.gender.toLowerCase() : "male";
    return `/assets/character_creation/${cls}_${gender}.png`;
  };

  const handleSelect = (id) => {
    const char = characters.find((c) => c._id === id);
    if (char) setSelected(char);
  };

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
      navigate("/");
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

  const glowClass = "drop-shadow-[0_0_8px_white]";
  const addGlow = (e) => {
    e.currentTarget.classList.add(glowClass);
  };

  const removeGlow = (e) => {
    e.currentTarget.classList.remove(glowClass);
  };

  return (
    <div
      className="relative w-screen h-screen bg-no-repeat bg-center bg-cover bg-fixed flex justify-center items-start pt-24 font-['SS_Homero'] text-white overflow-hidden"
      style={{
        backgroundImage: "url(/assets/ui/backgrounds/selection_background.png)",
      }}
    >
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] pointer-events-none z-10">
        <div className="relative w-full flex justify-center">
          <img
            src="/assets/ui/parchment_banner.png"
            alt="banner"
            className="w-full max-h-32 object-contain" />
          <h2
            className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white font-['SS_Homero'] drop-shadow-[0_0_6px_rgba(0,0,0,1)] fade-in-down px-4 text-center">
            {`Welcome ${username}! Choose or create a character:`}
          </h2>
        </div>
      </div>
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto py-6 px-4 max-h-[calc(100vh-120px)]">
          <ul className="list-none p-0 m-auto mt-16 mb-8 w-full max-w-[600px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 justify-items-center">
            {characters.map((c) => (
              <li
                key={c._id}
                className="flex flex-col items-center w-full p-2"
                onClick={() => handleSelect(c._id)}
              >
                <div className="flex justify-between items-center gap-3 w-full">
                  <div
                    className={`w-16 h-16 flex justify-center items-center ${
                      selected && selected._id === c._id ? "drop-shadow-[0_0_8px_white]" : ""
                    }`}
                  >
                    <img
                      src={portraitForCharacter(c)}
                      alt={`${c.class} ${c.gender}`}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="flex flex-col flex-1 mr-2">
                    <span
                      className={`font-bold text-xs drop-shadow-sm ${
                        selected && selected._id === c._id ? "text-yellow-300" : ""
                      }`}
                    >
                      {c.name}
                    </span>
                    <span
                      className={`text-[10px] drop-shadow-sm ${
                        selected && selected._id === c._id ? "text-yellow-300" : ""
                      }`}
                    >
                      Lvl {c.level}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex justify-center w-full">
                  <img
                    src="/assets/ui/buttons/select_button.png"
                    alt="Select"
                    className="w-[21vw] max-w-[84px] min-h-12 mx-1 cursor-pointer transition-transform duration-200 hover:scale-105 outline-none"
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
                    className="w-[21vw] max-w-[84px] min-h-12 mx-1 cursor-pointer transition-transform duration-200 hover:scale-105 outline-none"
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
            <div className="sticky bottom-0 w-full flex justify-center py-3 z-10">
              <img
                src="/assets/character_creation/+_create_character_button.png"
                alt="Create"
                className="w-[120px] cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => navigate("/create-character")}
              />
            </div>
          )}
        </div>
        {selected && (
          <div className="sticky bottom-0 w-full flex justify-center py-3 z-10">
            <img
              src="/assets/ui/buttons/continue_button.png"
              alt="Continue"
              className="w-[120px] cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={handleContinue}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterSelect;
