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
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16 lg:px-8">
        <div className="rounded-3xl border border-white/40 bg-white/50 p-8 shadow-xl backdrop-blur-xl">
          <h2 className="text-center text-xl font-semibold text-gray-900">System at a glance</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Search happens on your device. The cloud only stores ciphertext.</p>

          {/* Unified blueprint diagram */}
          <div className="mt-8">
            <svg
              role="img"
              aria-labelledby="glance-title glance-desc"
              viewBox="0 0 1000 240"
              className="h-auto w-full"
            >
              <title id="glance-title">System at a glance</title>
              <desc id="glance-desc">Data flows from your device through on-device intelligence and encryption to encrypted storage, with recall from a local index.</desc>

              {/* Blueprint line */}
              <path
                d="M80 120 C 270 120, 430 120, 520 120 S 770 120, 920 120"
                fill="none"
                stroke="#0f172a"
                strokeOpacity="0.18"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* Coral pathline animation */}
              <path
                className="animate-dash-flow"
                d="M80 120 C 270 120, 430 120, 520 120 S 770 120, 920 120"
                fill="none"
                stroke="#f1998d"
                strokeWidth="2"
                strokeDasharray="10 10"
                strokeLinecap="round"
              />

              {/* Nodes */}
              {[
                { x: 80, y: 120, title: 'Your device', sub: 'Local compute' },
                { x: 360, y: 120, title: 'On‑device intelligence', sub: 'OCR · NER · embeddings' },
                { x: 640, y: 120, title: 'Per‑document keys', sub: 'AES‑256‑GCM · Argon2id' },
                { x: 920, y: 120, title: 'Encrypted storage', sub: 'R2/S3 versioning' },
              ].map((n, i) => (
                <g key={n.title} tabIndex={0} role="link" aria-label={`${n.title}. ${n.sub}. Press Enter to continue.`}
                   onKeyDown={(e) => { if (e.key === 'Enter') (window.location.hash = '#magic-loop'); }}>
                  <circle cx={n.x} cy={n.y} r="20" fill="#ffffff" stroke="#e5e7eb" />
                  <circle cx={n.x} cy={n.y} r="4" fill="#0f172a" opacity="0.6" />
                  <text x={n.x} y={n.y + 40} textAnchor="middle" fontSize="12" fill="#0f172a" fontWeight={600}>{n.title}</text>
                  <text x={n.x} y={n.y + 58} textAnchor="middle" fontSize="10" fill="#64748b">{n.sub}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {['Upload','Index','Encrypt','Recall'].map((c) => (
              <Link key={c} href="#magic-loop" className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">{c}</Link>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes dash-flow { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
        .animate-dash-flow { animation: dash-flow 8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-dash-flow { animation: none; } }
      `}</style>
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


