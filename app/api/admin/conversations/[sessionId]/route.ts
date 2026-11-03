import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual, createHash } from 'crypto'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

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

const VALID_STATUSES = new Set(['new', 'contacted', 'quote_sent', 'won', 'lost'])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const adminSecret = process.env.ADMIN_SECRET
  const token = req.headers.get('x-admin-secret')
  if (!adminSecret || !token || !verifySecret(token, adminSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE })
  }

  const { sessionId } = await params
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'Missing session ID.' }, { status: 400, headers: NO_STORE })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400, headers: NO_STORE })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400, headers: NO_STORE })
  }

  const { status, dealValue, notes, followUpDate, nextAction } = body as Record<string, unknown>

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (status !== undefined) {
    if (typeof status !== 'string' || !VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400, headers: NO_STORE })
    }
    updates.status = status
  }

  if (dealValue !== undefined) {
    const num = Number(dealValue)
    if (!Number.isFinite(num) || num < 0) {
      return NextResponse.json({ error: 'Deal value must be a positive number.' }, { status: 400, headers: NO_STORE })
    }
    updates.deal_value = num
  }

  if (notes !== undefined) {
    if (typeof notes !== 'string' || notes.length > 2000) {
      return NextResponse.json({ error: 'Notes too long.' }, { status: 400, headers: NO_STORE })
    }
    updates.notes = notes
  }

  if (followUpDate !== undefined) {
    if (followUpDate === null || followUpDate === '') {
      updates.follow_up_date = null
    } else if (typeof followUpDate === 'string' && !isNaN(Date.parse(followUpDate))) {
      updates.follow_up_date = new Date(followUpDate).toISOString()
    } else {
      return NextResponse.json({ error: 'Invalid follow-up date.' }, { status: 400, headers: NO_STORE })
    }
  }

  if (nextAction !== undefined) {
    if (typeof nextAction !== 'string' || nextAction.length > 500) {
      return NextResponse.json({ error: 'Next action text too long.' }, { status: 400, headers: NO_STORE })
    }
    updates.next_action = nextAction
  }

  const db = getAdminClient()
  if (!db) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 500, headers: NO_STORE })
  }

  const { error } = await db
    .from('conversations')
    .update(updates)
    .eq('session_id', sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: NO_STORE })
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}

