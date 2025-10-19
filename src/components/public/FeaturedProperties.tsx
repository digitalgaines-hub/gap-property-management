import Link from 'next/link';
import PropertyCard from './PropertyCard';
import { FaArrowRight } from 'react-icons/fa';

export default function FeaturedProperties() {
  // Sample property data - replace with API call later
  const featuredProperties = [
    {
      id: '1',
      name: '244 W. Irvine Street',
      address: '244 W. Irvine St, Richmond, KY 40475',
      type: 'Commercial' as const,
      price: 2500,
      sqft: 3500,
      featured: true,
    },
    {
      id: '2',
      name: '375 Michelle Drive',
      address: '375 Michelle Dr, Richmond, KY 40475',
      type: 'Residential' as const,
      price: 1200,
      beds: 2,
      sqft: 1800,
      featured: true,
    },
    {
      id: '3',
      name: 'Downtown Office Complex',
      address: '500 Main St, Richmond, KY 40475',
      type: 'Commercial' as const,
      price: 3200,
      sqft: 5000,
      featured: false,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Featured Properties
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our premium selection of commercial and residential properties, carefully curated to meet diverse needs in the Richmond community.
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
          >
            View All Properties
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}