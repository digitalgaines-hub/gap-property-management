'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaMapPin, FaBed, FaRuler, FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa'
import { createClient } from '@/lib/supabase/client'
import { useRecaptcha } from '@/lib/recaptcha'

interface Unit {
  id: string
  unit_number: string
  unit_type: string
  sqft: number | null
  floor: number | null
  bedrooms: number | null
  bathrooms: number | null
  monthly_rent: number | null
  status: string
  description: string | null
}

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
  amenities: string[]
  year_built: number | null
  year_renovated: number | null
  units: Unit[]
}

const propertyImages: Record<string, string[]> = {
  '244-w-irvine': [
    '/images/properties/irvine-street/irvine-office-1.jpg',
    '/images/properties/irvine-street/irvine-office-2.jpg',
    '/images/properties/irvine-street/irvine-office-3.jpg',
    '/images/properties/irvine-street/irvine-office-4.jpg',
    '/images/properties/irvine-street/irvine-office-5.jpg',
    '/images/properties/irvine-street/irvine-office-6.jpg',
    '/images/properties/irvine-street/irvine-office-7.jpg',
    '/images/properties/irvine-street/irvine-office-8.jpg',
    '/images/properties/irvine-street/irvine-office-9.jpg',
  ],
}

const idToSlug: Record<string, string> = {
  '1': '244-w-irvine',
  '2': '375-michelle',
}

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    moveInDate: '', employmentStatus: '', message: '',
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const { executeRecaptcha } = useRecaptcha()

  useEffect(() => {
    params.then(async (p) => {
      const slug = idToSlug[p.slug] || p.slug
      const supabase = createClient()
      const { data } = await supabase
        .from('properties')
        .select(`
          id, name, slug, address_line1, city, state, zip,
          property_type, total_sqft, description, amenities,
          year_built, year_renovated,
          units ( id, unit_number, unit_type, sqft, floor, bedrooms, bathrooms, monthly_rent, status, description )
        `)
        .eq('slug', slug)
        .single()

      setProperty(data as Property | null)
      setLoading(false)
    })
  }, [params])

  const images = property ? (propertyImages[property.slug] || []) : []
  const availableUnits = property?.units?.filter(u => u.status === 'available') ?? []
  const comingSoon = property?.units?.filter(u => u.status === 'coming_soon') ?? []
  const rents = availableUnits.map(u => u.monthly_rent).filter((r): r is number => r !== null).sort((a, b) => a - b)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    setFormSubmitting(true)
    setFormError('')

    try {
      const recaptchaToken = await executeRecaptcha('lease_application')

      const res = await fetch('/api/inquiries/lease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyId: property.id,
          recaptchaToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit application')
      }

      setFormSubmitted(true)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', moveInDate: '', employmentStatus: '', message: '' })
      setTimeout(() => {
        setShowApplicationForm(false)
        setFormSubmitted(false)
      }, 3000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setFormSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading property...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <Link href="/properties" className="text-blue-600 hover:text-blue-700 font-semibold">
            View All Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">Home</Link>
          <span className="text-gray-400 mx-2">/</span>
          <Link href="/properties" className="text-blue-600 hover:text-blue-700 text-sm">Properties</Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600 text-sm">{property.name}</span>
        </div>
      </div>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="mb-8">
                  <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden group">
                    <img
                      src={images[currentImageIndex]}
                      alt={`${property.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <button
                      onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                    >
                      <FaChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                    >
                      <FaChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Property Header */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{property.name}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaMapPin className="w-5 h-5 mr-2 text-blue-600" />
                      {property.address_line1}, {property.city}, {property.state} {property.zip}
                    </div>
                  </div>
                  {rents.length > 0 && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        ${rents[0].toLocaleString()}{rents.length > 1 ? ` - $${rents[rents.length - 1].toLocaleString()}` : ''}
                      </div>
                      <p className="text-gray-600">Monthly Rent</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-t border-b border-gray-200">
                  {property.total_sqft && (
                    <div className="text-center">
                      <FaRuler className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800">{property.total_sqft.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Square Feet</p>
                    </div>
                  )}
                  {property.units?.[0]?.bedrooms && (
                    <div className="text-center">
                      <FaBed className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800">{property.units[0].bedrooms}</p>
                      <p className="text-xs text-gray-500">Bedrooms</p>
                    </div>
                  )}
                  {property.year_renovated && (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800">{property.year_renovated}</p>
                      <p className="text-xs text-gray-500">Renovated</p>
                    </div>
                  )}
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                      property.property_type === 'commercial' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              {/* Available Units */}
              {availableUnits.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Spaces</h2>
                  <div className="space-y-4">
                    {availableUnits.map(unit => (
                      <div key={unit.id} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">{unit.unit_number}</p>
                          <p className="text-sm text-gray-600">{unit.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            {unit.sqft && <span>{unit.sqft} SF</span>}
                            {unit.floor && <span>Floor {unit.floor}</span>}
                            {unit.bedrooms && <span>{unit.bedrooms} bed / {unit.bathrooms} bath</span>}
                          </div>
                        </div>
                        {unit.monthly_rent && (
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">${unit.monthly_rent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">/month</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coming Soon */}
              {comingSoon.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
                  {comingSoon.map(unit => (
                    <div key={unit.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                      <p className="font-semibold text-gray-800">{unit.unit_number}</p>
                      <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                      {unit.sqft && <p className="text-sm text-gray-500 mt-1">{unit.sqft} SF</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <FaCheckCircle className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg mb-6 sticky top-20">
                {rents.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Monthly Rent</p>
                    <p className="text-4xl font-bold text-blue-600">
                      ${rents[0].toLocaleString()}{rents.length > 1 ? ` - $${rents[rents.length - 1].toLocaleString()}` : ''}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                >
                  Apply Now
                </button>

                <Link
                  href="/contact"
                  className="block w-full text-center border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Schedule Tour
                </Link>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Questions?</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Call us</p>
                      <a href="tel:(859)333-9244" className="text-blue-600 font-semibold hover:text-blue-700">(859) 333-9244</a>
                    </div>
                    <div>
                      <p className="text-gray-600">Contact us</p>
                      <a href="/contact" className="text-blue-600 font-semibold hover:text-blue-700">Use our contact form</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Apply for {property.name}</h2>
              <button onClick={() => { setShowApplicationForm(false); setFormSubmitted(false) }} className="text-gray-600 hover:text-gray-800 text-2xl">&times;</button>
            </div>

            {formSubmitted ? (
              <div className="p-12 text-center">
                <FaCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
                <p className="text-gray-600">We will review your application and contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleFormChange} required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                  <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleFormChange} required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleFormChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                  <option value="">Select Employment Status</option>
                  <option value="employed">Employed</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
                <textarea name="message" placeholder="Additional Information (Optional)" value={formData.message} onChange={handleFormChange} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {formError}
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowApplicationForm(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={formSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {formSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
