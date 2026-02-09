/**
 * FormInput Component - Accessible form input with luxury styling
 *
 * Features:
 * - Labels and floating labels support
 * - Focus states with design tokens
 * - Error states with validation messages
 * - Help text support
 * - Accessibility (ARIA labels, etc.)
 *
 * Usage:
 * <FormInput
 *   label="Email"
 *   type="email"
 *   placeholder="your@email.com"
 *   error={emailError}
 *   helpText="We'll never share your email"
 * />
 */

import './FormInput.css';

const FormInput = ({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = null,
  helpText = null,
  disabled = false,
  required = false,
  id = null,
  className = '',
  floatingLabel = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  const errorId = error ? `${inputId}-error` : null;
  const helpId = helpText ? `${inputId}-help` : null;

  const ariaDescribedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  const hasValue = value && value.toString().length > 0;

  return (
    <div className={`form-input-wrapper ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${hasValue ? 'has-value' : ''} ${className}`}>
      {!floatingLabel && label && (
        <label htmlFor={inputId} className="form-input-label">
          {label}
          {required && <span className="form-input-required" aria-label="required">*</span>}
        </label>
      )}

      <div className="form-input-container">
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy}
          className="form-input"
          {...props}
        />
        {floatingLabel && label && (
          <label htmlFor={inputId} className="form-input-label-floating">
            {label}
            {required && <span className="form-input-required" aria-label="required">*</span>}
          </label>
        )}
      </div>

      {error && (
        <p id={errorId} className="form-input-error">
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={helpId} className="form-input-help">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormInput;
