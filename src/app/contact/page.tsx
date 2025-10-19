'use client';

import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapPin, FaClock, FaLinkedin } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setTimeout(() => setSubmitted(false), 5000);
  };

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
                        href="tel:859-333-9244"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
                      >
                        (859) 333-9244
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
                        href="mailto:info@gaproperty.com"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        info@gaproperty.com
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
                      href="tel:859-333-9244"
                      className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                      (859) 333-9244
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-8 rounded-lg">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                    Thank you for your message! We'll get back to you as soon as possible.
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="(859) 555-0123"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Select a subject</option>
                      <option value="property-inquiry">Property Inquiry</option>
                      <option value="maintenance-issue">Maintenance Issue</option>
                      <option value="lease-question">Lease Question</option>
                      <option value="payment-issue">Payment Issue</option>
                      <option value="general">General Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Tell us how we can help..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Send Message
                  </button>
                </form>

                <p className="text-gray-600 text-sm mt-6 text-center">
                  We typically respond within 24 business hours.
                </p>
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
                Tenants can submit maintenance requests through the tenant portal or call us at (859) 333-9244. Emergency issues are available 24/7.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Is there emergency support available?</h3>
              <p className="text-gray-600">
                Yes! Call (859) 333-9244 for urgent maintenance issues outside office hours. We have emergency support available.
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