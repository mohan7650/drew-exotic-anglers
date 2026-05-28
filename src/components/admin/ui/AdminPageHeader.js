import React from 'react';
import { Link } from 'react-router-dom';
import './AdminPageHeader.css';

/**
 * Shared page header used by every admin list/form page.
 * Props:
 *   title      {string}            - Page heading
 *   subtitle   {string?}           - Optional muted line below title
 *   backTo     {string?}           - If set, renders a ← Back link to this path
 *   action     {object?}           - { label, to?, onClick? } — primary CTA button
 */
export default function AdminPageHeader({ title, subtitle, backTo, action }) {
  return (
    <div className="aph-root">
      <div className="aph-left">
        {backTo && (
          <Link to={backTo} className="aph-back">
            ← Back
          </Link>
        )}
        <h1 className="aph-title">{title}</h1>
        {subtitle && <p className="aph-subtitle">{subtitle}</p>}
      </div>

      {action && (
        <div className="aph-right">
          {action.to ? (
            <Link to={action.to} className="aph-btn">
              {action.label}
            </Link>
          ) : (
            <button className="aph-btn" onClick={action.onClick}>
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
