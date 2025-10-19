'use client';
import Link from 'next/link';
import { FaCreditCard, FaArrowLeft } from 'react-icons/fa';

export default function TenantPayments() {
  const payments = [
    { id: 1, date: 'March 1, 2025', amount: 1200, status: 'Upcoming', dueDate: 'April 1, 2025' },
    { id: 2, date: 'February 1, 2025', amount: 1200, status: 'Paid', paidDate: 'February 1, 2025' },
    { id: 3, date: 'January 1, 2025', amount: 1200, status: 'Paid', paidDate: 'January 1, 2025' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tenant/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">Rent Payments</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Next Payment Due</p>
            <p className="text-3xl font-bold text-blue-600">$1,200</p>
            <p className="text-sm text-gray-600 mt-1">April 1, 2025</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Total Paid This Year</p>
            <p className="text-3xl font-bold text-green-600">$2,400</p>
            <p className="text-sm text-gray-600 mt-1">2 payments</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm">Account Status</p>
            <p className="text-3xl font-bold text-gray-800">Good</p>
            <p className="text-sm text-green-600 mt-1">No late payments</p>
          </div>
        </div>

        <button className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
          <FaCreditCard /> Make Payment Now
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Payment History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <div key={payment.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Rent Payment</p>
                  <p className="text-sm text-gray-600">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${payment.amount}</p>
                  <span className={`text-sm font-medium ${payment.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}