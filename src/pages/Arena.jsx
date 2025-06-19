import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getArenaProfile,
  getArenaOpponents,
  refreshArenaOpponents,
  challengeArenaOpponent,
  getArenaLeaderboard,
} from "../services/playerService";

function Arena({ character, refreshCharacter }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [opponents, setOpponents] = useState([]);
  const [refreshRemaining, setRefreshRemaining] = useState(0);
  const [boardData, setBoardData] = useState({ results: [], total: 0, myRank: null });
  const [page, setPage] = useState(1);
  const [showOpponents, setShowOpponents] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getArenaProfile(character._id);
      setProfile(data);
      if (typeof data.refreshesRemaining === "number") {
        setRefreshRemaining(data.refreshesRemaining);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [character]);

  const loadOpponents = useCallback(async () => {
    if (!character) return;
    try {
      const data = await getArenaOpponents(character._id);
      setOpponents(data);
    } catch (err) {
      setError(err.message);
    }
  }, [character]);

  const loadLeaderboard = useCallback(
    async (p = page) => {
      if (!character) return;
      try {
        const data = await getArenaLeaderboard(p, 3, character._id);
        setBoardData(data);
        setPage(p);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      }
    },
    [character, page]
  );

  useEffect(() => {
    loadProfile();
    loadOpponents();
  }, [loadProfile, loadOpponents]);

  const handleChallenge = async (oppId) => {
    setSelectedOpponent(oppId);
    try {
      const data = await challengeArenaOpponent(character._id, oppId);
      setResult(data);
      await refreshCharacter();
      loadProfile();
      loadOpponents();
    } catch (err) {
      setError(err.message);
    } finally {
      setSelectedOpponent(null);
    }
  };

  const handleRefreshOpponents = async () => {
    if (refreshRemaining <= 0) return;
    try {
      const data = await refreshArenaOpponents(character._id);
      setOpponents(data.opponents);
      if (typeof data.refreshesRemaining === "number") {
        setRefreshRemaining(data.refreshesRemaining);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const classBadge = (cls) => `/assets/character_creation/${cls.toLowerCase()}_button.png`;

  return (
    <div className="relative w-screen h-screen font-[Cinzel] text-white overflow-hidden">
      <img
        src="/assets/arena/arena_background.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <img
        src="/assets/arena/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <img
        src="/assets/arena/arena_sign.png"
        alt="Arena"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] drop-shadow-md"
      />
      <img
        src="/assets/arena/gladiator.png"
        alt="Gladiator"
        className="absolute top-1/2 right-0 -translate-y-1/2 w-48 sm:w-64 md:w-80 cursor-pointer"
        onClick={() => setShowOpponents(true)}
      />
      <img
        src="/assets/arena/stats_button.png"
        alt="Stats"
        className="absolute bottom-4 left-4 w-20 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setShowStats(true)}
      />
      <img
        src="/assets/arena/leaderboard_button.png"
        alt="Leaderboard"
        className="absolute bottom-4 right-4 w-20 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          setShowLeaderboard(true);
          loadLeaderboard(1);
        }}
      />

      {showOpponents && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowOpponents(false)}
        >
          <div className="relative w-[760px] sm:w-[560px]" onClick={(e) => e.stopPropagation()}>
            <img src="/assets/arena/opponents_window.png" alt="Opponents" className="w-full h-auto" />
            <div className="absolute inset-0 pt-12 px-20 pb-6 text-lg sm:text-base flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <img src="/assets/arena/remaining_fights_icon_128.png" alt="Fights" className="w-10" />
                  <span className="font-bold">{profile?.fightsRemaining}</span>
                </div>
                <div className="flex items-center gap-1">
                  <img
                    src="/assets/arena/refresh_icon_128.png"
                    alt="Refresh"
                    className={`w-10 cursor-pointer ${refreshRemaining <= 0 ? "opacity-50" : "hover:scale-110"}`}
                    onClick={handleRefreshOpponents}
                  />
                  <span className="font-bold">{refreshRemaining}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {opponents.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-3 items-center text-center bg-black bg-opacity-30 rounded-md py-1"
                  >
                    <span className="col-span-1 truncate px-1">{o.name}</span>
                    <img src={classBadge(o.class)} alt={o.class} className="w-10 mx-auto" />
                    <div className="flex items-center justify-center gap-1">
                      <img src="/assets/arena/combat_score_icon_128.png" alt="CS" className="w-10" />
                      <span>{o.combatScore}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <img src="/assets/arena/mmr_icon_128.png" alt="MMR" className="w-10" />
                      <span>{o.mmr}</span>
                    </div>
                    <img
                      src="/assets/arena/fight_button_128.png"
                      alt="Fight"
                      className={`w-10 cursor-pointer ${profile?.fightsRemaining <= 0 ? "opacity-50" : "hover:scale-105"}`}
                      onClick={() => profile?.fightsRemaining > 0 && handleChallenge(o.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowStats(false)}
        >
          <div className="relative w-[760px] sm:w-[560px]" onClick={(e) => e.stopPropagation()}>
            <img src="/assets/arena/stats_window.png" alt="Stats" className="w-full h-auto" />
            <div className="absolute inset-0 pt-12 px-32 pb-6 text-xl sm:text-base flex flex-col">
              <div className="flex items-center gap-3"><img src="/assets/arena/wins_icon_128.png" alt="Wins" className="w-20"/><span className="flex-1 text-left">{profile?.wins}</span></div>
              <div className="flex items-center gap-3"><img src="/assets/arena/losses_icon_128.png" alt="Losses" className="w-20"/><span className="flex-1 text-left">{profile?.losses}</span></div>
              <div className="flex items-center gap-3"><img src="/assets/arena/combat_score_icon_128.png" alt="CS" className="w-20"/><span className="flex-1 text-left">{profile?.combatScore}</span></div>
              <div className="flex items-center gap-3"><img src="/assets/arena/mmr_icon_128.png" alt="MMR" className="w-20"/><span className="flex-1 text-left">{profile?.mmr}</span></div>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowLeaderboard(false)}
        >
          <div className="relative w-[760px] sm:w-[560px]" onClick={(e) => e.stopPropagation()}>
            <img src="/assets/arena/leaderboard_window.png" alt="Leaderboard" className="w-full h-auto" />
            <div className="absolute inset-0 pt-12 px-20 pb-6 text-sm sm:text-base flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <tbody>
                    {boardData.results.map((entry, idx) => {
                      const rank = (page - 1) * 3 + idx + 1;
                      const highlight = entry._id === character._id;
                      return (
                        <tr key={entry._id} className={`text-center ${highlight ? "text-yellow-300 font-bold" : ""}`}>
                          <td className="py-1">{rank}</td>
                          <td>{entry.name}</td>
                          <td><img src={classBadge(entry.class)} alt={entry.class} className="w-10 mx-auto" /></td>
                          <td className="flex items-center justify-center gap-1"><img src="/assets/arena/mmr_icon_128.png" alt="MMR" className="w-8"/><span>{entry.mmr}</span></td>
                        </tr>
                      );
                    })}
                    {boardData.myRank && boardData.myRank > page * 3 && (
                      <tr className="text-center text-yellow-300 font-bold">
                        <td>{boardData.myRank}</td>
                        <td>{character.name}</td>
                        <td><img src={classBadge(character.class)} alt={character.class} className="w-10 mx-auto" /></td>
                        <td className="flex items-center justify-center gap-1"><img src="/assets/arena/combat_score_icon_128.png" alt="CS" className="w-8"/><span>{profile?.combatScore}</span></td>
                        <td className="flex items-center justify-center gap-1"><img src="/assets/arena/mmr_icon_128.png" alt="MMR" className="w-8"/><span>{profile?.mmr}</span></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center items-center gap-4 mt-2">
                <button
                  className={`px-2 py-1 bg-gray-700 bg-opacity-60 rounded hover:bg-opacity-90 ${page === 1 ? "opacity-50 cursor-default" : ""}`}
                  onClick={() => loadLeaderboard(page - 1)}
                  disabled={page === 1}
                >
                  Prev
                </button>
                <span>Page {page}</span>
                <button
                  className={`px-2 py-1 bg-gray-700 bg-opacity-60 rounded hover:bg-opacity-90 ${page * 3 >= boardData.total ? "opacity-50 cursor-default" : ""}`}
                  onClick={() => loadLeaderboard(page + 1)}
                  disabled={page * 3 >= boardData.total}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setResult(null)}
        >
          <div className="bg-gray-800 p-4 rounded" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">{result.result === "win" ? "Victory" : "Defeat"}</h3>
            <p>Your MMR: {result.player.mmr}</p>
            <p>
              Your Score: {result.player.combatScore} vs {result.opponent.name}'s Score: {result.opponent.combatScore}
            </p>
            <ul className="text-xs list-disc pl-5 my-2 max-h-40 overflow-y-auto">
              {result.log.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <button className="mt-2 px-3 py-1 bg-gray-700 rounded" onClick={() => setResult(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {error && <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-500 drop-shadow-md">{error}</p>}
    </div>
  );
}

export default Arena;
