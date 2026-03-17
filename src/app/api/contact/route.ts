import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyRecaptcha } from '@/lib/recaptcha-verify'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email, phone, message, recaptchaToken } = await req.json()

    // Verify reCAPTCHA
    const recaptcha = await verifyRecaptcha(recaptchaToken || '')
    if (!recaptcha.success) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 })
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('inquiries').insert({
      name,
      email,
      phone: phone || null,
      message,
      inquiry_type: 'general',
    })

    if (error) {
      console.error('Contact insert error:', error)
      return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
