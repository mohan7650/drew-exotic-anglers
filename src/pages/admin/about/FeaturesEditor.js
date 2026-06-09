import React, { useEffect, useRef, useState } from 'react';
import { saveFeatures, getFeatures } from '../../../services/aboutService';

function withKey(item) {
  return {
    ...item,
    _key: item.id != null ? String(item.id) : `new-${Math.random().toString(36).slice(2)}`,
  };
}

export default function FeaturesEditor({ initialItems }) {
  const isHydrated = useRef(false);

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

  useEffect(() => {
    if (!isHydrated.current && initialItems.length > 0) {
      isHydrated.current = true;
      setItems(initialItems.map(withKey));
    }
  }, [initialItems]); // eslint-disable-line react-hooks/exhaustive-deps

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
      id: null, icon: '', feature_text: '', sort_order: prev.length + 1, active: true,
    })]);
  }

  async function handleSave() {
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await saveFeatures(items, deletedIds);
      setDeletedIds([]);
      const fresh = await getFeatures();
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

  return (
    <div className="hap-editor">
      <div className="hap-editor-head">
        <span className="hap-editor-title">About Features</span>
        <div className="hap-editor-meta">
          {error && <span className="hap-editor-err" role="alert">⚠ {error}</span>}
          {saved && <span className="hap-editor-ok" role="status">✓ Saved</span>}
          <button
            type="button"
            className="hap-btn-save-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Features'}
          </button>
        </div>
      </div>

      <div className="hap-editor-list">
        {items.length === 0 && (
          <p className="hap-editor-empty">No features yet — add one below.</p>
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
              className="hap-inline-input feat-input--icon"
              value={item.icon ?? ''}
              onChange={e => update(i, 'icon', e.target.value)}
              placeholder="🏆"
              disabled={saving}
              aria-label="Icon emoji"
            />
            <input
              className="hap-inline-input hap-inline-input--lg"
              value={item.feature_text ?? ''}
              onChange={e => update(i, 'feature_text', e.target.value)}
              placeholder="Feature description…"
              disabled={saving}
              aria-label="Feature text"
            />

            <button
              type="button"
              className="hap-del-btn"
              onClick={() => remove(i)}
              disabled={saving}
              aria-label="Delete feature"
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
        + Add Feature
      </button>
    </div>
  );
}
