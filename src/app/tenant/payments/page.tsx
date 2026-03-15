'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '../TenantShell'
import { FaCreditCard, FaCheckCircle, FaTimes, FaSync } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Payment {
  id: string
  amount: number
  payment_date: string
  due_date: string
  status: string
  payment_method: string | null
}

interface AutopayEnrollment {
  id: string
  is_active: boolean
  payment_method_type: string
  day_of_month: number
}

// ─── One-time payment form ──────────────────────────────────
function PaymentForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tenant/payments?success=true`,
      },
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Auto-pay setup form ────────────────────────────────────
function AutopaySetupForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    const { error: setupError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tenant/payments?autopay=success`,
      },
      redirect: 'if_required',
    })

    if (setupError) {
      setError(setupError.message || 'Setup failed')
      setProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Setting up...' : 'Enable Auto-Pay'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Main payments page ─────────────────────────────────────
export default function TenantPayments() {
  const { user, lease } = useTenant()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayForm, setShowPayForm] = useState(false)
  const [showAutopay, setShowAutopay] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [autopaySecret, setAutopaySecret] = useState<string | null>(null)
  const [autopayEnrollment, setAutopayEnrollment] = useState<AutopayEnrollment | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const loadPayments = useCallback(async () => {
    if (!lease) {
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('payments')
      .select('id, amount, payment_date, due_date, status, payment_method')
      .eq('tenant_id', user.id)
      .order('due_date', { ascending: false })
      .limit(20)

    setPayments(data ?? [])
    setLoading(false)
  }, [user.id, lease])

  const loadAutopay = useCallback(async () => {
    if (!lease) return
    const supabase = createClient()
    const { data } = await supabase
      .from('autopay_enrollment')
      .select('id, is_active, payment_method_type, day_of_month')
      .eq('tenant_id', user.id)
      .eq('lease_id', lease.id)
      .eq('is_active', true)
      .maybeSingle()

    setAutopayEnrollment(data)
  }, [user.id, lease])

  useEffect(() => {
    loadPayments()
    loadAutopay()

    // Check for success query params
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccessMsg('Payment completed successfully!')
      window.history.replaceState({}, '', '/tenant/payments')
      loadPayments()
    }
    if (params.get('autopay') === 'success') {
      setSuccessMsg('Auto-pay has been enabled!')
      window.history.replaceState({}, '', '/tenant/payments')
      loadAutopay()
    }
  }, [loadPayments, loadAutopay])

  const startPayment = async () => {
    if (!lease) return
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.id, amount: Number(lease.monthlyRent) }),
      })
      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setShowPayForm(true)
      }
    } catch (err) {
      console.error('Failed to start payment:', err)
    }
  }

  const startAutopay = async () => {
    if (!lease) return
    try {
      const res = await fetch('/api/payments/setup-autopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId: lease.id, dayOfMonth: 1 }),
      })
      const data = await res.json()
      if (data.clientSecret) {
        setAutopaySecret(data.clientSecret)
        setShowAutopay(true)
      }
    } catch (err) {
      console.error('Failed to start autopay setup:', err)
    }
  }

  const cancelAutopay = async () => {
    try {
      await fetch('/api/payments/setup-autopay', { method: 'DELETE' })
      setAutopayEnrollment(null)
      setSuccessMsg('Auto-pay has been cancelled.')
    } catch (err) {
      console.error('Failed to cancel autopay:', err)
    }
  }

  const completedPayments = payments.filter((p) => p.status === 'completed')
  const totalPaidThisYear = completedPayments
    .filter((p) => new Date(p.payment_date).getFullYear() === new Date().getFullYear())
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const hasLatePayments = payments.some(
    (p) => p.status === 'failed' || (p.status === 'pending' && new Date(p.due_date) < new Date())
  )

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Rent Payments</h1>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-green-600 flex-shrink-0" />
          <span className="text-green-700">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-auto text-green-600 hover:text-green-800">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Next Payment Due</p>
          <p className="text-3xl font-bold text-blue-600">
            {lease ? `$${Number(lease.monthlyRent).toLocaleString()}` : '--'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {lease ? getNextDueDate(lease.leaseStart) : 'No active lease'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Total Paid This Year</p>
          <p className="text-3xl font-bold text-green-600">
            ${totalPaidThisYear.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {completedPayments.filter(p => new Date(p.payment_date).getFullYear() === new Date().getFullYear()).length} payments
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Account Status</p>
          <p className={`text-3xl font-bold ${hasLatePayments ? 'text-red-600' : 'text-gray-800'}`}>
            {hasLatePayments ? 'Past Due' : 'Good'}
          </p>
          <p className={`text-sm mt-1 ${hasLatePayments ? 'text-red-600' : 'text-green-600'}`}>
            {hasLatePayments ? 'Payment required' : 'No late payments'}
          </p>
        </div>
      </div>

      {/* Payment Actions */}
      {lease && !showPayForm && !showAutopay && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={startPayment}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white p-5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <FaCreditCard className="text-lg" />
            Pay Rent — ${Number(lease.monthlyRent).toLocaleString()}
          </button>
          {autopayEnrollment ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-5 rounded-lg">
              <div>
                <p className="font-semibold text-green-700 flex items-center gap-2">
                  <FaCheckCircle /> Auto-Pay Active
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {autopayEnrollment.payment_method_type === 'card' ? 'Card' : 'ACH'} on the {ordinal(autopayEnrollment.day_of_month)} of each month
                </p>
              </div>
              <button
                onClick={cancelAutopay}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startAutopay}
              className="flex items-center justify-center gap-3 bg-white border-2 border-green-600 text-green-700 p-5 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              <FaSync className="text-lg" />
              Set Up Auto-Pay
            </button>
          )}
        </div>
      )}

      {/* Stripe Payment Form */}
      {showPayForm && clientSecret && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Make a Payment</h2>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#2563EB' } },
            }}
          >
            <PaymentForm
              onSuccess={() => {
                setShowPayForm(false)
                setClientSecret(null)
                setSuccessMsg('Payment completed successfully!')
                loadPayments()
              }}
              onCancel={() => {
                setShowPayForm(false)
                setClientSecret(null)
              }}
            />
          </Elements>
        </div>
      )}

      {/* Stripe Auto-Pay Setup Form */}
      {showAutopay && autopaySecret && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Set Up Auto-Pay</h2>
          <p className="text-sm text-gray-600 mb-4">
            Save a payment method to automatically pay your rent of ${lease ? Number(lease.monthlyRent).toLocaleString() : '--'} on the 1st of each month.
          </p>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: autopaySecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#16a34a' } },
            }}
          >
            <AutopaySetupForm
              onSuccess={() => {
                setShowAutopay(false)
                setAutopaySecret(null)
                setSuccessMsg('Auto-pay has been enabled!')
                loadAutopay()
              }}
              onCancel={() => {
                setShowAutopay(false)
                setAutopaySecret(null)
              }}
            />
          </Elements>
        </div>
      )}

      {/* Payment History */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No payment history</p>
          <p className="text-gray-400 text-sm mt-1">Payments will appear here once recorded</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Payment History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div key={payment.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Rent Payment</p>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(payment.due_date).toLocaleDateString()}
                  </p>
                  {payment.payment_method && (
                    <p className="text-xs text-gray-400 mt-0.5 uppercase">{payment.payment_method.replace('_', ' ')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    ${Number(payment.amount).toLocaleString()}
                  </p>
                  <span className={`text-sm font-medium ${
                    payment.status === 'completed' ? 'text-green-600' :
                    payment.status === 'failed' ? 'text-red-600' :
                    payment.status === 'refunded' ? 'text-purple-600' :
                    'text-orange-600'
                  }`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function getNextDueDate(leaseStart: string): string {
  const now = new Date()
  const start = new Date(leaseStart)
  const dayOfMonth = start.getDate()

  let next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
  if (next <= now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth)
  }

  return next.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
