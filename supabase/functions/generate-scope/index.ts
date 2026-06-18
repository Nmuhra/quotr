// supabase/functions/generate-scope/index.ts
// Generates scope of work from line items using Claude API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

interface RequestBody {
  items: string
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { items }: RequestBody = await req.json()

    if (!items) {
      return new Response(JSON.stringify({ error: 'items required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `You are a professional quote writer for tradespeople in South Africa. Generate a concise, professional scope of work paragraph based on these line items:

${items}

Write in first person ("I will", "We will"). Keep it under 150 words. Professional tone.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude API error: ${error}`)
    }

    const data = await response.json()
    const scope = data.content[0]?.text || ''

    return new Response(JSON.stringify({ scope }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})
