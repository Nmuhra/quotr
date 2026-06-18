/**
 * Quotr — AppLoader
 *
 * Full-screen loading state shown during auth initialisation.
 * Rendered by guards before the session check resolves — the user
 * should see this for ~200ms max on a normal connection.
 *
 * Design: centred logo + animated ring. No text — keeps it clean
 * and avoids translation concerns for the loading copy.
 */

export function AppLoader() {
  return (
    <div className="app-loader">
      <div className="app-loader__ring" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="var(--color-border)"
            strokeWidth="3"
          />
          <circle
            className="app-loader__arc"
            cx="24"
            cy="24"
            r="20"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="30 100"
          />
        </svg>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}