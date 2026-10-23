import React, { useState } from 'react';

export default function EmailButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="mailto:drewsbaitshack@gmail.com"
      title="Email Capt Drew"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 999,
        height: 56, paddingLeft: hovered ? 18 : 16, paddingRight: hovered ? 22 : 16,
        borderRadius: 28,
        background: '#1D9E75', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        gap: hovered ? 10 : 0,
        boxShadow: '0 4px 20px rgba(29,158,117,0.45)',
        textDecoration: 'none', color: '#fff',
        fontWeight: 700, fontSize: 14, letterSpacing: '0.05em',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap', overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>✉️</span>
      <span
        style={{
          maxWidth: hovered ? 200 : 0,
          opacity: hovered ? 1 : 0,
          transition: 'all 0.25s ease',
        }}
      >
        Email Drew
      </span>
    </a>
  );
}
