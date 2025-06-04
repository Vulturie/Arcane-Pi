export const getXpForNextLevel = (level) => {
  return 100 + (level - 1) * 50;
};

export const CLASS_BASE_STATS = {
  Warrior: { STR: 7, AGI: 4, INT: 2, VIT: 7 },
  Rogue: { STR: 5, AGI: 8, INT: 2, VIT: 5 },
  Assassin: { STR: 6, AGI: 7, INT: 2, VIT: 5 },
  Mage: { STR: 2, AGI: 4, INT: 9, VIT: 5 },
};

export const CLASS_GROWTH = {
  Warrior: { STR: 2, AGI: 1, INT: 0, VIT: 2 },
  Rogue: { STR: 1, AGI: 2, INT: 0, VIT: 1 },
  Assassin: { STR: 2, AGI: 2, INT: 0, VIT: 1 },
  Mage: { STR: 0, AGI: 1, INT: 3, VIT: 1 },
};

export function getStatsForClass(className, level) {
  const base = CLASS_BASE_STATS[className];
  const growth = CLASS_GROWTH[className];
  if (!base || !growth) return null;
  return {
    STR: base.STR + growth.STR * (level - 1),
    AGI: base.AGI + growth.AGI * (level - 1),
    INT: base.INT + growth.INT * (level - 1),
    VIT: base.VIT + growth.VIT * (level - 1),
  };
}

export const getCharacters = async (owner) => {
  const res = await fetch(`http://localhost:4000/api/account/${owner}/characters`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load characters");
    return data;
  };

  export const createCharacter = async (owner, name, className) => {
    const res = await fetch(`http://localhost:4000/api/account/${owner}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, className }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create character");
    return data;
  };

export const getCharacter = async (id) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load character");
  return data;
};

export const rewardPlayer = async (id, reward) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}/quest/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reward),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to complete quest");
  return data;
};

export const updateEnergy = async (id, newEnergy) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}/energy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ energy: newEnergy }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update energy");
  return data;
};

export const getQuestStatus = async (id) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}/quest/status`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get quest status");
  return data;

};

export const cancelQuest = async (id) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}/quest/cancel`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to cancel quest");
  return data;
};

export const setPlayerClass = async (id, className) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ className }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to set class");
  return data;
};

export const deleteCharacter = async (id) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete player");
  return data;
 };

 export const getInventory = async (username) => {
   const res = await fetch(`http://localhost:4000/player/${username}/inventory`);
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Failed to load inventory");
   return data;
 };

export const updateInventory = async (username, inventory) => {
  const res = await fetch(`http://localhost:4000/player/${username}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inventory }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update inventory");
  return data;
};

export const getItems = async () => {
  const res = await fetch("http://localhost:4000/items");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load items");
  return data;
};

export const addItemToInventory = async (username, itemId) => {
  const res = await fetch(`http://localhost:4000/player/${username}/inventory/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add item");
  return data;
 };

 export const getEquipment = async (username) => {
   const res = await fetch(`http://localhost:4000/player/${username}/equipment`);
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Failed to load equipment");
   return data;
 };

 export const equipItem = async (username, itemId) => {
   const res = await fetch(`http://localhost:4000/player/${username}/equip`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ itemId }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.error || "Failed to equip item");
   return data;
 };

export const unequipItem = async (username, slot) => {
  const res = await fetch(`http://localhost:4000/player/${username}/unequip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to unequip item");
  return data;
};

export const getHistory = async (id) => {
  const res = await fetch(`http://localhost:4000/api/characters/${id}/history`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load history");
  return data;
};