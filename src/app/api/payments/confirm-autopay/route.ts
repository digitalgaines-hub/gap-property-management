import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

const CARD_SURCHARGE_RATE = 0.03

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { setupIntentId } = await req.json()

    if (!setupIntentId) {
      return NextResponse.json({ error: 'Missing setupIntentId' }, { status: 400 })
    }

    const stripe = getStripe()

    // Retrieve the completed SetupIntent from Stripe
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)

    if (setupIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'SetupIntent not succeeded' }, { status: 400 })
    }

    // Verify this SetupIntent belongs to the authenticated user
    const metadata = setupIntent.metadata ?? {}
    if (metadata.tenantId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const leaseId = metadata.leaseId
    const dayOfMonth = parseInt(metadata.dayOfMonth) || 1
    const paymentMethodType: 'card' | 'ach' = metadata.paymentMethodType === 'ach' ? 'ach' : 'card'
    const customerId = setupIntent.customer as string
    const paymentMethodId = setupIntent.payment_method as string

    // Set this payment method as the customer's default
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Get the lease to know the rent amount
    const { data: lease } = await supabase
      .from('leases')
      .select('id, monthly_rent')
      .eq('id', leaseId)
      .eq('tenant_id', user.id)
      .eq('status', 'active')
      .single()

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 })
    }

    // Get all active leases for this tenant to calculate total rent
    const { data: allLeases } = await supabase
      .from('leases')
      .select('id, monthly_rent')
      .eq('tenant_id', user.id)
      .eq('status', 'active')

    const totalRent = (allLeases ?? [lease]).reduce(
      (sum, l) => sum + Number(l.monthly_rent), 0
    )

    // Calculate surcharge for card payments
    const surchargeAmount = paymentMethodType === 'card'
      ? Math.round(totalRent * CARD_SURCHARGE_RATE * 100) / 100
      : 0
    const subscriptionTotal = totalRent + surchargeAmount

    // Create a Stripe Product + Price for this tenant's rent
    const product = await stripe.products.create({
      name: `Monthly Rent — ${user.email}`,
      metadata: { tenantId: user.id, leaseId },
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(subscriptionTotal * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: {
        tenantId: user.id,
        baseAmount: String(totalRent),
        surchargeAmount: String(surchargeAmount),
      },
    })

    // Calculate billing_cycle_anchor: the next 1st of the month
    const now = new Date()
    let anchorDate: Date
    if (now.getDate() === 1 && now.getHours() < 12) {
      // If it's the 1st and before noon, anchor to today
      anchorDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 12, 0, 0))
    } else {
      // Next 1st of the month
      anchorDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1, 12, 0, 0))
    }

    // Create the Stripe Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      default_payment_method: paymentMethodId,
      billing_cycle_anchor: Math.floor(anchorDate.getTime() / 1000),
      proration_behavior: 'none',
      metadata: {
        tenantId: user.id,
        leaseId,
      },
    })

    // Save enrollment using admin client (bypasses RLS)
    const adminSupabase = createAdminSupabaseClient()
    const { error } = await adminSupabase
      .from('autopay_enrollment')
      .upsert({
        tenant_id: user.id,
        lease_id: leaseId,
        stripe_customer_id: customerId,
        stripe_payment_method_id: paymentMethodId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: price.id,
        payment_method_type: paymentMethodType,
        day_of_month: dayOfMonth,
        is_active: true,
      }, {
        onConflict: 'tenant_id,lease_id',
      })

    if (error) {
      console.error('Autopay enrollment error:', error)
      // Attempt to cancel the subscription if DB save fails
      await stripe.subscriptions.cancel(subscription.id)
      return NextResponse.json({ error: 'Failed to save enrollment' }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriptionId: subscription.id })
  } catch (error) {
    console.error('Confirm autopay error:', error)
    return NextResponse.json({ error: 'Failed to confirm autopay' }, { status: 500 })
  }
}
