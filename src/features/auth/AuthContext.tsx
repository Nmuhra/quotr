/**
 * Quotr — AuthContext
 *
 * Single source of truth for:
 *  - Supabase auth session + user
 *  - Current business profile
 *  - Derived UI states: isLoading, isOnboarded, subscriptionStatus
 *
 * Design decisions:
 *  - We listen to onAuthStateChange so any tab/device sign-in propagates
 *    instantly via Supabase Realtime.
 *  - Business is fetched once on session open and cached here. Components
 *    should NOT re-fetch it individually — consume it from context.
 *  - All navigation guards live in <AuthGuard>, not in this context.
 *    Context is state-only; guards are routing-only.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, db } from '../../lib/supabase'
import type { Business, SubscriptionStatus } from '../../lib/database.types'

// ─── Types ───────────────────────────────────────────────────

type LoadingState = 'initialising' | 'ready'

interface AuthContextValue {
  // Raw Supabase primitives
  session: Session | null
  user: User | null

  // Derived business data
  business: Business | null
  isLoadingBusiness: boolean

  // Top-level loading — true until initial session check resolves
  loadingState: LoadingState

  // Convenience derived booleans
  isAuthenticated: boolean
  isOnboarded: boolean           // business name + trade_type set
  subscriptionStatus: SubscriptionStatus | null
  isSubscriptionActive: boolean  // trial OR active

  // Actions
  signOut: () => Promise<void>
  refreshBusiness: () => Promise<void>
}

// ─── Context ─────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('initialising')
  const [session, setSession]           = useState<Session | null>(null)
  const [user, setUser]                 = useState<User | null>(null)
  const [business, setBusiness]         = useState<Business | null>(null)
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)

  // Fetch the business record for the current user.
  // Called on session open and can be called manually after onboarding.
  const fetchBusiness = useCallback(async (userId: string) => {
    setIsLoadingBusiness(true)
    try {
      const { data, error } = await db
        .businesses()
        .select('*')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .single()

      if (error) {
        // PGRST116 = no rows — business not yet created (shouldn't happen
        // since the DB trigger creates one on signup, but handle gracefully)
        if (error.code !== 'PGRST116') {
          console.error('[AuthContext] fetchBusiness error:', error)
        }
        setBusiness(null)
      } else {
        setBusiness(data)
      }
    } finally {
      setIsLoadingBusiness(false)
    }
  }, [])

  const refreshBusiness = useCallback(async () => {
    if (user?.id) await fetchBusiness(user.id)
  }, [user, fetchBusiness])

  // Bootstrap: get existing session, then subscribe to auth changes.
  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      // Safety timeout: if bootstrap takes more than 5 seconds, 
      // force the app to show the login screen.
      const timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('[AuthContext] Bootstrap taking too long, forcing ready state...')
          setLoadingState('ready')
        }
      }, 5000)

      try {
        console.log('[AuthContext] Bootstrap starting...')
        
        console.log('[AuthContext] Calling getSession...')
        const { data, error } = await supabase.auth.getSession()
        const initialSession = data?.session
        
        if (error) {
          console.error('[AuthContext] getSession error:', error)
        }
        
        console.log('[AuthContext] getSession resolved. Session exists:', !!initialSession)

        if (!mounted) {
          console.log('[AuthContext] Bootstrap aborted: component unmounted')
          clearTimeout(timeoutId)
          return
        }

        setSession(initialSession ?? null)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          console.log('[AuthContext] User found, fetching business...')
          await fetchBusiness(initialSession.user.id)
          console.log('[AuthContext] Business fetch complete.')
        } else {
          console.log('[AuthContext] No user session found.')
        }
      } catch (err) {
        console.error('[AuthContext] Bootstrap failed with exception:', err)
      } finally {
        clearTimeout(timeoutId)
        if (mounted) {
          setLoadingState('ready')
          console.log('[AuthContext] Bootstrap finished. LoadingState set to ready.')
        }
      }
    }

    bootstrap()

    // Subscribe to auth state changes (sign in, sign out, token refresh,
    // password recovery, user updated, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            await fetchBusiness(newSession.user.id)
          }
        }

        if (event === 'SIGNED_OUT') {
          setBusiness(null)
        }

        // Ensure loading state is cleared after any auth event
        // (handles the email magic link / OAuth redirect case)
        setLoadingState('ready')
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchBusiness])

  // ─── Derived state ───────────────────────────────────────

  const isAuthenticated = session !== null && user !== null

  // Onboarded = business has a real name and a trade type set.
  // The DB trigger creates a business with placeholder values on signup.
  const isOnboarded = Boolean(
    business &&
    business.name &&
    business.name !== 'My Business' &&
    business.trade_type &&
    business.trade_type !== 'general'
  )

  const subscriptionStatus = business?.subscription_status ?? null

  const isSubscriptionActive =
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trial'

  // ─── Actions ─────────────────────────────────────────────

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // State cleared by onAuthStateChange listener above
  }, [])

  // ─── Value ───────────────────────────────────────────────

  const value: AuthContextValue = {
    session,
    user,
    business,
    isLoadingBusiness,
    loadingState,
    isAuthenticated,
    isOnboarded,
    subscriptionStatus,
    isSubscriptionActive,
    signOut,
    refreshBusiness,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}