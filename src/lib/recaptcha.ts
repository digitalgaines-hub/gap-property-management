'use client'

import { useEffect, useCallback, useRef } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

export function useRecaptcha() {
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !SITE_KEY) return
    loaded.current = true

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
      loaded.current = false
    }
  }, [])

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    if (!SITE_KEY) return ''

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        const token = await window.grecaptcha.execute(SITE_KEY, { action })
        resolve(token)
      })
    })
  }, [])

  return { executeRecaptcha }
}
