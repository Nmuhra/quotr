/**
 * Quotr — TradeTypePicker
 *
 * Visual grid of trade types for registration and onboarding.
 * Uses radio-button semantics (keyboard navigable, screen reader friendly).
 * Each tile shows an icon + label. Selected tile has a tinted border.
 *
 * TradeType values must match the database enum in database.types.ts.
 */

import type { TradeType } from '../../lib/database.types'

interface Trade {
  value: TradeType
  label: string
  icon: string   // Tabler icon class
  description: string
}

const TRADES: Trade[] = [
  {
    value: 'electrician',
    label: 'Electrician',
    icon: 'ti-bolt',
    description: 'Wiring, boards, CoC',
  },
  {
    value: 'plumber',
    label: 'Plumber',
    icon: 'ti-droplet',
    description: 'Pipes, geysers, drains',
  },
  {
    value: 'builder',
    label: 'Builder',
    icon: 'ti-building',
    description: 'Brickwork, renovations',
  },
  {
    value: 'roofer',
    label: 'Roofer',
    icon: 'ti-home',
    description: 'Roofing, waterproofing',
  },
  {
    value: 'painter',
    label: 'Painter',
    icon: 'ti-brush',
    description: 'Interior & exterior',
  },
  {
    value: 'general',
    label: 'Other trade',
    icon: 'ti-tool',
    description: 'Handyman, carpentry…',
  },
]

interface TradeTypePickerProps {
  value: TradeType | ''
  onChange: (value: TradeType) => void
  disabled?: boolean
}

export function TradeTypePicker({ value, onChange, disabled }: TradeTypePickerProps) {
  return (
    <div
      className="trade-grid"
      role="radiogroup"
      aria-label="Select your trade"
    >
      {TRADES.map(trade => {
        const isSelected = value === trade.value
        return (
          <button
            key={trade.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            className={`trade-tile ${isSelected ? 'selected' : ''}`}
            onClick={() => onChange(trade.value)}
          >
            <i
              className={`ti ${trade.icon} trade-icon`}
              aria-hidden="true"
            />
            <span className="trade-label">{trade.label}</span>
            <span className="trade-desc">{trade.description}</span>
            {isSelected && (
              <i
                className="ti ti-check trade-check"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}

      <style>{`
        .trade-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .trade-tile {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          padding: 12px;
          background: var(--color-background-secondary);
          border: 1.5px solid var(--color-border-tertiary);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
          appearance: none;
          -webkit-appearance: none;
        }

        .trade-tile:hover:not(:disabled) {
          border-color: var(--color-border-secondary);
          background: var(--color-background-primary);
        }

        .trade-tile.selected {
          border-color: var(--color-border-info);
          background: var(--color-background-info);
        }

        .trade-tile:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trade-icon {
          font-size: 20px;
          color: var(--color-text-secondary);
          margin-bottom: 2px;
        }

        .trade-tile.selected .trade-icon {
          color: var(--color-text-info);
        }

        .trade-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .trade-desc {
          font-size: 11px;
          color: var(--color-text-tertiary);
          line-height: 1.3;
        }

        .trade-check {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 13px;
          color: var(--color-text-info);
        }

        /* Focus ring for keyboard nav */
        .trade-tile:focus-visible {
          outline: 2px solid var(--color-border-info);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  )
}