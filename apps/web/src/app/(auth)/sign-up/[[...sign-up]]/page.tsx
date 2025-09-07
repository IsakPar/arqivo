'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

export default function Page() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const enabled = !!pk && pk !== 'pk_test_clerk_placeholder';
  if (!enabled) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md rounded-2xl border border-white/30 bg-white/60 p-6 shadow-xl backdrop-blur-xl ring-1 ring-white/30 text-center">
          <h1 className="text-base font-semibold text-gray-900">Authentication not configured</h1>
          <p className="mt-2 text-sm text-gray-700">Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable sign up.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-gray-900 underline">Back to home</Link>
        </div>
      </div>
    );
  }
  const SignUp = dynamic(() => import('@clerk/nextjs').then(m => m.SignUp), { ssr: false });
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" afterSignUpUrl="/workspace" />
    </div>
  );
}


