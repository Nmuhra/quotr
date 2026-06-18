/**
 * Quote Builder Step 4: Preview & Settings
 */

import { useQuoteBuilder } from '../store'
import { Button } from '../../../components/ui/Button'

export function QuoteBuilderStep4() {
  const {
    setStep,
    clientName,
    lineItems,
    scopeText,
    notes,
    setNotes,
    subtotal,
    vatAmount,
    total,
    depositAmount,
    vatRate,
    depositPct,
    calculateTotals,
  } = useQuoteBuilder()

  const handleVatToggle = () => {
    calculateTotals(vatAmount === 0, vatRate, depositPct)
  }

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Math.max(0, Math.min(100, Number(e.target.value)))
    calculateTotals(vatAmount > 0, vatRate, pct)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Review Quote</h2>

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div className="text-sm text-gray-600">Client: {clientName}</div>
          <div className="text-sm text-gray-600 mt-1">Items: {lineItems.length}</div>
        </div>

        {/* Line Items */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Line Items</h3>
          <div className="space-y-1">
            {lineItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name} ({item.quantity}×)
                </span>
                <span>R{Number(item.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scope */}
        {scopeText && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Scope of Work</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{scopeText}</p>
          </div>
        )}

        {/* Calculations */}
        <div className="mb-4 space-y-3 p-3 border rounded-lg">
          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={vatAmount > 0}
                onChange={handleVatToggle}
                className="w-4 h-4"
              />
              <span className="text-sm">VAT ({vatRate}%)</span>
            </label>
            <span>R{vatAmount.toFixed(2)}</span>
          </div>

          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>R{total.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">
              Deposit Required
              <input
                type="number"
                min="0"
                max="100"
                value={depositPct}
                onChange={handleDepositChange}
                className="w-16 ml-2 px-2 py-1 border rounded text-right"
              />
              %
            </label>
            <span className="font-medium">R{depositAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Payment terms, warranty, etc."
            className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => setStep(3)} fullWidth>
            Back
          </Button>
          <Button type="button" onClick={() => setStep(5)} fullWidth>
            Send Quote
          </Button>
        </div>
      </div>
    </div>
  )
}
