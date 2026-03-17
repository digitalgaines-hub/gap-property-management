import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
  }
}
