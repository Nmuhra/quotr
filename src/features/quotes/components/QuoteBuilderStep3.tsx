/**
 * Quote Builder Step 3: AI Scope Generation
 */

import { useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useQuoteBuilder } from '../store'
import { Button } from '../../../components/ui/Button'
import { FormError } from '../../../components/ui/FormError'

export function QuoteBuilderStep3() {
  const {
    setStep,
    lineItems,
    scopeText,
    setScopeText,
    isGeneratingScope,
    setIsGeneratingScope,
    error,
    setError,
  } = useQuoteBuilder()

  // Auto-generate scope on mount or when line items change
  useEffect(() => {
    if (!scopeText && lineItems.length > 0) {
      generateScope()
    }
  }, [])

  const generateScope = async () => {
    setIsGeneratingScope(true)
    setError(null)

    try {
      const itemsList = lineItems
        .map(
          (item) =>
            `- ${item.name} (${item.quantity} × R${Number(item.unit_price).toFixed(2)}): ${item.description || ''}`,
        )
        .join('\n')

      const { data, error: fnError } = await supabase.functions.invoke('generate-scope', {
        body: { items: itemsList },
      })

      if (fnError) throw fnError
      if (data?.scope) {
        setScopeText(data.scope)
      } else {
        throw new Error('No scope generated')
      }
    } catch (err) {
      console.error('Scope generation error:', err)
      setError('Failed to generate scope. You can write it manually.')
      setScopeText('')
    } finally {
      setIsGeneratingScope(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Scope of Work</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-generated description of the work. Edit as needed.
        </p>

        {isGeneratingScope && (
          <div className="p-4 text-center text-gray-500">Generating scope...</div>
        )}

        {error && <FormError message={error} />}

        {!isGeneratingScope && (
          <>
            <textarea
              value={scopeText || ''}
              onChange={(e) => setScopeText(e.target.value)}
              placeholder="Scope of work will appear here..."
              className="w-full h-48 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={generateScope}
              disabled={isGeneratingScope}
              className="mt-2 text-blue-600 text-sm hover:underline"
            >
              🔄 Regenerate
            </button>
          </>
        )}

        <div className="flex gap-2 mt-6">
          <Button type="button" variant="ghost" onClick={() => setStep(2)} fullWidth>
            Back
          </Button>
          <Button type="button" onClick={() => setStep(4)} fullWidth>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
