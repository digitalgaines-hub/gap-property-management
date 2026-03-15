import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FaMapPin, FaRuler, FaBuilding, FaHome } from 'react-icons/fa'

interface Property {
  id: string
  name: string
  slug: string
  address_line1: string
  city: string
  state: string
  zip: string
  property_type: string
  total_sqft: number | null
  description: string
  featured: boolean
  year_renovated: number | null
  amenities: string[]
  units: {
    id: string
    unit_number: string
    sqft: number | null
    monthly_rent: number | null
    status: string
    bedrooms: number | null
  }[]
}

export default async function PropertiesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, name, slug, address_line1, city, state, zip,
      property_type, total_sqft, description, featured,
      year_renovated, amenities,
      units ( id, unit_number, sqft, monthly_rent, status, bedrooms )
    `)
    .eq('status', 'active')
    .order('featured', { ascending: false })

  const props: Property[] = (properties ?? []) as Property[]

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Properties</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Browse our selection of commercial and residential properties in Richmond, Kentucky.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {props.length === 0 ? (
            <div className="text-center py-12">
              <FaBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No properties available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {props.map((property) => {
                const availableUnits = property.units?.filter(u => u.status === 'available') ?? []
                const rents = availableUnits
                  .map(u => u.monthly_rent)
                  .filter((r): r is number => r !== null)
                  .sort((a, b) => a - b)
                const minRent = rents[0]
                const maxRent = rents[rents.length - 1]

                return (
                  <Link
                    key={property.id}
                    href={`/properties/${property.slug}`}
                    className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition group"
                  >
                    {/* Image placeholder */}
                    <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                      {property.property_type === 'commercial' ? (
                        <FaBuilding className="w-16 h-16 text-blue-400" />
                      ) : (
                        <FaHome className="w-16 h-16 text-green-400" />
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                          property.property_type === 'commercial' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                        </span>
                        {property.featured && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold text-yellow-800 bg-yellow-400">
                            Featured
                          </span>
                        )}
                      </div>
                      {availableUnits.length > 0 && (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                          {availableUnits.length} Available
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                        {property.name}
                      </h2>

                      <div className="flex items-center text-gray-600 mb-4">
                        <FaMapPin className="w-4 h-4 mr-2 text-blue-600" />
                        {property.address_line1}, {property.city}, {property.state} {property.zip}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                        {property.total_sqft && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaRuler className="text-blue-600" />
                            {property.total_sqft.toLocaleString()} SF
                          </div>
                        )}
                        {minRent && (
                          <div className="text-sm font-semibold text-blue-600">
                            ${minRent.toLocaleString()}{maxRent && maxRent !== minRent ? ` – $${maxRent.toLocaleString()}` : ''}/mo
                          </div>
                        )}
                        {property.year_renovated && (
                          <div className="text-sm text-gray-500">
                            Renovated {property.year_renovated}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
