import React from 'react';
import './FormField.css';

/**
 * Wraps a label + input/textarea/select with consistent styling and error display.
 * All standard input/textarea/select props are forwarded via rest spread.
 *
 * Props:
 *   label    {string}
 *   id       {string}
 *   error    {string?}
 *   hint     {string?}
 *   as       {'input'|'textarea'|'select'} — defaults to 'input'
 *   required {boolean?}
 *   children {ReactNode?} — used when as='select' to render <option> elements
 */
export default function FormField({
  label,
  id,
  error,
  hint,
  as: Tag = 'input',
  required,
  children,
  ...rest
}) {
  return (
    <div className={`ff-root${error ? ' ff-root--error' : ''}`}>
      <label htmlFor={id} className="ff-label">
        {label}
        {required && <span className="ff-required" aria-hidden="true"> *</span>}
      </label>

      <Tag
        id={id}
        name={id}
        className={`ff-control ff-control--${Tag}`}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {children}
      </Tag>

      {hint && !error && (
        <p id={`${id}-hint`} className="ff-hint">{hint}</p>
      )}
      {error && (
        <p id={`${id}-err`} className="ff-error" role="alert">{error}</p>
      )}
    </div>
  );
}
