import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-600">The page you are looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">Go home</Link>
    </main>
  );
}


