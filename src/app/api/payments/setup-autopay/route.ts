import { getStripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leaseId, dayOfMonth, paymentMethodType } = await req.json()
    const methodType: 'card' | 'ach' = paymentMethodType === 'card' ? 'card' : 'ach'

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

    const stripe = getStripe()

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
    const customer = customers.data[0] || await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    })

    // Create a SetupIntent so the tenant can save a payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: methodType === 'ach' ? ['us_bank_account'] : ['card'],
      metadata: {
        leaseId,
        tenantId: user.id,
        dayOfMonth: String(dayOfMonth || 1),
        paymentMethodType: methodType,
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

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up the active enrollment to get the subscription ID
    const adminSupabase = createAdminSupabaseClient()
    const { data: enrollment } = await adminSupabase
      .from('autopay_enrollment')
      .select('id, stripe_subscription_id')
      .eq('tenant_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!enrollment) {
      return NextResponse.json({ error: 'No active autopay found' }, { status: 404 })
    }

    // Cancel the Stripe subscription
    if (enrollment.stripe_subscription_id) {
      const stripe = getStripe()
      await stripe.subscriptions.cancel(enrollment.stripe_subscription_id)
    }

    // Deactivate the enrollment
    const { error } = await adminSupabase
      .from('autopay_enrollment')
      .update({ is_active: false })
      .eq('id', enrollment.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel autopay' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel autopay error:', error)
    return NextResponse.json({ error: 'Failed to cancel autopay' }, { status: 500 })
  }
}
