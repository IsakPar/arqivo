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
    <section id="advisors" className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="rounded-3xl border border-white/40 bg-white/40 p-8 shadow-xl backdrop-blur-xl sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Advisors & Builders</h3>
            <p className="mt-2 text-sm text-gray-600">We're meeting exceptional people across security, cryptography, storage infra, and product.</p>
          </div>
          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-300"
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">How can you help?</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-300"
                >
                  <option>Advisor</option>
                  <option>Builder</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Links (LinkedIn, GitHub, site)</label>
                <input
                  type="text"
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  placeholder="linkedin.com/in/.., github.com/.."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-300"
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
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-300"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500">We'll spin up an email draft. If it doesn't open, reach us at <span className="font-medium text-gray-700">hello@arqivo.app</span>.</p>
              <button
                type="submit"
                disabled={!isValid}
                className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send introduction
              </button>
            </div>

            {submitted && (
              <p className="text-right text-xs text-emerald-600">Draft prepared — thank you. We'll be in touch.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}


