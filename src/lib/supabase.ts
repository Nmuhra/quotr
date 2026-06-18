// ============================================================
// Quotr — Supabase client
// src/lib/supabase.ts
// ============================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage (works in Capacitor via native storage plugin)
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ─── Typed table helpers ──────────────────────────────────────
// Use these instead of supabase.from('table') directly
// so you get full type inference everywhere.

export const db = {
  businesses:         () => supabase.from('businesses'),
  clients:            () => supabase.from('clients'),
  lineItemTemplates:  () => supabase.from('line_item_templates'),
  quotes:             () => supabase.from('quotes'),
  quoteLineItems:     () => supabase.from('quote_line_items'),
  invoices:           () => supabase.from('invoices'),
  pushTokens:         () => supabase.from('push_tokens'),
}

// ─── Storage bucket helpers ───────────────────────────────────
export const storage = {
  logos:      () => supabase.storage.from('business-assets'),
  signatures: () => supabase.storage.from('signatures'),
  pdfs:       () => supabase.storage.from('quote-pdfs'),
}

// ─── Auth helpers ─────────────────────────────────────────────
export const auth = supabase.auth

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}