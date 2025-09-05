'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const SUGGESTIONS = [
  'Receipt · MacBook Air · 2015',
  'Passport · Renewal · 2027',
  'Warranty · Sony TV · 2019',
];

export function Usage() {
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const typing = useRef<NodeJS.Timeout | null>(null);
  const reduced = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  , []);

  useEffect(() => {
    if (reduced) { setQuery(SUGGESTIONS[0]); return; }
    const target = SUGGESTIONS[idx % SUGGESTIONS.length];
    let i = 0;
    typing.current && clearInterval(typing.current);
    typing.current = setInterval(() => {
      i += 1;
      setQuery(target.slice(0, i));
      if (i >= target.length) {
        typing.current && clearInterval(typing.current);
        setTimeout(() => setIdx((v) => (v + 1) % SUGGESTIONS.length), 1400);
      }
    }, 35);
    return () => { typing.current && clearInterval(typing.current); };
  }, [idx, reduced]);

  const chips = ['Receipt', 'Passport', 'Warranty', 'Taxes'];
  const results = [
    { title: 'Receipt — MacBook Air 13"', date: '2015-04-12', tags: ['receipt','apple','laptop'] },
    { title: 'Warranty — Sony Bravia', date: '2019-09-02', tags: ['warranty','tv'] },
    { title: 'Passport — Renewal Pack', date: '2027-01-15', tags: ['passport','id'] },
  ];

  return (
    <section id="usage" className="relative overflow-hidden bg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_50%_0%,#eef2ff_10%,transparent_55%)] opacity-70" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 sm:py-28 md:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Usage</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Find anything in seconds.</h2>
          <p className="mt-4 text-base text-gray-600">Type naturally. We understand context, entities, and time.</p>
          <ul className="mt-6 space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Receipts and warranties from years ago</li>
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Passports, IDs, certificates — instantly</li>
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Taxes and statements, right when you need them</li>
          </ul>
        </div>

        <div className="relative">
          {/* Glass panel */}
          <div className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            {/* Search bar */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-3 shadow-sm">
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-gray-500">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-3.5-3.5" />
              </svg>
              <input
                aria-label="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: Receipt · MacBook Air · 2015"
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c} onClick={() => setQuery(c)} className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs text-gray-800 shadow-sm hover:bg-white">
                  {c}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="mt-5 space-y-3">
              {results.map((r, i) => (
                <div key={r.title} className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{r.title}</span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">{r.date}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {r.tags.map((t) => (
                        <span key={t} className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-gray-200">{t}</span>
                      ))}
                    </div>
                  </div>
                  <span title="End-to-end encrypted" className="rounded-full bg-gray-900/90 p-1.5 text-white shadow-sm">
                    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <rect x="4" y="10" width="16" height="10" rx="2" />
                      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>

            {/* E2EE badge */}
            <div className="mt-4 flex items-center gap-2 text-[12px] text-gray-600">
              <span className="inline-flex items-center rounded-full bg-gray-900/90 p-1 text-white">
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V8a4 4 0 1 1 8 0v2" />
                </svg>
              </span>
              Encrypted on your device. Only you can search.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


