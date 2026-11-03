import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const SYSTEM_PROMPT = `You are the eehu! support assistant. eehu! is a service that builds and integrates live chat widgets into existing business websites.

YOUR ONLY JOB is to help visitors understand eehu! and what it can do for their business. You must not answer questions outside this scope.

If someone asks about anything unrelated to eehu! — such as general coding help, other products, news, personal advice, math problems, or any other topic — politely decline and bring the conversation back to eehu!. Example: "I can only help with questions about eehu! and how it works for your business. Is there something I can help you with on that front?"

NEVER answer off-topic questions even if the user insists.

What eehu! does:
- Builds and integrates a live chat widget into a business's existing website
- The business does not need to rebuild their site or hire a developer
- The chat is customised to match the business's brand and voice
- Customers can start a conversation any time; the business replies when ready
- It shows businesses what questions their website keeps failing to answer

How to respond:
- Keep replies short, warm, and plain. No jargon.
- Speak like a helpful person, not a product manual.
- If someone asks about pricing, say the team will share details personally and ask them to leave their contact or website.
- If someone wants to get started, ask for their website URL and a brief description of their business.
- If someone asks to speak to a human, a real person, or says they prefer human support, respond with exactly this text and nothing else: ESCALATE_TO_HUMAN
- Always be friendly and brief.`

// Model fallback chain — fastest/newest first, most stable last
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
]

// Cache the last working model in memory across serverless invocations
let cachedModel: string | null = null

async function callGemini(
  apiKey: string,
  model: string,
  contents: object[],
  apiVersion = 'v1beta'
): Promise<{ ok: boolean; data?: object; status?: number }> {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // AQ. auth keys require x-goog-api-key header (not ?key= query param)
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.65 },
    }),
  })
  if (!res.ok) return { ok: false, status: res.status }
  const data = await res.json()
  return { ok: true, data }
}

function extractReply(data: object): string {
  const parts: { text?: string; thought?: boolean }[] =
    (data as any)?.candidates?.[0]?.content?.parts ?? []
  // Filter out reasoning/thought tokens from models like gemini-2.5-flash
  const answerParts = parts.filter((p) => !p.thought && typeof p.text === 'string')
  return answerParts.map((p) => p.text).join('').trim() || 'Sorry, I could not generate a response.'
}

async function getGeminiReply(apiKey: string, contents: object[]): Promise<string> {
  // Try cached model first for speed
  if (cachedModel) {
    const res = await callGemini(apiKey, cachedModel, contents)
    if (res.ok && res.data) return extractReply(res.data)
    // Cached model stopped working — clear it and fall through
    cachedModel = null
  }

  // Try each candidate in order
  for (const model of MODEL_CANDIDATES) {
    // Try v1beta first, then v1
    for (const version of ['v1beta', 'v1']) {
      const res = await callGemini(apiKey, model, contents, version)
      if (res.ok && res.data) {
        cachedModel = model // Cache for next request
        return extractReply(res.data)
      }
      if (res.status !== 404) break // Non-404 means model exists but something else failed
    }
  }

  return 'Sorry, I could not generate a response right now. Please try again.'
}

export async function POST(req: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim()
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured.' }, { status: 500 })
  }

  const { messages, sessionId } = await req.json() as {
    messages: { role: 'user' | 'model'; text: string }[]
    sessionId: string
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const latestUserMessage = messages[messages.length - 1]
  const db = getSupabase()

  // Persist user message (non-blocking)
  if (db) {
    db.from('conversations')
      .upsert({ session_id: sessionId }, { onConflict: 'session_id' })
      .then(() => db.from('messages').insert({
        session_id: sessionId,
        role: 'user',
        text: latestUserMessage.text,
      }))
  }

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  const raw = await getGeminiReply(apiKey, contents)
  const escalate = raw.trim() === 'ESCALATE_TO_HUMAN'
  const agentReply = escalate
    ? 'No problem at all! Click below to chat with a real person on WhatsApp right now.'
    : raw

  // Persist agent reply (non-blocking)
  if (db) {
    db.from('messages').insert({
      session_id: sessionId,
      role: 'agent',
      text: agentReply,
    })
  }

  return NextResponse.json({ reply: escalate ? '' : raw, escalate })
}
