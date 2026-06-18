/**
 * Quotr — Input
 *
 * Controlled text input with built-in label, error state, and
 * optional hint/helper text. Wraps the native <input> — all standard
 * input props pass through via rest spread.
 *
 * Props:
 *   label   — always required, shown above the field
 *   error   — field-level error, shown below in red
 *   hint    — helper text shown below (hidden when error is present)
 *   helper  — alias for hint, accepted for backwards compat
 *
 * Usage:
 *   <Input
 *     label="Email address"
 *     type="email"
 *     value={email}
 *     onChange={e => setEmail(e.target.value)}
 *     error={errors.email}
 *     hint="We'll send your quote confirmations here"
 *   />
 */

import { forwardRef, type InputHTMLAttributes, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:    string
  error?:   string
  /** Helper text below the field. Hidden when error is present. */
  hint?:    string
  /** Alias for hint */
  helper?:  string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, helper, className = '', id: providedId, ...rest }, ref) => {
    const generatedId = useId()
    const id          = providedId ?? generatedId
    const errorId     = `${id}-error`
    const hintId      = `${id}-hint`

    const hasError  = Boolean(error)
    const hintText  = hint ?? helper   // accept both prop names

    return (
      <div className={`input-field ${className}`}>
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>

        <input
          ref={ref}
          id={id}
          className={`input-field__input ${hasError ? 'input-field__input--error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={
            [hasError && errorId, !hasError && hintText && hintId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          {...rest}
        />

        {hasError && (
          <p id={errorId} className="input-field__error" role="alert">
            {error}
          </p>
        )}

        {!hasError && hintText && (
          <p id={hintId} className="input-field__helper">
            {hintText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'