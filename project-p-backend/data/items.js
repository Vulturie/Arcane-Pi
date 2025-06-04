const ITEMS = [
  {
    id: "sword_iron",
    name: "Iron Sword",
    type: "weapon",
    classRestriction: ["Warrior"],
    statBonus: { STR: 2 },
  },
  {
    id: "dagger_shadow",
    name: "Shadow Dagger",
    type: "weapon",
    classRestriction: ["Rogue", "Assassin"],
    statBonus: { AGI: 2 },
  },
  {
    id: "staff_apprentice",
    name: "Apprentice Staff",
    type: "weapon",
    classRestriction: ["Mage"],
    statBonus: { INT: 3 },
  },
  {
    id: "armor_leather",
    name: "Leather Armor",
    type: "armor",
    classRestriction: null,
    statBonus: { VIT: 2 },
  },
  {
    id: "ring_luck",
    name: "Lucky Ring",
    type: "accessory",
    classRestriction: null,
    statBonus: { AGI: 1 },
  },
];

module.exports = ITEMS;