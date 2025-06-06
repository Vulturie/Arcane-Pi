import React, { useState, useEffect } from "react";
import { buyItem, getEquipment } from "../services/playerService";
import { RARITY_MULTIPLIER, getRarityLabel } from "../rarity";

function Shop({ character, refreshCharacter }) {
  const [preview, setPreview] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [equipped, setEquipped] = useState({});

  const getBonus = (item, stat) => {
    if (!item || !item.statBonus) return 0;
    const mult = RARITY_MULTIPLIER[item.rarity] || 1;
    return (item.statBonus[stat] || 0) * mult;
  };

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
      <p>Next refresh at 00:00 UTC</p>
      <ul>
        {shopItems.map((it) => (
          <li key={it.id}>
            <span className={`rarity-${it.rarity}`}>{it.name} ({getRarityLabel(it.rarity)})</span> - {it.cost} Gold
            <button onClick={() => openPreview(it)}>Preview</button>
            <button onClick={() => handleBuy(it)}>Buy</button>
          </li>
        ))}
      </ul>
      {preview && (
        <div className="modal" onClick={() => setPreview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className={`rarity-${preview.item.rarity}`}>
              {preview.item.name} ({getRarityLabel(preview.item.rarity)})
            </h3>
            <p>Type: {preview.item.type}</p>
            {preview.item.classRestriction && (
              <p className={
                preview.item.classRestriction.includes(character.class)
                  ? "equip-allowed"
                  : "equip-denied"
              }>
                Classes: {preview.item.classRestriction.join(", ")}
              </p>
            )}
            <p>Cost: {preview.item.cost} Gold</p>
            {preview.item.statBonus && (
              <ul>
                {Object.entries(preview.item.statBonus).map(([k]) => {
                  const value = getBonus(preview.item, k);
                  const current = getBonus(preview.compareItem, k);
                  const diff = value - current;
                  return (
                    <li key={k}>
                      {k}: +{value}
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
                        <span className="worse">({-getBonus(preview.compareItem, k)})</span>
                      </li>
                    ))}
              </ul>
            )}
            {preview.compareItem && (
              <>
                <h4>Currently Equipped</h4>
                <p className={`rarity-${preview.compareItem.rarity}`}>
                  {preview.compareItem.name} ({getRarityLabel(preview.compareItem.rarity)})
                </p>
                {preview.compareItem.statBonus && (
                  <ul>
                    {Object.entries(preview.compareItem.statBonus).map(([k, v]) => (
                      <li key={k}>{k}: +{getBonus(preview.compareItem, k)}</li>
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