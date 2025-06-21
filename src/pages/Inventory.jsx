import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInventory,
  getEquipment,
  equipItem,
  unequipItem,
  sellItem,
  getStatsForClass,
  getXpForNextLevel,
} from "../services/playerService";
import { RARITY_MULTIPLIER, getRarityLabel } from "../rarity";
import logStat from "../utils/logStat";

function Inventory({ character, refreshCharacter }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [preview, setPreview] = useState(null);
  const [showItems, setShowItems] = useState(false);

  const getBonus = (item, stat) => {
    if (!item || !item.statBonus) return 0;
    const mult = RARITY_MULTIPLIER[item.rarity] || 1;
    return Math.round((item.statBonus[stat] || 0) * mult * 10) / 10;
  };

  const loadInventory = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getInventory(character._id);
      const inv = data.inventory.slice(0, 10);
      setItems(inv);
    } catch (err) {
      console.error("Failed to load inventory", err);
    }
  }, [character]);

  const loadEquipment = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getEquipment(character._id);
      setEquipped(data);
    } catch (err) {
      console.error("Failed to load equipment", err);
    }
  }, [character]);

  useEffect(() => {
    loadInventory();
    loadEquipment();
  }, [loadInventory, loadEquipment]);

  const handleEquip = async (itemId) => {
    const item = items.find((it) => it.id === itemId);
    if (!item) {
      alert("This item is no longer available to equip.");
      setPreview(null);
      return;
    }
    try {
      await equipItem(character._id, itemId);
      loadInventory();
      loadEquipment();
      setPreview(null);
    } catch (err) {
      console.error("Failed to equip item", err);
      alert(err.message);
    }
  };

  const handleUnequip = async (slot) => {
    try {
      await unequipItem(character._id, slot);
      loadInventory();
      loadEquipment();
      setPreview(null);
    } catch (err) {
      console.error("Failed to unequip item", err);
    }
  };

  const handleSell = async (itemId) => {
    const item = items.find((it) => it.id === itemId);
    if (!item) {
      alert("This item is no longer available to sell.");
      setPreview(null);
      return;
    }
    try {
      await sellItem(character._id, itemId);
      logStat({
        type: "ui_interaction",
        area: "inventory",
        button: "sell",
        item: itemId,
      });
      loadInventory();
      loadEquipment();
      if (refreshCharacter) refreshCharacter();
      setPreview(null);
    } catch (err) {
      console.error("Failed to sell item", err);
    }
  };

  const openPreview = (item, source = "inventory") => {
    if (source === "inventory" && !items.find((i) => i.id === item.id)) {
      console.warn("Attempted to preview an item not in inventory");
      return;
    }
    const compareItem = source === "inventory" ? equipped[item.type] : null;
    setPreview({ item, compareItem, source });
  };

  if (!character) return null;

  const portrait = `/assets/character_creation/${character.class.toLowerCase()}_${character.gender}.png`;
  const nextXp = getXpForNextLevel(character.level);
  const xpPercent = Math.min((character.xp / nextXp) * 100, 100);

  const leftSlots = ["headpiece", "chestplate", "gloves", "footwear"];
  const rightSlots = ["belt", "necklace", "ring", "artifact"];

  const displayItems = items.slice(0, 10);

  const stats = (() => {
    const base = getStatsForClass(character.class, character.level);
    if (base) {
      Object.values(equipped).forEach((it) => {
        if (it && it.statBonus) {
          Object.keys(it.statBonus).forEach((k) => {
            base[k] = (base[k] || 0) + getBonus(it, k);
          });
        }
      });
    }
    return base;
  })();

  const renderSlot = (slot) => {
    const item = equipped[slot];
    return (
      <div
        key={slot}
        className="relative w-16 h-16 cursor-pointer"
        onClick={() => item && openPreview(item, "equipped")}
      >
        {item && (
          <>
            <img
              src={`/assets/items/resized_128/${item.id}_128.png`}
              alt={item.name}
              className="absolute inset-2 w-[80%] h-[80%] object-contain"
            />
            <img
              src={`/assets/borders/resized_128/border_${item.rarity}_128.png`}
              alt="Border"
              className="absolute inset-0 w-full h-full"
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen font-['SS_Homero'] text-white overflow-hidden">
      <img
        src="/assets/inventory/inventory_background.png"
        alt="Background"
        className="fixed inset-0 w-full h-full object-contain object-center"
      />
      <img
        src="/assets/inventory/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-10 h-10 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="absolute left-1/2 top-[28.55%] -translate-x-1/2 -translate-y-1/2 relative flex items-start justify-center gap-2">
        <div className="absolute left-[15px] top-[-36px] flex flex-col gap-3.5">
          {leftSlots.map(renderSlot)}
        </div>
        <div className="absolute right-[15px] top-[-36px] flex flex-col gap-3.5">
          {rightSlots.map(renderSlot)}
        </div>
        <div className="flex flex-col items-center">
          <img
            src={portrait}
            alt="Character"
            className="w-32 h-auto drop-shadow-md"
          />
          <div className="mt-2 text-lg text-outline">{character.name}</div>
          <div
            className="relative w-16 h-16 mt-5 mb-2 cursor-pointer"
            onClick={() =>
              equipped.weapon && openPreview(equipped.weapon, "equipped")
            }
          >
            {equipped.weapon && (
              <>
                <img
                  src={`/assets/items/resized_128/${equipped.weapon.id}_128.png`}
                  alt={equipped.weapon.name}
                  className="absolute inset-2 w-[80%] h-[80%] object-contain"
                />
                <img
                  src={`/assets/borders/resized_128/border_${equipped.weapon.rarity}_128.png`}
                  alt="Border"
                  className="absolute inset-0 w-full h-full"
                />
              </>
            )}
          </div>
          <div className="w-full max-w-[300px] h-10 mt-5 relative rounded-xl overflow-hidden mb-1">
            <img
              src="/assets/game_hub/xp_bar.png"
              alt="XP"
              className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
            />
            <div className="absolute inset-3 z-0 overflow-hidden rounded-xl">
              <div
                className="h-full bg-gradient-to-r from-[#ffcf33] to-[#ffe884]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-20 text-outline text-sm">
              {`${character.xp} / ${nextXp} XP`}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <img
          src="/assets/inventory/items_button.png"
          alt="Items"
          className="w-20 cursor-pointer mb-56"
          onClick={() => setShowItems((p) => !p)}
        />
        <div className="relative w-[160px] h-[160px]">
          <img
            src="/assets/inventory/stats_table.png"
            alt="Stats"
            className="w-full h-full"
          />
          {stats && (
            <>
              <div className="absolute w-[35%] left-[16px] top-[22px] flex justify-between items-center px-4 text-lg font-bold drop-shadow-md">
                <span>STR</span>
                <span className="text-yellow-300 min-w-[60px] text-right">
                  {stats.STR.toFixed(2)}
                </span>
              </div>
              <div className="absolute w-[35%] left-[16px] top-[52px] flex justify-between items-center px-4 text-lg font-bold drop-shadow-md">
                <span>AGI</span>
                <span className="text-yellow-300 min-w-[60px] text-right">
                  {stats.AGI.toFixed(2)}
                </span>
              </div>
              <div className="absolute w-[35%] left-[16px] top-[82px] flex justify-between items-center px-4 text-lg font-bold drop-shadow-md">
                <span>INT</span>
                <span className="text-yellow-300 min-w-[60px] text-right">
                  {stats.INT.toFixed(2)}
                </span>
              </div>
              <div className="absolute w-[35%] left-[16px] top-[112px] flex justify-between items-center px-4 text-lg font-bold drop-shadow-md">
                <span>VIT</span>
                <span className="text-yellow-300 min-w-[60px] text-right">
                  {stats.VIT.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {showItems && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setShowItems(false)}
        >
          <div
            className="relative w-[360px]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/inventory/items_window.png"
              alt="Items"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-5 gap-15 p-16 pt-16 justify-items-center items-start">
              {displayItems.map((it) => (
                <div
                  key={it.id}
                  className="relative w-16 h-16 cursor-pointer"
                  onClick={() => openPreview(it, "inventory")}
                >
                  <img
                    src={`/assets/items/resized_128/${it.id}_128.png`}
                    alt={it.name}
                    className="absolute inset-2 w-[80%] h-[80%] object-contain"
                  />
                  <img
                    src={`/assets/borders/resized_128/border_${it.rarity}_128.png`}
                    alt="Border"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-[330px] h-[560px] scale-[1.25]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/inventory/preview_window.png"
              alt="Preview"
              className="w-full h-full"
            />
            <div className="absolute inset-0 flex flex-col items-center text-white text-sm p-4 pt-10">
              <div className="relative w-[256px] h-[256px] mx-auto">
                <img
                  src={`/assets/items/resized_256/${preview.item.id}_256.png`}
                  alt={preview.item.name}
                  className="absolute inset-16 w-[46%] h-[46%] mt-16 ml-3"
                />
                <img
                  src={`/assets/borders/resized_256/border_${preview.item.rarity}_256.png`}
                  alt="Border"
                  className="absolute inset-14 w-[60%] h-[60%] mt-14"
                />
              </div>
              <div className="flex-1 overflow-y-auto w-full text-center mt-2">
                <p className={`rarity-${preview.item.rarity} font-bold`}>
                  {preview.item.name} ({getRarityLabel(preview.item.rarity)})
                </p>
                <p>Type: {preview.item.type}</p>
                {preview.item.classRestriction && (
                  <p>
                    Classes:
                    {" "}
                    {preview.item.classRestriction.map((cls, i) => (
                      <span
                        key={cls}
                        className={
                          cls === character.class ? "equip-allowed" : "equip-denied"
                        }
                      >
                        {cls}
                        {i < preview.item.classRestriction.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                )}
                {preview.item.statBonus && (
                  <ul>
                    {Object.entries(preview.item.statBonus).map(([k]) => {
                      const value = getBonus(preview.item, k);
                      const current = getBonus(preview.compareItem, k);
                      const diff = value - current;
                      return (
                        <li key={k}>
                          {k}: +{value.toFixed(2)}
                          {preview.compareItem && (
                            <span
                              className={
                                diff > 0 ? "better" : diff < 0 ? "worse" : "neutral"
                              }
                            >
                              ({diff > 0 ? "+" : ""}
                              {diff.toFixed(2)})
                            </span>
                          )}
                        </li>
                      );
                    })}
                    {preview.compareItem &&
                      Object.entries(preview.compareItem.statBonus || {})
                        .filter(([k]) => !(preview.item.statBonus || {})[k])
                        .map(([k]) => (
                          <li key={k}>
                            {k}: +0{" "}
                            <span className="worse">
                              ({-getBonus(preview.compareItem, k).toFixed(2)})
                            </span>
                          </li>
                        ))}
                  </ul>
                )}
                {preview.compareItem && (
                  <>
                    <h4>Currently Equipped</h4>
                    <p className={`rarity-${preview.compareItem.rarity}`}>
                      {preview.compareItem.name} (
                      {getRarityLabel(preview.compareItem.rarity)})
                    </p>
                    {preview.compareItem.statBonus && (
                      <ul>
                        {Object.entries(preview.compareItem.statBonus).map(
                          ([k]) => (
                            <li key={k}>
                              {k}: +{getBonus(preview.compareItem, k).toFixed(2)}
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </>
                )}
              </div>
              {preview.source === "equipped" ? (
                <img
                  src="/assets/inventory/unequip_button.png"
                  alt="Unequip"
                  className="w-[135px] h-[75px] mt-2 cursor-pointer"
                  onClick={() => handleUnequip(preview.item.type)}
                />
              ) : (
                <>
                  {preview.item.type && (
                    <img
                      src="/assets/inventory/equip_button.png"
                      alt="Equip"
                      className="w-[135px] h-[75px] mt-2 cursor-pointer"
                      onClick={() => handleEquip(preview.item.id)}
                    />
                  )}
                  <img
                    src="/assets/inventory/sell_button.png"
                    alt="Sell"
                    className="w-[135px] h-[75px] mt-2 cursor-pointer"
                    onClick={() => handleSell(preview.item.id)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
