'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FaHome, FaFileAlt, FaCreditCard, FaWrench, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { createContext, useContext, useState } from 'react'

export interface TenantUser {
  id: string
  email: string
  fullName: string | null
  phone: string | null
}

export interface TenantLease {
  id: string
  leaseStart: string
  leaseEnd: string
  monthlyRent: number
  status: string
  unitId: string | null
  unitNumber: string | null
  propertyName: string | null
  propertyAddress: string | null
}

interface TenantContextValue {
  user: TenantUser
  lease: TenantLease | null
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantShell')
  return ctx
}

const navItems = [
  { href: '/tenant/dashboard', label: 'Dashboard', icon: FaHome },
  { href: '/tenant/documents', label: 'Documents', icon: FaFileAlt },
  { href: '/tenant/payments', label: 'Payments', icon: FaCreditCard },
  { href: '/tenant/maintenance', label: 'Maintenance', icon: FaWrench },
  { href: '/tenant/profile', label: 'Profile', icon: FaUser },
]

export default function TenantShell({
  user,
  lease,
  children,
}: {
  user: TenantUser
  lease: TenantLease | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <TenantContext value={{ user, lease }}>
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm">G&A</div>
              <span className="font-semibold text-gray-800 hidden sm:inline">Tenant Portal</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden lg:inline">
                {user.fullName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white px-4 pb-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </TenantContext>
  )
}
