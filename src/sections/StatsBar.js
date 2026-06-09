import React, { useEffect, useState } from 'react';
import { getStats } from '../services/heroService';
import './StatsBar.css';

export default function StatsBar() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getStats(true).then(setStats).catch(() => {});
  }, []);

  if (!stats.length) return null;

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div className="stat-item" key={s.id}>
          <div className="stat-num">{s.stat_number}</div>
          <div className="stat-label">{s.stat_label}</div>
        </div>
      ))}
    </div>
  );
}
