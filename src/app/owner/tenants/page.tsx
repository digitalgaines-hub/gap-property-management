'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaUsers, FaEnvelope, FaPhone, FaPlus, FaTimes, FaCheckCircle } from 'react-icons/fa'

interface Tenant {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  created_at: string
  leases: {
    id: string
    lease_start: string
    lease_end: string
    monthly_rent: number
    status: string
    unit: { unit_number: string; property: { name: string } } | null
  }[]
}

export default function OwnerTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select(`
        id, full_name, email, phone, created_at,
        leases (
          id, lease_start, lease_end, monthly_rent, status,
          unit:units ( unit_number, property:properties ( name ) )
        )
      `)
      .eq('role', 'tenant')
      .order('created_at', { ascending: false })

    setTenants((data ?? []).map(t => ({
      ...t,
      leases: (t.leases ?? []).map((l: Record<string, unknown>) => ({
        ...l,
        unit: l.unit as { unit_number: string; property: { name: string } } | null,
      })),
    })) as Tenant[])
    setLoading(false)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')

    const res = await fetch('/api/tenants/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, fullName: inviteName }),
    })

    const data = await res.json()

    if (!res.ok) {
      setInviteError(data.error || 'Failed to invite tenant')
      setInviting(false)
      return
    }

    setInviteSuccess(`Invitation sent to ${inviteEmail}`)
    setInviteEmail('')
    setInviteName('')
    setInviting(false)
    setShowInvite(false)
    loadTenants()

    setTimeout(() => setInviteSuccess(''), 5000)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading tenants...</div>
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tenant Management</h1>
        <button
          onClick={() => { setShowInvite(!showInvite); setInviteError(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {showInvite ? <FaTimes /> : <FaPlus />}
          {showInvite ? 'Cancel' : 'Add Tenant'}
        </button>
      </div>

      {inviteSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-green-600 flex-shrink-0" />
          <span className="text-green-700">{inviteSuccess}</span>
        </div>
      )}

      {showInvite && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Invite New Tenant</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter the tenant&apos;s email and name. They will receive an invitation email with a sign-in link.
          </p>

          {inviteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {inviteError}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="tenant@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={inviting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tenants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No tenants found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tenants.map(tenant => {
            const activeLease = tenant.leases.find(l => l.status === 'active')
            return (
              <div key={tenant.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {tenant.full_name || 'Unnamed Tenant'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaEnvelope className="w-3 h-3" /> {tenant.email}
                      </span>
                      {tenant.phone && (
                        <span className="flex items-center gap-1">
                          <FaPhone className="w-3 h-3" /> {tenant.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {activeLease && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        ${Number(activeLease.monthly_rent).toLocaleString()}/mo
                      </p>
                      <p className="text-sm text-gray-500">
                        {activeLease.unit?.unit_number} @ {activeLease.unit?.property?.name}
                      </p>
                    </div>
                  )}
                </div>

                {activeLease && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Lease: {new Date(activeLease.lease_start).toLocaleDateString()} – {new Date(activeLease.lease_end).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeLease.status === 'active' ? 'bg-green-100 text-green-700' :
                      activeLease.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activeLease.status}
                    </span>
                  </div>
                )}

                {!activeLease && tenant.leases.length === 0 && (
                  <p className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-400">No lease on file</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
