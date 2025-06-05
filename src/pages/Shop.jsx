import React, { useState, useEffect } from "react";
import ITEMS from "../itemData";
import { buyItem } from "../services/playerService";

function getDailyItems() {
  const today = new Date().toISOString().split("T")[0];
  const stored = JSON.parse(localStorage.getItem("shopData") || "{}");

  if (stored.date === today && Array.isArray(stored.items)) {
    const items = stored.items
      .map((id) => ITEMS.find((it) => it.id === id))
      .filter(Boolean);
    if (items.length === stored.items.length) return items;
  }

  const shuffled = [...ITEMS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(8, ITEMS.length));
  localStorage.setItem(
    "shopData",
    JSON.stringify({ date: today, items: selected.map((it) => it.id) })
  );
  return selected;
}

function Shop({ username, character, refreshCharacter }) {
  const [preview, setPreview] = useState(null);
  const [shopItems, setShopItems] = useState([]);

  useEffect(() => {
    setShopItems(getDailyItems());
  }, []);

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