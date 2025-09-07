'use client';

import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const enabled = !!pk && pk !== 'pk_test_clerk_placeholder';
  if (!enabled) {
    // Fallback: run without Clerk when keys are not configured yet
    return <>{children}</>;
  }
  return <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>;
}


