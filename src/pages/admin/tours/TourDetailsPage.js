import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import { getTour } from '../../../services/toursService';
import {
  listTourDetails,
  createTourDetail,
  updateTourDetail,
  deleteTourDetail,
  reorderTourDetails,
} from '../../../services/tourDetailsService';
import './TourDetailsPage.css';

export default function TourDetailsPage() {
  const { id } = useParams();

  const [tour,        setTour]        = useState(null);
  const [rows,        setRows]        = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError,   setPageError]   = useState('');

  // Add form
  const [addOpen,   setAddOpen]   = useState(false);
  const [addLabel,  setAddLabel]  = useState('');
  const [addValue,  setAddValue]  = useState('');
  const [adding,    setAdding]    = useState(false);
  const [addError,  setAddError]  = useState('');
  const addLabelRef = useRef(null);

  // Inline edit
  const [editingId,  setEditingId]  = useState(null);
  const [editLabel,  setEditLabel]  = useState('');
  const [editValue,  setEditValue]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  // Delete
  const [deletingId,  setDeletingId]  = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Reorder
  const [reordering, setReordering] = useState(false);
  const [reorderErr, setReorderErr] = useState('');

  const reload = useCallback(async () => {
    setPageError('');
    try {
      const [tourData, rowData] = await Promise.all([
        getTour(id),
        listTourDetails(id),
      ]);
      setTour(tourData);
      setRows(rowData);
    } catch (e) {
      setPageError(e.message);
    } finally {
      setPageLoading(false);
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  // ── Add
  async function handleAdd(e) {
    e.preventDefault();
    if (!addLabel.trim()) { setAddError('Label is required.'); return; }
    if (!addValue.trim()) { setAddError('Value is required.'); return; }
    setAdding(true);
    setAddError('');
    try {
      await createTourDetail(id, addLabel, addValue);
      setAddLabel('');
      setAddValue('');
      setAddOpen(false);
      await reload();
    } catch (e) {
      setAddError(e.message);
    } finally {
      setAdding(false);
    }
  }

  function openAdd() {
    setAddOpen(true);
    setTimeout(() => addLabelRef.current?.focus(), 50);
  }

  // ── Edit
  function startEdit(row) {
    setEditingId(row.id);
    setEditLabel(row.label);
    setEditValue(row.value);
    setSaveError('');
  }

  async function handleSave(rowId) {
    if (!editLabel.trim()) { setSaveError('Label is required.'); return; }
    if (!editValue.trim()) { setSaveError('Value is required.'); return; }
    setSaving(true);
    setSaveError('');
    try {
      await updateTourDetail(rowId, editLabel, editValue);
      setRows(prev =>
        prev.map(r => r.id === rowId ? { ...r, label: editLabel.trim(), value: editValue.trim() } : r)
      );
      setEditingId(null);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setSaveError('');
  }

  // ── Delete
  async function handleDelete(row) {
    if (!window.confirm(`Delete "${row.label}"? This cannot be undone.`)) return;
    setDeletingId(row.id);
    setDeleteError('');
    try {
      await deleteTourDetail(row.id);
      setRows(prev => prev.filter(r => r.id !== row.id));
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Reorder
  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= rows.length) return;

    const newRows = [...rows];
    [newRows[index], newRows[swapIndex]] = [newRows[swapIndex], newRows[index]];
    const updates   = newRows.map((r, i) => ({ id: r.id, sort_order: i + 1 }));
    const optimistic = newRows.map((r, i) => ({ ...r, sort_order: i + 1 }));

    const prev = rows;
    setRows(optimistic);
    setReordering(true);
    setReorderErr('');
    try {
      await reorderTourDetails(updates);
    } catch (e) {
      setRows(prev);
      setReorderErr(e.message);
    } finally {
      setReordering(false);
    }
  }

  if (pageLoading) return <AdminSpinner />;

  return (
    <div className="tdp-page">
      <AdminPageHeader
        title="Trip Details"
        subtitle={tour ? `Managing details for: ${tour.title}` : 'Tour details'}
        backTo="/admin/tours"
      />

      {pageError && (
        <div className="tdp-alert tdp-alert--error" role="alert">
          ⚠ {pageError}
          <button className="tdp-alert-retry" onClick={reload}>Retry</button>
        </div>
      )}
      {reorderErr && (
        <div className="tdp-alert tdp-alert--error" role="alert">
          ⚠ Reorder failed: {reorderErr}
          <button className="tdp-alert-retry" onClick={() => setReorderErr('')}>Dismiss</button>
        </div>
      )}
      {deleteError && (
        <div className="tdp-alert tdp-alert--error" role="alert">⚠ {deleteError}</div>
      )}

      {/* ── Add form / button */}
      {!addOpen ? (
        <button className="tdp-add-btn" onClick={openAdd}>+ Add Detail Row</button>
      ) : (
        <form className="tdp-add-form" onSubmit={handleAdd} noValidate>
          <div className="tdp-add-fields">
            <div className="tdp-add-field">
              <label className="tdp-field-label" htmlFor="add-label">Label</label>
              <input
                id="add-label"
                ref={addLabelRef}
                type="text"
                className="tdp-input"
                value={addLabel}
                onChange={e => { setAddLabel(e.target.value); setAddError(''); }}
                placeholder="e.g. Duration"
                disabled={adding}
              />
            </div>
            <div className="tdp-add-field tdp-add-field--value">
              <label className="tdp-field-label" htmlFor="add-value">Value</label>
              <input
                id="add-value"
                type="text"
                className="tdp-input"
                value={addValue}
                onChange={e => { setAddValue(e.target.value); setAddError(''); }}
                placeholder="e.g. 7 nights / 6 days fishing"
                disabled={adding}
              />
            </div>
          </div>
          {addError && <p className="tdp-field-error">{addError}</p>}
          <div className="tdp-add-actions">
            <button type="submit" className="tdp-btn tdp-btn--save" disabled={adding}>
              {adding ? 'Adding…' : 'Add Row'}
            </button>
            <button
              type="button"
              className="tdp-btn tdp-btn--cancel"
              onClick={() => { setAddOpen(false); setAddLabel(''); setAddValue(''); setAddError(''); }}
              disabled={adding}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Count */}
      {rows.length > 0 && (
        <div className="tdp-count">
          {rows.length} detail row{rows.length !== 1 ? 's' : ''}
          {reordering && <span className="tdp-reorder-saving"> — saving order…</span>}
        </div>
      )}

      {/* ── Empty state */}
      {rows.length === 0 && !pageLoading && (
        <div className="tdp-empty">
          <p className="tdp-empty-text">
            No detail rows yet. Click "+ Add Detail Row" to add your first entry.
          </p>
        </div>
      )}

      {/* ── Rows */}
      <div className="tdp-list">
        {rows.map((row, index) => {
          const isEditing  = editingId === row.id;
          const isDeleting = deletingId === row.id;

          return (
            <div
              key={row.id}
              className={`tdp-row${isEditing ? ' tdp-row--editing' : ''}${isDeleting ? ' tdp-row--deleting' : ''}${reordering ? ' tdp-row--reordering' : ''}`}
            >
              {/* Reorder */}
              <div className="tdp-move-group">
                <button
                  className="tdp-btn-move"
                  title="Move up"
                  disabled={reordering || isDeleting || index === 0}
                  onClick={() => handleMove(index, 'up')}
                  aria-label="Move row up"
                >▲</button>
                <span className="tdp-order-num">{index + 1}</span>
                <button
                  className="tdp-btn-move"
                  title="Move down"
                  disabled={reordering || isDeleting || index === rows.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  aria-label="Move row down"
                >▼</button>
              </div>

              {/* Content / Edit fields */}
              {isEditing ? (
                <div className="tdp-edit-fields">
                  <input
                    type="text"
                    className="tdp-input tdp-input--label"
                    value={editLabel}
                    onChange={e => { setEditLabel(e.target.value); setSaveError(''); }}
                    placeholder="Label"
                    disabled={saving}
                    autoFocus
                  />
                  <input
                    type="text"
                    className="tdp-input tdp-input--value"
                    value={editValue}
                    onChange={e => { setEditValue(e.target.value); setSaveError(''); }}
                    placeholder="Value"
                    disabled={saving}
                  />
                  {saveError && <p className="tdp-field-error tdp-field-error--inline">{saveError}</p>}
                </div>
              ) : (
                <div className="tdp-row-content">
                  <span className="tdp-row-label">{row.label}</span>
                  <span className="tdp-row-value">{row.value}</span>
                </div>
              )}

              {/* Actions */}
              <div className="tdp-row-actions">
                {isEditing ? (
                  <>
                    <button
                      className="tdp-btn tdp-btn--save"
                      onClick={() => handleSave(row.id)}
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      className="tdp-btn tdp-btn--cancel"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="tdp-btn tdp-btn--edit"
                      onClick={() => startEdit(row)}
                      disabled={isDeleting || !!editingId}
                    >
                      Edit
                    </button>
                    <button
                      className="tdp-btn tdp-btn--delete"
                      onClick={() => handleDelete(row)}
                      disabled={isDeleting || reordering}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
