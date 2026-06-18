/**
 * Quotr — Email flow screens
 *
 * VerifyEmailPage — shown after registration, prompts user to check inbox.
 * ForgotPasswordPage — email input to trigger password reset.
 * ResetPasswordPage — shown after clicking the reset link in email.
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForgotPassword, useResetPassword } from '../../features/auth/hooks'
import { useAuth } from '../../features/auth/AuthContext'
import { ROUTES } from '../../lib/routes'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { QuotrLogo } from '../../components/ui/QuotrLogo'

// ─── VerifyEmailPage ─────────────────────────────────────────

export function VerifyEmailPage() {
  const { user } = useAuth()

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <QuotrLogo size={40} />
          <h1 className="auth-title">Check your inbox</h1>
        </div>

        <div className="verify-body">
          <div className="verify-icon-wrap">
            <i className="ti ti-mail-opened verify-icon" aria-hidden="true" />
          </div>

          <p className="verify-text">
            We sent a confirmation link to{' '}
            <strong>{user?.email ?? 'your email address'}</strong>.
            Click the link in the email to activate your account.
          </p>

          <p className="verify-hint">
            Didn't get it? Check your spam folder, or{' '}
            <Link to={ROUTES.register} className="text-link">
              try a different email address
            </Link>
            .
          </p>
        </div>
      </div>

      <EmailFlowStyles />
    </div>
  )
}

// ─── ForgotPasswordPage ──────────────────────────────────────

export function ForgotPasswordPage() {
  const { sendReset, isLoading, error, emailSent, clearError } = useForgotPassword()
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    await sendReset({ email })
    // emailSent state is set by the hook — renders the confirmation UI below
  }

  if (emailSent) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-logo">
            <QuotrLogo size={40} />
            <h1 className="auth-title">Reset link sent</h1>
          </div>
          <div className="verify-body">
            <div className="verify-icon-wrap">
              <i className="ti ti-mail-forward verify-icon" aria-hidden="true" />
            </div>
            <p className="verify-text">
              If an account exists for <strong>{email}</strong>, you'll receive
              a password reset link shortly.
            </p>
            <p className="verify-hint">
              <Link to={ROUTES.login} className="text-link">
                ← Back to sign in
              </Link>
            </p>
          </div>
        </div>
        <EmailFlowStyles />
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <QuotrLogo size={40} />
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

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

            {error && <FormError message={error} />}

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!email}
              fullWidth
            >
              Send reset link
            </Button>
          </div>
        </form>

        <p className="auth-footer">
          <Link to={ROUTES.login} className="text-link">
            ← Back to sign in
          </Link>
        </p>
      </div>

      <EmailFlowStyles />
    </div>
  )
}

// ─── ResetPasswordPage ───────────────────────────────────────

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword, isLoading, error, clearError } = useResetPassword()

  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError,      setLocalError]      = useState<string | null>(null)
  const [done,            setDone]            = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    const ok = await resetPassword({ newPassword: password })
    if (ok) {
      setDone(true)
      setTimeout(() => navigate(ROUTES.login, { replace: true }), 2500)
    }
  }

  const displayError = localError ?? error

  if (done) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="verify-body">
            <div className="verify-icon-wrap success">
              <i className="ti ti-circle-check verify-icon" aria-hidden="true" />
            </div>
            <h1 className="auth-title" style={{ textAlign: 'center' }}>
              Password updated
            </h1>
            <p className="verify-text" style={{ textAlign: 'center' }}>
              Redirecting you to sign in…
            </p>
          </div>
        </div>
        <EmailFlowStyles />
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <QuotrLogo size={40} />
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-stack">
            <Input
              id="password"
              type="password"
              label="New password"
              autoComplete="new-password"
              hint="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <Input
              id="confirm"
              type="password"
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            {displayError && <FormError message={displayError} />}

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!password || !confirmPassword}
              fullWidth
            >
              Update password
            </Button>
          </div>
        </form>
      </div>

      <EmailFlowStyles />
    </div>
  )
}

// ─── Shared styles ───────────────────────────────────────────

function EmailFlowStyles() {
  return (
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
        text-align: center;
      }
      .verify-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
      }
      .verify-icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: var(--color-background-info);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .verify-icon-wrap.success {
        background: var(--color-background-success);
      }
      .verify-icon-wrap.success .verify-icon {
        color: var(--color-text-success);
      }
      .verify-icon {
        font-size: 28px;
        color: var(--color-text-info);
      }
      .verify-text {
        font-size: 14px;
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.6;
      }
      .verify-hint {
        font-size: 13px;
        color: var(--color-text-tertiary);
        margin: 0;
        line-height: 1.6;
      }
      .form-stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .text-link {
        color: var(--color-text-info);
        text-decoration: none;
        font-weight: 500;
        font-size: 13px;
      }
      .text-link:hover { text-decoration: underline; }
      .auth-footer {
        font-size: 13px;
        color: var(--color-text-secondary);
        text-align: center;
        margin: 0;
      }
    `}</style>
  )
}