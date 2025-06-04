import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pi from "./piSdk";
import { getPlayerData } from "./services/playerService";
import GameHub from "./components/GameHub";
import Character from "./pages/Character";
import Tavern from "./pages/Tavern";
// Placeholder pages
// Add Arena, Shop, Inventory, Stats when ready

function App() {
  const [username, setUsername] = useState("");
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Pi.authenticate({
      onReady: ({ user }) => {
        setUsername(user.username);
        loadPlayer(user.username);
      },
      onError: (err) => setError("Login failed"),
    });
  }, []);

  const loadPlayer = async (username) => {
    try {
      const data = await getPlayerData(username);
      setPlayer(data);
    } catch (err) {
      setError(err);
    }
  };

  const refreshPlayer = async () => {
    try {
      const data = await getPlayerData(username);
      setPlayer(data);
    } catch (err) {
      console.error("Failed to refresh player data");
    }
  };

  if (!username) return <p>Logging in...</p>;
  if (!player) return <p>Loading player data...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Router>
      <Routes>
        <Route
          path="/tavern"
          element={
            <Tavern
              player={player}
              setPlayer={setPlayer}
              refreshPlayer={refreshPlayer}
            />
          }
        />

        <Route
                  path="/character"
                  element={<Character player={player} refreshPlayer={refreshPlayer} />}
                />

        <Route
          path="/"
          element={
            <GameHub
              player={player}
              refreshPlayer={refreshPlayer}
              setPlayer={setPlayer}
            />
          }
        />
        {/* Add more routes later */}
      </Routes>
    </Router>
  );
}

export default App;