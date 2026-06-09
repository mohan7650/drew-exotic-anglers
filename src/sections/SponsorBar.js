import React, { useEffect, useState } from 'react';
import { getPartners } from '../services/heroService';
import './SponsorBar.css';

// Maps style_variant value → CSS modifier class added to sponsor-pill base
const PILL_MODIFIER = {
  gold:  'sponsor-pill--gold',
  light: 'sponsor-pill--light',
};

function pillClass(styleVariant) {
  const modifier = PILL_MODIFIER[styleVariant];
  return modifier ? `sponsor-pill ${modifier}` : 'sponsor-pill';
}

export default function SponsorBar() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    getPartners(true).then(setPartners).catch(() => {});
  }, []);

  if (!partners.length) return null;

  return (
    <div className="sponsor-bar">
      <span className="sponsor-label">Trusted Partners &amp; Credentials</span>
      {partners.map((p) => (
        <span key={p.id} className={pillClass(p.style_variant)}>
          {p.partner_text}
        </span>
      ))}
    </div>
  );
}
