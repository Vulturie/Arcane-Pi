const ITEMS = [
  {
    id: "sword_iron",
    name: "Iron Sword",
    type: "weapon",
    cost: 20,
    classRestriction: ["Warrior"],
    statBonus: { STR: 2 },
  },
  {
    id: "dagger_shadow",
    name: "Shadow Dagger",
    type: "weapon",
    cost: 25,
    classRestriction: ["Rogue", "Assassin"],
    statBonus: { AGI: 2 },
  },
  {
    id: "staff_apprentice",
    name: "Apprentice Staff",
    type: "weapon",
    cost: 20,
    classRestriction: ["Mage"],
    statBonus: { INT: 3 },
  },
  {
    id: "armor_leather",
    name: "Leather Armor",
    type: "armor",
    cost: 15,
    classRestriction: null,
    statBonus: { VIT: 2 },
  },
  {
    id: "ring_luck",
    name: "Lucky Ring",
    type: "accessory",
    cost: 10,
    classRestriction: null,
    statBonus: { AGI: 1 },
  },
];

export default ITEMS;