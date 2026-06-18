/**
 * Quote Builder Step 5: Send Quote
 */

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../features/auth/AuthContext'
import { useQuoteBuilder } from '../store'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { FormError } from '../../../components/ui/FormError'

export function QuoteBuilderStep5() {
  const { business } = useAuth()
  const {
    setStep,
    client,
    clientName,
    lineItems,
    scopeText,
    notes,
    total,
    depositAmount,
    depositPct,
    vatAmount,
    isSaving,
    setIsSaving,
    error,
    setError,
    reset,
  } = useQuoteBuilder()

  const [clientEmail, setClientEmail] = useState(client?.email || '')
  const [clientPhone, setClientPhone] = useState(client?.phone || '')
  const [quoteNumber, setQuoteNumber] = useState(`QT-${new Date().getTime()}`)
  const [isSent, setIsSent] = useState(false)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || !client) return

    setIsSaving(true)
    setError(null)

    try {
      // 1. Save quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert([
          {
            business_id: business.id,
            client_id: client.id,
            quote_number: quoteNumber,
            status: 'sent',
            scope_text: scopeText,
            notes: notes || null,
            subtotal: lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0),
            vat_enabled: vatAmount > 0,
            vat_rate: vatAmount > 0 ? 15 : 0,
            vat_amount: vatAmount,
            total,
            deposit_pct: depositPct,
            deposit_amount: depositAmount,
            validity_days: 30,
            payment_terms: 'Due on invoice',
            public_token: crypto.randomUUID(),
            sent_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (quoteError) throw quoteError

      // 2. Save line items
      const { error: itemsError } = await supabase.from('quote_line_items').insert(
        lineItems.map((item) => ({
          quote_id: quote.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit,
          total: item.total,
        })),
      )

      if (itemsError) throw itemsError

      // 3. Update client contact info if changed
      if (clientEmail || clientPhone) {
        await supabase
          .from('clients')
          .update({
            email: clientEmail || null,
            phone: clientPhone || null,
          })
          .eq('id', client.id)
      }

      // Generate public URL
      const url = `${window.location.origin}/q/${quote.public_token}`
      setPublicUrl(url)
      setIsSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send quote')
    } finally {
      setIsSaving(false)
    }
  }

  if (isSent && publicUrl) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-lg font-semibold mb-2">Quote Sent!</h2>
          <p className="text-gray-600 mb-4">
            Quote created. Share the link below with {clientName}.
          </p>

          {/* Share URL */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Public Link</p>
            <code className="text-sm break-all font-mono">{publicUrl}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="block mt-2 text-blue-600 text-sm hover:underline"
            >
              Copy Link
            </button>
          </div>

          {/* WhatsApp Link */}
          {clientPhone && (
            <a
              href={`https://wa.me/${clientPhone.replace(/\D/g, '')}?text=Hi%20${clientName}%2C%20here%27s%20your%20quote%3A%20${encodeURIComponent(publicUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-green-500 text-white rounded-lg font-medium mb-4"
            >
              Send via WhatsApp
            </a>
          )}

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                reset()
                setStep(1)
                setIsSent(false)
                setPublicUrl(null)
              }}
              fullWidth
            >
              Create Another Quote
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Send Quote</h2>

        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="Quote Number"
            value={quoteNumber}
            onChange={(e) => setQuoteNumber(e.target.value)}
          />

          <Input
            label="Client Email"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="optional"
          />

          <Input
            label="Client Phone (for WhatsApp)"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="optional"
          />

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Quote Summary</div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Total:</span>
              <span>R{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Deposit ({depositPct}%):</span>
              <span>R{depositAmount.toFixed(2)}</span>
            </div>
          </div>

          {error && <FormError message={error} />}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(4)} fullWidth>
              Back
            </Button>
            <Button type="submit" disabled={isSaving} isLoading={isSaving} fullWidth>
              Send Quote
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
