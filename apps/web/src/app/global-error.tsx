'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">App crashed</h1>
          <p className="mt-2 text-sm text-gray-600">We hit an unexpected error. Reload to continue.</p>
          {error?.digest && <p className="mt-2 text-xs text-gray-500">Ref: {error.digest}</p>}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">Reload</button>
            <Link href="/" className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50">Home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
