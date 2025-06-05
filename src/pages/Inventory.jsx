import React, { useEffect, useState } from "react";
import {
  getInventory,
  addItemToInventory,
  getEquipment,
  equipItem,
  unequipItem,
  sellItem,
} from "../services/playerService";

function Inventory({ username, character, refreshCharacter }) {
  const [items, setItems] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [slots, setSlots] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [preview, setPreview] = useState(null);

  const loadInventory = async () => {
      if (!username) return;
      try {
        const data = await getInventory(username);
        setItems(data.inventory);
        setSlots(data.slots);
        setMaxSlots(data.maxSlots);
      } catch (err) {
        console.error("Failed to load inventory", err);
      }
    };

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
    loadInventory();
    loadEquipment();
  }, [username]);

    const giveTestItem = async () => {
        try {
          await addItemToInventory(username, "sword_iron");
          loadInventory();
          loadEquipment();
        } catch (err) {
          console.error("Failed to add item", err);
        }
    };

  const handleEquip = async (id) => {
    try {
      await equipItem(username, id);
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
      await unequipItem(username, slot);
      loadInventory();
      loadEquipment();
    } catch (err) {
      console.error("Failed to unequip item", err);
    }
  };

  const handleSell = async (id) => {
    if (!character) return;
    try {
      await sellItem(username, character._id, id);
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
            {slot}: {equipped && equipped[slot] ? `${equipped[slot].name}` : "None"}
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
            {item.name} ({item.type})
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
            <h3>{preview.item.name}</h3>
            <p>Type: {preview.item.type}</p>
            {preview.item.classRestriction && (
              <p>Classes: {preview.item.classRestriction.join(", ")}</p>
            )}
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

export default Inventory;