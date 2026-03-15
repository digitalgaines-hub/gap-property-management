import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendMaintenanceUpdate } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is owner/admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['owner', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestId, status } = await req.json()

    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('title, tenant_id')
      .eq('id', requestId)
      .single()

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { data: tenant } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', request.tenant_id)
      .single()

    if (tenant?.email) {
      await sendMaintenanceUpdate({
        to: tenant.email,
        title: request.title,
        status,
      })
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('Maintenance update notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
