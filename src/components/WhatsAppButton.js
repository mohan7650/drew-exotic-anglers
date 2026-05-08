import React, { useState } from 'react';

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://wa.me/17863425791"
      target="_blank"
      rel="noopener noreferrer"
      title="Message Capt Drew on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 999,
        height: 56, paddingLeft: hovered ? 18 : 16, paddingRight: hovered ? 22 : 16,
        borderRadius: 28,
        background: '#25D366', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        gap: hovered ? 10 : 0,
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        textDecoration: 'none', color: '#fff',
        fontWeight: 700, fontSize: 14, letterSpacing: '0.05em',
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap', overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>💬</span>
      <span
        style={{
          maxWidth: hovered ? 200 : 0,
          opacity: hovered ? 1 : 0,
          transition: 'all 0.25s ease',
        }}
      >
        Message Drew
      </span>
    </a>
  );
}
