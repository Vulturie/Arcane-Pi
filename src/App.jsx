import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pi from "./piSdk";
import {
  getCharacters,
  getCharacter,
} from "./services/playerService";
import GameHub from "./components/GameHub";
import Character from "./pages/Character";
import CharacterSelect from "./pages/CharacterSelect";
import Tavern from "./pages/Tavern";
import Inventory from "./pages/Inventory";

function App() {
  const [username, setUsername] = useState("");
  const [characters, setCharacters] = useState([]);
  const [activeChar, setActiveChar] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Pi.authenticate({
      onReady: ({ user }) => {
        setUsername(user.username);
        loadCharacters(user.username);
      },
      onError: () => setError("Login failed"),
    });
  }, []);

  const loadCharacters = async (owner) => {
    try {
      const data = await getCharacters(owner);
      setCharacters(data);;
    } catch (err) {
      setError(err.message);
    }
  };

  const refreshActiveCharacter = async () => {
    if (!activeChar) return;
    try {
      const data = await getCharacter(activeChar._id);
      setActiveChar(data);
    } catch (err) {
      console.error("Failed to refresh character");
    }
  };

  if (!username) return <p>Logging in...</p>;
  if (!activeChar)
      return (
        <CharacterSelect
          owner={username}
          characters={characters}
          onSelect={(c) => setActiveChar(c)}
          refresh={() => loadCharacters(username)}
        />
      );

  return (
    <Router>
      <Routes>
        <Route
          path="/tavern"
          element={<Tavern character={activeChar} refreshCharacter={refreshActiveCharacter} />}
        />
        <Route
          path="/character"
          element={<Character character={activeChar} refreshCharacter={refreshActiveCharacter} />}
        />
        <Route
          path="/inventory"
          element={<Inventory username={username} />}
        />
        <Route
          path="/"
          element={<GameHub character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} />}
        />
      </Routes>
    </Router>
  );
}

export default App;