'use client';

import Link from 'next/link';

function RibbonBackground() {
  const cryptoString = '41727169766f20697320707269766163792d66697273742e205a65726f2d6b6e6f776c656467652e20456e642d746f2d656e6420656e637279707465642e';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono text-[#f1998d] opacity-[0.06] rotate-[-8deg] animate-crypto-drift">
            {cryptoString.repeat(18)}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes crypto-drift { 0% { transform: translate(-50%, -50%) rotate(-8deg) translateX(0); } 100% { transform: translate(-50%, -50%) rotate(-8deg) translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .animate-crypto-drift { animation: none; } }
      `}</style>
    </div>
  );
}

function SectionHeader() {
  return (
    <section id="overview" className="relative isolate overflow-hidden bg-white">
      <RibbonBackground />
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 sm:pt-20 sm:pb-12 lg:px-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">How Arqivo works.</h1>
        <p className="mt-3 text-sm text-gray-600">Private by design. Everything important happens on your device.</p>
        <div className="mt-4">
          <Link href="#magic-loop" className="inline-flex items-center text-sm font-medium text-gray-900 hover:underline underline-offset-4">Skip to the magic →</Link>
        </div>
      </div>
    </section>
  );
}

function SystemAtAGlance() {
  return (
    <section className="bg-[#fafafb]">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16 lg:px-8">
        <div className="rounded-3xl border border-white/40 bg-white/50 p-8 shadow-xl backdrop-blur-xl">
          <h2 className="text-center text-xl font-semibold text-gray-900">System at a glance</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Search happens on your device. The cloud only stores ciphertext.</p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              { title: 'Your device', desc: 'Local compute. No raw data leaves.' },
              { title: 'On‑device intelligence', desc: 'OCR · NER · embeddings' },
              { title: 'Per‑document keys', desc: 'AES‑256‑GCM · Argon2id' },
              { title: 'Encrypted storage', desc: 'R2/S3 with versioning' },
            ].map((n, i) => (
              <div key={n.title} className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                <p className="mt-1 text-xs text-gray-600">{n.desc}</p>
                {i < 3 && (
                  <svg aria-hidden viewBox="0 0 120 8" className="absolute -right-14 top-1/2 hidden h-2 w-28 -translate-y-1/2 md:block">
                    <defs>
                      <linearGradient id="glanceLine" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.08" />
                        <stop offset="50%" stopColor="#f1998d" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.08" />
                      </linearGradient>
                    </defs>
                    <path d="M4 4 L116 4" stroke="url(#glanceLine)" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
                  </svg>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {['Upload','Index','Encrypt','Recall'].map((c) => (
              <Link key={c} href="#magic-loop" className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">{c}</Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <SectionHeader />
      <SystemAtAGlance />
    </main>
  );
}


