'use client';

import Link from 'next/link';

export function CTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-3xl border border-white/40 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl sm:p-12">
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Ready to secure your documents?</h3>
          <p className="mt-3 text-sm text-gray-600">End‑to‑end encrypted. Zero‑knowledge by design.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/sign-up" className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black">Get started</Link>
            <Link href="mailto:hello@arqivo.app" className="inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50">Contact sales</Link>
          </div>
        </div>
      </div>
    </section>
  );
}


