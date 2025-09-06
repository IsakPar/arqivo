'use client';

import Link from 'next/link';
import React from 'react';

type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function PrimaryButton({ href, onClick, children, className }: Props) {
  const classes = `group inline-flex items-center rounded-full bg-gradient-to-b from-gray-900 to-black px-6 py-3 text-sm font-medium text-white shadow-[0_6px_16px_rgba(0,0,0,0.15)] transition-all hover:shadow-[0_10px_22px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400 ${className || ''}`;
  const arrow = (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-2 h-4 w-4 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
        {arrow}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={classes}>
      {children}
      {arrow}
    </button>
  );
}


