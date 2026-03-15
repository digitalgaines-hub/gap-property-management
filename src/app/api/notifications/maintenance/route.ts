import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendMaintenanceNotification } from '@/lib/email'
import { NextResponse } from 'next/server'

// Called after a tenant submits a maintenance request to notify the owner
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = await req.json()

    // Fetch the maintenance request details
    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('title, priority, category')
      .eq('id', requestId)
      .single()

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Send to owner email
    await sendMaintenanceNotification({
      to: 'dejon@digitalgaines.com',
      tenantName: profile?.full_name || profile?.email || 'A tenant',
      title: request.title,
      priority: request.priority,
      category: request.category,
    })

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error('Maintenance notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
