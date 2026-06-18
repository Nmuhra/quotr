/**
 * Quote Builder Step 2: Add Line Items
 */

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../features/auth/AuthContext'
import { useQuoteBuilder } from './store'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Database } from '../../lib/database.types'

type LineItemTemplate = Database['public']['Tables']['line_item_templates']['Row']

export function QuoteBuilderStep2() {
  const { business } = useAuth()
  const { setStep, lineItems, addLineItem, removeLineItem, updateLineItem, calculateTotals } =
    useQuoteBuilder()

  const [templates, setTemplates] = useState<LineItemTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')

  useEffect(() => {
    loadTemplates()
  }, [business?.id])

  const loadTemplates = async () => {
    if (!business) return
    setIsLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('line_item_templates')
      .select('*')
      .eq('business_id', business.id)
      .is('deleted_at', null)
      .order('sort_order')

    if (err) {
      setError('Failed to load rate card')
    } else {
      setTemplates(data || [])
    }
    setIsLoading(false)
  }

  const handleAddItem = (template: LineItemTemplate) => {
    const qty = Math.max(1, Number(quantity) || 1)
    addLineItem({
      id: crypto.randomUUID(),
      quote_id: '', // Will be set on save
      name: template.name,
      description: template.description || '',
      quantity: qty,
      unit_price: template.unit_price,
      unit: template.unit,
      total: qty * Number(template.unit_price),
      sort_order: lineItems.length,
      created_at: new Date().toISOString(),
      templateId: template.id,
    })
    setQuantity('1')
    calculateTotals(false, 15, 30) // Will be updated in next steps
  }

  const handleRemoveItem = (index: number) => {
    removeLineItem(index)
  }

  const handleUpdateQuantity = (index: number, qty: number) => {
    const item = lineItems[index]
    updateLineItem(index, {
      quantity: qty,
      total: qty * Number(item.unit_price),
    })
    calculateTotals(false, 15, 30)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Add Line Items</h2>

        {/* Rate Card */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Your Rate Card</h3>

          {isLoading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {templates.length === 0 && !isLoading && (
            <p className="text-gray-500 text-sm">No rate card items yet</p>
          )}

          <div className="space-y-2">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{template.name}</div>
                  {template.description && (
                    <div className="text-xs text-gray-500">{template.description}</div>
                  )}
                  <div className="text-sm font-semibold mt-1">
                    R{Number(template.unit_price).toFixed(2)} / {template.unit}
                  </div>
                </div>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-12 px-2 py-1 text-sm border rounded"
                />
                <Button
                  type="button"
                  onClick={() => handleAddItem(template)}
                  className="px-3 py-1 text-sm"
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Added Items */}
        {lineItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Quote Items ({lineItems.length})</h3>
            <div className="space-y-2">
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-600">
                      {item.quantity} × R{Number(item.unit_price).toFixed(2)} = R
                      {Number(item.total).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(i, Number(e.target.value))}
                      className="w-12 px-2 py-1 text-sm border rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveItem(i)}
                      className="px-2 py-1 text-sm text-red-600"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => setStep(1)} fullWidth>
            Back
          </Button>
          <Button
            type="button"
            onClick={() => setStep(3)}
            disabled={lineItems.length === 0}
            fullWidth
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
