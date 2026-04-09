import { getStripe } from '@/lib/stripe'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { sendPaymentReceipt, sendPaymentFailed } from '@/lib/email'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

function getSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details
  if (!subDetails) return null
  return typeof subDetails.subscription === 'string'
    ? subDetails.subscription
    : subDetails.subscription?.id ?? null
}

export async function POST(req: Request) {
  const stripe = getStripe()
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  // Verify webhook signature if secret is configured
  if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } else {
    // Development: accept unsigned events
    event = JSON.parse(body) as Stripe.Event
  }

  const supabase = createAdminSupabaseClient()

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionId(invoice)
        // Only process subscription invoices (not one-off)
        if (!subscriptionId) break

        // Look up the enrollment to get tenant/lease info
        const { data: enrollment } = await supabase
          .from('autopay_enrollment')
          .select('tenant_id, lease_id, payment_method_type, stripe_price_id')
          .eq('stripe_subscription_id', subscriptionId)
          .eq('is_active', true)
          .single()

        if (!enrollment) {
          console.warn('No enrollment found for subscription:', subscriptionId)
          break
        }

        const amountPaid = (invoice.amount_paid ?? 0) / 100
        const isCard = enrollment.payment_method_type === 'card'
        const baseAmount = isCard ? Math.round((amountPaid / 1.03) * 100) / 100 : amountPaid
        const surchargeAmount = isCard ? Math.round((amountPaid - baseAmount) * 100) / 100 : 0
        const now = new Date()
        const dueDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
          .toISOString().split('T')[0]

        // Record the payment
        await supabase.from('payments').insert({
          tenant_id: enrollment.tenant_id,
          lease_id: enrollment.lease_id,
          amount: amountPaid,
          base_amount: baseAmount,
          surcharge_amount: surchargeAmount,
          payment_date: new Date().toISOString(),
          due_date: dueDate,
          payment_method: isCard ? 'credit_card' : 'ach',
          stripe_invoice_id: invoice.id,
          status: 'completed',
          notes: 'Auto-pay',
        })

        // Send receipt email
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', enrollment.tenant_id)
          .single()

        if (profile?.email) {
          await sendPaymentReceipt({
            to: profile.email,
            amount: amountPaid,
            date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          }).catch(err => console.error('Failed to send receipt email:', err))
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionId(invoice)
        if (!subscriptionId) break

        const { data: failedEnrollment } = await supabase
          .from('autopay_enrollment')
          .select('tenant_id, lease_id, payment_method_type')
          .eq('stripe_subscription_id', subscriptionId)
          .eq('is_active', true)
          .single()

        if (!failedEnrollment) break

        const amountDue = (invoice.amount_due ?? 0) / 100
        const failedIsCard = failedEnrollment.payment_method_type === 'card'
        const failedBaseAmount = failedIsCard ? Math.round((amountDue / 1.03) * 100) / 100 : amountDue
        const failedSurcharge = failedIsCard ? Math.round((amountDue - failedBaseAmount) * 100) / 100 : 0
        const failedNow = new Date()
        const failedDueDate = new Date(Date.UTC(failedNow.getFullYear(), failedNow.getMonth(), 1))
          .toISOString().split('T')[0]

        // Record the failed payment
        await supabase.from('payments').insert({
          tenant_id: failedEnrollment.tenant_id,
          lease_id: failedEnrollment.lease_id,
          amount: amountDue,
          base_amount: failedBaseAmount,
          surcharge_amount: failedSurcharge,
          payment_date: new Date().toISOString(),
          due_date: failedDueDate,
          payment_method: failedIsCard ? 'credit_card' : 'ach',
          stripe_invoice_id: invoice.id,
          status: 'failed',
          notes: 'Auto-pay failed',
        })

        // Send failure notification
        const { data: failedProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', failedEnrollment.tenant_id)
          .single()

        if (failedProfile?.email) {
          await sendPaymentFailed({
            to: failedProfile.email,
            amount: amountDue,
          }).catch(err => console.error('Failed to send failure email:', err))
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Deactivate the enrollment when Stripe cancels the subscription
        await supabase
          .from('autopay_enrollment')
          .update({ is_active: false })
          .eq('stripe_subscription_id', subscription.id)

        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
