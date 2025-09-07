'use client';

import Link from 'next/link';

export function HeroRefinement() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* animated crisp background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(600px_200px_at_50%_0%,#eef2ff_25%,transparent_60%)]" />
        <div className="absolute left-1/2 top-10 h-40 w-[120%] -translate-x-1/2 bg-gradient-to-r from-transparent via-gray-200/60 to-transparent [mask-image:linear-gradient(90deg,transparent,black,transparent)] animate-beam" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left: refined copy & CTAs */}
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl leading-[1.05]">
              <span className="block">Privacy,</span>
              <span className="block">without compromise.</span>
            </h2>
            <p className="mt-5 text-lg leading-7 text-gray-600">
              Search everything instantly — with end‑to‑end encryption and zero‑knowledge by design.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/sign-up"
                className="group inline-flex items-center rounded-full bg-gradient-to-b from-gray-900 to-black px-6 py-3 text-sm font-medium text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_10px_22px_rgba(0,0,0,0.2)] hover:translate-y-[-1px]"
              >
                Get Started
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-2 h-4 w-4 opacity-80 transition group-hover:translate-x-0.5">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center text-sm font-medium text-gray-900 hover:opacity-80"
              >
                See how it works
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-1.5 h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: product glimpse (glass panel) */}
          <div className="relative">
            <div className="rounded-3xl border border-white/40 bg-white/50 p-6 shadow-xl backdrop-blur-xl">
              {/* mock UI */}
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                {/* search bar */}
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-gray-500">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-3.5-3.5" />
                  </svg>
                  <input defaultValue="Receipt · MacBook Air · 2015" readOnly className="w-full bg-transparent text-sm text-gray-900" />
                </div>
                {/* results */}
                <div className="mt-4 space-y-3">
                  {[{t:'Receipt — MacBook Air 13"',d:'2015-04-12'},{t:'Warranty — Sony Bravia',d:'2019-09-02'},{t:'Passport — Renewal Pack',d:'2027-01-15'}].map((r) => (
                    <div key={r.t} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{r.t}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">{r.d}</span>
                      </div>
                      <span title="End-to-end encrypted" className="rounded-full bg-gray-900/90 p-1.5 text-white shadow-sm">
                        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                          <rect x="4" y="10" width="16" height="10" rx="2" />
                          <path d="M8 10V8a4 4 0 1 1 8 0v2" />
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-beam { animation: beam 6s linear infinite; }
        @keyframes beam { from { transform: translateX(-10%); } to { transform: translateX(10%); } }
      `}</style>
    </section>
  );
}


