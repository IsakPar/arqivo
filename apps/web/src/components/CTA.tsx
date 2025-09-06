'use client';

import Link from 'next/link';

export function CTA() {
  const cryptoString = '41727169766f20697320707269766163792d66697273742e205a65726f2d6b6e6f776c656467652e20456e642d746f2d656e6420656e637279707465642e';
  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Crypto ribbon background (soft coral) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono text-[#f1998d] opacity-[0.10] rotate-[-8deg] animate-cta-drift">
              {cryptoString.repeat(16)}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono text-[#f1998d] opacity-[0.05] rotate-[9deg] animate-cta-drift">
              {cryptoString.repeat(16)}
            </div>
          </div>
        </div>
        {/* Soft fade removed to increase ribbon visibility */}
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/30 p-10 text-center shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl sm:p-14">
          {/* Ambient coral halo behind text, behind content */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(241,153,141,0.18)_0%,_transparent_70%)]" />
            </div>
          </div>

          {/* Blueprint micro-frame (top/bottom dashed) */}
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-8 border-t border-dashed border-gray-200/60" />
          <div aria-hidden className="pointer-events-none absolute inset-x-8 bottom-8 border-t border-dashed border-gray-200/60" />

          <div className="mx-auto max-w-3xl">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Ready to secure your documents?</h3>
            <p className="mt-3 text-sm text-gray-600">End‑to‑end encrypted. Zero‑knowledge by design.</p>
            <div className="mt-7 flex items-center justify-center gap-4">
              <Link href="/sign-up" className="group inline-flex items-center rounded-full bg-[#f1998d] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#ee8a7c]">Get started
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-2 h-4 w-4 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </Link>
              <Link href="mailto:hello@arqivo.app" className="group inline-flex items-center text-sm font-medium text-gray-900 hover:underline underline-offset-4">Contact sales
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cta-drift { 0% { transform: translate(-50%, -50%) rotate(-8deg) translateX(0); } 100% { transform: translate(-50%, -50%) rotate(-8deg) translateX(-50%); } }
        @keyframes cta-drift-fast { 0% { transform: translate(-50%, -50%) rotate(-8deg) translateX(0); } 100% { transform: translate(-50%, -50%) rotate(-8deg) translateX(-60%); } }
        @media (prefers-reduced-motion: reduce) { .animate-cta-drift { animation: none; } }
      `}</style>
    </section>
  );
}


