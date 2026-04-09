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

  const supabase = createAdminSupabaseClient()

  try {
    switch (event.type) {
      // === One-time payment events ===

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { leaseId, leaseIds, tenantId, baseAmount: baseStr, surchargeAmount: surchargeStr } = paymentIntent.metadata
        const primaryLeaseId = leaseId || (leaseIds ? leaseIds.split(',')[0] : null)

        if (primaryLeaseId && tenantId) {
          const amount = paymentIntent.amount / 100
          const baseAmount = baseStr ? parseFloat(baseStr) : amount
          const surchargeAmount = surchargeStr ? parseFloat(surchargeStr) : 0
          await supabase.from('payments').insert({
            tenant_id: tenantId,
            lease_id: primaryLeaseId,
            amount,
            base_amount: baseAmount,
            surcharge_amount: surchargeAmount,
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
        const { leaseId, leaseIds: failedLeaseIds, tenantId } = paymentIntent.metadata
        const failedPrimaryLeaseId = leaseId || (failedLeaseIds ? failedLeaseIds.split(',')[0] : null)

        if (failedPrimaryLeaseId && tenantId) {
          const amount = paymentIntent.amount / 100
          const baseAmount = paymentIntent.metadata.baseAmount ? parseFloat(paymentIntent.metadata.baseAmount) : amount
          const surchargeAmount = paymentIntent.metadata.surchargeAmount ? parseFloat(paymentIntent.metadata.surchargeAmount) : 0
          await supabase.from('payments').insert({
            tenant_id: tenantId,
            lease_id: failedPrimaryLeaseId,
            amount,
            base_amount: baseAmount,
            surcharge_amount: surchargeAmount,
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

      // === Auto-pay setup ===

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

      // === Subscription / recurring billing events ===

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
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
