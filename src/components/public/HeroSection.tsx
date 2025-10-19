import Link from 'next/link';
import { FaChevronDown } from 'react-icons/fa';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Welcome to G&A Property Management
        </h1>
        
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Professional property management serving the Richmond, Kentucky community with premium commercial and residential spaces.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/properties"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
          >
            View Available Properties
          </Link>
          <Link
            href="/tenant-login"
            className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Tenant Portal
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 md:gap-12 mb-12 pt-8 border-t border-blue-400">
          <div>
            <div className="text-3xl md:text-4xl font-bold">25+</div>
            <p className="text-blue-100 text-sm md:text-base">Quality Properties</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">500+</div>
            <p className="text-blue-100 text-sm md:text-base">Happy Tenants</p>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">15+</div>
            <p className="text-blue-100 text-sm md:text-base">Years Experience</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-bounce">
          <FaChevronDown className="w-6 h-6 mx-auto text-blue-100" />
        </div>
      </div>
    </section>
  );
}