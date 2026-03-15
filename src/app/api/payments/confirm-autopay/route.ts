import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leaseId, stripeCustomerId, stripePaymentMethodId, paymentMethodType, dayOfMonth } = await req.json()

    // Save autopay enrollment to database
    const { error } = await supabase
      .from('autopay_enrollment')
      .upsert({
        tenant_id: user.id,
        lease_id: leaseId,
        stripe_customer_id: stripeCustomerId,
        stripe_payment_method_id: stripePaymentMethodId,
        payment_method_type: paymentMethodType || 'card',
        day_of_month: dayOfMonth || 1,
        is_active: true,
      }, {
        onConflict: 'tenant_id,lease_id',
      })

    if (error) {
      console.error('Autopay enrollment error:', error)
      return NextResponse.json({ error: 'Failed to save enrollment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirm autopay error:', error)
    return NextResponse.json({ error: 'Failed to confirm autopay' }, { status: 500 })
  }
}
