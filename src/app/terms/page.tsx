export default function TermsPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using the G&A Property Management website and tenant portal, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Tenant Portal</h2>
          <p className="text-gray-600 mb-4">
            The tenant portal is provided for the convenience of current tenants of G&A Property Management. Access is granted via email-based authentication. You are responsible for maintaining the security of your email account used to access the portal.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Online Payments</h2>
          <p className="text-gray-600 mb-4">
            Rent payments made through our portal are processed by Stripe, a third-party payment processor. By making a payment, you agree to Stripe&apos;s terms of service. All payments are subject to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Verification and processing timelines as determined by your financial institution</li>
            <li>The payment terms outlined in your lease agreement</li>
            <li>Late fees as specified in your lease for payments received after the due date</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Auto-Pay</h2>
          <p className="text-gray-600 mb-4">
            By enrolling in auto-pay, you authorize G&A Property Management to charge your selected payment method for the monthly rent amount on the scheduled date. You may cancel auto-pay at any time through the tenant portal.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Maintenance Requests</h2>
          <p className="text-gray-600 mb-4">
            Maintenance requests submitted through the portal are for non-emergency repair needs. For emergencies (fire, flood, gas leak, or safety hazard), please call our emergency line immediately at (502) 783-7573.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Lease Application</h2>
          <p className="text-gray-600 mb-4">
            Submitting an application through our website does not guarantee approval. All applications are subject to review, credit check, and verification. Application decisions are made in accordance with applicable Fair Housing laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            All content on this website, including text, images, logos, and design, is the property of G&A Property Management and is protected by copyright law.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            G&A Property Management provides this website and portal on an &quot;as is&quot; basis. We are not liable for any damages arising from the use or inability to use our online services. In the event of a payment processing error, we will work with you to resolve the issue promptly.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">9. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date. Continued use of our services constitutes acceptance of modified terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">10. Contact</h2>
          <p className="text-gray-600 mb-4">
            For questions regarding these Terms of Service, contact us at:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-gray-800 font-semibold">G&A Property Management</p>
            <p className="text-gray-600">244 W. Irvine Street, Richmond, KY 40475</p>
            <p className="text-gray-600">Phone: (502) 783-7573</p>
          </div>
        </div>
      </section>
    </>
  )
}
