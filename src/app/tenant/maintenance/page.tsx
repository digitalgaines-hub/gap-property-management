'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '../TenantShell'
import { FaWrench, FaPlus, FaTimes, FaCamera, FaTrash } from 'react-icons/fa'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  updated_at: string
  scheduled_date: string | null
  vendor_name: string | null
}

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-500',
  acknowledged: 'bg-blue-500',
  in_progress: 'bg-blue-600',
  scheduled: 'bg-purple-500',
  completed: 'bg-green-600',
  closed: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  completed: 'Completed',
  closed: 'Closed',
}

const priorityColors: Record<string, string> = {
  emergency: 'text-red-600',
  urgent: 'text-orange-600',
  normal: 'text-gray-600',
  low: 'text-gray-400',
}

const categories = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'appliance', label: 'Appliance' },
  { value: 'structural', label: 'Structural' },
  { value: 'pest', label: 'Pest Control' },
  { value: 'other', label: 'Other' },
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'emergency', label: 'Emergency' },
]

export default function TenantMaintenance() {
  const { user, lease } = useTenant()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [priority, setPriority] = useState('normal')
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  async function loadRequests() {
    const supabase = createClient()
    const { data } = await supabase
      .from('maintenance_requests')
      .select('id, title, description, category, priority, status, created_at, updated_at, scheduled_date, vendor_name')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false })

    setRequests(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lease?.unitId) {
      setError('No active lease found. Please contact management.')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    // Create the maintenance request
    const { data: request, error: insertError } = await supabase
      .from('maintenance_requests')
      .insert({
        tenant_id: user.id,
        unit_id: lease.unitId,
        title,
        description,
        category,
        priority,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    // Upload images if any
    if (images.length > 0 && request) {
      for (const image of images) {
        const fileName = `${request.id}/${Date.now()}-${image.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('maintenance-images')
          .upload(fileName, image)

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('maintenance-images')
            .getPublicUrl(uploadData.path)

          await supabase.from('maintenance_images').insert({
            request_id: request.id,
            image_url: publicUrl,
          })
        }
      }
    }

    // Notify owner via email (fire and forget)
    if (request) {
      fetch('/api/notifications/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id }),
      }).catch(() => {})
    }

    // Reset form
    setTitle('')
    setDescription('')
    setCategory('other')
    setPriority('normal')
    setImages([])
    setShowForm(false)
    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)

    // Reload requests
    loadRequests()
  }

  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
          Maintenance request submitted successfully!
        </div>
      )}

      {/* New Request Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Submit New Request</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Please describe the issue in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photos (optional)</label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                      <img
                        src={URL.createObjectURL(img)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTrash className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition">
                  <FaCamera className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageAdd}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaWrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No maintenance requests</p>
          <p className="text-gray-400 text-sm mt-1">Click &quot;New Request&quot; to submit one</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {requests.map((req) => (
              <div key={req.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <FaWrench className="w-5 h-5 text-orange-600 mt-1 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800">{req.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-gray-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                        <span className="capitalize text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">
                          {req.category}
                        </span>
                        {req.scheduled_date && (
                          <span className="text-purple-600 text-xs">
                            Scheduled: {new Date(req.scheduled_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[req.status] ?? 'bg-gray-500'}`}>
                      {statusLabels[req.status] ?? req.status}
                    </span>
                    <p className={`text-sm mt-1 capitalize ${priorityColors[req.priority] ?? 'text-gray-600'}`}>
                      {req.priority} Priority
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
