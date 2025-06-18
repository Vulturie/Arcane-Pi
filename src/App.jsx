import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pi from "./piSdk";
import {
  getCharacters,
  getCharacter,
} from "./services/playerService";
import GameHub from "./components/GameHub";
import CharacterPage from "./pages/CharacterPage";
import CharacterSelect from "./pages/CharacterSelect";
import CharacterCreate from "./pages/CharacterCreate";
import Tavern from "./pages/Tavern";
import Inventory from "./pages/Inventory";
import Shop from "./pages/Shop";
import Tower from "./pages/Tower";
import Arena from "./pages/Arena";
import Journal from "./pages/Journal";
import LoadingScreenWrapper from "./components/LoadingScreenWrapper";

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
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
      onError: () => {
        setError("Login failed");
        setIsInitializing(false);
      },
    });
  }, []);

  const loadCharacters = async (owner) => {
    try {
      const data = await getCharacters(owner);
      setCharacters(data);
    } catch (err) {
      setError(err.message);
    }
    setIsInitializing(false);
  };

  const refreshActiveCharacter = useCallback(async () => {
    if (!activeChar) return;
    try {
      const data = await getCharacter(activeChar._id);
      setActiveChar(data);
    } catch (err) {
      console.error("Failed to refresh character");
    }
  }, [activeChar]);

  const spendEnergy = useCallback((cost) => {
    setActiveChar((prev) => (prev ? { ...prev, energy: Math.max(prev.energy - cost, 0) } : prev));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  let routes;
  if (!activeChar) {
    routes = (
      <Routes>
        <Route
          path="/create-character"
          element={<CharacterCreate owner={username} refresh={() => loadCharacters(username)} />}
        />
        <Route
          path="/character-select"
          element={
            <CharacterSelect
              owner={username}
              characters={characters}
              onSelect={(c) => {
                setActiveChar(c);
              }}
              refresh={() => loadCharacters(username)}
            />
          }
        />
        <Route
          path="*"
          element={
            <CharacterSelect
              owner={username}
              characters={characters}
              onSelect={(c) => {
                setActiveChar(c);
              }}
              refresh={() => loadCharacters(username)}
            />
          }
        />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route
          path="/tavern"
          element={<Tavern character={activeChar} refreshCharacter={refreshActiveCharacter} spendEnergy={spendEnergy} />}
        />
        <Route
          path="/character"
          element={
            <CharacterPage
              character={activeChar}
              onDelete={async () => {
                await loadCharacters(username);
                setActiveChar(null);
              }}
              onSwitch={() => setActiveChar(null)}
            />
          }
        />
        <Route
          path="/inventory"
          element={
            <Inventory
              character={activeChar}
              refreshCharacter={refreshActiveCharacter}
            />
          }
        />
        <Route
          path="/shop"
          element={<Shop character={activeChar} refreshCharacter={refreshActiveCharacter} />}
        />
        <Route
          path="/arena"
          element={<Arena character={activeChar} refreshCharacter={refreshActiveCharacter} />}
        />
        <Route
          path="/tower"
          element={<Tower character={activeChar} refreshCharacter={refreshActiveCharacter} />}
        />
        <Route
          path="/journal"
          element={<Journal character={activeChar} />}
        />
        <Route
          path="/character-select"
          element={
            <CharacterSelect
              owner={username}
              characters={characters}
              onSelect={(c) => {
                setActiveChar(c);
              }}
              refresh={() => loadCharacters(username)}
            />
          }
        />
        <Route
          path="/"
          element={<GameHub character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} />}
        />
      </Routes>
    );
  }

  return (
    <Router>
      {routes}
      <LoadingScreenWrapper isInitializing={isInitializing} />
    </Router>
  );
}

export default App;