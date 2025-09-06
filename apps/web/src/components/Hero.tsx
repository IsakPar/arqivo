'use client';

import Link from 'next/link';
import Image from 'next/image';

function IconLock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
    </svg>
  );
}

function IconKey(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="M12 15h8l-2 2m0-4l2 2" />
    </svg>
  );
}

function IconFingerprint(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 11a3 3 0 0 0-3 3c0 2.5 1 4 2 6" />
      <path d="M12 7a7 7 0 0 0-7 7c0 3 1 5 2 7" />
      <path d="M12 7a7 7 0 0 1 7 7c0 3-1 5-2 7" />
      <path d="M12 11a3 3 0 0 1 3 3c0 2.5-1 4-2 6" />
    </svg>
  );
}

function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
      <path d="M9.5 12.5l2 2 3-4" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* subtle animated background */
      }
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(700px_240px_at_50%_0%,#eef2ff_25%,transparent_60%)]" />
        {/* crypto ribbon in soft coral */}
        <div className="absolute left-1/2 top-14 w-[140%] -translate-x-1/2 rotate-[-10deg] [mask-image:linear-gradient(90deg,transparent,black,transparent)]">
          <p className="crypto-ribbon pointer-events-none select-none whitespace-nowrap font-mono text-[14px] tracking-[0.18em] text-[#f1998d]" style={{ opacity: 0.44 }}>
            6f1a9c7b2e3d58a1c4f0b7e2a9d3c6f1 8b2e4a7d9c1f3e6a5b8d2c4f1a7e9d3c 2f9a7e1c3b5d8f0a6c4e2b9d1f3a7c5e
            9d3c7a1e5f0b2d4c6e8a1f3b5d7c9e2a 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d 7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-24 sm:pt-24 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Top-centered brand image */}
          <div className="flex justify-center">
            <Image
              src="/image.png"
              alt="Arqivo"
              width={480}
              height={480}
              priority
              className="h-40 w-auto md:h-48"
            />
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl leading-[1.05]">
            <span className="block">Privacy,</span>
            <span className="block">without&nbsp;compromise.</span>
          </h1>
          <p className="mt-6 text-lg leading-7 text-gray-600">
            Search everything instantly, without ever giving up control.
          </p>
          <p className="mt-1 text-base leading-7 text-gray-500">
            End-to-end encrypted. Zero-knowledge by design.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up" className="group inline-flex items-center rounded-full bg-gradient-to-b from-gray-900 to-black px-6 py-3 text-sm font-medium text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_10px_22px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400">
              Get Started
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-2 h-4 w-4 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link href="#how-it-works" className="group inline-flex items-center text-sm font-medium text-gray-900 hover:underline underline-offset-4">
              See how it works
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* remove floating icons to keep minimal */}

      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .crypto-ribbon { animation: cryptoDrift 16s linear infinite; }
        }
        @keyframes cryptoDrift { from { transform: translateX(-10%); } to { transform: translateX(10%); } }
      `}</style>
    </section>
  );
}
