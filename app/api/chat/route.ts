import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

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

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured.' },
      { status: 500 }
    )
  }

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'model'; text: string }[]
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }))

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.65,
    },
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Gemini error:', err)
    return NextResponse.json(
      { error: 'Failed to get a response. Please try again.' },
      { status: 502 }
    )
  }

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Sorry, I could not generate a response.'

  // Detect escalation signal from the model
  const escalate = raw.trim() === 'ESCALATE_TO_HUMAN'

  return NextResponse.json({
    reply: escalate ? '' : raw,
    escalate,
  })
}
