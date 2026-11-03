import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('Supabase keepalive is not configured: CRON_SECRET is missing.')
    return NextResponse.json({ error: 'Keepalive is not configured.' }, { status: 503 })
  }

  if (req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase keepalive is not configured: Supabase environment variables are missing.')
    return NextResponse.json({ error: 'Keepalive is not configured.' }, { status: 503 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const { error } = await supabase.from('conversations').select('id').limit(1)

  if (error) {
    console.error('Supabase keepalive query failed:', error.message)
    return NextResponse.json({ error: 'Supabase keepalive failed.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
