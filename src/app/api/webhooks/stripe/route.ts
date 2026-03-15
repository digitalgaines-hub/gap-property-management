import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendPaymentReceipt, sendPaymentFailed } from '@/lib/email'

// Use service role client for webhook (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } else {
      // In development without webhook secret, parse directly
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { leaseId, tenantId } = paymentIntent.metadata

        if (leaseId && tenantId) {
          const amount = paymentIntent.amount / 100
          await supabase.from('payments').insert({
            tenant_id: tenantId,
            lease_id: leaseId,
            amount,
            payment_date: new Date().toISOString(),
            due_date: new Date().toISOString().split('T')[0],
            payment_method: paymentIntent.payment_method_types?.[0] === 'us_bank_account' ? 'ach' : 'credit_card',
            stripe_payment_id: paymentIntent.id,
            status: 'completed',
          })

          // Send receipt email
          const { data: tenant } = await supabase.from('profiles').select('email').eq('id', tenantId).single()
          if (tenant?.email) {
            await sendPaymentReceipt({
              to: tenant.email,
              amount,
              date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            })
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { leaseId, tenantId } = paymentIntent.metadata

        if (leaseId && tenantId) {
          const amount = paymentIntent.amount / 100
          await supabase.from('payments').insert({
            tenant_id: tenantId,
            lease_id: leaseId,
            amount,
            payment_date: new Date().toISOString(),
            due_date: new Date().toISOString().split('T')[0],
            payment_method: 'credit_card',
            stripe_payment_id: paymentIntent.id,
            status: 'failed',
          })

          // Notify tenant of failed payment
          const { data: tenant } = await supabase.from('profiles').select('email').eq('id', tenantId).single()
          if (tenant?.email) {
            await sendPaymentFailed({ to: tenant.email, amount })
          }
        }
        break
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent
        const leaseId = setupIntent.metadata?.leaseId
        const tenantId = setupIntent.metadata?.tenantId
        const dayOfMonth = setupIntent.metadata?.dayOfMonth

        if (leaseId && tenantId && setupIntent.payment_method) {
          await supabase.from('autopay_enrollment').upsert({
            tenant_id: tenantId,
            lease_id: leaseId,
            stripe_customer_id: setupIntent.customer as string,
            stripe_payment_method_id: setupIntent.payment_method as string,
            payment_method_type: 'card',
            day_of_month: dayOfMonth ? parseInt(dayOfMonth) : 1,
            is_active: true,
          }, {
            onConflict: 'tenant_id,lease_id',
          })
        }
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
