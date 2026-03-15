'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaDollarSign, FaChartBar } from 'react-icons/fa'

interface PaymentSummary {
  month: string
  total: number
  count: number
}

interface PropertyRevenue {
  propertyName: string
  monthlyRent: number
  activeLeases: number
}

export default function OwnerFinancials() {
  const [monthlySummary, setMonthlySummary] = useState<PaymentSummary[]>([])
  const [propertyRevenue, setPropertyRevenue] = useState<PropertyRevenue[]>([])
  const [totalAnnual, setTotalAnnual] = useState(0)
  const [totalMonthly, setTotalMonthly] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Get all completed payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('status', 'completed')
        .order('payment_date', { ascending: false })

      // Get all active leases with property info
      const { data: leases } = await supabase
        .from('leases')
        .select(`
          monthly_rent,
          unit:units (
            property:properties ( name )
          )
        `)
        .eq('status', 'active')

      // Build monthly summary
      const now = new Date()
      const year = now.getFullYear()
      const monthMap: Record<string, { total: number; count: number }> = {}

      for (let m = 0; m < 12; m++) {
        const key = `${year}-${String(m + 1).padStart(2, '0')}`
        monthMap[key] = { total: 0, count: 0 }
      }

      let annualTotal = 0
      let thisMonthTotal = 0
      const thisMonth = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`

      ;(payments ?? []).forEach(p => {
        const d = new Date(p.payment_date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const amount = Number(p.amount)
        if (d.getFullYear() === year) {
          annualTotal += amount
          if (monthMap[key]) {
            monthMap[key].total += amount
            monthMap[key].count += 1
          }
        }
        if (key === thisMonth) thisMonthTotal += amount
      })

      const summary = Object.entries(monthMap).map(([month, data]) => ({
        month,
        ...data,
      }))

      // Build property revenue
      const propMap: Record<string, { monthlyRent: number; activeLeases: number }> = {}
      ;(leases ?? []).forEach(l => {
        const unit = l.unit as unknown as { property: { name: string } } | null
        const name = unit?.property?.name || 'Unknown'
        if (!propMap[name]) propMap[name] = { monthlyRent: 0, activeLeases: 0 }
        propMap[name].monthlyRent += Number(l.monthly_rent)
        propMap[name].activeLeases += 1
      })

      setMonthlySummary(summary)
      setPropertyRevenue(Object.entries(propMap).map(([name, d]) => ({ propertyName: name, ...d })))
      setTotalAnnual(annualTotal)
      setTotalMonthly(thisMonthTotal)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading financials...</div>
  }

  const expectedMonthly = propertyRevenue.reduce((sum, p) => sum + p.monthlyRent, 0)

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Financial Overview</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg"><FaDollarSign className="text-green-600" /></div>
            <p className="text-sm text-gray-600">Collected This Month</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">${totalMonthly.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">of ${expectedMonthly.toLocaleString()} expected</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FaChartBar className="text-blue-600" /></div>
            <p className="text-sm text-gray-600">Year-to-Date Revenue</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">${totalAnnual.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{new Date().getFullYear()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg"><FaDollarSign className="text-purple-600" /></div>
            <p className="text-sm text-gray-600">Expected Monthly</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">${expectedMonthly.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">from {propertyRevenue.reduce((s, p) => s + p.activeLeases, 0)} active leases</p>
        </div>
      </div>

      {/* Revenue by Property */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Revenue by Property</h2>
        </div>
        {propertyRevenue.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No active leases</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {propertyRevenue.map(p => (
              <div key={p.propertyName} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{p.propertyName}</p>
                  <p className="text-sm text-gray-500">{p.activeLeases} active lease{p.activeLeases !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-lg font-bold text-blue-600">${p.monthlyRent.toLocaleString()}/mo</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Monthly Collections — {new Date().getFullYear()}</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {monthlySummary.map(m => {
            const date = new Date(m.month + '-01')
            const label = date.toLocaleDateString('en-US', { month: 'long' })
            const pct = expectedMonthly > 0 ? Math.min(100, Math.round((m.total / expectedMonthly) * 100)) : 0
            return (
              <div key={m.month} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{label}</span>
                  <span className="text-sm text-gray-600">
                    ${m.total.toLocaleString()} ({m.count} payment{m.count !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
