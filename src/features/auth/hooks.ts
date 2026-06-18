/**
 * Quotr — Auth operation hooks
 *
 * Encapsulates all Supabase auth calls with:
 *  - Consistent loading + error state
 *  - Typed error messages (no raw Supabase error strings shown to users)
 *  - Analytics-ready event hooks (stubbed, wire up PostHog/Mixpanel later)
 *
 * Each hook returns { execute, isLoading, error, clearError }.
 * Components own the form state; these hooks own the async operation.
 */

import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { ROUTES } from '../../lib/routes'

// ─── Types ───────────────────────────────────────────────────

interface AsyncState {
  isLoading: boolean
  error: string | null
}

interface AuthOperation extends AsyncState {
  clearError: () => void
}

// Maps Supabase error messages → user-friendly strings.
// Never show raw Supabase or Postgres errors to end users.
function mapAuthError(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('invalid login credentials'))
    return 'Incorrect email or password. Please try again.'

  if (msg.includes('email not confirmed'))
    return 'Please check your inbox and confirm your email before signing in.'

  if (msg.includes('user already registered'))
    return 'An account with this email already exists. Try signing in instead.'

  if (msg.includes('password should be at least'))
    return 'Password must be at least 8 characters.'

  if (msg.includes('rate limit'))
    return 'Too many attempts. Please wait a moment before trying again.'

  if (msg.includes('email rate limit'))
    return 'Email already sent. Please check your inbox or wait before requesting another.'

  if (msg.includes('network'))
    return 'No internet connection. Please check your signal and try again.'

  // Fallback — generic but actionable
  return 'Something went wrong. Please try again or contact support.'
}

// ─── useRegister ─────────────────────────────────────────────

interface RegisterArgs {
  email: string
  password: string
  businessName: string
  tradeType: string
}

interface UseRegisterReturn extends AuthOperation {
  register: (args: RegisterArgs) => Promise<boolean>
}

export function useRegister(): UseRegisterReturn {
  const [state, setState] = useState<AsyncState>({ isLoading: false, error: null })

  const register = useCallback(async ({
    email,
    password,
    businessName,
    tradeType,
  }: RegisterArgs): Promise<boolean> => {
    setState({ isLoading: true, error: null })

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        // Passed to the DB trigger (handle_new_user) to pre-populate
        // the business record before the tradie completes onboarding.
        data: {
          business_name: businessName.trim(),
          trade_type: tradeType,
        },
        // After email verification, redirect to onboarding
        emailRedirectTo: `${window.location.origin}${ROUTES.onboarding}`,
      },
    })

    if (error) {
      setState({ isLoading: false, error: mapAuthError(error.message) })
      return false
    }

    setState({ isLoading: false, error: null })
    // analytics.track('user_registered', { trade_type: tradeType })
    return true
  }, [])

  return {
    register,
    isLoading: state.isLoading,
    error: state.error,
    clearError: () => setState(s => ({ ...s, error: null })),
  }
}

// ─── useLogin ────────────────────────────────────────────────

interface LoginArgs {
  email: string
  password: string
}

interface UseLoginReturn extends AuthOperation {
  login: (args: LoginArgs) => Promise<boolean>
}

export function useLogin(): UseLoginReturn {
  const [state, setState] = useState<AsyncState>({ isLoading: false, error: null })

  const login = useCallback(async ({ email, password }: LoginArgs): Promise<boolean> => {
    setState({ isLoading: true, error: null })

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      setState({ isLoading: false, error: mapAuthError(error.message) })
      return false
    }

    setState({ isLoading: false, error: null })
    // analytics.track('user_logged_in')
    return true
  }, [])

  return {
    login,
    isLoading: state.isLoading,
    error: state.error,
    clearError: () => setState(s => ({ ...s, error: null })),
  }
}

// ─── useForgotPassword ───────────────────────────────────────

interface ForgotPasswordArgs {
  email: string
}

interface UseForgotPasswordReturn extends AuthOperation {
  sendReset: (args: ForgotPasswordArgs) => Promise<boolean>
  emailSent: boolean
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const [state, setState]   = useState<AsyncState>({ isLoading: false, error: null })
  const [emailSent, setEmailSent] = useState(false)

  const sendReset = useCallback(async ({ email }: ForgotPasswordArgs): Promise<boolean> => {
    setState({ isLoading: true, error: null })

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
      }
    )

    if (error) {
      setState({ isLoading: false, error: mapAuthError(error.message) })
      return false
    }

    // Even if the email doesn't exist, Supabase returns success (prevents
    // email enumeration). We always show the "check your inbox" screen.
    setState({ isLoading: false, error: null })
    setEmailSent(true)
    return true
  }, [])

  return {
    sendReset,
    isLoading: state.isLoading,
    error: state.error,
    emailSent,
    clearError: () => setState(s => ({ ...s, error: null })),
  }
}

// ─── useResetPassword ────────────────────────────────────────
// Called on the /reset-password page after the user clicks the
// email link. The session from the link is already in the URL hash
// and Supabase picks it up automatically.

interface ResetPasswordArgs {
  newPassword: string
}

interface UseResetPasswordReturn extends AuthOperation {
  resetPassword: (args: ResetPasswordArgs) => Promise<boolean>
}

export function useResetPassword(): UseResetPasswordReturn {
  const [state, setState] = useState<AsyncState>({ isLoading: false, error: null })

  const resetPassword = useCallback(async ({ newPassword }: ResetPasswordArgs): Promise<boolean> => {
    setState({ isLoading: true, error: null })

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setState({ isLoading: false, error: mapAuthError(error.message) })
      return false
    }

    setState({ isLoading: false, error: null })
    return true
  }, [])

  return {
    resetPassword,
    isLoading: state.isLoading,
    error: state.error,
    clearError: () => setState(s => ({ ...s, error: null })),
  }
}

// ─── useSignOut ──────────────────────────────────────────────

interface UseSignOutReturn extends AuthOperation {
  signOut: () => Promise<void>
}

export function useSignOut(): UseSignOutReturn {
  const [state, setState] = useState<AsyncState>({ isLoading: false, error: null })

  const signOut = useCallback(async () => {
    setState({ isLoading: true, error: null })
    const { error } = await supabase.auth.signOut()
    if (error) {
      setState({ isLoading: false, error: mapAuthError(error.message) })
    } else {
      setState({ isLoading: false, error: null })
    }
  }, [])

  return {
    signOut,
    isLoading: state.isLoading,
    error: state.error,
    clearError: () => setState(s => ({ ...s, error: null })),
  }
}