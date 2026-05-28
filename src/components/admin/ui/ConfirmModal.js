import React, { useEffect } from 'react';
import './ConfirmModal.css';

/**
 * Accessible confirmation dialog (no portal dependency).
 * Traps focus and responds to Escape key.
 *
 * Props:
 *   open       {boolean}
 *   title      {string}
 *   message    {string}
 *   confirmLabel {string?}  - defaults to 'Delete'
 *   onConfirm  {function}
 *   onCancel   {function}
 *   danger     {boolean?}   - red confirm button when true
 *   loading    {boolean?}
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  danger = true,
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="cm-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cm-title"
    >
      <div className="cm-panel">
        <h2 id="cm-title" className="cm-title">{title}</h2>
        <p className="cm-message">{message}</p>

        <div className="cm-actions">
          <button className="cm-cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`cm-confirm${danger ? ' cm-confirm--danger' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
