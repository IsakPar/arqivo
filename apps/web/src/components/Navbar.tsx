'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useMemo } from 'react';
import { PlanChip } from './PlanChip';

export function Navbar() {
  const clerkEnabled = useMemo(() => typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_clerk_placeholder', []);
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/20 backdrop-blur-xl supports-[backdrop-filter]:bg-white/15 shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/image.png" alt="Arqivo" width={28} height={28} className="h-6 w-auto" />
            <span className="text-sm font-semibold tracking-wide text-gray-900">Arqivo</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/how-it-works" className="text-gray-800 hover:text-gray-900">How it works</Link>
          <Link href="#pricing" className="text-gray-800 hover:text-gray-900">Pricing</Link>
          {clerkEnabled ? (
            <>
              <SignedOut>
                <Link href="/sign-in" className="px-3 py-1.5 text-gray-900 transition-colors hover:opacity-80">Sign in</Link>
              </SignedOut>
              <SignedIn>
                <Link href="/workspace" className="px-3 py-1.5 text-gray-900 transition-colors hover:opacity-80">Workspace</Link>
                <PlanChip />
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="px-3 py-1.5 text-gray-900 transition-colors hover:opacity-80">Sign in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
