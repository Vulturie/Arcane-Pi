import React, { useEffect, useState } from "react";
import { getInventory, addItemToInventory } from "../services/playerService";

function Inventory({ username }) {
  const [items, setItems] = useState([]);

  const loadInventory = async () => {
      if (!username) return;
      try {
        const data = await getInventory(username);
        setItems(data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      }
    };

  useEffect(() => {
    loadInventory();
  }, [username]);

    const giveTestItem = async () => {
        try {
          await addItemToInventory(username, "sword_iron");
          loadInventory();
        } catch (err) {
          console.error("Failed to add item", err);
        }
    };

  return (
    <div>
      <h2>Inventory</h2>
      <button onClick={giveTestItem}>Give Test Item</button>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            {item.name} ({item.type})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Inventory;