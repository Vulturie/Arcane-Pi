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

export const getPlayerData = async (username) => {
  const res = await fetch(`http://localhost:4000/player/${username}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Failed to load player");
  return data;
};

export const rewardPlayer = async (username, reward) => {
  const res = await fetch(`http://localhost:4000/player/${username}/quest/complete`, {
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

export const updateEnergy = async (username, newEnergy) => {
  const res = await fetch(`http://localhost:4000/player/${username}/energy`, {
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

export const getQuestStatus = async (username) => {
  const res = await fetch(`http://localhost:4000/player/${username}/quest/status`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get quest status");
  return data;

};

export const cancelQuest = async (username) => {
  const res = await fetch(`http://localhost:4000/player/${username}/quest/cancel`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to cancel quest");
  return data;
};

export const setPlayerClass = async (username, className) => {
  const res = await fetch(`http://localhost:4000/player/${username}/class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ className }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to set class");
  return data;
};

export const deletePlayer = async (username) => {
  const res = await fetch(`http://localhost:4000/player/${username}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete player");
  return data;
};