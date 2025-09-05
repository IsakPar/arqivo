import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Image src="/image.png" alt="Arqivo" width={120} height={40} className="h-8 w-auto" />
            <span className="text-sm text-gray-600">End-to-end encrypted. Zero-knowledge by design.</span>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <Link href="#how-it-works" className="hover:text-gray-900">How it works</Link>
            <Link href="#pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/sign-in" className="hover:text-gray-900">Sign in</Link>
            <Link href="/sign-up" className="hover:text-gray-900">Sign up</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
              <Link href="/legal/privacy" className="hover:text-gray-900">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-gray-900">Terms</Link>
              <Link href="/security" className="hover:text-gray-900">Security</Link>
              <Link href="/status" className="hover:text-gray-900">Status</Link>
              <Link href="/legal/dpa" className="hover:text-gray-900">Data Processing Addendum</Link>
              <Link href="/legal/responsible-disclosure" className="hover:text-gray-900">Responsible Disclosure</Link>
              <a href="mailto:security@arqivo.app" className="hover:text-gray-900">security@arqivo.app</a>
            </nav>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Arqivo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}


