import Link from 'next/link';
import { FaEnvelope, FaPhone, FaMapPin, FaClock } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold">
                G&A
              </div>
              <span className="font-semibold">Property Management</span>
            </div>
            <p className="text-gray-400 mb-6">
              Professional property management serving Richmond, Kentucky with excellence and integrity.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FaPhone className="w-4 h-4 text-blue-500" />
                <span>(859) 555-0123</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaEnvelope className="w-4 h-4 text-blue-500" />
                <span>info@gaproperty.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-blue-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-400 hover:text-blue-400 transition">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/maintenance" className="text-gray-400 hover:text-blue-400 transition">
                  Maintenance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/tenant-login" className="text-gray-400 hover:text-blue-400 transition">
                  Tenant Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Tenant Resources */}
          <div>
            <h3 className="font-bold text-white mb-4">Tenant Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/documents" className="text-gray-400 hover:text-blue-400 transition">
                  Lease Documents
                </Link>
              </li>
              <li>
                <Link href="/payments" className="text-gray-400 hover:text-blue-400 transition">
                  Pay Rent
                </Link>
              </li>
              <li>
                <Link href="/maintenance" className="text-gray-400 hover:text-blue-400 transition">
                  Request Maintenance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition">
                  Report Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Office Hours */}
          <div>
            <h3 className="font-bold text-white mb-4">Office Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FaClock className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <p className="font-semibold">Monday - Friday</p>
                  <p className="text-gray-400">9:00 AM - 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FaMapPin className="w-4 h-4 text-blue-500 mt-1" />
                <div>
                  <p className="font-semibold">Saturday & Sunday</p>
                  <p className="text-gray-400">By Appointment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {currentYear} G&A Property Management. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-blue-400 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-400 transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}