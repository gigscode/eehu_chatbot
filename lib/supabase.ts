import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

// Lazily create the client so it only instantiates at runtime when env vars are present.
// At build time the env vars are empty and createClient is never called.
export function getSupabase(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return _client
}
