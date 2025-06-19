import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

function Bar({ value, max }) {
  const width = max ? (value / max) * 100 : 0;
  return <div className="bg-blue-600 h-3" style={{ width: `${width}%` }} />;
}

export default function DevDashboard() {
  const [data, setData] = useState(null);
  const token = new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dev/dashboard?token=${token}`);
        const d = await res.json();
        if (res.ok) setData(d);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [token]);

  if (!data) return <div className="p-4 text-center">Loading...</div>;

  const maxQuest = Math.max(...data.topQuests.map(q => q.count), 1);
  const maxEnemy = Math.max(...data.failedEnemies.map(e => e.fails), 1);

  return (
    <div className="p-4 space-y-8 text-sm">
      <h2 className="text-xl font-bold">Developer Dashboard</h2>

      <div>
        <h3 className="font-semibold mb-2">Top Quests</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr><th className="p-1">Quest</th><th className="p-1">Attempts</th></tr>
          </thead>
          <tbody>
            {data.topQuests.map(q => (
              <tr key={q.questName} className="border-t">
                <td className="p-1">{q.questName}</td>
                <td className="p-1 w-40">
                  <Bar value={q.count} max={maxQuest} />
                  <div>{q.count}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Failed Enemies</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr><th className="p-1">Enemy</th><th className="p-1">Fails</th></tr>
          </thead>
          <tbody>
            {data.failedEnemies.map(e => (
              <tr key={e.enemy} className="border-t">
                <td className="p-1">{e.enemy}</td>
                <td className="p-1 w-40">
                  <Bar value={e.fails} max={maxEnemy} />
                  <div>{e.fails}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Class Win Rates</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr><th className="p-1">Class</th><th className="p-1">Level</th><th className="p-1">Win Rate</th></tr>
          </thead>
          <tbody>
            {data.classWinRates.map(r => (
              <tr key={`${r.class}-${r.level}`} className="border-t">
                <td className="p-1">{r.class}</td>
                <td className="p-1">{r.level}</td>
                <td className="p-1">{(r.winRate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-semibold mb-2">XP / Gold Inflation</h3>
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr><th className="p-1">Level</th><th className="p-1">Avg XP</th><th className="p-1">Avg Gold</th></tr>
          </thead>
          <tbody>
            {data.rewardInflation.map(r => (
              <tr key={r.level} className="border-t">
                <td className="p-1">{r.level}</td>
                <td className="p-1">{r.avgXp.toFixed(1)}</td>
                <td className="p-1">{r.avgGold.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}