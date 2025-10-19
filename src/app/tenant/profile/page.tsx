'use client';
import Link from 'next/link';
import { FaUser, FaArrowLeft } from 'react-icons/fa';

export default function TenantProfile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tenant/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <FaArrowLeft /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <FaUser className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
            <p className="text-gray-600">john.doe@email.com</p>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Edit Profile
            </button>
          </div>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="font-semibold text-gray-800">John Doe</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-semibold text-gray-800">john.doe@email.com</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-semibold text-gray-800">(859) 555-0123</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Property</label>
                  <p className="font-semibold text-gray-800">375 Michelle Drive</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Lease Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Lease Start Date</label>
                  <p className="font-semibold text-gray-800">March 1, 2024</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Lease End Date</label>
                  <p className="font-semibold text-gray-800">February 28, 2025</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Monthly Rent</label>
                  <p className="font-semibold text-gray-800">$1,200</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Security</h3>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}