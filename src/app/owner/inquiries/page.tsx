'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaEnvelope } from 'react-icons/fa'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  inquiry_type: string
  message: string
  status: string
  created_at: string
}

const statusOptions = ['new', 'responded', 'closed']

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-700',
  responded: 'bg-blue-100 text-blue-700',
  closed: 'bg-gray-100 text-gray-700',
}

const typeLabels: Record<string, string> = {
  general: 'General',
  leasing: 'Lease Application',
  maintenance_emergency: 'Maintenance Emergency',
  tour_request: 'Tour Request',
}

export default function OwnerInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadInquiries()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function loadInquiries() {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('inquiries')
      .select('id, name, email, phone, inquiry_type, message, status, created_at')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setInquiries(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, newStatus: string) {
    const supabase = createClient()
    await supabase.from('inquiries').update({ status: newStatus }).eq('id', id)
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inquiries</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Inquiries</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.replace(/^\w/, c => c.toUpperCase())}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaEnvelope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No inquiries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inq => (
            <div key={inq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">{inq.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inq.status] || ''}`}>
                      {inq.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {typeLabels[inq.inquiry_type] || inq.inquiry_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{inq.message}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Email: {inq.email}</span>
                    {inq.phone && <span>Phone: {inq.phone}</span>}
                    <span>Submitted: {new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <select
                    value={inq.status}
                    onChange={e => updateStatus(inq.id, e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s.replace(/^\w/, c => c.toUpperCase())}</option>
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
