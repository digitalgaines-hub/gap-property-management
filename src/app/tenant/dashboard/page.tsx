'use client'

import Link from 'next/link'
import { useTenant } from '../TenantShell'
import { FaFileAlt, FaCreditCard, FaWrench, FaUser, FaChevronRight, FaPhone, FaEnvelope } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  openRequests: number
  recentActivity: {
    type: 'payment' | 'maintenance' | 'document'
    title: string
    date: string
    detail: string
  }[]
}

export default function TenantDashboard() {
  const { user, lease } = useTenant()
  const [stats, setStats] = useState<DashboardStats>({ openRequests: 0, recentActivity: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      // Fetch open maintenance requests count
      const { count: openRequests } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .not('status', 'in', '("completed","closed")')

      // Fetch recent maintenance requests
      const { data: recentMaint } = await supabase
        .from('maintenance_requests')
        .select('title, status, created_at')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      // Fetch recent payments
      const { data: recentPayments } = lease ? await supabase
        .from('payments')
        .select('amount, status, payment_date')
        .eq('tenant_id', user.id)
        .order('payment_date', { ascending: false })
        .limit(3) : { data: [] }

      const activity: DashboardStats['recentActivity'] = []

      recentPayments?.forEach((p) => {
        activity.push({
          type: 'payment',
          title: 'Rent Payment',
          date: new Date(p.payment_date).toLocaleDateString(),
          detail: p.status === 'completed'
            ? `-$${Number(p.amount).toLocaleString()}`
            : p.status.charAt(0).toUpperCase() + p.status.slice(1),
        })
      })

      recentMaint?.forEach((m) => {
        activity.push({
          type: 'maintenance',
          title: m.title,
          date: new Date(m.created_at).toLocaleDateString(),
          detail: m.status.charAt(0).toUpperCase() + m.status.slice(1).replace('_', ' '),
        })
      })

      // Sort by date descending
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setStats({
        openRequests: openRequests ?? 0,
        recentActivity: activity.slice(0, 5),
      })
      setLoading(false)
    }

    loadStats()
  }, [user.id, lease])

  const nextDueDate = lease
    ? getNextDueDate(lease.leaseStart)
    : null

  const quickLinks = [
    {
      icon: FaFileAlt,
      title: 'Lease Documents',
      description: 'View your lease agreement and documents',
      href: '/tenant/documents',
      color: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: FaCreditCard,
      title: 'Make Payment',
      description: 'Pay your rent online',
      href: '/tenant/payments',
      color: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: FaWrench,
      title: 'Maintenance',
      description: 'Submit maintenance requests',
      href: '/tenant/maintenance',
      color: 'bg-orange-50 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: FaUser,
      title: 'My Profile',
      description: 'Manage your account',
      href: '/tenant/profile',
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back{user.fullName ? `, ${user.fullName}` : ''}!
          </h1>
          <p className="text-blue-100">Here&apos;s your tenant portal dashboard</p>
          {lease && (
            <p className="text-blue-200 text-sm mt-2">
              {lease.propertyName} &mdash; {lease.unitNumber}
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Next Rent Due</p>
          <p className="text-2xl font-bold text-gray-800">
            {nextDueDate ?? 'No active lease'}
          </p>
          {lease && (
            <p className="text-sm text-gray-500 mt-1">
              ${Number(lease.monthlyRent).toLocaleString()}/mo
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Lease Status</p>
          <p className="text-2xl font-bold text-gray-800">
            {lease ? lease.status.charAt(0).toUpperCase() + lease.status.slice(1) : 'None'}
          </p>
          {lease && (
            <p className="text-sm text-gray-500 mt-1">
              Ends {new Date(lease.leaseEnd).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm">Open Requests</p>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? '...' : stats.openRequests}
          </p>
          <p className="text-sm text-gray-500 mt-1">Maintenance</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <div className={`${link.color} p-6 rounded-lg transition cursor-pointer border border-gray-200`}>
                  <Icon className={`w-10 h-10 ${link.iconColor} mb-3`} />
                  <h3 className="font-semibold text-gray-800 mb-1">{link.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{link.description}</p>
                  <div className="flex items-center text-gray-600 text-sm font-medium">
                    View <FaChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : stats.recentActivity.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {stats.recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between pb-4 ${
                  i < stats.recentActivity.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.date}</p>
                </div>
                <span
                  className={`font-semibold ${
                    item.type === 'payment' ? 'text-green-600' : 'text-orange-600'
                  }`}
                >
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support */}
      <div className="bg-blue-50 p-8 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          If you have any questions or need assistance, please contact us:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="tel:859-333-9244"
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <FaPhone className="w-4 h-4" /> (859) 333-9244
          </a>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 px-6 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            <FaEnvelope className="w-4 h-4" /> Send Message
          </Link>
        </div>
      </div>
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
