export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-8">Last updated: January 1, 2025</p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            G&A Property Management (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects information you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Name, email address, phone number, and mailing address</li>
            <li>Rental application information including employment and financial details</li>
            <li>Payment information processed through our secure payment provider (Stripe)</li>
            <li>Maintenance request details and associated images</li>
            <li>Communications you send to us</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Process rental applications and manage lease agreements</li>
            <li>Process rent payments and maintain payment records</li>
            <li>Respond to and manage maintenance requests</li>
            <li>Communicate with you about your tenancy, property updates, and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Information Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Service providers who assist in property management operations</li>
            <li>Payment processors (Stripe) for rent payment processing</li>
            <li>Maintenance contractors as needed to fulfill repair requests</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information. Payment data is processed through Stripe and is never stored on our servers.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Your Rights</h2>
          <p className="text-gray-600 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information (subject to legal retention requirements)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
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
