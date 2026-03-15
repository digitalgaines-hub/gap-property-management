import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin client with service role key for user management
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // Verify caller is owner/admin
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['owner', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, fullName } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists in profiles
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'A tenant with this email already exists' }, { status: 409 })
    }

    // Invite user via Supabase Admin API — sends them a magic link email
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName || null },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    })

    if (inviteError) {
      console.error('Invite error:', inviteError)
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    // Ensure profile has tenant role and full name (trigger may have already created it)
    if (inviteData.user) {
      await supabaseAdmin
        .from('profiles')
        .update({ role: 'tenant', full_name: fullName || null })
        .eq('id', inviteData.user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tenant invite error:', error)
    return NextResponse.json({ error: 'Failed to invite tenant' }, { status: 500 })
  }
}
