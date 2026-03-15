'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '../TenantShell'
import { FaUser, FaCheck } from 'react-icons/fa'

export default function TenantProfile() {
  const { user, lease } = useTenant()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    }

    setSaving(false)
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium flex items-center gap-2">
          <FaCheck /> Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {fullName || 'Tenant'}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setFullName(user.fullName ?? '')
                      setPhone(user.phone ?? '')
                      setError(null)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="font-semibold text-gray-800">{fullName || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-semibold text-gray-800">{phone || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lease Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Lease Information</h3>
            {lease ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Property</label>
                  <p className="font-semibold text-gray-800">
                    {lease.propertyName} &mdash; {lease.unitNumber}
                  </p>
                  {lease.propertyAddress && (
                    <p className="text-sm text-gray-500">{lease.propertyAddress}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Lease Start</label>
                    <p className="font-semibold text-gray-800">
                      {new Date(lease.leaseStart).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Lease End</label>
                    <p className="font-semibold text-gray-800">
                      {new Date(lease.leaseEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Monthly Rent</label>
                    <p className="font-semibold text-gray-800">
                      ${Number(lease.monthlyRent).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <p className="font-semibold text-green-600 capitalize">{lease.status}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active lease on file</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
