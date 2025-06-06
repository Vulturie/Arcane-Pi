import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getXpForNextLevel } from "../services/playerService";

function GameHub({ character, refreshCharacter, username }) {
  const [showTowerInfo, setShowTowerInfo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshCharacter(); // Pull latest data
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [refreshCharacter]);

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
        {character.level >= 10 ? (
          <Link to="/tower"><button>🗼 Tower</button></Link>
        ) : (
          <>
            <button
              className="locked"
              disabled
              title="Unlocks at level 10"
              onClick={() => setShowTowerInfo(true)}
            >
              🗼 Tower (Locked)
            </button>
            {showTowerInfo && (
              <div className="modal" onClick={() => setShowTowerInfo(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <p>Unlocks at level 10</p>
                  <button onClick={() => setShowTowerInfo(false)}>Close</button>
                </div>
              </div>
            )}
          </>
        )}
        <Link to="/stats"><button>📊 Stats</button></Link>
      </div>
    </div>
  );
}

export default GameHub;
