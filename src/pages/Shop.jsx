import React, { useState, useEffect } from "react";
import { buyItem, getEquipment } from "../services/playerService";

function Shop({ character, refreshCharacter }) {
  const [preview, setPreview] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [equipped, setEquipped] = useState({});

  const loadEquipment = async () => {
    if (!character) return;
    try {
      const data = await getEquipment(character._id);
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
  }, [character]);

  useEffect(() => {
    if (character && character.shopPool) {
      setShopItems(character.shopPool);
    }
  }, [character]);

  const handleBuy = async (item) => {
    try {
      await buyItem(character._id, item.id);
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
                {Object.entries(preview.item.statBonus).map(([k, v]) => {
                  const current = preview.compareItem?.statBonus?.[k] || 0;
                  const diff = v - current;
                  return (
                    <li key={k}>
                      {k}: +{v}{" "}
                      {preview.compareItem && diff !== 0 && (
                        <span className={diff > 0 ? "better" : "worse"}>
                          ({diff > 0 ? "+" : ""}{diff})
                        </span>
                      )}
                    </li>
                  );
                })}
                {preview.compareItem &&
                  Object.entries(preview.compareItem.statBonus || {})
                    .filter(([k]) => !(preview.item.statBonus || {})[k])
                    .map(([k, v]) => (
                      <li key={k}>
                        {k}: +0 {" "}
                        <span className="worse">({-v})</span>
                      </li>
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