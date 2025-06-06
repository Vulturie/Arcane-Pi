import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pi from "./piSdk";
import {
  getCharacters,
  getCharacter,
  acknowledgeQuestResult,
} from "./services/playerService";
import GameHub from "./components/GameHub";
import Character from "./pages/Character";
import CharacterSelect from "./pages/CharacterSelect";
import Tavern from "./pages/Tavern";
import Inventory from "./pages/Inventory";
import History from "./pages/History";
import Shop from "./pages/Shop";
import Tower from "./pages/Tower";
import Arena from "./pages/Arena";
import QuestResultModal from "./components/QuestResultModal";
import LoadingScreenWrapper from "./components/LoadingScreenWrapper";

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [username, setUsername] = useState("");
  const [characters, setCharacters] = useState([]);
  const [activeChar, setActiveChar] = useState(null);
  const [error, setError] = useState("");
  const [questResult, setQuestResult] = useState(null);

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
      if (data.pendingQuestResult) {
        setQuestResult(data.pendingQuestResult);
      }
    } catch (err) {
      console.error("Failed to refresh character");
    }
  }, [activeChar]);

  const handleQuestResultClose = async () => {
    if (activeChar && questResult) {
      try {
        await acknowledgeQuestResult(activeChar._id);
      } catch (err) {
        console.error(err);
      }
    }
    setQuestResult(null);
    refreshActiveCharacter();
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  let content;
  if (!activeChar) {
    content = (
      <CharacterSelect
        owner={username}
        characters={characters}
        onSelect={(c) => {
          setActiveChar(c);
          if (c.pendingQuestResult) setQuestResult(c.pendingQuestResult);
        }}
        refresh={() => loadCharacters(username)}
      />
    );
  } else {
    content = (
      <Router>
        <Routes>
        <Route
          path="/tavern"
          element={<Tavern character={activeChar} refreshCharacter={refreshActiveCharacter} onQuestResult={setQuestResult} />}
        />
        <Route
          path="/character"
          element={<Character character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} />}
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
          path="/history"
          element={<History character={activeChar} />}
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
          path="/"
          element={<GameHub character={activeChar} refreshCharacter={refreshActiveCharacter} username={username} />}
        />
      </Routes>
      <QuestResultModal result={questResult} onClose={handleQuestResultClose} />
    </Router>
    );
  }

  return (
    <>
      {content}
      <LoadingScreenWrapper isInitializing={isInitializing} />
    </>
  );
}

export default App;