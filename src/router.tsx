import { createBrowserRouter, Navigate } from 'react-router-dom'
import {
  AuthGuard,
  OnboardingGuard,
  SubscriptionGuard,
  PublicOnlyGuard,
} from './features/auth/guards'

// Layouts
import AppShell from './components/layout/AppShell'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OnboardingPage from './pages/auth/OnboardingPage'
import {
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from './pages/auth/EmailFlowPages'

// ─── Stub for pages not built yet ────────────────────────────
// Prevents import crashes. Swap for real pages as you build them.
function ComingSoon({ name }: { name: string }) {
  return (
    <div style={{
      padding: '40px 24px',
      textAlign: 'center',
      color: 'var(--color-text-secondary)',
      fontSize: '14px',
    }}>
      {name} — coming soon
    </div>
  )
}

export const router = createBrowserRouter([
  // ─── Landing ─────────────────────────────────────────────
  { path: '/', element: <Navigate to="/login" replace /> },

  // ─── Public-only (bounce authenticated users to dashboard) ─
  { path: '/login',    element: <PublicOnlyGuard><LoginPage /></PublicOnlyGuard> },
  { path: '/register', element: <PublicOnlyGuard><RegisterPage /></PublicOnlyGuard> },

  // ─── Email flow (no guard — user arrives via email link) ──
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password',  element: <ResetPasswordPage /> },
  { path: '/verify-email',    element: <VerifyEmailPage /> },

  // ─── Onboarding (auth required, subscription not checked) ─
  { path: '/onboarding', element: <AuthGuard><OnboardingPage /></AuthGuard> },

  // ─── Paywall (auth + onboarded, subscription lapsed) ──────
  {
    path: '/subscribe',
    element: <OnboardingGuard><ComingSoon name="Subscribe" /></OnboardingGuard>,
  },

  // ─── Public client quote signing (no auth, token-based) ───
  { path: '/q/:token', element: <ComingSoon name="Public quote page" /> },

  // ─── Protected app shell ──────────────────────────────────
  {
    path: '/app',
    element: (
      <SubscriptionGuard>
        <AppShell />
      </SubscriptionGuard>
    ),
    children: [
      { index: true,        element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard',  element: <ComingSoon name="Dashboard" /> },
      { path: 'quotes',     element: <ComingSoon name="Quotes list" /> },
      { path: 'quotes/new', element: <ComingSoon name="Quote builder" /> },
      { path: 'quotes/:id', element: <ComingSoon name="Quote detail" /> },
      { path: 'clients',    element: <ComingSoon name="Clients" /> },
      { path: 'clients/:id',          element: <ComingSoon name="Client detail" /> },
      { path: 'settings',             element: <ComingSoon name="Settings" /> },
      { path: 'settings/business',    element: <ComingSoon name="Business profile" /> },
      { path: 'settings/billing',     element: <ComingSoon name="Billing" /> },
      { path: 'settings/line-items',  element: <ComingSoon name="Line items" /> },
    ],
  },

  // ─── Catch-all ────────────────────────────────────────────
  { path: '*', element: <Navigate to="/login" replace /> },
])