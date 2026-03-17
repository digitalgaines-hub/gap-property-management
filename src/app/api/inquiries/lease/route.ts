import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyRecaptcha } from '@/lib/recaptcha-verify'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const {
      firstName, lastName, email, phone,
      moveInDate, employmentStatus, message,
      propertyId, recaptchaToken,
    } = await req.json()

    // Verify reCAPTCHA
    const recaptcha = await verifyRecaptcha(recaptchaToken || '')
    if (!recaptcha.success) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !moveInDate || !employmentStatus) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('inquiries').insert({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      inquiry_type: 'leasing',
      property_id: propertyId || null,
      message: `Move-in: ${moveInDate}\nEmployment: ${employmentStatus}\n\n${message || ''}`,
    })

    if (error) {
      console.error('Lease inquiry insert error:', error)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lease inquiry API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
