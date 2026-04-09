'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '../TenantShell'
import { FaCreditCard, FaCheckCircle, FaTimes, FaSync, FaUniversity } from 'react-icons/fa'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CARD_SURCHARGE_RATE = 0.03

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

type PaymentMethodChoice = 'ach' | 'card'

// ─── Payment method selector ─────────────────────────────────
function PaymentMethodSelector({
  selected,
  onChange,
  rentAmount,
}: {
  selected: PaymentMethodChoice
  onChange: (m: PaymentMethodChoice) => void
  rentAmount: number
}) {
  const surcharge = Math.round(rentAmount * CARD_SURCHARGE_RATE * 100) / 100

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">Payment Method</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('ach')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition ${
            selected === 'ach'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FaUniversity className={`text-lg ${selected === 'ach' ? 'text-blue-600' : 'text-gray-400'}`} />
          <div>
            <p className={`font-semibold ${selected === 'ach' ? 'text-blue-700' : 'text-gray-800'}`}>
              ACH Bank Transfer
            </p>
            <p className="text-xs text-green-600 font-medium">No processing fee</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange('card')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition ${
            selected === 'card'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FaCreditCard className={`text-lg ${selected === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
          <div>
            <p className={`font-semibold ${selected === 'card' ? 'text-blue-700' : 'text-gray-800'}`}>
              Credit / Debit Card
            </p>
            <p className="text-xs text-orange-600 font-medium">3% fee (+${surcharge.toFixed(2)})</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ─── Fee breakdown (card only) ───────────────────────────────
function FeeBreakdown({ baseAmount, surchargeAmount, totalAmount }: {
  baseAmount: number
  surchargeAmount: number
  totalAmount: number
}) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm text-gray-700">
        <span>Rent</span>
        <span>${baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-sm text-orange-700">
        <span>Processing fee (3%)</span>
        <span>${surchargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-orange-200">
        <span>Total</span>
        <span>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  )
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
function AutopaySetupForm({ leaseId, onSuccess, onCancel }: { leaseId: string; onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError('')

    const { error: setupError, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tenant/payments`,
      },
      redirect: 'if_required',
    })

    if (setupError) {
      setError(setupError.message || 'Setup failed')
      setProcessing(false)
      return
    }

    // SetupIntent succeeded without redirect — call confirm-autopay
    if (setupIntent?.status === 'succeeded') {
      try {
        const res = await fetch('/api/payments/confirm-autopay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setupIntentId: setupIntent.id }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to save auto-pay enrollment')
          setProcessing(false)
          return
        }
      } catch {
        setError('Failed to save auto-pay enrollment')
        setProcessing(false)
        return
      }
    }

    onSuccess()
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
  const { user, lease, leases } = useTenant()
  const activeLeases = leases.filter(l => l.status === 'active')
  const totalRent = activeLeases.reduce((sum, l) => sum + Number(l.monthlyRent), 0)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayForm, setShowPayForm] = useState(false)
  const [showAutopay, setShowAutopay] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [autopaySecret, setAutopaySecret] = useState<string | null>(null)
  const [autopayEnrollment, setAutopayEnrollment] = useState<AutopayEnrollment | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [payMethod, setPayMethod] = useState<PaymentMethodChoice>('ach')
  const [autopayMethod, setAutopayMethod] = useState<PaymentMethodChoice>('ach')
  const [feeBreakdown, setFeeBreakdown] = useState<{ baseAmount: number; surchargeAmount: number; totalAmount: number } | null>(null)

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

    // Handle redirect return from Stripe SetupIntent (3DS etc.)
    const setupIntentId = params.get('setup_intent')
    const redirectStatus = params.get('redirect_status')
    if (setupIntentId && redirectStatus === 'succeeded') {
      window.history.replaceState({}, '', '/tenant/payments')
      fetch('/api/payments/confirm-autopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupIntentId }),
      })
        .then(res => {
          if (res.ok) {
            setSuccessMsg('Auto-pay has been enabled!')
            loadAutopay()
          } else {
            setSuccessMsg('Auto-pay setup completed on Stripe but failed to save. Please contact support.')
          }
        })
        .catch(() => {
          setSuccessMsg('Auto-pay setup completed on Stripe but failed to save. Please contact support.')
        })
    }
  }, [loadPayments, loadAutopay])

  const startPayment = async (method: PaymentMethodChoice) => {
    if (!lease) return
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId: lease.id,
          leaseIds: activeLeases.map(l => l.id),
          paymentMethod: method,
        }),
      })
      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setFeeBreakdown({
          baseAmount: data.baseAmount,
          surchargeAmount: data.surchargeAmount,
          totalAmount: data.totalAmount,
        })
        setShowPayForm(true)
      }
    } catch (err) {
      console.error('Failed to start payment:', err)
    }
  }

  const startAutopay = async (method: PaymentMethodChoice) => {
    if (!lease) return
    try {
      const res = await fetch('/api/payments/setup-autopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseId: lease.id,
          dayOfMonth: 1,
          paymentMethodType: method,
        }),
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

  const cardSurcharge = Math.round(totalRent * CARD_SURCHARGE_RATE * 100) / 100

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
            {activeLeases.length > 0 ? `$${totalRent.toLocaleString()}` : '--'}
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

      {/* Lease Breakdown */}
      {activeLeases.length > 1 && !showPayForm && !showAutopay && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Rent Breakdown</h2>
          <div className="space-y-2">
            {activeLeases.map(l => (
              <div key={l.id} className="flex justify-between text-sm">
                <span className="text-gray-700">{l.unitNumber} @ {l.propertyName}</span>
                <span className="font-medium text-gray-800">${Number(l.monthlyRent).toLocaleString()}/mo</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
              <span className="text-gray-800">Total</span>
              <span className="text-blue-600">${totalRent.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Actions */}
      {lease && !showPayForm && !showAutopay && (
        <div className="mb-8 space-y-4">
          {/* One-time payment section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Make a Payment</h2>
            <PaymentMethodSelector
              selected={payMethod}
              onChange={setPayMethod}
              rentAmount={totalRent}
            />
            {payMethod === 'card' && (
              <FeeBreakdown
                baseAmount={totalRent}
                surchargeAmount={cardSurcharge}
                totalAmount={totalRent + cardSurcharge}
              />
            )}
            <button
              onClick={() => startPayment(payMethod)}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {payMethod === 'ach' ? <FaUniversity /> : <FaCreditCard />}
              Pay Rent — ${payMethod === 'card'
                ? (totalRent + cardSurcharge).toLocaleString(undefined, { minimumFractionDigits: 2 })
                : totalRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </button>
          </div>

          {/* Auto-pay section */}
          {autopayEnrollment ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-5 rounded-lg">
              <div>
                <p className="font-semibold text-green-700 flex items-center gap-2">
                  <FaCheckCircle /> Auto-Pay Active
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {autopayEnrollment.payment_method_type === 'card' ? 'Card' : 'ACH'} on the {ordinal(autopayEnrollment.day_of_month)} of each month
                  {autopayEnrollment.payment_method_type === 'card' && ' (includes 3% processing fee)'}
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Auto-Pay</h2>
              <PaymentMethodSelector
                selected={autopayMethod}
                onChange={setAutopayMethod}
                rentAmount={totalRent}
              />
              {autopayMethod === 'card' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    Credit card payments include a 3% processing fee. Consider ACH bank transfer to avoid this fee.
                  </p>
                </div>
              )}
              <button
                onClick={() => startAutopay(autopayMethod)}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-green-600 text-green-700 p-4 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                <FaSync className="text-lg" />
                Set Up Auto-Pay
              </button>
            </div>
          )}

          {/* Surcharge disclosure */}
          <p className="text-xs text-gray-500 text-center">
            Credit card payments include a 3% processing fee. ACH bank transfers are free.
          </p>
        </div>
      )}

      {/* Stripe Payment Form */}
      {showPayForm && clientSecret && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {payMethod === 'ach' ? 'Pay via Bank Transfer' : 'Pay via Card'}
          </h2>
          {feeBreakdown && payMethod === 'card' && (
            <div className="mb-4">
              <FeeBreakdown
                baseAmount={feeBreakdown.baseAmount}
                surchargeAmount={feeBreakdown.surchargeAmount}
                totalAmount={feeBreakdown.totalAmount}
              />
            </div>
          )}
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
                setFeeBreakdown(null)
                setSuccessMsg('Payment completed successfully!')
                loadPayments()
              }}
              onCancel={() => {
                setShowPayForm(false)
                setClientSecret(null)
                setFeeBreakdown(null)
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
            Save a payment method to automatically pay your rent on the 1st of each month.
            {autopayMethod === 'card' && (
              <> Your monthly charge will be <strong>${(totalRent + cardSurcharge).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> (rent ${totalRent.toLocaleString(undefined, { minimumFractionDigits: 2 })} + 3% fee ${cardSurcharge.toFixed(2)}).</>
            )}
            {autopayMethod === 'ach' && (
              <> Your monthly charge will be <strong>${totalRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> with no processing fee.</>
            )}
          </p>
          {autopayMethod === 'card' && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                Credit card payments include a 3% processing fee. Consider ACH bank transfer to avoid this fee.
              </p>
            </div>
          )}
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: autopaySecret,
              appearance: { theme: 'stripe', variables: { colorPrimary: '#16a34a' } },
            }}
          >
            <AutopaySetupForm
              leaseId={lease!.id}
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
