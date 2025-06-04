import React, { useEffect, useState } from "react";
import {
  getInventory,
  addItemToInventory,
  getEquipment,
  equipItem,
  unequipItem,
} from "../services/playerService";

function Inventory({ username }) {
  const [items, setItems] = useState([]);
  const [equipped, setEquipped] = useState({});

  const loadInventory = async () => {
      if (!username) return;
      try {
        const data = await getInventory(username);
        setItems(data);
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
    }
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

    return (
      <div>
        <h2>Equipped Items</h2>
        <ul>
          {['weapon', 'armor', 'accessory'].map((slot) => (
            <li key={slot}>
              {slot}: {equipped && equipped[slot] ? `${equipped[slot].name}` : 'None'}
              {equipped && equipped[slot] && (
                <button onClick={() => handleUnequip(slot)}>Unequip</button>
              )}
            </li>
          ))}
        </ul>
        <h2>Inventory</h2>
        <button onClick={giveTestItem}>Give Test Item</button>
        <ul>
          {items.map((item, idx) => (
            <li key={idx}>
              {item.name} ({item.type})
              <button onClick={() => handleEquip(item.id)}>Equip</button>
            </li>
          ))}
        </ul>
      </div>
    );
}

export default Inventory;