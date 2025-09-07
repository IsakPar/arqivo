'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryTextLink } from './ui/SecondaryTextLink';
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
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [lineTop, setLineTop] = useState<number | null>(null);
  useEffect(() => {
    function compute() {
      const root = gridRef.current;
      if (!root) return;
      const header = root.querySelector('[data-card-header]') as HTMLElement | null;
      if (!header) return;
      const rootBox = root.getBoundingClientRect();
      const headerBox = header.getBoundingClientRect();
      // 8px spacing below header
      setLineTop(Math.max(0, Math.round(headerBox.bottom - rootBox.top + 8)));
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);
  const plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      subtitle: 'Up to 20 documents',
      features: [
        'End‑to‑end encrypted',
        'Zero‑knowledge by design',
        'Cloud access (multi‑device coming soon)',
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
        'Cloud sync everywhere (enforcement coming soon)',
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

        {/* Unified privacy line across plans */}
        <div className="relative mt-12 sm:mt-14">
          <svg
            aria-hidden
            viewBox="0 0 1200 40"
            className="absolute left-0 hidden h-8 w-full md:block"
            style={{ top: lineTop !== null ? `${lineTop}px` : '64px' }}
          >
            <defs>
              <linearGradient id="pricingLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.04" />
                <stop offset="50%" stopColor="#f1998d" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <path d="M60 20 C 300 20, 900 20, 1140 20" stroke="url(#pricingLine)" strokeWidth="1.5" fill="none" strokeDasharray="6 6" />
          </svg>

          <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-4">
            {plans.map((p) => {
              const isStandard = p.name === 'Standard';
              const isEnterprise = p.name === 'Enterprise';
              return (
                <div
                  key={p.name}
                  className={`relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-2xl ring-1 ${isStandard ? 'border-[#f1998d] ring-[#f1998d]/40 bg-white/55' : 'border-white/30 ring-white/30 bg-white/45'}`}
                >
                  {isEnterprise && (
                    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
                          backgroundSize: '24px 24px',
                          backgroundPosition: '0 0',
                        }}
                      />
                    </div>
                  )}
                  <div data-card-header className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{p.name}</h3>
                    {isStandard && (
                      <span className="rounded-full bg-[#f1998d]/15 px-2 py-0.5 text-[11px] font-medium text-[#d76e60] ring-1 ring-inset ring-[#f1998d]/30">Popular</span>
                    )}
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

                  <div className="mt-6">
                    {startCheckout && (p.name === 'Standard' || p.name === 'Pro') ? (
                      isStandard ? (
                        <PrimaryButton onClick={() => startCheckout('standard')} variant="coral" className="w-full justify-center">
                          Choose Standard
                        </PrimaryButton>
                      ) : (
                        <SecondaryTextLink href="#" className="w-full justify-center" onClick={() => startCheckout('pro')}>
                          Choose Pro
                        </SecondaryTextLink>
                      )
                    ) : (
                      p.name === 'Free' ? (
                        <SecondaryTextLink href={p.cta.href} className="w-full justify-center">
                          Get started
                        </SecondaryTextLink>
                      ) : p.name === 'Enterprise' ? (
                        <SecondaryTextLink href={p.cta.href} className="w-full justify-center">
                          Contact sales
                        </SecondaryTextLink>
                      ) : (
                        isStandard ? (
                          <PrimaryButton href="#" variant="coral" className="w-full justify-center">
                            Choose Standard
                          </PrimaryButton>
                        ) : (
                          <SecondaryTextLink href="#" className="w-full justify-center">
                            Choose Pro
                          </SecondaryTextLink>
                        )
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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


