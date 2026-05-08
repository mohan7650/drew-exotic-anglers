import React from 'react';

export default function SectionTag({ children, center }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
      textTransform: 'uppercase', color: 'var(--teal-bright)',
      marginBottom: 16, display: 'flex', alignItems: 'center',
      gap: 10, justifyContent: center ? 'center' : 'flex-start'
    }}>
      {children}
      <span style={{ flex: 1, maxWidth: 48, height: 1, background: 'var(--teal-bright)' }} />
    </div>
  );
}
