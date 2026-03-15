import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leaseId, dayOfMonth } = await req.json()

    // Verify lease belongs to this user
    const { data: lease } = await supabase
      .from('leases')
      .select('id, tenant_id, monthly_rent')
      .eq('id', leaseId)
      .eq('tenant_id', user.id)
      .eq('status', 'active')
      .single()

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
    const customer = customers.data[0] || await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    })

    // Create a SetupIntent so the tenant can save a payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      metadata: {
        leaseId,
        tenantId: user.id,
        dayOfMonth: String(dayOfMonth || 1),
      },
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    })
  } catch (error) {
    console.error('Setup autopay error:', error)
    return NextResponse.json({ error: 'Failed to setup autopay' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deactivate autopay enrollment
    const { error } = await supabase
      .from('autopay_enrollment')
      .update({ is_active: false })
      .eq('tenant_id', user.id)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel autopay' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel autopay error:', error)
    return NextResponse.json({ error: 'Failed to cancel autopay' }, { status: 500 })
  }
}
