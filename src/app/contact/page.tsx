'use client';

import { useState } from 'react';
import { FaPhone, FaMapPin, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useRecaptcha } from '@/lib/recaptcha';

export default function ContactPage() {
  const { executeRecaptcha } = useRecaptcha();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const recaptchaToken = await executeRecaptcha('contact');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Have questions about our properties or services? Get in touch with our team. We&apos;re here to help.
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

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>

                {status === 'success' ? (
                  <div className="text-center py-12">
                    <FaCheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">We&apos;ll get back to you as soon as possible.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                        placeholder="How can we help you?"
                      />
                    </div>

                    {status === 'error' && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      This site is protected by reCAPTCHA and the Google{' '}
                      <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{' '}
                      <a href="https://policies.google.com/terms" className="underline" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.
                    </p>
                  </form>
                )}
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
                Visit any property detail page and click &quot;Apply Now&quot; to fill out an application. we&apos;ll review your information and contact you within 24 hours.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3">What are your office hours?</h3>
              <p className="text-gray-600">
                We&apos;re open Monday through Friday, 9:00 AM to 5:00 PM. Weekend appointments are available by request.
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
