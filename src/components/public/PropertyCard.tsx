import Link from 'next/link';
import { FaMapPin, FaBed, FaRuler, FaDollarSign } from 'react-icons/fa';

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  type: 'Commercial' | 'Residential';
  price: number;
  beds?: number;
  sqft: number;
  image?: string;
  featured?: boolean;
}

export default function PropertyCard({
  id,
  name,
  address,
  type,
  price,
  beds,
  sqft,
  image,
  featured = false,
}: PropertyCardProps) {
  return (
    <Link href={`/properties/${id}`}>
      <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer h-full ${
        featured ? 'border-2 border-blue-600' : ''
      }`}>
        {/* Image Placeholder */}
        <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden group">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaRuler className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
              type === 'Commercial' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {type}
            </span>
          </div>
          {featured && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              FEATURED
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{name}</h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <FaMapPin className="w-4 h-4 mr-1" />
            <span className="line-clamp-1">{address}</span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-200">
            {beds !== undefined && (
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-600 mb-1">
                  <FaBed className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-gray-800">{beds}</p>
                <p className="text-xs text-gray-500">Beds</p>
              </div>
            )}
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-600 mb-1">
                <FaRuler className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-gray-800">{sqft.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Sq Ft</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-gray-600 mb-1">
                <FaDollarSign className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-gray-800">${(price / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500">Monthly</p>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}