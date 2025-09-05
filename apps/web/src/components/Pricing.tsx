'use client';

import Link from 'next/link';

type Plan = {
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

export function Pricing() {
  const plans: Plan[] = [
    {
      name: 'Free',
      price: '$0',
      subtitle: 'Up to 20 documents',
      features: [
        'End‑to‑end encrypted',
        'Zero‑knowledge by design',
        '1 device',
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
        '3 devices',
      ],
      cta: { label: 'Choose Standard', href: '/sign-up' },
      highlight: true,
    },
    {
      name: 'Pro',
      price: '$29.99',
      subtitle: '2 TB encrypted storage',
      features: [
        'All Standard features',
        'Priority support',
        '10 devices',
      ],
      cta: { label: 'Choose Pro', href: '/sign-up' },
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
              <Link href={p.cta.href} className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-3 py-2 text-sm font-medium shadow-sm transition-colors ${p.highlight ? 'bg-gray-900 text-white hover:bg-black' : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'}`}>
                {p.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


