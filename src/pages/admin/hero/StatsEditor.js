import React, { useEffect, useRef, useState } from 'react';
import { saveStats, getStats } from '../../../services/heroService';

function withKey(item) {
  // Use a stable string key: DB id for persisted rows, random token for new ones.
  return {
    ...item,
    _key: item.id != null ? String(item.id) : `new-${Math.random().toString(36).slice(2)}`,
  };
}

export default function StatsEditor({ initialItems }) {
  const isHydrated = useRef(false);

  // Layer 1: lazy initializer — handles the happy path where initialItems is
  // already populated when this component first mounts (loading guard in parent).
  const [items, setItems] = useState(() => {
    if (initialItems.length > 0) {
      isHydrated.current = true;
      return initialItems.map(withKey);
    }
    return [];
  });

  const [deletedIds, setDeletedIds] = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [saved,      setSaved]      = useState(false);

  // Layer 2: effect fallback — handles any timing scenario where the lazy
  // initializer ran before initialItems arrived (StrictMode, async batching, etc.).
  useEffect(() => {
    if (!isHydrated.current && initialItems.length > 0) {
      isHydrated.current = true;
      setItems(initialItems.map(withKey));
    }
  }, [initialItems]); 
  // ── Mutations ──────────────────────────────────────────────────────────────

  function update(index, field, value) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }

  function move(index, dir) {
    const next = dir === 'up' ? index - 1 : index + 1;
    setItems(prev => {
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  }

  function remove(index) {
    const item = items[index];
    if (item.id) setDeletedIds(prev => [...prev, item.id]);
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems(prev => [...prev, withKey({
      id: null, stat_number: '', stat_label: '', sort_order: prev.length + 1, active: true,
    })]);
  }

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await saveStats(items, deletedIds);
      setDeletedIds([]);
      // Re-fetch to get fresh DB ids for any newly inserted rows,
      // so a second save correctly updates rather than re-inserts them.
      const fresh = await getStats();
      isHydrated.current = true;
      setItems(fresh.map(withKey));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="hap-editor">
      <div className="hap-editor-head">
        <span className="hap-editor-title">Stats Bar</span>
        <div className="hap-editor-meta">
          {error && <span className="hap-editor-err" role="alert">⚠ {error}</span>}
          {saved && <span className="hap-editor-ok" role="status">✓ Saved</span>}
          <button
            type="button"
            className="hap-btn-save-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Stats'}
          </button>
        </div>
      </div>

      <div className="hap-editor-list">
        {items.length === 0 && (
          <p className="hap-editor-empty">No stats yet — add one below.</p>
        )}
        {items.map((item, i) => (
          <div
            key={item._key}
            className={`hap-editor-row${item.active ? '' : ' hap-row--inactive'}`}
          >
            <div className="hap-reorder">
              <button
                type="button"
                className="hap-reorder-btn"
                onClick={() => move(i, 'up')}
                disabled={i === 0 || saving}
                aria-label="Move up"
              >▲</button>
              <button
                type="button"
                className="hap-reorder-btn"
                onClick={() => move(i, 'down')}
                disabled={i === items.length - 1 || saving}
                aria-label="Move down"
              >▼</button>
            </div>

            <button
              type="button"
              className={`hap-active-dot${item.active ? ' hap-active-dot--on' : ''}`}
              onClick={() => update(i, 'active', !item.active)}
              disabled={saving}
              title={item.active ? 'Visible — click to hide' : 'Hidden — click to show'}
              aria-label={item.active ? 'Deactivate' : 'Activate'}
            />

            <input
              className="hap-inline-input hap-inline-input--sm"
              value={item.stat_number ?? ''}
              onChange={e => update(i, 'stat_number', e.target.value)}
              placeholder="20+"
              disabled={saving}
              aria-label="Stat number"
            />
            <input
              className="hap-inline-input hap-inline-input--lg"
              value={item.stat_label ?? ''}
              onChange={e => update(i, 'stat_label', e.target.value)}
              placeholder="Species Available"
              disabled={saving}
              aria-label="Stat label"
            />

            <button
              type="button"
              className="hap-del-btn"
              onClick={() => remove(i)}
              disabled={saving}
              aria-label="Delete stat"
            >✕</button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="hap-add-btn"
        onClick={addItem}
        disabled={saving}
      >
        + Add Stat
      </button>
    </div>
  );
}
