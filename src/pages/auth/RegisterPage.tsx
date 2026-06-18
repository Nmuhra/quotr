/**
 * Quotr — Register page
 *
 * Two-step form:
 *   Step 1: Email + password
 *   Step 2: Business name + trade type selection
 *
 * Design decision: split into two steps so the first screen is
 * lightweight (just email + password) and the second feels like
 * the start of onboarding. Reduces perceived friction vs one long form.
 *
 * After successful register, Supabase sends a verification email.
 * We redirect to /verify-email to show the "check your inbox" prompt.
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../../features/auth/hooks'
import { ROUTES } from '../../lib/routes'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { QuotrLogo } from '../../components/ui/QuotrLogo'
import { TradeTypePicker } from '../../features/auth/TradeTypePicker'
import type { TradeType } from '../../lib/database.types'

const STEPS = ['Account', 'Your business'] as const
type Step = 0 | 1

// Password validation — must be at least 8 chars with 1 number
function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/\d/.test(pw)) return 'Password must include at least one number.'
  return null
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useRegister()

  const [step, setStep] = useState<Step>(0)

  // Step 1 fields
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError,      setLocalError]      = useState<string | null>(null)

  // Step 2 fields
  const [businessName, setBusinessName] = useState('')
  const [tradeType,    setTradeType]    = useState<TradeType | ''>('')

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    const pwError = validatePassword(password)
    if (pwError) { setLocalError(pwError); return }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    setStep(1)
  }

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault()
    clearError()

    if (!tradeType) {
      setLocalError('Please select your trade.')
      return
    }

    const ok = await register({
      email,
      password,
      businessName,
      tradeType,
    })

    if (ok) {
      navigate(ROUTES.verifyEmail, { replace: true })
    }
  }

  const displayError = localError ?? error

  return (
    <div className="auth-screen">
      <div className="auth-card">

        {/* Logo + step indicator */}
        <div className="auth-logo">
          <QuotrLogo size={40} />
          <h1 className="auth-title">Quotr</h1>
          <p className="auth-subtitle">
            {step === 0 ? 'Create your account' : 'Set up your business'}
          </p>
          {/* Step pills */}
          <div className="step-pills">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`step-pill ${i === step ? 'active' : i < step ? 'done' : ''}`}
              >
                <span className="step-dot" />
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: Email + password ── */}
        {step === 0 && (
          <form onSubmit={handleStep1} noValidate>
            <div className="form-stack">
              <Input
                id="email"
                type="email"
                label="Email address"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                type="password"
                label="Password"
                autoComplete="new-password"
                hint="At least 8 characters with one number"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                id="confirm-password"
                type="password"
                label="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />

              {displayError && <FormError message={displayError} />}

              <Button
                type="submit"
                disabled={!email || !password || !confirmPassword}
                fullWidth
              >
                Continue
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 2: Business name + trade type ── */}
        {step === 1 && (
          <form onSubmit={handleStep2} noValidate>
            <div className="form-stack">
              <Input
                id="business-name"
                type="text"
                label="Business name"
                placeholder="e.g. Smith Plumbing"
                autoComplete="organization"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                disabled={isLoading}
                required
              />

              <div className="field">
                <label className="field-label">Your trade</label>
                <TradeTypePicker
                  value={tradeType}
                  onChange={setTradeType}
                  disabled={isLoading}
                />
              </div>

              {displayError && <FormError message={displayError} />}

              <div className="button-row">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setStep(0); setLocalError(null) }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={!businessName || !tradeType}
                  fullWidth
                >
                  Create account
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to={ROUTES.login} className="text-link">
            Sign in
          </Link>
        </p>

      </div>

      <style>{`
        .auth-screen {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: env(safe-area-inset-top, 24px) 20px env(safe-area-inset-bottom, 24px);
          background: var(--color-background-tertiary);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--color-background-primary);
          border: 0.5px solid var(--color-border-tertiary);
          border-radius: 16px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .auth-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .auth-title {
          font-size: 24px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0;
        }
        .step-pills {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        .step-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--color-text-tertiary);
        }
        .step-pill.active {
          color: var(--color-text-info);
        }
        .step-pill.done {
          color: var(--color-text-success);
        }
        .step-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          display: block;
        }
        .step-label { font-size: 12px; }
        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-secondary);
        }
        .button-row {
          display: flex;
          gap: 8px;
        }
        .text-link {
          font-size: 13px;
          color: var(--color-text-info);
          text-decoration: none;
          font-weight: 500;
        }
        .text-link:hover { text-decoration: underline; }
        .auth-footer {
          font-size: 13px;
          color: var(--color-text-secondary);
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  )
}