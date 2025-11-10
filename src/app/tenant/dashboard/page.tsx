'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaHome, FaFileAlt, FaWrench, FaCreditCard, FaUser, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';

interface TenantSession {
  email: string;
  name: string;
  tenantId: string;
  loginTime: string;
}

export default function TenantDashboard() {
  const [tenant, setTenant] = useState<TenantSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get tenant session from localStorage
    const session = localStorage.getItem(&apos;tenantSession');
    if (session) {
      setTenant(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(&apos;tenantSession');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Link href="/tenant-login" className="text-blue-600 font-semibold">
          Please log in
        </Link>
      </div>
    );
  }

  const quickLinks = [
    {
      icon: FaFileAlt,
      title: 'Lease Documents',
      description: 'View your lease agreement and documents',
      href: '/tenant/documents',
      color: 'bg-blue-50 hover:bg-blue-100',
      iconColor: &apos;text-blue-600',
    },
    {
      icon: FaCreditCard,
      title: 'Make Payment',
      description: 'Pay your rent online',
      href: '/tenant/payments',
      color: 'bg-green-50 hover:bg-green-100',
      iconColor: &apos;text-green-600',
    },
    {
      icon: FaWrench,
      title: 'Maintenance',
      description: 'Submit maintenance requests',
      href: '/tenant/maintenance',
      color: 'bg-orange-50 hover:bg-orange-100',
      iconColor: &apos;text-orange-600',
    },
    {
      icon: FaUser,
      title: 'My Profile',
      description: 'Manage your account',
      href: '/tenant/profile',
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: &apos;text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold">G&A</div>
            <span className="font-semibold text-gray-800">Tenant Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {tenant.name}!</h1>
            <p className="text-blue-100">Here's your tenant portal dashboard</p>
            <p className="text-blue-200 text-sm mt-2">Account: {tenant.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rent Due</p>
                <p className="text-2xl font-bold text-gray-800">April 1, 2025</p>
              </div>
              <FaCreditCard className="w-12 h-12 text-blue-100" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Lease Status</p>
                <p className="text-2xl font-bold text-gray-800">Active</p>
              </div>
              <FaFileAlt className="w-12 h-12 text-green-100" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Requests</p>
                <p className="text-2xl font-bold text-gray-800">2</p>
              </div>
              <FaWrench className="w-12 h-12 text-orange-100" />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <div
                    className={`${link.color} p-6 rounded-lg transition cursor-pointer border border-gray-200`}
                  >
                    <Icon className={`w-10 h-10 ${link.iconColor} mb-3`} />
                    <h3 className="font-semibold text-gray-800 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{link.description}</p>
                    <div className="flex items-center text-gray-600 text-sm font-medium">
                      View <FaChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">Rent Payment</p>
                <p className="text-sm text-gray-600">March 1, 2025</p>
              </div>
              <span className="text-green-600 font-semibold">-$1,200</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="font-semibold text-gray-800">Maintenance Request Submitted</p>
                <p className="text-sm text-gray-600">February 28, 2025</p>
              </div>
              <span className="text-orange-600 font-semibold">Pending</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Lease Renewal Notice</p>
                <p className="text-sm text-gray-600">February 15, 2025</p>
              </div>
              <span className="text-blue-600 font-semibold">View</span>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-blue-50 p-8 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions or need assistance, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:859-333-9244"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center"
            >
              Call (859) 333-9244
            </a>
            <Link
              href="/contact"
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
            >
              Send Message
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
