import React from 'react';
import './StatsBar.css';

const stats = [
  { num: '20+', label: 'Species Available' },
  { num: '15+', label: 'Years on the Water' },
  { num: '22lb', label: "Capt Drew's Personal Best" },
  { num: 'Small', label: 'Group Always' },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div className="stat-item" key={s.label}>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}