'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaBuilding, FaUsers, FaDollarSign, FaWrench, FaChevronRight } from 'react-icons/fa'
import Link from 'next/link'

interface Stats {
  totalProperties: number
  totalUnits: number
  occupiedUnits: number
  availableUnits: number
  totalTenants: number
  openMaintenance: number
  monthlyRevenue: number
  totalPaidThisMonth: number
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentRequests, setRecentRequests] = useState<Array<{
    id: string; title: string; status: string; priority: string; created_at: string
    tenant: { full_name: string | null; email: string } | null
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [
        { count: propCount },
        { data: units },
        { count: tenantCount },
        { count: openMaint },
        { data: leases },
        { data: monthPayments },
        { data: requests },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('units').select('id, status'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tenant'),
        supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }).not('status', 'in', '("completed","closed")'),
        supabase.from('leases').select('monthly_rent').eq('status', 'active'),
        supabase.from('payments').select('amount').eq('status', 'completed')
          .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('maintenance_requests')
          .select('id, title, status, priority, created_at, tenant:profiles!maintenance_requests_tenant_id_fkey(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      const allUnits = units ?? []
      const occupied = allUnits.filter(u => u.status === 'occupied').length
      const available = allUnits.filter(u => u.status === 'available').length
      const revenue = (leases ?? []).reduce((sum, l) => sum + Number(l.monthly_rent), 0)
      const paid = (monthPayments ?? []).reduce((sum, p) => sum + Number(p.amount), 0)

      setStats({
        totalProperties: propCount ?? 0,
        totalUnits: allUnits.length,
        occupiedUnits: occupied,
        availableUnits: available,
        totalTenants: tenantCount ?? 0,
        openMaintenance: openMaint ?? 0,
        monthlyRevenue: revenue,
        totalPaidThisMonth: paid,
      })

      setRecentRequests((requests ?? []).map(r => ({
        ...r,
        tenant: r.tenant as unknown as { full_name: string | null; email: string } | null,
      })))

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
  }

  if (!stats) return null

  const occupancyRate = stats.totalUnits > 0
    ? Math.round((stats.occupiedUnits / stats.totalUnits) * 100)
    : 0

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Owner Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg"><FaBuilding className="text-blue-600" /></div>
            <p className="text-sm text-gray-600">Properties</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalProperties}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.totalUnits} total units</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg"><FaUsers className="text-green-600" /></div>
            <p className="text-sm text-gray-600">Occupancy</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{occupancyRate}%</p>
          <p className="text-sm text-gray-500 mt-1">{stats.occupiedUnits} occupied, {stats.availableUnits} available</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg"><FaDollarSign className="text-purple-600" /></div>
            <p className="text-sm text-gray-600">Monthly Revenue</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">${stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">${stats.totalPaidThisMonth.toLocaleString()} collected this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg"><FaWrench className="text-orange-600" /></div>
            <p className="text-sm text-gray-600">Open Requests</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.openMaintenance}</p>
          <p className="text-sm text-gray-500 mt-1">maintenance requests</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { href: '/owner/tenants', label: 'Manage Tenants', icon: FaUsers, color: 'blue' },
          { href: '/owner/maintenance', label: 'View Maintenance', icon: FaWrench, color: 'orange' },
          { href: '/owner/financials', label: 'View Financials', icon: FaDollarSign, color: 'green' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <link.icon className={`text-${link.color}-600 w-5 h-5`} />
              <span className="font-semibold text-gray-800">{link.label}</span>
            </div>
            <FaChevronRight className="text-gray-400" />
          </Link>
        ))}
      </div>

      {/* Recent Maintenance Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Recent Maintenance Requests</h2>
          <Link href="/owner/maintenance" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No maintenance requests</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentRequests.map(req => (
              <div key={req.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{req.title}</p>
                  <p className="text-sm text-gray-500">
                    {req.tenant?.full_name || req.tenant?.email || 'Unknown'} &middot; {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                    req.priority === 'urgent' ? 'bg-orange-100 text-orange-700' :
                    req.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {req.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
