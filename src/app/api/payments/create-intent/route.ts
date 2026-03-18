import { getStripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leaseId, amount } = await req.json()

    if (!leaseId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: customer.id,
      payment_method_types: ['card'],
      metadata: {
        leaseId,
        tenantId: user.id,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
