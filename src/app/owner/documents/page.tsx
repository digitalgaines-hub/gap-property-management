'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaFileAlt, FaUpload, FaDownload, FaTrash } from 'react-icons/fa'

interface Doc {
  id: string
  title: string
  category: string
  file_url: string
  is_public: boolean
  created_at: string
  property: { name: string } | null
  tenant: { full_name: string | null; email: string } | null
}

const categories = ['lease', 'rules', 'insurance', 'renovation', 'compliance', 'notice', 'other']

const categoryColors: Record<string, string> = {
  lease: 'bg-blue-100 text-blue-700',
  rules: 'bg-purple-100 text-purple-700',
  insurance: 'bg-green-100 text-green-700',
  renovation: 'bg-orange-100 text-orange-700',
  compliance: 'bg-red-100 text-red-700',
  notice: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function OwnerDocuments() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '', category: 'other', is_public: false, file: null as File | null,
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select(`
        id, title, category, file_url, is_public, created_at,
        property:properties(name),
        tenant:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })

    setDocs((data ?? []).map(d => ({
      ...d,
      property: d.property as unknown as Doc['property'],
      tenant: d.tenant as unknown as Doc['tenant'],
    })))
    setLoading(false)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.title) return

    setUploading(true)
    const supabase = createClient()

    const filePath = `documents/${Date.now()}-${uploadForm.file.name}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, uploadForm.file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)

    await supabase.from('documents').insert({
      title: uploadForm.title,
      category: uploadForm.category,
      file_url: publicUrl,
      is_public: uploadForm.is_public,
    })

    setUploadForm({ title: '', category: 'other', is_public: false, file: null })
    setShowUpload(false)
    setUploading(false)
    loadDocs()
  }

  async function deleteDoc(id: string) {
    const supabase = createClient()
    await supabase.from('documents').delete().eq('id', id)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Document Management</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <FaUpload /> Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="text"
              placeholder="Document Title"
              value={uploadForm.title}
              onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={uploadForm.category}
                onChange={e => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={uploadForm.is_public}
                  onChange={e => setUploadForm(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Visible to all tenants
              </label>
            </div>
            <input
              type="file"
              onChange={e => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading documents...</div>
      ) : docs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No documents yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {docs.map(doc => (
              <div key={doc.id} className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[doc.category] || ''}`}>
                      {doc.category}
                    </span>
                    {doc.is_public && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Public</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Uploaded {new Date(doc.created_at).toLocaleDateString()}
                    {doc.tenant && ` · For: ${doc.tenant.full_name || doc.tenant.email}`}
                    {doc.property && ` · ${doc.property.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <FaDownload />
                  </a>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
