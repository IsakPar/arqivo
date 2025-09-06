'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

type Plan = {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

function BasePricing({ startCheckout }: { startCheckout?: (plan: 'standard'|'pro') => void }) {
  const plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      subtitle: 'Up to 20 documents',
      features: [
        'End‑to‑end encrypted',
        'Zero‑knowledge by design',
        'Cloud access from any device',
      ],
      cta: { label: 'Get started', href: '/sign-up' },
    },
    {
      name: 'Standard',
      price: '$9.99',
      subtitle: 'Up to 10 GB encrypted storage',
      features: [
        'All Free features',
        'Unlimited documents',
        'Cloud sync everywhere',
      ],
      cta: { label: 'Choose Standard', href: '#' },
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$29.99',
      subtitle: '2 TB encrypted storage',
      features: [
        'All Standard features',
        'Secure sharing with other users',
        'Priority support',
      ],
      cta: { label: 'Choose Pro', href: '#' },
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      subtitle: 'Compliance, SSO, retention, SLAs',
      features: [
        'Dedicated support',
        'On‑prem / region controls',
        'Security reviews',
      ],
      cta: { label: 'Contact sales', href: 'mailto:hello@arqivo.app' },
    },
  ];

  return (
    <section id="pricing" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Simple, private pricing</h2>
          <p className="mt-4 text-base text-gray-600">End‑to‑end encrypted on every plan. Zero‑knowledge by design.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:gap-8 md:grid-cols-4">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-6 shadow-sm ${p.highlight ? 'border-gray-900' : 'border-gray-200'}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
                {p.highlight && <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-medium text-white">Popular</span>}
              </div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-semibold text-gray-900">{p.price}</span>
                {p.price !== 'Custom' && <span className="text-sm text-gray-600">/mo</span>}
              </div>
              <p className="mt-1 text-sm text-gray-600">{p.subtitle}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> {f}</li>
                ))}
              </ul>
              {startCheckout && (p.name === 'Standard' || p.name === 'Pro') ? (
                <button onClick={() => startCheckout(p.name.toLowerCase() as 'standard'|'pro')} className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-medium shadow-sm transition-colors ${p.highlight ? 'bg-gray-900 text-white hover:bg-black' : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'}`}>
                  {p.cta.label}
                </button>
              ) : (
                <Link href={p.cta.href} className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-medium shadow-sm transition-colors ${p.highlight ? 'bg-gray-900 text-white hover:bg-black' : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'}`}>
                  {p.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingWithClerk() {
  const { getToken } = useAuth();
  const startCheckout = useCallback(async (plan: 'standard'|'pro') => {
    try {
      const token = await getToken?.();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/billing/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ plan }),
      });
      let url: string | undefined;
      try {
        const data = await res.json();
        url = data?.url;
      } catch {}
      if (url) window.location.href = url;
    } catch {}
  }, [getToken]);
  return <BasePricing startCheckout={startCheckout} />;
}

function PricingAnon() {
  const startCheckout = useCallback(async (plan: 'standard'|'pro') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/billing/checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      let url: string | undefined;
      try {
        const data = await res.json();
        url = data?.url;
      } catch {}
      if (url) window.location.href = url;
    } catch {}
  }, []);
  return <BasePricing startCheckout={startCheckout} />;
}

export function Pricing() {
  const enabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_clerk_placeholder';
  return enabled ? <PricingWithClerk /> : <PricingAnon />;
}


