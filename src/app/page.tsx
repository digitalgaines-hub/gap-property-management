import HeroSection from '@/components/public/HeroSection';
import FeaturedProperties from '@/components/public/FeaturedProperties';
import Link from 'next/link';
import { FaCheck, FaUsers, FaShieldAlt, FaClock } from 'react-icons/fa';

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
      icon: FaCheck,
      title: 'Hassle-Free Payments',
      description: 'Multiple payment options including ACH, credit card, and auto-pay setup.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Properties */}
      <FeaturedProperties />

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose G&A Property Management?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional property management with a focus on tenant satisfaction and property excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center"
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

      {/* Tenant Portal CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Current Tenant?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Access your lease documents, pay rent online, submit maintenance requests, and manage your account through our secure tenant portal.
          </p>
          <Link
            href="/tenant-login"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition transform hover:scale-105"
          >
            Go to Tenant Portal
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Reach our leasing office</p>
              <a
                href="tel:(859)555-0123"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                (859) 555-0123
              </a>
            </div>

            {/* Email Info */}
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600 mb-4">Send us a message</p>
              <a
                href="mailto:info@gaproperty.com"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                info@gaproperty.com
              </a>
            </div>

            {/* Office Hours */}
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hours</h3>
              <p className="text-gray-600 mb-4">Monday - Friday</p>
              <p className="text-gray-800 font-semibold">9:00 AM - 5:00 PM</p>
            </div>
          </div>

          {/* Contact Form CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Send Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}