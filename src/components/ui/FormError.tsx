/**
 * Quotr — FormError
 *
 * Displays a top-of-form error banner for API/server-level errors
 * that aren't tied to a specific field (wrong password, network
 * failure, rate limit, etc.).
 *
 * Renders nothing when `message` is falsy — safe to always mount.
 *
 * Usage:
 *   <FormError message={authError} />
 *
 *   // With title override:
 *   <FormError title="Payment failed" message={stripeError} />
 */

interface FormErrorProps {
  message?: string | null
  title?:   string
}

export function FormError({ message, title }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="form-error" role="alert" aria-live="assertive">
      <span className="form-error__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 1.5L14.5 13H1.5L8 1.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
      </span>
      <div className="form-error__body">
        {title && <p className="form-error__title">{title}</p>}
        <p className="form-error__message">{message}</p>
      </div>
    </div>
  )
}