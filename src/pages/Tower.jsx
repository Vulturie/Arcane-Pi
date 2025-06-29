import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTowerStatus,
  attemptTowerLevel,
  getTowerLeaderboard,
  buyTowerWins,
} from "../services/playerService";
import { getRarityLabel } from "../rarity";
import NotificationModal from "../components/NotificationModal";

function Tower({ character, refreshCharacter }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showGuardian, setShowGuardian] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [boardData, setBoardData] = useState({
    results: [],
    total: 0,
    myRank: null,
    lastUpdated: null,
  });
  const [page, setPage] = useState(1);
  const [buyingWins, setBuyingWins] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const loadStatus = useCallback(async () => {
    if (!character || character.level < 10) return;
    try {
      const data = await getTowerStatus(character._id);
      setStatus(data);
    } catch (err) {
      console.error("Failed to load tower status", err);
    }
  }, [character]);

  const loadLeaderboard = useCallback(
    async (p = page) => {
      if (!character) return;
      try {
        const data = await getTowerLeaderboard(p, 10, character._id);
        setBoardData(data);
        setPage(p);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      }
    },
    [character, page],
  );

  useEffect(() => {
    if (character.level >= 10) {
      loadStatus();
    }
  }, [character, loadStatus]);

  const handleFight = async () => {
    try {
      const data = await attemptTowerLevel(character._id);
      if (data.result === "win") {
        refreshCharacter();
      }
      setResult(data);
      loadStatus();
    } catch (err) {
      if (err.message.includes("Inventory full")) setError("Inventory full");
      else if (err.message.includes("Daily")) setLimitReached(true);
      else if (err.message.includes("locked")) setError(err.message);
      else console.error(err);
    }
  };

  const handleBuyWins = async () => {
    if (buyingWins) return;
    setBuyingWins(true);
    try {
      const data = await buyTowerWins(character._id);
      setStatus((prev) => ({ ...prev, victoriesRemaining: data.victoriesRemaining }));
    } catch (err) {
      setNotificationMessage(err.message);
      setShowNotification(true);
    }
    setBuyingWins(false);
  };

  if (character.level < 10) {
    return (
      <div className="relative w-screen h-screen font-['SS_Homero'] text-white overflow-hidden">
        <img
          src="/assets/tower/tower_background.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <img
          src="/assets/tower/back_button.png"
          alt="Back"
          className="absolute top-4 left-4 w-16 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-gray-800 p-4 rounded text-center border-4 border-yellow-600" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4">The Tower unlocks at level 10.</p>
            <button
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              onClick={() => navigate("/")}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!status) return <p>Loading...</p>;

  return (
    <div className="relative w-screen h-screen font-['SS_Homero'] text-white overflow-hidden">
      <img
        src="/assets/tower/tower_background.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <img
        src="/assets/tower/back_button.png"
        alt="Back"
        className="absolute top-4 left-4 w-16 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => navigate("/")}
      />
      <img
        src="/assets/tower/tower_sign.png"
        alt="The Tower"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[220px] drop-shadow-md"
      />
      <img
        src="/assets/tower/tower_keeper.png"
        alt="Tower Keeper"
        className="absolute bottom-20 left-0 w-52 sm:w-64 md:w-80 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          if (status.victoriesRemaining === 0) {
            setLimitReached(true);
          } else {
            setShowGuardian(true);
          }
        }}
      />
      <img
        src="/assets/tower/leaderboard_button.png"
        alt="Leaderboard"
        className="absolute bottom-4 right-4 w-20 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          setShowLeaderboard(true);
          loadLeaderboard(1);
        }}
      />
      {status.victoriesRemaining === 0 && (
        <img
          src="/assets/tower/more_fights_button.png"
          alt="More Wins"
          className="absolute bottom-4 left-4 w-24 cursor-pointer hover:scale-105 transition-transform"
          onClick={handleBuyWins}
          style={{ opacity: buyingWins ? 0.5 : 1 }}
        />
      )}

      {showGuardian && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowGuardian(false)}
        >
          <div
            className="relative w-[660px] sm:w-[620px]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/tower/tower_guardian.png"
              alt="Guardian"
              className="w-full h-auto"
            />
            <img
              src="/assets/tower/exit_button.png"
              alt="Close"
              className="absolute top-8 right-8 w-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowGuardian(false)}
            />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-outline text-xl">
              {status.nextLevel}
            </div>
            <img
              src="/assets/tower/fight_button.png"
              alt="Fight"
              className="absolute bottom-24 left-1/2 -translate-x-1/2 w-24 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                setShowGuardian(false);
                handleFight();
              }}
            />
            <div
              className="absolute flex items-center"
              style={{ bottom: "100px", left: "calc(50% + 70px)" }}
            >
              <img
                src="/assets/tower/remaining_wins_icon.png"
                alt="Wins Remaining"
                className="w-6 mr-1"
              />
              <span className="text-outline text-lg">
                {status.victoriesRemaining}/10
              </span>
            </div>
            <div className="absolute bottom-11 left-1/2 -translate-x-1/2 text-outline">
              Tower Guardian
            </div>
          </div>
        </div>
      )}

      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setResult(null)}
        >
          <div
            className="bg-gray-800 p-4 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-outline text-lg mb-2">
              {result.result === "win" ? "Victory" : "Defeat"}
            </h3>
            <ul className="text-xs list-disc pl-5 my-2 max-h-40 overflow-y-auto">
              {result.combat.log.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            {result.result === "win" && (
              <p>
                You received:{" "}
                <span className={`rarity-${result.reward.rarity}`}>
                  {result.reward.name} ({getRarityLabel(result.reward.rarity)})
                </span>
              </p>
            )}
            {result.result === "loss" && (
              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={() => {
                    setResult(null);
                    handleFight();
                  }}
                >
                  Retry
                </button>
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={() => setResult(null)}
                >
                  Quit
                </button>
              </div>
            )}
            {result.result === "win" && (
              <button
                className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                onClick={() => setResult(null)}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setShowLeaderboard(false)}
        >
          <div
            className="relative w-[680px] sm:w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/tower/leaderboard_window.png"
              alt="Leaderboard"
              className="w-full h-auto"
            />
            <img
              src="/assets/tower/exit_button.png"
              alt="Close"
              className="absolute top-6 right-12 w-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowLeaderboard(false)}
            />
            <div className="absolute inset-0 pt-36 px-20 pb-20 text-xs flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Max Floor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardData.results.map((entry, idx) => {
                      const rank = (page - 1) * 10 + idx + 1;
                      const highlight = entry._id === character._id;
                      return (
                        <tr
                          key={entry._id}
                          className={
                            highlight ? "text-yellow-300 font-bold" : ""
                          }
                        >
                          <td className="py-1">{rank}</td>
                          <td>{entry.name}</td>
                          <td>{entry.class}</td>
                          <td>{entry.towerProgress}</td>
                        </tr>
                      );
                    })}
                    {boardData.myRank && boardData.myRank > page * 10 && (
                      <tr className="text-yellow-300 font-bold">
                        <td>{boardData.myRank}</td>
                        <td>{character.name}</td>
                        <td>{character.class}</td>
                        <td>{character.towerProgress}</td>
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
                  className={`px-2 py-1 bg-gray-700 bg-opacity-60 rounded hover:bg-opacity-90 ${page * 10 >= boardData.total ? "opacity-50 cursor-default" : ""}`}
                  onClick={() => loadLeaderboard(page + 1)}
                  disabled={page * 10 >= boardData.total}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {limitReached && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setLimitReached(false)}
        >
          <div
            className="bg-gray-800 p-4 rounded text-center border-4 border-yellow-600"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4">
              You've reached the daily limit of 10 Tower victories. Try again
              tomorrow!
            </p>
            <button
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
              onClick={() => setLimitReached(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-500 drop-shadow-md">
          {error}
        </p>
      )}
      <NotificationModal
        message={notificationMessage}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
}

export default Tower;
