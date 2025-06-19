import { API_BASE_URL } from "../config";
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
  const res = await fetch(`${API_BASE_URL}/api/account/${owner}/characters`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load characters");
    return data;
  };

export const createCharacter = async (owner, name, className, gender) => {
    const res = await fetch(`${API_BASE_URL}/api/account/${owner}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, className, gender }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create character");
    return data;
  };

export const getCharacter = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load character");
  return data;
};

export const rewardPlayer = async (id, reward) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/quest/complete`, {
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
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/energy`, {
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
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/quest/status`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get quest status");
  return data;

};

export const cancelQuest = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/quest/cancel`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to cancel quest");
  return data;
};

export const acknowledgeQuestResult = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/quest/result/ack`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to acknowledge quest result");
  return data;
};

export const setPlayerClass = async (id, className) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ className }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to set class");
  return data;
};

export const setAccountClass = async (username, className) => {
  const res = await fetch(`${API_BASE_URL}/player/${username}/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ className }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to set class");
  return data;
};

export const deleteCharacter = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete player");
  return data;
 };

export const getInventory = async (characterId) => {
  const res = await fetch(
    `${API_BASE_URL}/api/characters/${characterId}/inventory`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load inventory");
  return data;
};

export const updateInventory = async (characterId, inventory) => {
  const res = await fetch(
    `${API_BASE_URL}/api/characters/${characterId}/inventory`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inventory }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update inventory");
  return data;
};

export const getItems = async () => {
  const res = await fetch("${API_BASE_URL}/items");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load items");
  return data;
};

export const addItemToInventory = async (characterId, itemId) => {
  const res = await fetch(
    `${API_BASE_URL}/api/characters/${characterId}/inventory/add`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add item");
  return data;
 };

export const buyItem = async (characterId, itemId) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${characterId}/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to buy item");
  return data;
};

export const forceRefreshShop = async (characterId) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${characterId}/shop/refresh`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to refresh shop");
  return data;
};

export const getShopItems = async (characterId, page = 1, limit = 8) => {
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(
    `${API_BASE_URL}/api/characters/${characterId}/shop?${params.toString()}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load shop items");
  return data;
};

export const sellItem = async (characterId, itemId) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${characterId}/sell`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to sell item");
  return data;
};

export const getEquipment = async (characterId) => {
  const res = await fetch(
    `${API_BASE_URL}/api/characters/${characterId}/equipment`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load equipment");
  return data;
};

export const equipItem = async (characterId, itemId) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${characterId}/equip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to equip item");
  return data;
 };

export const unequipItem = async (characterId, slot) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${characterId}/unequip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to unequip item");
  return data;
};

export const getHistory = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/history`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load history");
  return data;
};

export const getTowerStatus = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/tower/status`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load tower status");
  return data;
};

export const attemptTowerLevel = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/characters/${id}/tower/attempt`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to attempt tower level");
  return data;
};

export const getTowerLeaderboard = async (page = 1, limit = 10, charId) => {
  const params = new URLSearchParams({ page, limit });
  if (charId) params.append("charId", charId);
  const res = await fetch(
    `${API_BASE_URL}/api/leaderboard/tower?${params.toString()}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load leaderboard");
  return data;
  };

export const getArenaLeaderboard = async (page = 1, limit = 10, charId) => {
  const params = new URLSearchParams({ page, limit });
  if (charId) params.append("charId", charId);
  const res = await fetch(
    `${API_BASE_URL}/api/leaderboard/tower?${params.toString()}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load leaderboard");
  return data;
};

  export const getArenaProfile = async (id) => {
    const res = await fetch(`${API_BASE_URL}/arena/profile/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load arena profile");
    return data;
  };

export const startArenaMatch = async (id) => {
  const res = await fetch(`${API_BASE_URL}/arena/match/${id}`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to start match");
  return data;
};

export const getArenaOpponents = async (id) => {
  const res = await fetch(`${API_BASE_URL}/arena/opponents/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load opponents");
  return data;
};

export const refreshArenaOpponents = async (id) => {
  const res = await fetch(`${API_BASE_URL}/arena/opponents/${id}/refresh`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load opponents");
  return data;
};

export const challengeArenaOpponent = async (id, opponentId) => {
  const res = await fetch(
    `${API_BASE_URL}/arena/challenge/${id}/${opponentId}`,
    {
      method: "POST",
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to start match");
  return data;
};
