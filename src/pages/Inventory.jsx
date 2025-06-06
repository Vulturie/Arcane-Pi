import React, { useEffect, useState, useCallback } from "react";
import { RARITY_MULTIPLIER, getRarityLabel } from "../rarity";
import {
  getInventory,
  addItemToInventory,
  getEquipment,
  equipItem,
  unequipItem,
  sellItem,
} from "../services/playerService";

function Inventory({ character, refreshCharacter }) {
  const [items, setItems] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [slots, setSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [preview, setPreview] = useState(null);

  const getBonus = (item, stat) => {
    if (!item || !item.statBonus) return 0;
    const mult = RARITY_MULTIPLIER[item.rarity] || 1;
    const value = (item.statBonus[stat] || 0) * mult;
    return Math.round(value * 10) / 10;
  };

  const loadInventory = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getInventory(character._id);
      setItems(data.inventory);
      setSlots(data.slots);
      setMaxSlots(data.maxSlots);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  }, [character]);

  const loadEquipment = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getEquipment(character._id);
      setEquipped(data);
    } catch (err) {
      console.error("Failed to load equipment", err);
    }
  }, [character]);

  useEffect(() => {
    loadInventory();
    loadEquipment();
  }, [character, loadInventory, loadEquipment]);

    const giveTestItem = async () => {
        try {
          await addItemToInventory(character._id, "sword_iron");
          loadInventory();
          loadEquipment();
        } catch (err) {
          console.error("Failed to add item", err);
        }
    };

  const handleEquip = async (id) => {
    try {
      await equipItem(character._id, id);
      loadInventory();
      loadEquipment();
    } catch (err) {
      console.error("Failed to equip item", err);
      alert(err.message);
    }
  };

  const openPreview = (item, compare = false) => {
    const compareItem = compare ? equipped[item.type] : null;
    setPreview({ item, compareItem });
  };

  const handleUnequip = async (slot) => {
    try {
      await unequipItem(character._id, slot);
      loadInventory();
      loadEquipment();
    } catch (err) {
      console.error("Failed to unequip item", err);
    }
  };

  const handleSell = async (id) => {
    if (!character) return;
    try {
      await sellItem(character._id, id);
      loadInventory();
      loadEquipment();
      if (refreshCharacter) refreshCharacter();
    } catch (err) {
      console.error("Failed to sell item", err);
    }
  };

  return (
    <div>
      <h2>Equipped Items</h2>
      <ul>
        {[
          "weapon",
          "headpiece",
          "chestplate",
          "gloves",
          "footwear",
          "necklace",
          "belt",
          "ring",
          "artifact",
        ].map((slot) => (
          <li key={slot}>
            {slot}: {equipped && equipped[slot] ? (
              <span className={`rarity-${equipped[slot].rarity}`}>{equipped[slot].name} ({getRarityLabel(equipped[slot].rarity)})</span>
            ) : "None"}
            {equipped && equipped[slot] && (
              <>
                <button onClick={() => handleUnequip(slot)}>Unequip</button>
                <button onClick={() => openPreview(equipped[slot])}>Preview</button>
              </>
            )}
          </li>
        ))}
      </ul>
      <h2>Inventory</h2>
      {character && <p>Your Gold: {character.gold}</p>}
      <p>Items: {slots} / {maxSlots}</p>
      <button onClick={giveTestItem}>Give Test Item</button>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            <span className={`rarity-${item.rarity}`}>{item.name} ({getRarityLabel(item.rarity)})</span> ({item.type})
            <button onClick={() => openPreview(item, true)}>Preview</button>
            <button onClick={() => handleEquip(item.id)}>Equip</button>
            {character && (
              <button onClick={() => handleSell(item.id)}>Sell</button>
            )}
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

export default Inventory;