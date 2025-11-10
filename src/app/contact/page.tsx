'use client';

import { FaPhone, FaEnvelope, FaMapPin, FaClock } from 'react-icons/fa';

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Have questions about our properties or services? Get in touch with our team. We're here to help.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              {/* Main Office */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">G&A Property Management</h3>

                {/* Phone */}
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <FaPhone className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Phone</h4>
                      <a
                        href="tel:502-783-7573"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
                      >
                        (502) 783-7573
                      </a>
                      <p className="text-gray-600 text-sm mt-1">Mon-Fri: 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <FaEnvelope className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Email</h4>
                      <a
                        href="mailto:dejon@digitalgaines.com"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        dejon@digitalgaines.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <FaMapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Office Location</h4>
                      <p className="text-gray-600">
                        244 W. Irvine Street
                        <br />
                        Richmond, KY 40475
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="mb-8">
                  <div className="flex items-start gap-4">
                    <FaClock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Office Hours</h4>
                      <p className="text-gray-600 text-sm">
                        Monday - Friday: 9:00 AM - 5:00 PM
                        <br />
                        Saturday & Sunday: By Appointment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Owner</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">DeJon Gaines</p>
                    <p className="text-gray-600 text-sm">Owner & Operator</p>
                  </div>
                  <div>
                    <a
                      href="tel:502-783-7573"
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      (502) 783-7573
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Methods */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                
                <p className="text-gray-700 text-lg mb-8">
                  We'd love to hear from you! Reach out to us directly via phone or email, and we'll be happy to assist you with any questions about our properties or services.
                </p>

                <div className="space-y-6">
                  {/* Call */}
                  <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                    <FaPhone className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Give us a Call</h3>
                      <a
                        href="tel:502-783-7573"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
                      >
                        (502) 783-7573
                      </a>
                      <p className="text-gray-600 text-sm mt-2">Mon-Fri: 9:00 AM - 5:00 PM</p>
                      <p className="text-gray-600 text-sm">Emergency support available 24/7</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                    <FaEnvelope className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Send us an Email</h3>
                      <a
                        href="mailto:dejon@digitalgaines.com"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
                      >
                        dejon@digitalgaines.com
                      </a>
                      <p className="text-gray-600 text-sm mt-2">We typically respond within 24 business hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">How do I apply for a property?</h3>
              <p className="text-gray-600">
                Visit any property detail page and click "Apply Now" to fill out an application. We'll review your information and contact you within 24 hours.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">What are your office hours?</h3>
              <p className="text-gray-600">
                We're open Monday through Friday, 9:00 AM to 5:00 PM. Weekend appointments are available by request.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">How do I pay rent?</h3>
              <p className="text-gray-600">
                Tenants can pay rent through our tenant portal using ACH, credit card, or set up automatic payments. Contact us for details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">How do I request maintenance?</h3>
              <p className="text-gray-600">
                Tenants can submit maintenance requests through the tenant portal or call us at (502) 783-7573. Emergency issues are available 24/7.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Is there emergency support available?</h3>
              <p className="text-gray-600">
                Yes! Call (502) 783-7573 for urgent maintenance issues outside office hours. We have emergency support available.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Do you offer lease renewal?</h3>
              <p className="text-gray-600">
                Yes, we work with tenants on lease renewals. Contact us 60 days before your lease expires to discuss renewal options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}