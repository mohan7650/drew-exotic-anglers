import React from 'react';
import './StatsBar.css';

const stats = [
  { num: '696',  label: 'Fish in One Week' },
  { num: '22lb', label: "Capt Drew's Personal Best" },
  { num: '240mi',label: 'Exclusive Private River' },
  { num: '8',    label: 'Anglers Max — Ever' },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      {stats.map(s => (
        <div className="stat-item" key={s.label}>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
