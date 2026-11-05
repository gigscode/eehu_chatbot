import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  const { sessionId, leadName, leadContact, leadService } = await req.json() as {
    sessionId: string
    leadName: string
    leadContact: string
    leadService: string
  }

  if (!sessionId || !leadName || !leadContact) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const db = getAdminClient()
  if (!db) {
    // Supabase not configured — still let the WhatsApp handoff proceed
    return NextResponse.json({ ok: true })
  }

  // Upsert the conversation row with lead details
  const { error } = await db
    .from('conversations')
    .upsert(
      {
        session_id: sessionId,
        lead_name: leadName.trim(),
        lead_contact: leadContact.trim(),
        lead_service: leadService?.trim() ?? '',
        status: 'new',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    )

  if (error) {
    console.error('Lead save error:', error.message)
    // Still let the WhatsApp handoff proceed even if DB write fails
    return NextResponse.json({ ok: true, warning: 'Lead details could not be saved.' })
  }

  return NextResponse.json({ ok: true })
}
