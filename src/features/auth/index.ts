/**
 * Quotr — Auth module barrel export
 *
 * Import everything auth-related from '@/features/auth'.
 * Tree-shaken by Vite — unused exports are dropped.
 */

export { AuthProvider, useAuth }       from './AuthContext'
export { AuthGuard, OnboardingGuard, SubscriptionGuard, PublicOnlyGuard } from './guards'
export { useRegister, useLogin, useForgotPassword, useResetPassword, useSignOut } from './hooks'
export { TradeTypePicker }             from './TradeTypePicker'