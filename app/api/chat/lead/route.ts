import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const NO_STORE = { 'Cache-Control': 'no-store' }

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400, headers: NO_STORE })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400, headers: NO_STORE })
  }

  const { sessionId, leadName, leadContact, leadService } = body as Record<string, unknown>

  if (typeof sessionId !== 'string' || !SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 400, headers: NO_STORE })
  }
  if (typeof leadName !== 'string' || leadName.trim().length === 0 || leadName.length > 120) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400, headers: NO_STORE })
  }
  if (typeof leadContact !== 'string' || leadContact.trim().length === 0 || leadContact.length > 200) {
    return NextResponse.json({ error: 'Contact is required.' }, { status: 400, headers: NO_STORE })
  }
  if (typeof leadService !== 'string' || leadService.trim().length === 0 || leadService.length > 500) {
    return NextResponse.json({ error: 'Service is required.' }, { status: 400, headers: NO_STORE })
  }

  const db = getAnonClient()
  if (!db) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500, headers: NO_STORE })
  }

  const { error } = await db
    .from('conversations')
    .update({
      lead_name: leadName.trim(),
      lead_contact: leadContact.trim(),
      lead_service: leadService.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)

  if (error) {
    return NextResponse.json({ error: 'Could not save lead details.' }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}

