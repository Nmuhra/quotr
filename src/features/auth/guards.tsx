/**
 * Quotr — Route guards
 *
 * Three guards, each wrapping a different layer of protection:
 *
 *   <AuthGuard>         — must be signed in
 *   <OnboardingGuard>   — must be signed in + onboarded
 *   <SubscriptionGuard> — must be signed in + onboarded + active subscription
 *
 * Usage in your router:
 *
 *   <Route path="/app" element={
 *     <SubscriptionGuard>
 *       <Dashboard />
 *     </SubscriptionGuard>
 *   } />
 *
 *   <Route path="/onboarding" element={
 *     <AuthGuard>
 *       <Onboarding />
 *     </AuthGuard>
 *   } />
 *
 * Each guard renders a full-screen spinner during the initial session
 * check, then redirects or renders children.
 *
 * Design decision: guards redirect rather than render inline auth UI.
 * This keeps the auth screens fully decoupled from the app shell.
 */

import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { AppLoader } from '../../components/ui/AppLoader.tsx'
import { ROUTES } from '../../lib/routes'

// ─── AuthGuard ───────────────────────────────────────────────
// Redirects unauthenticated users to /login, preserving their
// intended destination in location state so we can redirect back.

interface GuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: GuardProps) {
  const { loadingState, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loadingState === 'initialising') {
    return <AppLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <>{children}</>
}

// ─── OnboardingGuard ─────────────────────────────────────────
// Authenticated users who haven't completed onboarding are sent
// to /onboarding. Users who ARE onboarded and land on /onboarding
// are bounced forward to the app.

export function OnboardingGuard({ children }: GuardProps) {
  const { loadingState, isAuthenticated, isOnboarded, isLoadingBusiness } = useAuth()
  const location = useLocation()

  if (loadingState === 'initialising' || isLoadingBusiness) {
    return <AppLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  if (!isOnboarded) {
    return <Navigate to={ROUTES.onboarding} replace />
  }

  return <>{children}</>
}

// ─── SubscriptionGuard ────────────────────────────────────────
// Full gate: auth + onboarding + active/trial subscription.
// Expired or cancelled subscriptions land on /subscribe (paywall).

export function SubscriptionGuard({ children }: GuardProps) {
  const {
    loadingState,
    isAuthenticated,
    isOnboarded,
    isSubscriptionActive,
    isLoadingBusiness,
  } = useAuth()
  const location = useLocation()

  if (loadingState === 'initialising' || isLoadingBusiness) {
    return <AppLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  if (!isOnboarded) {
    return <Navigate to={ROUTES.onboarding} replace />
  }

  if (!isSubscriptionActive) {
    return <Navigate to={ROUTES.subscribe} replace />
  }

  return <>{children}</>
}

// ─── PublicOnlyGuard ─────────────────────────────────────────
// Prevents authenticated users from seeing the login or register 
// screens — redirects them to the appropriate destination based 
// on their onboarding and subscription status.

export function PublicOnlyGuard({ children }: GuardProps) {
  const { 
    loadingState, 
    isAuthenticated, 
    isOnboarded, 
    isSubscriptionActive 
  } = useAuth()
  const location = useLocation()

  if (loadingState === 'initialising') {
    return <AppLoader />
  }

  if (isAuthenticated) {
    // 1. Fully onboarded and active? Go to app (or intended destination)
    if (isOnboarded && isSubscriptionActive) {
      const intendedDestination =
        (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard
      return <Navigate to={intendedDestination} replace />
    }
    
    // 2. Not onboarded? Go to onboarding
    if (!isOnboarded) {
      return <Navigate to={ROUTES.onboarding} replace />
    }

    // 3. Not active? Go to subscribe
    if (!isSubscriptionActive) {
      return <Navigate to={ROUTES.subscribe} replace />
    }
  }

  return <>{children}</>
}