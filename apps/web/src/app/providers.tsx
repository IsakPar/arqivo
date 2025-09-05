'use client';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) {
    // Fallback: run without Clerk when keys are not configured yet
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}


