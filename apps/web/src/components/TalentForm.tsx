'use client';

import { useMemo, useState } from 'react';

type Role = 'Advisor' | 'Builder' | 'Other';

export function TalentForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Advisor');
  const [message, setMessage] = useState('');
  const [links, setLinks] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(() => {
    return name.trim().length > 1 && /.+@.+\..+/.test(email) && message.trim().length > 5;
  }, [name, email, message]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`${role} intro — ${name}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Role: ${role}`,
        links ? `Links: ${links}` : undefined,
        '',
        'Message:',
        message,
      ]
        .filter(Boolean)
        .join('\n')
    );
    const mailto = `mailto:hello@arqivo.app?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <section id="advisors" className="relative isolate overflow-hidden bg-white">
      {/* Cryptographic ribbon background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono text-[#f1998d] opacity-[0.06] rotate-[-8deg] animate-cta-drift">
              {`41727169766f20697320707269766163792d66697273742e205a65726f2d6b6e6f776c656467652e20456e642d746f2d656e6420656e637279707465642e`.repeat(18)}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/30 p-8 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl sm:p-12">
          {/* Blueprint watermark grid */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
                backgroundPosition: '0 0',
              }}
            />
          </div>

          {/* Micro-frame */}
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-8 border-t border-dashed border-gray-200/60" />
          <div aria-hidden className="pointer-events-none absolute inset-x-8 bottom-8 border-t border-dashed border-gray-200/60" />

          <div className="mx-auto max-w-3xl text-center">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Shape the Future of Privacy</h3>
            <p className="mt-2 text-sm text-gray-600">We&apos;re assembling a core group of advisors and collaborators who are leaders in cryptography, distributed systems, and product design. If you are driven to build foundational technology for a more private internet, we want to hear from you.</p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-3xl space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-[#f1998d] focus:ring-2 focus:ring-[#f1998d]/30"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-[#f1998d] focus:ring-2 focus:ring-[#f1998d]/30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">How can you help?</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full appearance-none cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 shadow-inner outline-none transition focus:border-[#f1998d] focus:ring-2 focus:ring-[#f1998d]/30"
                  >
                    <option>Advisor</option>
                    <option>Builder</option>
                    <option>Other</option>
                  </select>
                  <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"><path d="M6 9l6 6 6-6" fill="currentColor" /></svg>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Your Work (GitHub, LinkedIn, etc.)</label>
                <input
                  type="text"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="github.com/.., linkedin.com/in/.."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-[#f1998d] focus:ring-2 focus:ring-[#f1998d]/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="A quick note about your background and how you can help."
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-inner outline-none transition focus:border-[#f1998d] focus:ring-2 focus:ring-[#f1998d]/30"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500">We&apos;ll spin up an email draft. If it doesn&apos;t open, reach us at <span className="font-medium text-gray-700">hello@arqivo.app</span>.</p>
              <button
                type="submit"
                disabled={!isValid}
                className="inline-flex items-center rounded-full bg-[#f1998d] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#ee8a7c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit Introduction
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="ml-2 h-4 w-4 opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
              </button>
            </div>

            {submitted && (
              <p className="text-right text-xs text-emerald-600">Draft prepared — thank you. We&apos;ll be in touch.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}


