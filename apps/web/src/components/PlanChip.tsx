'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

type Status = { plan: 'free' | 'standard' | 'pro' | 'enterprise'; status: string };

export function PlanChip() {
  const { getToken } = useAuth();
  const [data, setData] = useState<Status | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken?.();
        if (!token) return; // not signed in
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/billing/status`, {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setData(json);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [getToken]);

  if (!data) return null;
  const label = data.plan === 'free' ? 'Free' : data.plan === 'standard' ? 'Standard' : data.plan === 'pro' ? 'Pro' : 'Enterprise';
  return (
    <span className="hidden rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-900 shadow-sm sm:inline-flex">
      {label}
    </span>
  );
}


