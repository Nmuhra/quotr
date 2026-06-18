/**
 * Quote Builder Step 1: Select/Create Client
 */

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../features/auth/AuthContext'
import { useQuoteBuilder } from '../store'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { FormError } from '../../../components/ui/FormError'
import type { Database } from '../../../lib/database.types'

type Client = Database['public']['Tables']['clients']['Row']

export function QuoteBuilderStep1() {
  const { business } = useAuth()
  const { setStep, setClient, clientName, setClientName } = useQuoteBuilder()

  const [clients, setClients] = useState<Client[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')

  const loadClients = async () => {
    if (!business) return
    setIsLoadingClients(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .eq('business_id', business.id)
      .is('deleted_at', null)
      .order('name')

    if (err) {
      setError('Failed to load clients')
    } else {
      setClients(data || [])
    }
    setIsLoadingClients(false)
  }

  const handleSelectClient = (client: Client) => {
    setClient(client)
    setClientName(client.name)
    setStep(2)
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business || !clientName.trim()) return

    setIsCreating(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('clients')
      .insert([
        {
          business_id: business.id,
          name: clientName.trim(),
          email: newClientEmail || null,
          phone: newClientPhone || null,
        },
      ])
      .select()
      .single()

    if (err) {
      setError('Failed to create client')
      setIsCreating(false)
      return
    }

    setClient(data)
    setStep(2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Who is this quote for?</h2>

        {!showForm ? (
          <>
            <Button
              type="button"
              onClick={loadClients}
              disabled={isLoadingClients}
              fullWidth
              className="mb-4"
            >
              {isLoadingClients ? 'Loading...' : 'Select Existing Client'}
            </Button>

            {clients.length > 0 && (
              <div className="grid gap-2 mb-4">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="p-3 text-left border rounded-lg hover:bg-blue-50 transition"
                  >
                    <div className="font-medium">{client.name}</div>
                    {client.email && (
                      <div className="text-sm text-gray-500">{client.email}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(true)}
              fullWidth
            >
              + New Client
            </Button>
          </>
        ) : (
          <form onSubmit={handleCreateClient} className="space-y-4">
            <Input
              label="Client Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John Smith"
              required
            />
            <Input
              label="Email"
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="optional"
            />
            <Input
              label="Phone"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              placeholder="optional"
            />

            {error && <FormError message={error} />}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  setClientName('')
                  setNewClientEmail('')
                  setNewClientPhone('')
                }}
                fullWidth
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!clientName.trim() || isCreating}
                isLoading={isCreating}
                fullWidth
              >
                Create & Continue
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
