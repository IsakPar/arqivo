'use client';

import { ClerkProvider } from '@clerk/nextjs';
import * as Sentry from '@sentry/nextjs';
import React from 'react';

let sentryInited = false;

export function Providers({ children }: { children: React.ReactNode }) {
  try {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn && !sentryInited) {
      Sentry.init({ dsn, tracesSampleRate: 0.05, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 1.0 });
      sentryInited = true;
    }
  } catch {}
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const enabled = !!pk && pk !== 'pk_test_clerk_placeholder';
  if (!enabled) {
    // Fallback: run without Clerk when keys are not configured yet
    return <>{children}</>;
  }
  return <ClerkProvider publishableKey={pk}>{children}</ClerkProvider>;
}


