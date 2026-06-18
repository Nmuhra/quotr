/**
 * Quotr — QuotrLogo
 *
 * SVG wordmark. Two variants:
 *   full  — icon + wordmark side by side (default, used in auth screens)
 *   icon  — icon mark only (used in AppShell top bar, favicon-sized)
 *
 * The icon is a stylised quote/receipt mark — a rectangle with a
 * folded corner and a tick, suggesting "signed document". Rendered
 * in amber so it reads on both dark navy and white backgrounds.
 *
 * Usage:
 *   <QuotrLogo />                    // full wordmark
 *   <QuotrLogo variant="icon" />     // icon only
 *   <QuotrLogo size={32} />          // custom height in px
 */

interface QuotrLogoProps {
  variant?: 'full' | 'icon'
  size?:    number
  className?: string
}

export function QuotrLogo({
  variant   = 'full',
  size      = 36,
  className = '',
}: QuotrLogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Quotr"
        className={className}
      >
        {/* Document body */}
        <rect x="6" y="4" width="20" height="26" rx="2" fill="var(--color-accent)" />
        {/* Folded corner — cut out */}
        <path d="M26 4L26 11L33 11" fill="var(--color-surface)" />
        <path d="M26 4L33 11H28a2 2 0 01-2-2V4Z" fill="var(--color-accent-dim)" />
        {/* Tick / checkmark */}
        <path
          d="M12 19l3.5 3.5L24 14"
          stroke="var(--color-surface)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // Full wordmark: icon + "Quotr" text
  const textHeight = size
  const iconWidth  = size * 0.85
  const gap        = size * 0.35
  const totalWidth = iconWidth + gap + size * 2.6 // approx text width

  return (
    <svg
      width={totalWidth}
      height={textHeight}
      viewBox={`0 0 ${totalWidth} ${textHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Quotr"
      className={className}
    >
      {/* Icon mark */}
      <g transform={`scale(${size / 36})`}>
        <rect x="6" y="4" width="20" height="26" rx="2" fill="var(--color-accent)" />
        <path d="M26 4L33 11H28a2 2 0 01-2-2V4Z" fill="var(--color-accent-dim)" />
        <path
          d="M12 19l3.5 3.5L24 14"
          stroke="var(--color-surface)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Wordmark */}
      <text
        x={iconWidth + gap}
        y={size * 0.76}
        fontFamily="var(--font-display)"
        fontSize={size * 0.78}
        fontWeight="700"
        letterSpacing="-0.03em"
        fill="var(--color-text-primary)"
      >
        Quotr
      </text>
    </svg>
  )
}