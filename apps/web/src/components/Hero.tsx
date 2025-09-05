'use client';

import Link from 'next/link';

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
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-24 sm:pt-32 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            Privacy, without compromise.
          </h1>
          <p className="mt-6 text-lg leading-7 text-gray-600">
            Search everything instantly, without ever giving up control.
          </p>
          <p className="mt-1 text-base leading-7 text-gray-500">
            End-to-end encrypted. Zero-knowledge by design.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-400">
              Get Started
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300">
              See How It Works
            </Link>
          </div>
        </div>
      </div>

      {/* Floating line icons */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <IconLock className="absolute left-[8%] top-[20%] h-10 w-10 text-gray-300 opacity-60 icon-float-slow" />
        <IconKey className="absolute right-[12%] top-[30%] h-10 w-10 text-gray-300 opacity-60 icon-float-slower" />
        <IconFingerprint className="absolute left-[18%] bottom-[18%] h-10 w-10 text-gray-300 opacity-60 icon-float-slower" />
        <IconShield className="absolute right-[16%] bottom-[22%] h-10 w-10 text-gray-300 opacity-60 icon-float-slow" />
      </div>

      <style jsx global>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes floatSlower {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .icon-float-slow { animation: floatSlow 10s ease-in-out infinite; }
        .icon-float-slower { animation: floatSlower 14s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
