import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OwnerShell from './OwnerShell'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/tenant-login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, role')
    .eq('id', user.id)
    .single()

  // Only owner or admin can access
  if (!profile || !['owner', 'admin'].includes(profile.role)) {
    redirect('/tenant/dashboard')
  }

  return (
    <OwnerShell
      user={{
        id: user.id,
        email: user.email!,
        fullName: profile.full_name ?? null,
        role: profile.role,
      }}
    >
      {children}
    </OwnerShell>
  )
}
