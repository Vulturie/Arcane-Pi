export const RARITY_MULTIPLIER = {
  common: 1,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
};

export const RARITY_COLORS = {
  common: 'gray',
  uncommon: 'green',
  rare: 'blue',
  epic: 'purple',
  legendary: 'orange',
};

export function getRarityLabel(rarity) {
  return rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : 'Common';
}
