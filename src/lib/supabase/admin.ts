import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client using the service role key — bypasses RLS.
 * Use only in server-side code (API routes, webhooks) where the
 * calling user's session should NOT limit database access.
 */
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
