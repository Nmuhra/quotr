/**
 * Quote Builder Store
 * Manages quote state during the build process
 */

import { create } from 'zustand'
import type { Database } from '../../lib/database.types'

type Client = Database['public']['Tables']['clients']['Row']
type QuoteLineItem = Database['public']['Tables']['quote_line_items']['Row']

export interface QuoteBuilderState {
  // Current step (1-5)
  step: 1 | 2 | 3 | 4 | 5

  // Core quote data
  client: Client | null
  clientName: string
  lineItems: Array<QuoteLineItem & { templateId: string }>
  scopeText: string | null
  notes: string

  // Calculated values
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  depositPct: number
  depositAmount: number

  // UI state
  isGeneratingScope: boolean
  isSaving: boolean
  error: string | null

  // Actions
  setStep: (step: 1 | 2 | 3 | 4 | 5) => void
  setClient: (client: Client | null) => void
  setClientName: (name: string) => void
  addLineItem: (item: QuoteLineItem & { templateId: string }) => void
  removeLineItem: (index: number) => void
  updateLineItem: (index: number, updates: Partial<QuoteLineItem>) => void
  setScopeText: (text: string | null) => void
  setNotes: (notes: string) => void
  setIsGeneratingScope: (isGenerating: boolean) => void
  setIsSaving: (isSaving: boolean) => void
  setError: (error: string | null) => void
  calculateTotals: (vatEnabled: boolean, vatRate: number, depositPct: number) => void
  reset: () => void
}

const initialState = {
  step: 1 as const,
  client: null,
  clientName: '',
  lineItems: [],
  scopeText: null,
  notes: '',
  subtotal: 0,
  vatRate: 15,
  vatAmount: 0,
  total: 0,
  depositPct: 30,
  depositAmount: 0,
  isGeneratingScope: false,
  isSaving: false,
  error: null,
}

export const useQuoteBuilder = create<QuoteBuilderState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setClient: (client) => set({ client }),

  setClientName: (clientName) => set({ clientName }),

  addLineItem: (item) => set((state) => {
    const items = [...state.lineItems, item]
    return { lineItems: items }
  }),

  removeLineItem: (index) => set((state) => ({
    lineItems: state.lineItems.filter((_, i) => i !== index),
  })),

  updateLineItem: (index, updates) => set((state) => ({
    lineItems: state.lineItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    ),
  })),

  setScopeText: (scopeText) => set({ scopeText }),

  setNotes: (notes) => set({ notes }),

  setIsGeneratingScope: (isGeneratingScope) => set({ isGeneratingScope }),

  setIsSaving: (isSaving) => set({ isSaving }),

  setError: (error) => set({ error }),

  calculateTotals: (vatEnabled, vatRate, depositPct) => {
    set((state) => {
      const subtotal = state.lineItems.reduce((sum, item) => {
        return sum + (Number(item.unit_price || 0) * Number(item.quantity || 1))
      }, 0)

      const vatAmount = vatEnabled ? Math.round(subtotal * (vatRate / 100) * 100) / 100 : 0
      const total = subtotal + vatAmount
      const depositAmount = Math.round(total * (depositPct / 100) * 100) / 100

      return { subtotal, vatAmount, total, depositAmount, vatRate, depositPct }
    })
  },

  reset: () => set(initialState),
}))
