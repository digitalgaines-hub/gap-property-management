'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaWrench } from 'react-icons/fa'

interface Request {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  scheduled_date: string | null
  vendor_name: string | null
  tenant: { full_name: string | null; email: string } | null
  unit: { unit_number: string; property: { name: string } } | null
}

const statusOptions = ['submitted', 'acknowledged', 'in_progress', 'scheduled', 'completed', 'closed']

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-700',
  acknowledged: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  scheduled: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}

const priorityColors: Record<string, string> = {
  emergency: 'bg-red-100 text-red-700',
  urgent: 'bg-orange-100 text-orange-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-700',
}

export default function OwnerMaintenance() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')

  useEffect(() => {
    loadRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function loadRequests() {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('maintenance_requests')
      .select(`
        id, title, description, category, priority, status, created_at,
        scheduled_date, vendor_name,
        tenant:profiles!maintenance_requests_tenant_id_fkey(full_name, email),
        unit:units!maintenance_requests_unit_id_fkey(unit_number, property:properties(name))
      `)
      .order('created_at', { ascending: false })

    if (filter === 'open') {
      query = query.not('status', 'in', '("completed","closed")')
    } else if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setRequests((data ?? []).map(r => ({
      ...r,
      tenant: r.tenant as unknown as Request['tenant'],
      unit: r.unit as unknown as Request['unit'],
    })))
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    const supabase = createClient()
    const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
    if (newStatus === 'completed') updates.completed_date = new Date().toISOString().split('T')[0]

    await supabase.from('maintenance_requests').update(updates).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))

    // Notify tenant via email (fire and forget)
    fetch('/api/notifications/maintenance-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, status: newStatus }),
    }).catch(() => {})
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="open">Open Requests</option>
          <option value="all">All Requests</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaWrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No maintenance requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">{req.title}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[req.priority] || ''}`}>
                      {req.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status] || ''}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Tenant: {req.tenant?.full_name || req.tenant?.email || 'Unknown'}</span>
                    <span>Unit: {req.unit?.unit_number} @ {req.unit?.property?.name}</span>
                    <span>Category: {req.category}</span>
                    <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                    {req.scheduled_date && <span>Scheduled: {new Date(req.scheduled_date).toLocaleDateString()}</span>}
                    {req.vendor_name && <span>Vendor: {req.vendor_name}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <select
                    value={req.status}
                    onChange={e => updateStatus(req.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
