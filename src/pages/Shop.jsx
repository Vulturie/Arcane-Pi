import React, { useState, useEffect } from "react";
import { buyItem, getEquipment } from "../services/playerService";

function Shop({ username, character, refreshCharacter }) {
  const [preview, setPreview] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [equipped, setEquipped] = useState({});

  const loadEquipment = async () => {
    if (!username) return;
    try {
      const data = await getEquipment(username);
      setEquipped(data);
    } catch (err) {
      console.error("Failed to load equipment", err);
    }
  };

  useEffect(() => {
    refreshCharacter();
    loadEquipment();
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [username]);

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

  const openPreview = (item) => {
    const compareItem = equipped[item.type];
    setPreview({ item, compareItem });
  };

  return (
    <div>
      <h2>Shop</h2>
      <p>Your Gold: {character.gold}</p>
      <ul>
        {shopItems.map((it) => (
          <li key={it.id}>
            {it.name} - {it.cost} Gold
            <button onClick={() => openPreview(it)}>Preview</button>
            <button onClick={() => handleBuy(it)}>Buy</button>
          </li>
        ))}
      </ul>
      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{preview.item.name}</h3>
            <p>Type: {preview.item.type}</p>
            {preview.item.classRestriction && (
              <p>Classes: {preview.item.classRestriction.join(", ")}</p>
            )}
            <p>Cost: {preview.item.cost} Gold</p>
            {preview.item.statBonus && (
              <ul>
                {Object.entries(preview.item.statBonus).map(([k, v]) => (
                  <li key={k}>{k}: +{v}</li>
                ))}
              </ul>
            )}
            {preview.compareItem && (
              <>
                <h4>Currently Equipped</h4>
                <p>{preview.compareItem.name}</p>
                {preview.compareItem.statBonus && (
                  <ul>
                    {Object.entries(preview.compareItem.statBonus).map(([k, v]) => (
                      <li key={k}>{k}: +{v}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
            <button onClick={() => setPreview(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;