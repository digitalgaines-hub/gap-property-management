'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FaHome, FaUsers, FaWrench, FaFileAlt, FaChartBar, FaEnvelope, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { createContext, useContext, useState } from 'react'

export interface OwnerUser {
  id: string
  email: string
  fullName: string | null
  role: string
}

interface OwnerContextValue {
  user: OwnerUser
}

const OwnerContext = createContext<OwnerContextValue | null>(null)

export function useOwner() {
  const ctx = useContext(OwnerContext)
  if (!ctx) throw new Error('useOwner must be used within OwnerShell')
  return ctx
}

const navItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: FaHome },
  { href: '/owner/tenants', label: 'Tenants', icon: FaUsers },
  { href: '/owner/maintenance', label: 'Maintenance', icon: FaWrench },
  { href: '/owner/documents', label: 'Documents', icon: FaFileAlt },
  { href: '/owner/inquiries', label: 'Inquiries', icon: FaEnvelope },
  { href: '/owner/financials', label: 'Financials', icon: FaChartBar },
]

export default function OwnerShell({
  user,
  children,
}: {
  user: OwnerUser
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
    <OwnerContext value={{ user }}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-800 text-white px-3 py-1 rounded-lg font-bold text-sm">G&A</div>
              <span className="font-semibold text-gray-800 hidden sm:inline">Owner Portal</span>
            </Link>

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
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </OwnerContext>
  )
}
