'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReturnPage() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push('/'), 800);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Thanks! Finalizing billing…</h1>
      <p className="mt-3 text-sm text-gray-600">You'll be redirected shortly.</p>
    </main>
  );
}


