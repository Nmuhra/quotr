/**
 * Quotr — OnboardingPage
 *
 * Shown after email confirmation for users whose business record
 * has placeholder values (name = 'My Business' OR trade_type = 'general').
 *
 * Flow:
 *   1. Pre-fills fields from whatever the DB trigger saved at signup
 *   2. User confirms/corrects business name and trade type
 *   3. On save → updates the businesses row via Supabase
 *   4. Calls refreshBusiness() so AuthContext picks up the new values
 *   5. OnboardingGuard now sees isOnboarded = true → redirects to /app
 *
 * Design: same industrial-utility aesthetic as the auth screens.
 * Warmer tone — this is a welcome moment, not just a form.
 */

import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { supabase } from '../../lib/supabase'
import { ROUTES } from '../../lib/routes'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { FormError } from '../../components/ui/FormError'
import { QuotrLogo } from '../../components/ui/QuotrLogo'
import { TradeTypePicker } from '../../features/auth/TradeTypePicker'
import { LogoUpload } from '../../features/business/components/LogoUpload'
import { RateCardSetup } from '../../features/business/components/RateCardSetup'
import type { TradeType } from '../../lib/database.types'

type Step = 'basics' | 'branding' | 'rate-card'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, business, refreshBusiness } = useAuth()

  const [step, setStep] = useState<Step>('basics')
  
  // Basics state
  const [businessName, setBusinessName] = useState(
    business?.name && business.name !== 'My Business' ? business.name : ''
  )
  const [tradeType, setTradeType] = useState<TradeType | ''>(
    business?.trade_type && business.trade_type !== 'general'
      ? (business.trade_type as TradeType)
      : ''
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBasicsSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!tradeType) { setError('Please select your trade.'); return }
    if (!businessName.trim()) { setError('Please enter your business name.'); return }

    setIsLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: businessName.trim(),
        trade_type: tradeType,
      })
      .eq('owner_id', user!.id)

    if (updateError) {
      setError('Something went wrong saving your details. Please try again.')
      setIsLoading(false)
      return
    }

    await refreshBusiness()
    setIsLoading(false)
    setStep('branding')
  }

  const handleFinish = async () => {
    // Final refresh to ensure AuthContext has everything
    await refreshBusiness()
    navigate(ROUTES.dashboard, { replace: true })
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-grid" aria-hidden="true" />

      <div className="onboarding-card">
        <div className="onboarding-header">
          <QuotrLogo size={38} />
          <div className="onboarding-welcome">
            <h1 className="onboarding-title">
              {step === 'basics' && "Welcome to Quotr"}
              {step === 'branding' && "Look professional"}
              {step === 'rate-card' && "Ready to go"}
            </h1>
            <p className="onboarding-subtitle">
              {step === 'basics' && "Let's set up your business profile."}
              {step === 'branding' && "Upload your logo for quotes and invoices."}
              {step === 'rate-card' && "Confirm your pre-loaded trade templates."}
            </p>
          </div>

          <div className="onboarding-step-track">
            <div 
              className="onboarding-step-fill" 
              style={{ 
                width: step === 'basics' ? '33%' : step === 'branding' ? '66%' : '100%',
                transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
              }} 
            />
          </div>
        </div>

        {step === 'basics' && (
          <form onSubmit={handleBasicsSubmit} noValidate>
            <div className="onboarding-fields">
              <Input
                id="business-name"
                type="text"
                label="Business name"
                placeholder="e.g. Smith Plumbing"
                autoComplete="organization"
                autoFocus
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                disabled={isLoading}
                required
              />

              <div className="onboarding-trade-field">
                <span className="onboarding-trade-label">Your trade</span>
                <TradeTypePicker
                  value={tradeType}
                  onChange={val => { setTradeType(val); setError(null) }}
                  disabled={isLoading}
                />
              </div>

              {error && <FormError message={error} />}

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                disabled={!businessName.trim() || !tradeType}
                fullWidth
              >
                Continue →
              </Button>
            </div>
          </form>
        )}

        {step === 'branding' && (
          <div className="onboarding-fields">
            <LogoUpload 
              currentUrl={business?.logo_url} 
              onComplete={() => {}} // LogoUpload handles DB update
            />
            
            <Button
              type="button"
              size="lg"
              onClick={() => setStep('rate-card')}
              fullWidth
            >
              Continue →
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('rate-card')}
              fullWidth
            >
              Skip logo for now
            </Button>
          </div>
        )}

        {step === 'rate-card' && (
          <RateCardSetup 
            tradeType={tradeType || 'general'} 
            onComplete={handleFinish} 
          />
        )}
      </div>

      <style>{`
        .onboarding-screen {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: env(safe-area-inset-top, 24px) 20px env(safe-area-inset-bottom, 24px);
          background: var(--color-bg);
          position: relative;
          overflow: hidden;
        }

        .onboarding-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle,
            rgba(240, 165, 0, 0.12) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
          pointer-events: none;
          mask-image: radial-gradient(
            ellipse 80% 80% at 50% 50%,
            black 40%,
            transparent 100%
          );
        }

        .onboarding-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: var(--shadow-md),
                      0 0 0 1px rgba(240, 165, 0, 0.06);
          animation: card-rise 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes card-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .onboarding-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .onboarding-welcome {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .onboarding-title {
          font-family: var(--font-display);
          font-size: 26px;
          font-weight: 800;
          color: var(--color-text-primary);
          margin: 0;
          letter-spacing: -0.03em;
        }

        .onboarding-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .onboarding-step-track {
          width: 100%;
          height: 3px;
          background: var(--color-border);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 4px;
        }

        .onboarding-step-fill {
          height: 100%;
          background: var(--color-accent);
          border-radius: 99px;
        }

        .onboarding-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .onboarding-trade-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .onboarding-trade-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-text-secondary);
        }

        @media (max-width: 360px) {
          .onboarding-card { padding: 28px 20px; }
          .onboarding-title { font-size: 22px; }
        }
      `}</style>
    </div>
  )
}