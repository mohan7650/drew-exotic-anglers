import React from 'react';
import './SponsorBar.css';

const sponsors = [
  'Livingston Lures',
  'Florida Fishing Products',
  'Kalua II',
  'Vens Lures',
];

export default function SponsorBar() {
  return (
    <div className="sponsor-bar">

      <span className="sponsor-label">
        Trusted Partners & Credentials
      </span>

      {/* MOST IMPORTANT */}
      <span className="sponsor-pill sponsor-orvis">
        10 Years Orvis Endorsed
      </span>

      {/* SECONDARY */}
      <span className="sponsor-pill sponsor-gold">
        🎖 U.S.C.G. Licensed Captain
      </span>

      {/* PARTNERS */}
      {sponsors.map((s) => (
        <span className="sponsor-pill" key={s}>
          {s}
        </span>
      ))}

    </div>
  );
}