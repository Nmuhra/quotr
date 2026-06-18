/**
 * Quote Builder
 * Multi-step form to create and send quotes
 */

import { useQuoteBuilder } from '../../features/quotes/store'
import { QuoteBuilderStep1 } from '../../features/quotes/components/QuoteBuilderStep1'
import { QuoteBuilderStep2 } from '../../features/quotes/components/QuoteBuilderStep2'
import { QuoteBuilderStep3 } from '../../features/quotes/components/QuoteBuilderStep3'
import { QuoteBuilderStep4 } from '../../features/quotes/components/QuoteBuilderStep4'
import { QuoteBuilderStep5 } from '../../features/quotes/components/QuoteBuilderStep5'

export default function QuoteBuilderPage() {
  const { step, reset } = useQuoteBuilder()

  const steps = [
    { num: 1, label: 'Client' },
    { num: 2, label: 'Line Items' },
    { num: 3, label: 'Scope' },
    { num: 4, label: 'Review' },
    { num: 5, label: 'Send' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Create Quote</h1>
          <p className="text-gray-600">Step {step} of 5</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-2">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`flex-1 h-2 rounded-full transition ${
                  s.num <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            {steps.map((s) => (
              <span key={s.num}>{s.label}</span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {step === 1 && <QuoteBuilderStep1 />}
          {step === 2 && <QuoteBuilderStep2 />}
          {step === 3 && <QuoteBuilderStep3 />}
          {step === 4 && <QuoteBuilderStep4 />}
          {step === 5 && <QuoteBuilderStep5 />}
        </div>

        {/* Help / Reset */}
        <div className="text-center mb-4">
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  )
}

