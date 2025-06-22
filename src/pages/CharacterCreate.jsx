import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter } from "../services/playerService";
import NotificationModal from "../components/NotificationModal";

function CharacterCreate({ owner, refresh }) {
  const [gender, setGender] = useState("male");
  const [cls, setCls] = useState("Warrior");
  const [name, setName] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name) {
      setNotificationMessage("Enter a name");
      setShowNotification(true);
      return;
    }
    try {
      await createCharacter(owner, name, cls, gender);
      refresh();
      navigate("/");
    } catch (err) {
      setNotificationMessage(err.message);
      setShowNotification(true);
    }
  };

  const genderButton = (g) => (
    <img
      src={`/assets/character_creation/${g}_button.png`}
      alt={g}
      className={`w-[72px] cursor-pointer transition-transform duration-200 hover:scale-105 ${
        gender === g ? "ring-2 ring-offset-2 ring-yellow-300 drop-shadow-[0_0_8px_white]" : ""
      }`}
      onClick={() => setGender(g)}
    />
  );

  const classButton = (c) => (
    <img
      key={c}
      src={`/assets/character_creation/${c.toLowerCase()}_button.png`}
      alt={c}
      className={`w-[72px] cursor-pointer transition-transform duration-200 hover:scale-105 ${
        cls === c ? "ring-2 ring-offset-2 ring-yellow-300 drop-shadow-[0_0_8px_white]" : ""
      }`}
      onClick={() => setCls(c)}
    />
  );

  const previewSrc = `/assets/character_creation/${cls.toLowerCase()}_${gender}.png`;

  return (
    <div
      className="relative w-screen h-screen bg-no-repeat bg-center bg-cover flex justify-center items-center text-white font-['SS_Homero']"
      style={{
        backgroundImage: "url(/assets/character_creation/creation_background.png)",
      }}
    >
      <img
        src="/assets/character_creation/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
        onClick={() => navigate("/")}
      />
      <div
        className="w-full max-w-[500px] pt-24 pb-4 px-4 text-center flex flex-col justify-center items-center"
        style={{
          background:
            "url(/assets/character_creation/creation_panel.png) no-repeat center/contain",
        }}
      >
        <div
          className="p-6 mb-2"
          style={{
            background:
              "url(/assets/character_creation/character_name.png) no-repeat center/contain",
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full bg-transparent border-none text-black text-center font-['SS_Homero'] text-base focus:outline-none"
          />
        </div>
        <div className="flex justify-center gap-2 mb-8">
          {genderButton("male")}
          {genderButton("female")}
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 mb-8">
          {classButton("Warrior")}
          {classButton("Mage")}
          {classButton("Rogue")}
          {classButton("Assassin")}
        </div>
        <img src={previewSrc} alt="Preview" className="mx-auto w-3/5 max-w-xs mb-4" />
        <img
          src="/assets/character_creation/create_character_button.png"
          alt="Create"
          className="w-[160px] mt-10 cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={handleCreate}
        />
      </div>
      <NotificationModal
        message={notificationMessage}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default CharacterCreate;
