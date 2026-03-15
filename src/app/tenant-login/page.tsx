'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [error, setError] = useState(authError === 'auth' ? 'Authentication failed. Please try again.' : '');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  };

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {emailSent ? (
        /* Success State */
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-600 text-4xl mb-3">&#9993;</div>
            <p className="text-gray-800 font-semibold mb-2">Magic link sent!</p>
            <p className="text-gray-600 text-sm">
              We sent a sign-in link to <span className="font-semibold">{email}</span>.
              Click the link in your email to access your tenant portal.
            </p>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Try a different email
          </button>
        </div>
      ) : (
        /* Login Form */
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                autoFocus
              />
            </div>
          </div>

          {/* Info Text */}
          <p className="text-gray-500 text-sm">
            We&apos;ll send you a secure sign-in link. No password needed.
          </p>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending link...' : 'Send Sign-In Link'}
          </button>
        </form>
      )}
    </>
  );
}

export default function TenantLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-2xl">
                G&A
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Tenant Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <Suspense fallback={
            <div className="text-center py-4 text-gray-500">Loading...</div>
          }>
            <LoginForm />
          </Suspense>

          {/* Help Text */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">
                Contact Support
              </Link>
            </p>
            <p className="mt-2">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                Back to Home
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-blue-100 text-sm">
          <p>Secure login &bull; Data encrypted &bull; 24/7 Support</p>
        </div>
      </div>
    </div>
  );
}
