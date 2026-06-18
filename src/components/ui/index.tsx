/**
 * Quotr — Core UI primitives
 *
 * Input, Button, FormError, AppLoader — used across auth,
 * onboarding, and the app shell.
 *
 * Design decisions:
 *  - All components use CSS variables only (dark mode automatic)
 *  - Input labels float above the field (always visible, not placeholder-only)
 *  - Button has an isLoading state that shows a spinner and prevents double-submit
 *  - Components are unstyled by default and import their own <style> blocks
 *    so they work without a CSS framework dependency (important for Capacitor)
 */

import {
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react'

// ─── Input ───────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  hint?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, hint, error, disabled, ...rest }, ref) => {
    return (
      <div className="q-input-wrap">
        <label htmlFor={id} className="q-input-label">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`q-input ${error ? 'q-input--error' : ''}`}
          disabled={disabled}
          aria-describedby={
            hint ? `${id}-hint` : error ? `${id}-error` : undefined
          }
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />
        {hint && !error && (
          <p id={`${id}-hint`} className="q-input-hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="q-input-error" role="alert">
            {error}
          </p>
        )}

        <style>{`
          .q-input-wrap {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .q-input-label {
            font-size: 13px;
            font-weight: 500;
            color: var(--color-text-secondary);
          }
          .q-input {
            width: 100%;
            height: 44px;
            padding: 0 12px;
            font-size: 15px;
            font-family: var(--font-sans);
            color: var(--color-text-primary);
            background: var(--color-background-secondary);
            border: 1px solid var(--color-border-tertiary);
            border-radius: 8px;
            outline: none;
            transition: border-color 0.15s;
            box-sizing: border-box;
            /* Capacitor: prevent iOS zoom on focus (font-size >= 16px in input
               prevents the zoom, but we style with 15px and override here) */
            -webkit-text-size-adjust: 100%;
          }
          .q-input:focus {
            border-color: var(--color-border-info);
            background: var(--color-background-primary);
          }
          .q-input--error {
            border-color: var(--color-border-danger);
          }
          .q-input--error:focus {
            border-color: var(--color-border-danger);
          }
          .q-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .q-input::placeholder {
            color: var(--color-text-tertiary);
          }
          .q-input-hint {
            font-size: 12px;
            color: var(--color-text-tertiary);
            margin: 0;
          }
          .q-input-error {
            font-size: 12px;
            color: var(--color-text-danger);
            margin: 0;
          }
        `}</style>
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Button ──────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'danger'
  isLoading?: boolean
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`q-btn q-btn--${variant} ${fullWidth ? 'q-btn--full' : ''}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="q-btn-spinner" aria-hidden="true" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}

      <style>{`
        .q-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 44px;
          padding: 0 18px;
          font-size: 15px;
          font-weight: 500;
          font-family: var(--font-sans);
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: opacity 0.15s, background 0.15s;
          white-space: nowrap;
          user-select: none;
          /* Capacitor tap highlight */
          -webkit-tap-highlight-color: transparent;
        }
        .q-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .q-btn--primary {
          background: var(--color-text-primary);
          color: var(--color-background-primary);
          border-color: var(--color-text-primary);
        }
        .q-btn--primary:hover:not(:disabled) {
          opacity: 0.85;
        }
        .q-btn--ghost {
          background: transparent;
          color: var(--color-text-secondary);
          border-color: var(--color-border-secondary);
        }
        .q-btn--ghost:hover:not(:disabled) {
          background: var(--color-background-secondary);
        }
        .q-btn--danger {
          background: var(--color-background-danger);
          color: var(--color-text-danger);
          border-color: var(--color-border-danger);
        }
        .q-btn--danger:hover:not(:disabled) {
          opacity: 0.85;
        }
        .q-btn--full {
          width: 100%;
        }
        @keyframes q-spin {
          to { transform: rotate(360deg); }
        }
        .q-btn-spinner {
          display: block;
          width: 15px;
          height: 15px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: q-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
      `}</style>
    </button>
  )
}

// ─── FormError ───────────────────────────────────────────────

interface FormErrorProps {
  message: string
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="q-form-error" role="alert" aria-live="polite">
      <i className="ti ti-alert-circle" aria-hidden="true" />
      <span>{message}</span>

      <style>{`
        .q-form-error {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 10px 12px;
          background: var(--color-background-danger);
          border: 1px solid var(--color-border-danger);
          border-radius: 8px;
          font-size: 13px;
          color: var(--color-text-danger);
          line-height: 1.5;
        }
        .q-form-error .ti {
          flex-shrink: 0;
          margin-top: 1px;
          font-size: 15px;
        }
      `}</style>
    </div>
  )
}

// ─── AppLoader ───────────────────────────────────────────────
// Full-screen loading state shown during initial session check
// and route transitions.

export function AppLoader() {
  return (
    <div className="q-app-loader" aria-label="Loading Quotr">
      <div className="q-app-spinner" aria-hidden="true" />

      <style>{`
        .q-app-loader {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-background-tertiary);
        }
        .q-app-spinner {
          width: 28px;
          height: 28px;
          border: 2.5px solid var(--color-border-secondary);
          border-top-color: var(--color-text-primary);
          border-radius: 50%;
          animation: q-spin 0.7s linear infinite;
        }
        @keyframes q-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ─── QuotrLogo ───────────────────────────────────────────────
// Placeholder logo — replace SVG path with actual brand asset.

interface QuotrLogoProps {
  size?: number
}

export function QuotrLogo({ size = 32 }: QuotrLogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: 'var(--color-text-primary)',
        borderRadius: size * 0.22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Quotr logo"
    >
      <i
        className="ti ti-file-text"
        style={{
          fontSize: size * 0.55,
          color: 'var(--color-background-primary)',
        }}
        aria-hidden="true"
      />
    </div>
  )
}