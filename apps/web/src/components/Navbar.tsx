'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/image.png" alt="Arqivo" width={28} height={28} className="h-6 w-auto" />
            <span className="text-sm font-semibold tracking-wide text-gray-900">Arqivo</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="#how-it-works" className="text-gray-700 hover:text-gray-900">How it works</Link>
          <Link href="#pricing" className="text-gray-700 hover:text-gray-900">Pricing</Link>
          <Link href="/sign-in" className="rounded-full border border-gray-300 px-3 py-1.5 text-gray-900 hover:bg-gray-50">Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-gray-900 px-3 py-1.5 text-white hover:bg-black">Get started</Link>
        </nav>
      </div>
    </header>
  );
}
