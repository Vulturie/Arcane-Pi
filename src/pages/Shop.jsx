import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  buyItem,
  getEquipment,
  getShopItems,
  refreshShop,
  getPlayer,
} from "../services/playerService";
import logStat from "../utils/logStat";
import { RARITY_MULTIPLIER, getRarityLabel } from "../rarity";

function Shop({ character, refreshCharacter }) {
  const [preview, setPreview] = useState(null);
  const [shopItems, setShopItems] = useState([]);
  const [equipped, setEquipped] = useState({});
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [pie, setPie] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const getBonus = (item, stat) => {
    if (!item || !item.statBonus) return 0;
    const mult = RARITY_MULTIPLIER[item.rarity] || 1;
    const value = (item.statBonus[stat] || 0) * mult;
    return Math.round(value * 10) / 10;
  };

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
    refreshCharacter();
    loadEquipment();
  }, [refreshCharacter, loadEquipment]);

  useEffect(() => {
    loadEquipment();
  }, [character, loadEquipment]);

  useEffect(() => {
    const loadShop = async () => {
      if (!character) return;
      try {
        const data = await getShopItems(character._id);
        setShopItems(data.items);
      } catch (err) {
        console.error("Failed to load shop", err);
      }
    };
    loadShop();
  }, [character]);

  useEffect(() => {
    const loadPie = async () => {
      if (!character) return;
      try {
        const data = await getPlayer(character.owner);
        setPie(data.pie);
      } catch (err) {
        console.error("Failed to load pie", err);
      }
    };
    loadPie();
  }, [character]);

  const handleBuy = async (item) => {
    try {
      await buyItem(character._id, item.id);
      logStat({ type: 'ui_interaction', area: 'shop', button: 'buy', item: item.id });
      refreshCharacter();
      alert(`Bought ${item.name}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const data = await refreshShop(character._id);
      setShopItems(data.shopPool);
      setPie(data.pie);
    } catch (err) {
      alert(err.message);
    }
    setRefreshing(false);
  };

  const openPreview = (item) => {
    const compareItem = equipped[item.type];
    setPreview({ item, compareItem });
  };

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/assets/shop/shop_background.png)" }}
    >
      <img
        src="/assets/shop/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-12 h-12 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <img
        src="/assets/shop/shop_sign.png"
        alt="Shop"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[240px]"
      />
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1 text-white drop-shadow-md">
        <div className="flex items-center gap-1">
          <img src="/assets/shop/gold_icon.png" alt="Gold" className="w-6" />
          <span className="font-bold">{character.gold}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src="/assets/shop/pie_icon.png" alt="Pi" className="w-6" />
          <span className="font-bold">{pie}</span>
        </div>
      </div>

      <img
        src="/assets/shop/shopkeeper.png"
        alt="Shopkeeper"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] cursor-pointer"
        onClick={() => setIsWindowOpen((prev) => !prev)}
      />

      {isWindowOpen && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[500px] z-20">
          <img src="/assets/shop/shop_window.png" alt="Shop Window" className="w-full h-full" />
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-5 gap-2 p-4 pt-8 justify-items-center">
            {shopItems.map((it) => (
              <div key={it.id} className="relative w-24 h-24 cursor-pointer" onClick={() => openPreview(it)}>
                <img
                  src={`/assets/items/resized_128/${it.id}_128.png`}
                  alt={it.name}
                  className="absolute inset-3 w-[74%] h-[74%] object-contain"
                />
                <img
                  src={`/assets/borders/resized_128/border_${it.rarity}_128.png`}
                  alt="Border"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ))}
          </div>
          <img
            src="/assets/shop/refresh_button.png"
            alt="Refresh"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 cursor-pointer hover:scale-155 transition-all"
            onClick={handleRefresh}
            style={{ opacity: refreshing ? 0.5 : 1 }}
          />
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative w-[330px] h-[560px] scale-[1.25]"
            onClick={(e) => e.stopPropagation()}
          >
            <img src="/assets/shop/preview_window.png" alt="Preview" className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center text-white text-sm p-2 pt-8">
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
                <p className={`rarity-${preview.item.rarity} font-bold`}>{preview.item.name} ({getRarityLabel(preview.item.rarity)})</p>
                <p>Type: {preview.item.type}</p>
                {preview.item.classRestriction && (
                  <p className={
                    preview.item.classRestriction.includes(character.class)
                      ? "equip-allowed"
                      : "equip-denied"
                  }>
                    Classes: {preview.item.classRestriction.join(", ")}
                  </p>
                )}
                <p>Cost: {preview.item.cost} Gold</p>
                {preview.item.statBonus && (
                  <ul>
                    {Object.entries(preview.item.statBonus).map(([k]) => {
                      const value = getBonus(preview.item, k);
                      const current = getBonus(preview.compareItem, k);
                      const diff = value - current;
                      return (
                        <li key={k}>
                          {k}: +{value.toFixed(2)}
                          {preview.compareItem && diff !== 0 && (
                            <span className={diff > 0 ? "better" : "worse"}>
                              ({diff > 0 ? "+" : ""}{diff.toFixed(2)})
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
                            {k}: +0 <span className="worse">({-getBonus(preview.compareItem, k).toFixed(2)})</span>
                          </li>
                        ))}
                  </ul>
                )}
                {preview.compareItem && (
                  <>
                    <h4>Currently Equipped</h4>
                    <p className={`rarity-${preview.compareItem.rarity}`}>{preview.compareItem.name} ({getRarityLabel(preview.compareItem.rarity)})</p>
                    {preview.compareItem.statBonus && (
                      <ul>
                        {Object.entries(preview.compareItem.statBonus).map(([k]) => (
                          <li key={k}>{k}: +{getBonus(preview.compareItem, k).toFixed(2)}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
              <img
                src="/assets/shop/buy_button.png"
                alt="Buy"
                className="w-[135px] h-[75px] mt-2 cursor-pointer"
                onClick={() => handleBuy(preview.item)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;
