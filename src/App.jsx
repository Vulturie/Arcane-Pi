import React, { useEffect, useState, useCallback, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserContext } from "./context/UserContext";
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
import DevDashboard from "./pages/DevDashboard";
import PieShop from "./pages/PieShop";
import SpiritGrove from "./pages/SpiritGrove";
import SettingsPage from "./pages/SettingsPage";
import LoadingScreenWrapper from "./components/LoadingScreenWrapper";

function App() {
  const { user } = useContext(UserContext);
  const username = user?.username || "";

  const [isInitializing, setIsInitializing] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [activeChar, setActiveChar] = useState(null);
  const [error, setError] = useState("");

  const loadCharacters = useCallback(async (owner) => {
    setIsInitializing(true);
    try {
      const data = await getCharacters(owner);
      setCharacters(data);
    } catch (err) {
      setError(err.message);
    }
    setIsInitializing(false);
  }, []);

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

  useEffect(() => {
    if (username) {
      loadCharacters(username);
    }
  }, [username, loadCharacters]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  let routes;
  if (!username) {
    routes = null;
  } else if (!activeChar) {
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
        <Route path="/dev/dashboard" element={<DevDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route
          path="/tavern"
          element={<Tavern character={activeChar} refreshCharacter={refreshActiveCharacter} spendEnergy={spendEnergy} username={username} accessToken={accessToken} />}
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
          element={<Shop character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} accessToken={accessToken} />}
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
          path="/spirit-grove"
          element={<SpiritGrove character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} accessToken={accessToken} />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pie-shop" element={<PieShop username={username} accessToken={accessToken} />} />
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
          element={<GameHub character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} accessToken={accessToken} />}
        />
        <Route path="/dev/dashboard" element={<DevDashboard />} />
      </Routes>
    );
  }

  return (
    <Router>
      {routes}
      <LoadingScreenWrapper isInitializing={isInitializing} showLogin={!username} />
    </Router>
  );
}

export default App;
