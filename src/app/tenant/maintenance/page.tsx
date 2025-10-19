'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FaWrench, FaArrowLeft, FaPlus } from 'react-icons/fa';

export default function TenantMaintenance() {
  const [requests, setRequests] = useState([
    { id: 1, title: 'Leaky faucet in kitchen', date: 'February 28, 2025', status: 'In Progress', priority: 'Medium' },
    { id: 2, title: 'Door lock needs adjustment', date: 'February 20, 2025', status: 'Completed', priority: 'Low' },
    { id: 3, title: 'Ceiling light not working', date: 'February 10, 2025', status: 'Completed', priority: 'High' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tenant/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Maintenance Requests</h1>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <FaPlus /> New Request
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {requests.map((req) => (
              <div key={req.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <FaWrench className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{req.title}</h3>
                      <p className="text-sm text-gray-600">{req.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      req.status === 'In Progress' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {req.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{req.priority} Priority</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}