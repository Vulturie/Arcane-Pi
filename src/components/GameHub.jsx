import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import { getXpForNextLevel } from "../services/playerService";

function GameHub({ player, refreshPlayer }) {
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPlayer(); // Pull latest data (timestamp-based)
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const completeQuest = async () => {
    try {
      const res = await fetch(`http://localhost:4000/player/${player.username}/quest/complete`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Quest completed:", data);
        refreshPlayer(); // Pull updated player data from server
      } else {
        alert(data.error); // e.g., "Quest is still in progress"
      }
    } catch (err) {
      console.error("Failed to complete quest:", err);
    }
  };

  return (
    <div className="game-hub">
      <h2>Game Hub</h2>
      <p><strong>Username:</strong> {player.username}</p>
      <p><strong>Class:</strong> {player.class}</p>
      <p><strong>Level:</strong> {player.level}</p>
      <p><strong>XP:</strong> {player.xp} / {getXpForNextLevel(player.level)}</p>
      <p><strong>Gold:</strong> {player.gold}</p>
      <p><strong>Energy:</strong> {player.energy}</p>

      <div className="menu">
        <Link to="/character"><button>🏰 Character</button></Link>
        <Link to="/tavern"><button>📜 Tavern</button></Link>
        <Link to="/arena"><button>⚔️ Arena</button></Link>
        <Link to="/shop"><button>🛒 Shop</button></Link>
        <Link to="/inventory"><button>💼 Inventory</button></Link>
        <Link to="/stats"><button>📊 Stats</button></Link>
      </div>
    </div>
  );
}

export default GameHub;
