function generateEnemy(player) {
  const base = Math.floor(player.level * 0.8 + Math.random() * player.level * 0.4);
  return {
    name: "Goblin Raider",
    level: player.level,
    STR: base + Math.floor(Math.random() * 3),
    AGI: base + Math.floor(Math.random() * 3),
    INT: base + Math.floor(Math.random() * 2),
    VIT: base + Math.floor(Math.random() * 4),
  };
}

module.exports = { generateEnemy };