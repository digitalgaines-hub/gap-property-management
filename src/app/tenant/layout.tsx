import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TenantShell from './TenantShell'

export default async function TenantLayout({
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

  const { data: leasesRaw } = await supabase
    .from('leases')
    .select(`
      id,
      lease_start,
      lease_end,
      monthly_rent,
      status,
      unit:units (
        id,
        unit_number,
        property:properties (
          id,
          name,
          address_line1
        )
      )
    `)
    .eq('tenant_id', user.id)
    .eq('status', 'active')

  type UnitShape = { id: string; unit_number: string; property: { name: string; address_line1: string } } | null

  const leases = (leasesRaw ?? []).map(lease => {
    const unit = lease.unit as unknown as UnitShape
    return {
      id: lease.id,
      leaseStart: lease.lease_start,
      leaseEnd: lease.lease_end,
      monthlyRent: lease.monthly_rent,
      status: lease.status,
      unitId: unit?.id ?? null,
      unitNumber: unit?.unit_number ?? null,
      propertyName: unit?.property?.name ?? null,
      propertyAddress: unit?.property?.address_line1 ?? null,
    }
  })

  return (
    <TenantShell
      user={{
        id: user.id,
        email: user.email!,
        fullName: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
      }}
      lease={leases[0] ?? null}
      leases={leases}
    >
      {children}
    </TenantShell>
  )
}
