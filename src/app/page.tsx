import HeroSection from '@/components/public/HeroSection';
import Link from 'next/link';
import { FaCheckCircle, FaUsers, FaShieldAlt, FaClock, FaMapPin, FaPhone } from 'react-icons/fa';

export default function Home() {
  const features = [
    {
      icon: FaShieldAlt,
      title: 'Secure & Professional',
      description: 'Bank-level security for all your property documents and personal information.',
    },
    {
      icon: FaClock,
      title: '24/7 Support',
      description: 'Emergency maintenance available around the clock for tenant peace of mind.',
    },
    {
      icon: FaUsers,
      title: 'Experienced Team',
      description: '15+ years managing properties with dedicated support for every need.',
    },
    {
      icon: FaCheckCircle,
      title: 'Hassle-Free Payments',
      description: 'Multiple payment options including ACH, credit card, and auto-pay setup.',
    },
  ];

  const amenities = [
    'Receptionist Services – Lobby staff available to greet clients',
    'Conference Room – Shared meeting space for client sessions',
    'Break Room – Kitchenette with seating',
    'Secure Access – Controlled entry',
    'ADA-Compliant Restrooms',
    'Walkable to Courthouse & City Hall',
    'Close to restaurants and banks',
    'Ample street parking and nearby public lots',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Premium Professional Office Space in Richmond
          </h1>
          
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Newly renovated commercial office suites located behind City Hall, perfect for counselors, attorneys, accountants, and professional service providers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties/1"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
            >
              View Office Details & Apply
            </Link>
            <a
              href="tel:859-333-9244"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Schedule a Tour
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mt-16 pt-8 border-t border-blue-400">
            <div>
              <div className="text-3xl md:text-4xl font-bold">6,000</div>
              <p className="text-blue-100 text-sm md:text-base">Square Feet</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">Office Suite</div>
              <p className="text-blue-100 text-sm md:text-base">Monthly Rent</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">Prime</div>
              <p className="text-blue-100 text-sm md:text-base">Location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Property Spotlight */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            <div>
              <div className="relative w-full h-96 bg-gray-300 rounded-lg overflow-hidden">
                <img
                  src="/images/properties/irvine-street/irvine-office-1.jpg"
                  alt="244 W. Irvine Street Office"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-600 text-sm mt-4">Professional office space with modern amenities</p>
            </div>

            {/* Content Side */}
            <div>
              <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                AVAILABLE NOW
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                244 W. Irvine Street
              </h2>

              <div className="flex items-center text-gray-600 mb-6">
                <FaMapPin className="w-5 h-5 mr-2 text-blue-600" />
                Richmond, KY 40475 (Behind City Hall)
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">200 - 1,000</p>
                  <p className="text-gray-600 text-sm">Sq Ft</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">$600 - $3,500</p>
                  <p className="text-gray-600 text-sm">Monthly</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">2025</p>
                  <p className="text-gray-600 text-sm">Renovated</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                Welcome to your next professional address. This newly renovated commercial building offers private office suites ideal for counselors & therapists, attorneys & legal professionals, accountants & financial advisors, and consultants. Premium location with excellent visibility and proximity to legal and civic services.
              </p>

              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-4">Perfect For:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    Counselors & Therapists
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    Attorneys & Legal Professionals
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    Accountants & Financial Advisors
                  </li>
                  <li className="flex items-center text-gray-700">
                    <FaCheckCircle className="w-4 h-4 text-green-600 mr-3" />
                    Consultants & Remote Professionals
                  </li>
                </ul>
              </div>

              <Link
                href="/properties/1"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View Full Details & Apply
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Highlight */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
            Included Amenities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-start bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <FaCheckCircle className="w-5 h-5 text-blue-600 mr-4 flex-shrink-0 mt-1" />
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
            Why Choose G&A Property Management?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition text-center border border-gray-200"
                >
                  <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Schedule a Tour?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today to schedule your private tour of 244 W. Irvine Street and learn more about this premium office space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties/1"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Apply Online
            </Link>
            <a
              href="tel:859-333-9244"
              className="flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              <FaPhone /> Call (859) 333-9244
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Get In Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-8 rounded-lg text-center border border-blue-200">
              <FaPhone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Call Us</h3>
              <a href="tel:502-783-7573" className="text-blue-600 font-semibold hover:text-blue-700">
                (502) 783-7573
              </a>
              <p className="text-gray-600 text-sm mt-2">Mon-Fri: 9 AM - 5 PM</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg text-center border border-blue-200">
              <FaPhone className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
              <a href="mailto:dejon@digitalgaines.com" className="text-blue-600 font-semibold hover:text-blue-700">
                dejon@digitalgaines.com
              </a>
              <p className="text-gray-600 text-sm mt-2">We respond within 24 hours</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg text-center border border-blue-200">
              <FaMapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Visit Us</h3>
              <p className="text-gray-700 font-semibold">244 W. Irvine Street</p>
              <p className="text-gray-600 text-sm">Richmond, KY 40475</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}