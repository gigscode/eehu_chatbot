import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const SYSTEM_PROMPT = `You are the eehu! support assistant. eehu! helps service businesses capture website enquiries, organize leads, and follow up before valuable opportunities disappear.

YOUR ONLY JOB is to help visitors understand eehu! as a website lead-capture and follow-up system, not just a chatbot. Answer questions about how eehu! helps a business collect enquiries, track leads, manage follow-ups, and turn website visitors into paying customers.

If someone asks about anything unrelated to eehu! or business lead capture, such as general coding help, other products, news, personal advice, math problems, or any other topic, politely decline and bring the conversation back to eehu!. Example: "I can only help with questions about eehu! and how it helps businesses capture and follow up on leads. Is there something I can help you with on that front?"

NEVER answer off-topic questions even if the user insists.

What eehu! does:
- Captures enquiries from a business's website before visitors disappear
- Stores each lead in one simple system instead of burying conversations in WhatsApp chats
- Makes it easy to know who needs a follow-up today
- Tracks quote requests, conversations, and sales progress in one place
- Helps businesses close more deals from website traffic

How to respond:
- Keep replies short, warm, and plain. No jargon.
- Speak like a helpful person, not a product manual.
- If someone asks about pricing, say the team will share details personally and ask for their contact or website.
- If someone wants to get started, ask for their website URL and a brief description of their business.
- If someone asks to speak to a human, a real person, or says they prefer human support, respond with exactly this text and nothing else: ESCALATE_TO_HUMAN
- Always be friendly and brief.`

// Production Gemini model candidates in priority order
const MODEL_CANDIDATES = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
]

// Cache the last working model in memory
let cachedModel: string | null = null

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string; thought?: boolean }[]
    }
  }[]
  error?: { message?: string }
}

function isHumanEscalation(text: string): boolean {
  const t = text.trim().toLowerCase()
  return (
    t === 'escalate_to_human' ||
    t === 'i want to talk to a real person' ||
    t.includes('real person') ||
    t.includes('talk to a human') ||
    t.includes('speak to a human') ||
    t.includes('human support') ||
    t.includes('talk to someone') ||
    t.includes('speak to someone') ||
    t.includes('chat with someone') ||
    t.includes('human agent') ||
    t.includes('live agent') ||
    t.includes('whatsapp') ||
    t.includes('call me')
  )
}

function getKnowledgeBaseReply(query: string): string {
  const q = query.trim().toLowerCase()

  if (
    q === 'what does eehu! actually do?' ||
    q.includes('what does eehu') ||
    q.includes('what do you do') ||
    q.includes('what is eehu') ||
    q.includes('how does eehu work')
  ) {
    return 'eehu! helps businesses capture website enquiries, organise each lead, and follow up before valuable opportunities disappear. It starts with the chat on your site and turns it into a trackable sales lead instead of another lost WhatsApp message.'
  }

  if (
    q === 'how do you add it to my website?' ||
    q.includes('add it to my website') ||
    q.includes('how to add') ||
    q.includes('how do you install') ||
    q.includes('installation') ||
    q.includes('embed') ||
    q.includes('snippet') ||
    q.includes('wordpress') ||
    q.includes('shopify') ||
    q.includes('webflow') ||
    q.includes('wix') ||
    q.includes('squarespace')
  ) {
    return 'We handle the setup for you. We connect the system to your website and make sure the chat is set up to capture leads, track enquiries, and keep follow-ups organised. You do not need to rebuild your site or do the technical work yourself.'
  }

  if (
    q === 'how long does setup take?' ||
    q.includes('how long does setup take') ||
    q.includes('how fast') ||
    q.includes('setup time') ||
    q.includes('turnaround')
  ) {
    return 'Setup is usually quick. We look at your site, match the branding, and get the system working so your business can start capturing leads without slowing down your team.'
  }

  if (
    q === 'how much does it cost?' ||
    q.includes('how much does it cost') ||
    q.includes('pricing') ||
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('rates')
  ) {
    return 'We tailor the setup to your business and website. Share your website URL and what you do, and our team will walk you through the right package and pricing.'
  }

  if (
    q === 'can i see an example?' ||
    q.includes('can i see an example') ||
    q.includes('example') ||
    q.includes('demo') ||
    q.includes('sample')
  ) {
    return 'You are using an example right now. This chat is an eehu! flow built to capture enquiries and guide visitors toward a helpful next step.'
  }

  if (
    q.includes('get started') ||
    q.includes('sign up') ||
    q.includes('how to start') ||
    q.includes('onboard')
  ) {
    return 'Getting started is simple. Send us your website URL and a short note about your business, and we will tell you the best way to get the system running.'
  }

  // Fallback for general inquiries
  return 'Thanks for reaching out! eehu! helps businesses capture website enquiries, organise leads, and follow up before opportunities disappear. If you want to see how it could work for your business, share your website URL or tap "I want to talk to a real person" and we will take it from there.'
}

async function callGemini(
  apiKey: string,
  model: string,
  contents: object[],
  apiVersion = 'v1beta'
): Promise<{ data: GeminiResponse } | { status: number; message: string }> {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`

  // AQ. prefix keys are the new Google Authorization Key format (introduced May 2026).
  // They must be sent as Bearer tokens, not as x-goog-api-key header values.
  const isAuthKey = apiKey.startsWith('AQ.')
  const authHeaders: Record<string, string> = isAuthKey
    ? { Authorization: `Bearer ${apiKey}` }
    : { 'x-goog-api-key': apiKey }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    signal: AbortSignal.timeout(9000),
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.65 },
    }),
  })
  const data = (await res.json()) as GeminiResponse
  if (!res.ok) {
    return {
      status: res.status,
      message: data.error?.message ?? res.statusText,
    }
  }
  return { data }
}

function extractReply(data: GeminiResponse): string {
  const parts = data.candidates?.[0]?.content?.parts ?? []
  // Filter out reasoning tokens when a model includes them with its answer
  const answerParts = parts.filter((p) => !p.thought && typeof p.text === 'string')
  return answerParts.map((p) => p.text).join('').trim()
}

async function getGeminiReply(apiKey: string, contents: object[]): Promise<string> {
  const models = cachedModel
    ? [cachedModel, ...MODEL_CANDIDATES.filter((model) => model !== cachedModel)]
    : MODEL_CANDIDATES

  for (const model of models) {
    for (const version of ['v1beta', 'v1']) {
      const res = await callGemini(apiKey, model, contents, version)
      if ('data' in res) {
        cachedModel = model
        const reply = extractReply(res.data)
        if (reply) return reply
        throw new Error(`Gemini returned empty text for model ${model}.`)
      }
      // If unauthorized or forbidden, do not waste time checking other models
      if (res.status === 401 || res.status === 403) {
        cachedModel = null
        throw new Error(`Gemini authentication error (${res.status}): ${res.message}`)
      }
    }
  }

  cachedModel = null
  throw new Error('No supported Gemini model was found for this configuration.')
}

async function saveMessage(sessionId: string, role: 'user' | 'agent', text: string) {
  const db = getSupabase()
  if (!db) {
    throw new Error('Database is not configured.')
  }

  const { error: conversationError } = await db
    .from('conversations')
    .upsert({ session_id: sessionId }, { onConflict: 'session_id' })
  if (conversationError) throw conversationError

  const { error: messageError } = await db
    .from('messages')
    .insert({ session_id: sessionId, role, text })
  if (messageError) throw messageError
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const NO_STORE = { 'Cache-Control': 'no-store' }

export async function POST(req: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim()

  let body: { messages?: unknown; sessionId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400, headers: NO_STORE })
  }

  const { messages, sessionId } = body as {
    messages: { role: 'user' | 'model'; text: string }[]
    sessionId: string
  }

  // Input validation
  if (typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session ID.' }, { status: 400, headers: NO_STORE })
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400, headers: NO_STORE })
  }
  if (messages.length > 50) {
    return NextResponse.json({ error: 'Message history too long.' }, { status: 400, headers: NO_STORE })
  }
  const lastText = messages[messages.length - 1]?.text ?? ''
  if (typeof lastText !== 'string' || lastText.trim().length === 0) {
    return NextResponse.json({ error: 'Last message is empty.' }, { status: 400, headers: NO_STORE })
  }
  if (lastText.length > 2000) {
    return NextResponse.json({ error: 'Message too long. Please keep it under 2000 characters.' }, { status: 400, headers: NO_STORE })
  }

  try {
    await saveMessage(sessionId, 'user', lastText)
  } catch (err) {
    console.error('Unable to save incoming chat message:', err)
    return NextResponse.json(
      { error: 'Your message could not be saved. Please try again.' },
      { status: 503, headers: NO_STORE }
    )
  }

  // 1. Instant check for human escalation requests
  if (isHumanEscalation(lastText)) {
    const escalateReply = 'No problem at all! Click below to chat with a real person on WhatsApp right now.'
    try {
      await saveMessage(sessionId, 'agent', escalateReply)
    } catch (err) {
      console.error('Unable to save chat handoff message:', err)
    }
    return NextResponse.json({ reply: '', escalate: true }, { headers: NO_STORE })
  }

  // 2. Attempt Gemini generation if API key is present
  let replyText = ''
  let escalate = false

  if (apiKey) {
    try {
      const contents = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }))
      const raw = await getGeminiReply(apiKey, contents)
      if (raw.trim() === 'ESCALATE_TO_HUMAN') {
        escalate = true
      } else {
        replyText = raw
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.warn('Gemini request failed, falling back to built-in knowledge response:', errMsg)
    }
  }

  // 3. Fall back to built-in knowledge base if Gemini was unavailable or threw an error
  if (!escalate && !replyText) {
    replyText = getKnowledgeBaseReply(lastText)
  }

  const agentReply = escalate
    ? 'No problem at all! Click below to chat with a real person on WhatsApp right now.'
    : replyText

  try {
    await saveMessage(sessionId, 'agent', agentReply)
  } catch (err) {
    console.error('Unable to save chat reply:', err)
  }

  return NextResponse.json(
    {
      reply: escalate ? '' : agentReply,
      escalate,
    },
    { headers: NO_STORE }
  )
}
