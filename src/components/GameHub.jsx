import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import { getXpForNextLevel } from "../services/playerService";

function GameHub({ character, refreshCharacter, username }) {
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCharacter(); // Pull latest data
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const completeQuest = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/characters/${character._id}/quest/complete`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        console.log("✅ Quest completed:", data);
        refreshCharacter();
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
      <p><strong>Name:</strong> {character.name}</p>
      <p><strong>Class:</strong> {character.class}</p>
      <p><strong>Level:</strong> {character.level}</p>
      <p><strong>XP:</strong> {character.xp} / {getXpForNextLevel(character.level)}</p>
      <p><strong>Gold:</strong> {character.gold}</p>
      <p><strong>Energy:</strong> {character.energy}</p>

      <div className="menu">
        <Link to="/character"><button>🏰 Character</button></Link>
        <Link to="/tavern"><button>📜 Tavern</button></Link>
        <Link to="/arena"><button>⚔️ Arena</button></Link>
        <Link to="/shop"><button>🛒 Shop</button></Link>
        <Link to="/inventory"><button>💼 Inventory</button></Link>
        <Link to="/history"><button>📖 History</button></Link>
        <Link to="/stats"><button>📊 Stats</button></Link>
      </div>
    </div>
  );
}

export default GameHub;
