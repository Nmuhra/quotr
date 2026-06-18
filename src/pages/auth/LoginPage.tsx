/**
 * Quotr — Login page
 *
 * Design decisions:
 *  - Safe area aware (Capacitor on iOS has a notch + home indicator)
 *  - Error displayed inline below field (not toast) — tradies miss toasts
 *  - No auto-submit — tradies on site, form submissions must be deliberate
 *  - Input type="email" + autocomplete attributes for password managers
 *  - Loading state disables the entire form (prevents double-submit)
 */

import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '../../features/auth/hooks'
import { ROUTES } from '../../lib/routes'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { QuotrLogo } from '../../components/ui/QuotrLogo'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login, isLoading, error, clearError } = useLogin()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // Where to redirect after successful login
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()

    const ok = await login({ email, password })
    if (ok) navigate(from, { replace: true })
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <QuotrLogo size={40} />
          <h1 className="auth-title">Quotr</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-stack">

            <Input
              id="email"
              type="email"
              label="Email address"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <div className="forgot-link-row">
                <Link to={ROUTES.forgotPassword} className="text-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Server-side error */}
            {error && <FormError message={error} />}

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!email || !password}
              fullWidth
            >
              Sign in
            </Button>

          </div>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          No account?{' '}
          <Link to={ROUTES.register} className="text-link">
            Sign up free
          </Link>
        </p>

      </div>

      {/* ── Inline styles (CSS-in-JS via style tag for portability) ── */}
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

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .forgot-link-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 6px;
        }

        .text-link {
          font-size: 13px;
          color: var(--color-text-info);
          text-decoration: none;
          font-weight: 500;
        }

        .text-link:hover {
          text-decoration: underline;
        }

        .auth-footer {
          font-size: 13px;
          color: var(--color-text-secondary);
          text-align: center;
          margin: 0;
        }

        /* Capacitor: on very small devices (320px wide) reduce padding */
        @media (max-width: 360px) {
          .auth-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  )
}