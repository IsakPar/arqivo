'use client';

export function Steps() {
  const items: { n: number; title: string; body: string }[] = [
    { n: 1, title: 'Drop your file', body: 'Drag & drop or choose a document. No content ever leaves your device unencrypted.' },
    { n: 2, title: 'Encrypt & tag (on‑device)', body: 'We seal each file with AES‑GCM and extract lightweight tags/entities locally.' },
    { n: 3, title: 'Verify & upload', body: 'We compute a content hash for integrity, then upload over TLS to your region.' },
    { n: 4, title: 'Recall instantly', body: 'Search by natural language — receipts, passports, warranties — all private by design.' },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">The Flow</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Four clear steps</h2>
          <p className="mt-4 text-base text-gray-600">Nothing complex. Private, predictable, fast.</p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:gap-8 md:grid-cols-4">
          {items.map((it) => (
            <li key={it.n} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">{it.n}</div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">{it.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}


