import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const SYSTEM_PROMPT = `You are the eehu! support assistant. eehu! is a service that builds and integrates live chat widgets into existing business websites.

YOUR ONLY JOB is to help visitors understand eehu! and how live chat can work for their business. Answer specific questions and use cases when they relate to eehu!, setting up the widget, or using it to support their customers.

If someone asks about anything unrelated to eehu! or live chat for their business, such as general coding help, other products, news, personal advice, math problems, or any other topic, politely decline and bring the conversation back to eehu!. Example: "I can only help with questions about eehu! and how live chat can help your business. Is there something I can help you with on that front?"

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
    return 'eehu! designs and adds a custom live chat widget directly into your existing website. Your visitors can ask questions or request support at any time, and your team can reply when ready. You do not need to redesign your site or hire a developer. We handle the integration from start to finish.'
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
    return 'We handle the entire setup for you. We provide a lightweight, single-line snippet designed for your site (WordPress, Shopify, Webflow, Squarespace, Wix, or custom HTML), or our team can install it directly for you. You do not need any coding knowledge.'
  }

  if (
    q === 'how long does setup take?' ||
    q.includes('how long does setup take') ||
    q.includes('how fast') ||
    q.includes('setup time') ||
    q.includes('turnaround')
  ) {
    return 'Setup is typically complete within 24 to 48 hours. We customize the widget colors, branding, and messaging to match your company, test everything thoroughly, and confirm it runs cleanly on your website before launching.'
  }

  if (
    q === 'how much does it cost?' ||
    q.includes('how much does it cost') ||
    q.includes('pricing') ||
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('rates')
  ) {
    return 'We provide simple, transparent pricing tailored to your website and support needs. Share your website URL and contact details with us here, or tap "I want to talk to a real person" to discuss pricing directly with our team on WhatsApp.'
  }

  if (
    q === 'can i see an example?' ||
    q.includes('can i see an example') ||
    q.includes('example') ||
    q.includes('demo') ||
    q.includes('sample')
  ) {
    return 'You are using an example right now. This chat widget in the corner is eehu! running live. We customize the branding, colors, greeting, and conversation flow to match each client.'
  }

  if (
    q.includes('get started') ||
    q.includes('sign up') ||
    q.includes('how to start') ||
    q.includes('onboard')
  ) {
    return 'Getting started is simple. Tell us your website URL and a brief note about what your business offers. Our team will review your site and guide you through the setup.'
  }

  // Fallback for general inquiries
  return 'Thanks for reaching out! eehu! builds and integrates live chat widgets directly into your existing website without requiring code changes from your team. If you have questions about your site or want to explore adding live chat, please share your website URL or tap "I want to talk to a real person" to connect with our team on WhatsApp.'
}

async function callGemini(
  apiKey: string,
  model: string,
  contents: object[],
  apiVersion = 'v1beta'
): Promise<{ data: GeminiResponse } | { status: number; message: string }> {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
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
  try {
    const db = getSupabase()
    if (!db || !sessionId) return
    await db.from('conversations').upsert({ session_id: sessionId }, { onConflict: 'session_id' })
    await db.from('messages').insert({ session_id: sessionId, role, text })
  } catch (err) {
    console.warn('Database save error:', err)
  }
}

export async function POST(req: NextRequest) {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim()

  const { messages, sessionId } = (await req.json()) as {
    messages: { role: 'user' | 'model'; text: string }[]
    sessionId: string
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const latestUserMessage = messages[messages.length - 1]

  // Persist user message asynchronously
  void saveMessage(sessionId, 'user', latestUserMessage.text)

  // 1. Instant check for human escalation requests
  if (isHumanEscalation(latestUserMessage.text)) {
    const escalateReply = 'No problem at all! Click below to chat with a real person on WhatsApp right now.'
    void saveMessage(sessionId, 'agent', escalateReply)
    return NextResponse.json({ reply: '', escalate: true })
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
    replyText = getKnowledgeBaseReply(latestUserMessage.text)
  }

  const agentReply = escalate
    ? 'No problem at all! Click below to chat with a real person on WhatsApp right now.'
    : replyText

  // Persist agent reply asynchronously
  void saveMessage(sessionId, 'agent', agentReply)

  return NextResponse.json({
    reply: escalate ? '' : agentReply,
    escalate,
  })
}
