import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual, createHash } from 'crypto'

function verifyBearer(header: string | null, secret: string): boolean {
  if (!header || !header.startsWith('Bearer ')) return false
  const provided = header.slice(7)
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(secret).digest()
  return timingSafeEqual(a, b)
}

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('Supabase keepalive is not configured: CRON_SECRET is missing.')
    return NextResponse.json({ error: 'Keepalive is not configured.' }, { status: 503, headers: NO_STORE })
  }

  if (!verifyBearer(req.headers.get('authorization'), cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers: NO_STORE })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase keepalive is not configured: Supabase environment variables are missing.')
    return NextResponse.json({ error: 'Keepalive is not configured.' }, { status: 503, headers: NO_STORE })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const { error } = await supabase.from('conversations').select('id').limit(1)

  if (error) {
    console.error('Supabase keepalive query failed:', error.message)
    return NextResponse.json({ error: 'Supabase keepalive failed.' }, { status: 502, headers: NO_STORE })
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE })
}
