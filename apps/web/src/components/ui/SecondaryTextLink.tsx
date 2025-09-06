'use client';

import Link from 'next/link';
import React from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function SecondaryTextLink({ href, children, className }: Props) {
  return (
    <Link href={href} className={`group inline-flex items-center text-sm font-medium text-gray-900 hover:underline underline-offset-4 ${className || ''}`}>
      {children}
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}


