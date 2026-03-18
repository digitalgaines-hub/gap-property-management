export async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number }> {
  const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || ''

  if (!SECRET_KEY) {
    // Skip verification in development when key is not configured
    console.warn('RECAPTCHA_SECRET_KEY not set — skipping verification')
    return { success: true, score: 1.0 }
  }

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: SECRET_KEY, response: token }),
  })

  const data = await response.json()

  return {
    success: data.success && (data.score ?? 0) >= 0.5,
    score: data.score ?? 0,
  }
}
