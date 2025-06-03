export const getXpForNextLevel = (level) => {
  return 100 + (level - 1) * 50;
};

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