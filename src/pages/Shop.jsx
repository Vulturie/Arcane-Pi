import React, { useState, useEffect } from "react";
import { buyItem } from "../services/playerService";

function Shop({ username, character, refreshCharacter }) {
  const [preview, setPreview] = useState(null);
  const [shopItems, setShopItems] = useState([]);

  useEffect(() => {
    refreshCharacter();
  }, []);

  useEffect(() => {
    if (character && character.shopPool) {
      setShopItems(character.shopPool);
    }
  }, [character]);

  const handleBuy = async (item) => {
    try {
      await buyItem(username, character._id, item.id);
      refreshCharacter();
      alert(`Bought ${item.name}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Shop</h2>
      <p>Your Gold: {character.gold}</p>
      <ul>
        {shopItems.map((it) => (
          <li key={it.id}>
            {it.name} - {it.cost} Gold
            <button onClick={() => setPreview(it)}>Preview</button>
            <button onClick={() => handleBuy(it)}>Buy</button>
          </li>
        ))}
      </ul>
      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{preview.name}</h3>
            <p>Type: {preview.type}</p>
            {preview.classRestriction && (
              <p>Classes: {preview.classRestriction.join(", ")}</p>
            )}
            <p>Cost: {preview.cost} Gold</p>
            {preview.statBonus && (
              <ul>
                {Object.entries(preview.statBonus).map(([k, v]) => (
                  <li key={k}>
                    {k}: +{v}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setPreview(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;