import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual, createHash } from 'crypto'

// Admin route uses the service role key so it can read all data
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

// Constant-time comparison to prevent timing attacks on the admin secret
function verifySecret(provided: string, expected: string): boolean {
  try {
    const a = createHash('sha256').update(provided).digest()
    const b = createHash('sha256').update(expected).digest()
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  // Constant-time secret verification to prevent timing attacks
  const adminSecret = process.env.ADMIN_SECRET
  const token = req.headers.get('x-admin-secret')
  if (!adminSecret || !token || !verifySecret(token, adminSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const db = getAdminClient()
  if (!db) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500, headers: NO_STORE })
  }

  // Fetch all conversations with their messages
  const { data: conversations, error: convErr } = await db
    .from('conversations')
    .select('id, session_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (convErr) {
    return NextResponse.json({ error: convErr.message }, { status: 500, headers: NO_STORE })
  }

  // Fetch messages for all sessions
  const sessionIds = conversations.map((c) => c.session_id)
  const { data: messages, error: msgErr } = await db
    .from('messages')
    .select('session_id, role, text, created_at')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: true })

  if (msgErr) {
    return NextResponse.json({ error: msgErr.message }, { status: 500, headers: NO_STORE })
  }

  // Group messages by session_id
  const grouped = conversations.map((conv) => ({
    ...conv,
    messages: messages.filter((m) => m.session_id === conv.session_id),
  }))

  return NextResponse.json({ conversations: grouped }, { headers: NO_STORE })
}
