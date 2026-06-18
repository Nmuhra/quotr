/**
 * Quotr — RateCardSetup
 * 
 * Shows pre-loaded line items for the user's trade.
 * Allows them to confirm and initialize their business rate card.
 */

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../../components/ui/Button'
import { FormError } from '../../../components/ui/FormError'
import type { Tables } from '../../../lib/database.types'

interface RateCardSetupProps {
  tradeType: string
  onComplete: () => void
}

type Template = Tables<'line_item_templates'>

export function RateCardSetup({ tradeType, onComplete }: RateCardSetupProps) {
  const { business } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTemplates() {
      if (!tradeType) return
      
      setIsLoading(true)
      const { data, error } = await supabase
        .from('line_item_templates')
        .select('*')
        .or(`trade_type.eq.${tradeType},trade_type.eq.general`)
        .filter('business_id', 'is', null)
        .order('sort_order', { ascending: true })

      if (error) {
        setError('Failed to load rate card templates.')
      } else {
        setTemplates(data || [])
      }
      setIsLoading(false)
    }

    fetchTemplates()
  }, [tradeType])

  const handleConfirm = async () => {
    if (!business || templates.length === 0) {
      onComplete()
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // Copy system templates to business templates
      const businessTemplates = templates.map(t => ({
        business_id: business.id,
        name: t.name,
        description: t.description,
        unit: t.unit,
        unit_price: t.unit_price,
        trade_type: t.trade_type,
        sort_order: t.sort_order,
        is_system: false
      }))

      const { error: insertError } = await supabase
        .from('line_item_templates')
        .insert(businessTemplates)

      if (insertError) throw insertError

      onComplete()
    } catch (err: any) {
      console.error('Rate card setup error:', err)
      setError('Failed to save your rate card. You can skip this for now.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="rate-card-loading">Loading your trade templates...</div>
  }

  return (
    <div className="rate-card-setup">
      <div className="rate-card-header">
        <h3 className="rate-card-title">Pre-loaded Rate Card</h3>
        <p className="rate-card-subtitle">
          We've found {templates.length} common items for <strong>{tradeType}</strong>. 
          You can edit these later in settings.
        </p>
      </div>

      <div className="template-list">
        {templates.map(template => (
          <div key={template.id} className="template-item">
            <div className="template-info">
              <span className="template-name">{template.name}</span>
              <span className="template-unit">{template.unit}</span>
            </div>
            <span className="template-price">
              R{template.unit_price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      {error && <FormError message={error} />}

      <div className="rate-card-actions">
        <Button
          type="button"
          onClick={handleConfirm}
          isLoading={isSaving}
          fullWidth
        >
          Confirm & Finish Setup →
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onComplete}
          disabled={isSaving}
          fullWidth
        >
          Skip for now
        </Button>
      </div>

      <style>{`
        .rate-card-setup {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .rate-card-header {
          text-align: left;
        }

        .rate-card-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: var(--color-text-primary);
        }

        .rate-card-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .template-list {
          max-height: 240px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
          /* Custom scrollbar */
        }

        .template-list::-webkit-scrollbar { width: 4px; }
        .template-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }

        .template-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: var(--color-background-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
        }

        .template-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .template-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .template-unit {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }

        .template-price {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-accent);
        }

        .rate-card-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }

        .rate-card-loading {
          padding: 40px 0;
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
