import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getXpForNextLevel } from "../services/playerService";
import styles from "./GameHub.module.css";

function getBackground() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20
    ? "/assets/game_hub/hub_day_background.png"
    : "/assets/game_hub/hub_night_background.png";
}

function GameHub({ character, refreshCharacter, username }) {
  const [background, setBackground] = useState(getBackground());
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const bgInterval = setInterval(() => setBackground(getBackground()), 60000);
    const refreshInterval = setInterval(() => refreshCharacter(), 5000);
    return () => {
      clearInterval(bgInterval);
      clearInterval(refreshInterval);
    };
  }, [refreshCharacter]);

  if (!character) return null;

  const portrait = `/assets/character_creation/${character.class.toLowerCase()}_${character.gender}.png`;
  const nextXp = getXpForNextLevel(character.level);
  const xpPercent = Math.min((character.xp / nextXp) * 100, 100);

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${background})` }}>
      <div className={styles.topFrame}>
        <Link to="/character">
          <img src={portrait} alt="Character" className={styles.portrait} />
        </Link>
        <div className={styles.topRight}>
          <div className={styles.name}>{character.name}</div>
          <div className={styles.stats}>
            <div className={styles.stat}><img src="/assets/game_hub/gold_icon.png" alt="Gold" /><span>{character.gold}</span></div>
            <div className={styles.stat}><img src="/assets/game_hub/pie_icon.png" alt="Pi" /><span>0</span></div>
            <div className={styles.stat}><img src="/assets/game_hub/level_icon.png" alt="Level" /><span>{character.level}</span></div>
            <div className={styles.stat}><img src="/assets/character/energy_icon.png" alt="Energy" /><span>{`${character.energy}/100`}</span></div>
          </div>
          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
            <div className={styles.xpText}>{`${character.xp} / ${nextXp} XP`}</div>
            <img src="/assets/game_hub/xp_bar.png" alt="XP" className={styles.xpImage} />
          </div>
        </div>
      </div>

      <div
        className={`${styles.bottomDrawer} ${drawerOpen ? styles.open : styles.closed}`}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <Link to="/tavern"><img src="/assets/game_hub/tavern_button.png" alt="Tavern" className={styles.icon} /></Link>
        <Link to="/inventory"><img src="/assets/game_hub/inventory_button.png" alt="Inventory" className={styles.icon} /></Link>
        <Link to="/arena"><img src="/assets/game_hub/arena_button.png" alt="Arena" className={styles.icon} /></Link>
        <Link to="/shop"><img src="/assets/game_hub/shop_button.png" alt="Shop" className={styles.icon} /></Link>
        <Link to="/tower"><img src="/assets/game_hub/tower_icon.png" alt="Tower" className={styles.icon} /></Link>
        <img src="/assets/game_hub/gate_icon.png" alt="Gate" className={styles.icon} />
        <Link to="/journal"><img src="/assets/game_hub/journal_button.png" alt="Journal" className={styles.icon} /></Link>
        <img src="/assets/game_hub/settings_icon.png" alt="Settings" className={styles.icon} />
      </div>
    </div>
  );
}

export default GameHub;
