const ITEMS = [
  { id: "sword_iron", name: "Iron Sword", type: "weapon", cost: 20, classRestriction: ["Warrior"], statBonus: { STR: 2 } },
  { id: "dagger_shadow", name: "Shadow Dagger", type: "weapon", cost: 25, classRestriction: ["Rogue", "Assassin"], statBonus: { AGI: 2 } },
  { id: "staff_apprentice", name: "Apprentice Staff", type: "weapon", cost: 20, classRestriction: ["Mage"], statBonus: { INT: 3 } },

  // Headpieces
  { id: "head_cloth_hood", name: "Cloth Hood", type: "headpiece", cost: 10, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "head_iron_helm", name: "Iron Helm", type: "headpiece", cost: 15, classRestriction: ["Warrior"], statBonus: { STR: 1 } },
  { id: "head_feather_cap", name: "Feathered Cap", type: "headpiece", cost: 12, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "head_mystic_circlet", name: "Mystic Circlet", type: "headpiece", cost: 18, classRestriction: ["Mage"], statBonus: { INT: 1 } },
  { id: "head_knight_visor", name: "Knight Visor", type: "headpiece", cost: 20, classRestriction: ["Warrior"], statBonus: { VIT: 1 } },
  { id: "head_leather_coif", name: "Leather Coif", type: "headpiece", cost: 14, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "head_battle_crown", name: "Battle Crown", type: "headpiece", cost: 22, classRestriction: null, statBonus: { STR: 2 } },
  { id: "head_crystal_tiara", name: "Crystal Tiara", type: "headpiece", cost: 25, classRestriction: ["Mage"], statBonus: { INT: 2 } },
  { id: "head_bone_mask", name: "Bone Mask", type: "headpiece", cost: 17, classRestriction: null, statBonus: { STR: 1 } },
  { id: "head_golden_helm", name: "Golden Helm", type: "headpiece", cost: 30, classRestriction: null, statBonus: { VIT: 2 } },

  // Chestplates
  { id: "chest_linen_tunic", name: "Linen Tunic", type: "chestplate", cost: 10, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "chest_chainmail_vest", name: "Chainmail Vest", type: "chestplate", cost: 15, classRestriction: ["Warrior"], statBonus: { STR: 1 } },
  { id: "chest_scale_armor", name: "Scale Armor", type: "chestplate", cost: 18, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "chest_mystic_robe", name: "Mystic Robe", type: "chestplate", cost: 20, classRestriction: ["Mage"], statBonus: { INT: 1 } },
  { id: "chest_iron_cuirass", name: "Iron Cuirass", type: "chestplate", cost: 22, classRestriction: ["Warrior"], statBonus: { STR: 2 } },
  { id: "chest_leather_jerkin", name: "Leather Jerkin", type: "chestplate", cost: 14, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "chest_battle_plate", name: "Battle Plate", type: "chestplate", cost: 25, classRestriction: ["Warrior"], statBonus: { STR: 2 } },
  { id: "chest_crystal_cuirass", name: "Crystal Cuirass", type: "chestplate", cost: 28, classRestriction: ["Mage"], statBonus: { INT: 2 } },
  { id: "chest_bone_guard", name: "Bone Chestguard", type: "chestplate", cost: 17, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "chest_golden_plate", name: "Golden Chestplate", type: "chestplate", cost: 30, classRestriction: null, statBonus: { VIT: 2 } },

  // Gloves
  { id: "glove_cloth", name: "Cloth Gloves", type: "gloves", cost: 8, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "glove_leather_mitts", name: "Leather Mitts", type: "gloves", cost: 10, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "glove_iron_gauntlets", name: "Iron Gauntlets", type: "gloves", cost: 15, classRestriction: ["Warrior"], statBonus: { STR: 1 } },
  { id: "glove_thief", name: "Thief Gloves", type: "gloves", cost: 12, classRestriction: ["Rogue"], statBonus: { AGI: 1 } },
  { id: "glove_mystic", name: "Mystic Handwraps", type: "gloves", cost: 18, classRestriction: ["Mage"], statBonus: { INT: 1 } },
  { id: "glove_battle", name: "Battle Fists", type: "gloves", cost: 20, classRestriction: ["Warrior"], statBonus: { STR: 2 } },
  { id: "glove_crystal", name: "Crystal Grips", type: "gloves", cost: 22, classRestriction: ["Mage"], statBonus: { INT: 2 } },
  { id: "glove_bone", name: "Bone Claws", type: "gloves", cost: 16, classRestriction: null, statBonus: { STR: 1 } },
  { id: "glove_silk", name: "Silk Gloves", type: "gloves", cost: 14, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "glove_golden", name: "Golden Gauntlets", type: "gloves", cost: 25, classRestriction: null, statBonus: { STR: 2 } },

  // Footwear
  { id: "foot_cloth", name: "Cloth Boots", type: "footwear", cost: 8, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "foot_leather", name: "Leather Boots", type: "footwear", cost: 10, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "foot_iron", name: "Iron Greaves", type: "footwear", cost: 15, classRestriction: ["Warrior"], statBonus: { VIT: 1 } },
  { id: "foot_sandals", name: "Swift Sandals", type: "footwear", cost: 12, classRestriction: ["Rogue"], statBonus: { AGI: 1 } },
  { id: "foot_mystic", name: "Mystic Shoes", type: "footwear", cost: 18, classRestriction: ["Mage"], statBonus: { INT: 1 } },
  { id: "foot_battle", name: "Battle Boots", type: "footwear", cost: 20, classRestriction: ["Warrior"], statBonus: { STR: 1 } },
  { id: "foot_crystal", name: "Crystal Sabatons", type: "footwear", cost: 22, classRestriction: ["Mage"], statBonus: { INT: 2 } },
  { id: "foot_bone", name: "Bone Stompers", type: "footwear", cost: 16, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "foot_feather", name: "Feather Boots", type: "footwear", cost: 14, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "foot_golden", name: "Golden Boots", type: "footwear", cost: 25, classRestriction: null, statBonus: { VIT: 2 } },

  // Necklaces
  { id: "neck_copper", name: "Copper Necklace", type: "necklace", cost: 8, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "neck_silver", name: "Silver Locket", type: "necklace", cost: 10, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "neck_emerald", name: "Emerald Pendant", type: "necklace", cost: 15, classRestriction: null, statBonus: { INT: 1 } },
  { id: "neck_sapphire", name: "Sapphire Charm", type: "necklace", cost: 18, classRestriction: null, statBonus: { INT: 1 } },
  { id: "neck_rune", name: "Rune Necklace", type: "necklace", cost: 20, classRestriction: null, statBonus: { STR: 1 } },
  { id: "neck_bone", name: "Bone Amulet", type: "necklace", cost: 16, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "neck_crystal", name: "Crystal Chain", type: "necklace", cost: 22, classRestriction: null, statBonus: { INT: 2 } },
  { id: "neck_dragon", name: "Dragon Tooth Collar", type: "necklace", cost: 24, classRestriction: null, statBonus: { STR: 2 } },
  { id: "neck_gold", name: "Golden Choker", type: "necklace", cost: 25, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "neck_phoenix", name: "Phoenix Talisman", type: "necklace", cost: 28, classRestriction: null, statBonus: { VIT: 2 } },

  // Belts
  { id: "belt_rope", name: "Rope Belt", type: "belt", cost: 8, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "belt_leather", name: "Leather Belt", type: "belt", cost: 10, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "belt_iron", name: "Iron Buckle", type: "belt", cost: 15, classRestriction: ["Warrior"], statBonus: { STR: 1 } },
  { id: "belt_studded", name: "Studded Belt", type: "belt", cost: 18, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "belt_mystic", name: "Mystic Sash", type: "belt", cost: 20, classRestriction: ["Mage"], statBonus: { INT: 1 } },
  { id: "belt_bone", name: "Bone Girdle", type: "belt", cost: 16, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "belt_battle", name: "Battle Strap", type: "belt", cost: 22, classRestriction: ["Warrior"], statBonus: { STR: 2 } },
  { id: "belt_crystal", name: "Crystal Belt", type: "belt", cost: 24, classRestriction: ["Mage"], statBonus: { INT: 2 } },
  { id: "belt_dragon", name: "Dragon Scale Belt", type: "belt", cost: 26, classRestriction: null, statBonus: { VIT: 2 } },
  { id: "belt_golden", name: "Golden Girdle", type: "belt", cost: 30, classRestriction: null, statBonus: { STR: 2 } },

  // Rings
  { id: "ring_copper", name: "Copper Ring", type: "ring", cost: 8, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "ring_silver", name: "Silver Band", type: "ring", cost: 10, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "ring_emerald", name: "Emerald Ring", type: "ring", cost: 15, classRestriction: null, statBonus: { INT: 1 } },
  { id: "ring_sapphire", name: "Sapphire Ring", type: "ring", cost: 18, classRestriction: null, statBonus: { INT: 1 } },
  { id: "ring_rune", name: "Rune Ring", type: "ring", cost: 20, classRestriction: null, statBonus: { STR: 1 } },
  { id: "ring_bone", name: "Bone Loop", type: "ring", cost: 16, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "ring_crystal", name: "Crystal Band", type: "ring", cost: 22, classRestriction: null, statBonus: { INT: 2 } },
  { id: "ring_dragon", name: "Dragon Claw Ring", type: "ring", cost: 24, classRestriction: null, statBonus: { STR: 2 } },
  { id: "ring_gold", name: "Golden Ring", type: "ring", cost: 25, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "ring_phoenix", name: "Phoenix Signet", type: "ring", cost: 28, classRestriction: null, statBonus: { VIT: 2 } },

  // Artifacts
  { id: "art_broken_talisman", name: "Broken Talisman", type: "artifact", cost: 12, classRestriction: null, statBonus: { STR: 1 } },
  { id: "art_ancient_relic", name: "Ancient Relic", type: "artifact", cost: 15, classRestriction: null, statBonus: { INT: 1 } },
  { id: "art_mystic_orb", name: "Mystic Orb", type: "artifact", cost: 20, classRestriction: ["Mage"], statBonus: { INT: 2 } },
  { id: "art_cursed_idol", name: "Cursed Idol", type: "artifact", cost: 22, classRestriction: null, statBonus: { VIT: 1 } },
  { id: "art_dragon_eye", name: "Dragon Eye", type: "artifact", cost: 25, classRestriction: null, statBonus: { STR: 2 } },
  { id: "art_crystal_skull", name: "Crystal Skull", type: "artifact", cost: 27, classRestriction: null, statBonus: { INT: 2 } },
  { id: "art_phoenix_feather", name: "Phoenix Feather", type: "artifact", cost: 30, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "art_demon_horn", name: "Demon Horn", type: "artifact", cost: 32, classRestriction: null, statBonus: { STR: 1 } },
  { id: "art_timeworn_compass", name: "Timeworn Compass", type: "artifact", cost: 34, classRestriction: null, statBonus: { AGI: 1 } },
  { id: "art_golden_idol", name: "Golden Idol", type: "artifact", cost: 35, classRestriction: null, statBonus: { VIT: 2 } },
];

export default ITEMS;