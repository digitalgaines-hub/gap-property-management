'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '../TenantShell'
import { FaFileAlt, FaDownload, FaFilter } from 'react-icons/fa'

interface Document {
  id: string
  title: string
  category: string
  file_url: string
  is_public: boolean
  created_at: string
}

const categoryLabels: Record<string, string> = {
  lease: 'Lease',
  rules: 'Rules & Regulations',
  insurance: 'Insurance',
  renovation: 'Renovation',
  compliance: 'Compliance',
  notice: 'Notice',
  other: 'Other',
}

const categoryColors: Record<string, string> = {
  lease: 'bg-blue-100 text-blue-700',
  rules: 'bg-purple-100 text-purple-700',
  insurance: 'bg-green-100 text-green-700',
  renovation: 'bg-orange-100 text-orange-700',
  compliance: 'bg-red-100 text-red-700',
  notice: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
}

export default function TenantDocuments() {
  const { user } = useTenant()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function loadDocuments() {
      const supabase = createClient()
      const { data } = await supabase
        .from('documents')
        .select('id, title, category, file_url, is_public, created_at')
        .order('created_at', { ascending: false })

      setDocuments(data ?? [])
      setLoading(false)
    }

    loadDocuments()
  }, [user.id])

  const filteredDocs = filter === 'all'
    ? documents
    : documents.filter((d) => d.category === filter)

  const categories = [...new Set(documents.map((d) => d.category))]

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Documents</h1>

        {categories.length > 1 && (
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 w-3 h-3" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat] ?? cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No documents found</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Documents will appear here when shared by management'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <FaFileAlt className="w-8 h-8 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[doc.category] ?? categoryColors.other}`}>
                        {categoryLabels[doc.category] ?? doc.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shrink-0 ml-4"
                >
                  <FaDownload className="w-3 h-3" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
