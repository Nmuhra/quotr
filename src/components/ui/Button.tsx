/**
 * Quotr — Button
 *
 * Variants:
 *   primary   — amber filled, main CTA (Send Quote, Save, etc.)
 *   secondary — navy outlined, secondary actions
 *   ghost     — no background, inline or subtle actions
 *   danger    — red tint, destructive actions (delete, cancel quote)
 *
 * Sizes:
 *   sm  — tight padding, secondary inline actions
 *   md  — default, most use cases
 *   lg  — hero CTAs, bottom sheet actions on mobile
 *
 * Props:
 *   isLoading  — shows spinner, disables interaction (alias kept as `loading` too)
 *   fullWidth  — stretches to container width, for mobile bottom actions
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  /** Show spinner and disable. Pages pass this as `isLoading`. */
  isLoading?: boolean
  /** Alias accepted for backwards compat */
  loading?:   boolean
  fullWidth?: boolean
  children:   ReactNode
}

export function Button({
  variant   = 'primary',
  size      = 'md',
  isLoading = false,
  loading   = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const busy       = isLoading || loading
  const isDisabled = disabled || busy

  return (
    <button
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full'    : '',
        busy      ? 'btn--loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      aria-busy={busy}
      {...rest}
    >
      {busy && (
        <span className="btn__spinner" aria-hidden="true">
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
            <circle
              cx="8" cy="8" r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="10 28"
            />
          </svg>
        </span>
      )}
      <span className={busy ? 'btn__label--loading' : ''}>{children}</span>
    </button>
  )
}