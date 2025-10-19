'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaMapPin, FaBed, FaRuler, FaDollarSign, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'Commercial' | 'Residential';
  price: number;
  beds?: number;
  baths?: number;
  sqft: number;
  yearBuilt?: number;
  description: string;
  amenities: string[];
  leaseTerms: string;
  petPolicy?: string;
  utilities?: string;
  applicationRequired?: boolean;
}

// Sample property data - replace with API call using params.id later
const propertiesData: Record<string, Property> = {
  '1': {
    id: '1',
    name: '244 W. Irvine Street',
    address: '244 W. Irvine St, Richmond, KY 40475',
    type: 'Commercial',
    price: 2500,
    sqft: 3500,
    yearBuilt: 2010,
    description:
      'Welcome to your next professional address, located directly behind City Hall and just one block from the Madison County Courthouse. This newly renovated commercial building offers private office suites ideal for counselors & therapists, attorneys & legal professionals, accountants & financial advisors, consultants & remote professionals. Premium location with excellent visibility and proximity to legal and civic services.',
    amenities: [
      'Receptionist Services – Lobby staff available to greet clients',
      'Conference Room – Shared meeting space for client sessions',
      'Break Room – Kitchenette with seating',
      'Secure Access – Controlled entry',
      'ADA-Compliant Restrooms',
      'Walkable to Courthouse & City Hall',
      'Close to restaurants and banks',
      'Ample street parking and nearby public lots',
    ],
    leaseTerms: '1-3 year lease available, flexible terms',
    utilities: 'Contact property manager for utility details',
    applicationRequired: true,
  },
  '2': {
    id: '2',
    name: '375 Michelle Drive',
    address: '375 Michelle Dr, Richmond, KY 40475',
    type: 'Residential',
    price: 1200,
    beds: 3,
    baths: 2,
    sqft: 1800,
    yearBuilt: 1999,
    description:
      'Newly vacated property sitting on a 0.25 acre lot in the Hartland subdivision. This house has an expanded patio deck for entertaining, hardwood floors throughout the home, 3 bedrooms, 2 bathrooms and a spacious 2 car garage. Located just 5 minutes away from I-75. This is a non-smoking unit and great space for a family on a quiet street. First month rent and deposit due at signing.',
    amenities: [
      'In-Unit Washer & Dryer',
      'Spacious 2-Car Garage',
      'Hardwood Floors',
      'Expanded Patio Deck',
      'Forced Air Heating',
      'Air Conditioning',
      'Unfinished Basement',
      'Brick Exterior',
      'Close to I-75',
    ],
    leaseTerms: '12-month lease required',
    petPolicy: 'No pets',
    utilities: 'Tenant responsible for water, electric, and gas. First month rent and deposit due at signing.',
    applicationRequired: true,
  },
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = propertiesData[params.id];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moveInDate: '',
    employmentStatus: '',
    message: '',
  });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const images = [
    '/placeholder-1.jpg',
    '/placeholder-2.jpg',
    '/placeholder-3.jpg',
  ];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    alert('Application submitted successfully! We will review and contact you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      moveInDate: '',
      employmentStatus: '',
      message: '',
    });
    setShowApplicationForm(false);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            Home
          </a>
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
              <div className="mb-8">
                <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden group">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">Property Image</span>
                  </div>
                  {/* Previous Button */}
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                  >
                    <FaChevronLeft size={20} />
                  </button>
                  {/* Next Button */}
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition z-10"
                  >
                    <FaChevronRight size={20} />
                  </button>
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>
              </div>

              {/* Property Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{property.name}</h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <FaMapPin className="w-5 h-5 mr-2 text-blue-600" />
                      {property.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">${property.price.toLocaleString()}</div>
                    <p className="text-gray-600">Monthly Rent</p>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-4 gap-4 py-6 border-t border-b border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-blue-600 mb-2">
                      <FaRuler className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{property.sqft.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Square Feet</p>
                  </div>
                  {property.beds && (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-blue-600 mb-2">
                        <FaBed className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{property.beds}</p>
                      <p className="text-xs text-gray-500">Bedrooms</p>
                    </div>
                  )}
                  {property.yearBuilt && (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800">{property.yearBuilt}</p>
                      <p className="text-xs text-gray-500">Year Built</p>
                    </div>
                  )}
                  <div className="text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                      property.type === 'Commercial' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      {property.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lease Terms */}
              <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Lease Terms & Policies</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Lease Terms</h3>
                    <p className="text-gray-600">{property.leaseTerms}</p>
                  </div>
                  {property.utilities && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Utilities</h3>
                      <p className="text-gray-600">{property.utilities}</p>
                    </div>
                  )}
                  {property.petPolicy && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Pet Policy</h3>
                      <p className="text-gray-600">{property.petPolicy}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Info Card */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6 sticky top-20">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Monthly Rent</p>
                  <p className="text-4xl font-bold text-blue-600">${property.price.toLocaleString()}</p>
                </div>

                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                >
                  Apply Now
                </button>

                <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                  Schedule Tour
                </button>

                {/* Contact Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Questions?</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Call us</p>
                      <a href="tel:(859)555-0123" className="text-blue-600 font-semibold hover:text-blue-700">
                        (859) 555-0123
                      </a>
                    </div>
                    <div>
                      <p className="text-gray-600">Email us</p>
                      <a href="mailto:info@gaproperty.com" className="text-blue-600 font-semibold hover:text-blue-700">
                        info@gaproperty.com
                      </a>
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">Apply for {property.name}</h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select Employment Status</option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>

              <textarea
                name="message"
                placeholder="Additional Information (Optional)"
                value={formData.message}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}