import React, { useEffect, useState } from "react";
import { getInventory } from "../services/playerService";

function Inventory({ username }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInventory(username);
        setItems(data);
      } catch (err) {
        console.error("Failed to load inventory", err);
      }
    };
    if (username) load();
  }, [username]);

  return (
    <div>
      <h2>Inventory</h2>
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