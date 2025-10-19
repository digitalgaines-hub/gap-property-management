'use client';
import Link from 'next/link';
import { FaFileAlt, FaDownload, FaArrowLeft } from 'react-icons/fa';

export default function TenantDocuments() {
  const documents = [
    { id: 1, name: 'Lease Agreement', date: 'March 1, 2024', size: '2.4 MB' },
    { id: 2, name: 'Move-In Inspection Report', date: 'March 2, 2024', size: '1.8 MB' },
    { id: 3, name: 'House Rules & Regulations', date: 'March 1, 2024', size: '512 KB' },
    { id: 4, name: 'Emergency Procedures', date: 'January 15, 2024', size: '890 KB' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tenant/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Lease Documents</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FaFileAlt className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">{doc.name}</h3>
                    <p className="text-sm text-gray-600">{doc.date} • {doc.size}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <FaDownload /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}