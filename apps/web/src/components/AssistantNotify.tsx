'use client';

import { useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  actions?: { label: string; href?: string }[];
};

const MESSAGES: Message[] = [
  {
    id: 'warranty',
    title: 'Warranty expiring soon: MacBook Air receipt',
    subtitle: 'We found your Apple Store receipt from 2022. Your 3‑year warranty ends on 2025‑10‑06.',
    meta: 'in 30 days',
    actions: [
      { label: 'Set reminder' },
      { label: 'View document' },
    ],
  },
  {
    id: 'passport',
    title: 'Passport expiring: renewal window opens',
    subtitle: 'Your passport is due in 6 months. We prepared the renewal checklist and forms.',
    meta: 'in 6 months',
  },
  {
    id: 'invoice',
    title: 'Invoice available: Subscription billing',
    subtitle: 'Your monthly invoice is ready. We’ve filed the PDF to your Receipts.',
    meta: 'Now',
  },
];

export function AssistantNotify() {
  const [topIndex, setTopIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setTopIndex((i) => (i + 1) % MESSAGES.length), 7000);
    return () => clearTimeout(t);
  }, [topIndex, paused]);

  const order = [0, 1, 2].map((o) => (topIndex + o) % MESSAGES.length);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Arqivo Assistant</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Get notified before warranties expire</h2>
          <p className="mt-4 text-base text-gray-600">We detect warranty dates in receipts and nudge you in time — privately.</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div
              role="region"
              aria-label="Arqivo Assistant notifications"
              className="relative h-56 select-none"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onClick={() => setTopIndex((i) => (i + 1) % MESSAGES.length)}
              tabIndex={0}
            >
              {order.map((msgIndex, stackPos) => {
                const m = MESSAGES[msgIndex];
                const isTop = stackPos === 0;
                const isSecond = stackPos === 1;
                const scale = isTop ? 'scale-100' : isSecond ? 'scale-95' : 'scale-90';
                const translate = isTop ? 'translate-y-0' : isSecond ? 'translate-y-2' : 'translate-y-3';
                const opacity = isTop ? 'opacity-100' : isSecond ? 'opacity-85' : 'opacity-65';
                const z = isTop ? 'z-20' : isSecond ? 'z-10' : 'z-0';
                return (
                  <div
                    key={m.id}
                    aria-live={isTop ? 'polite' : undefined}
                    className={`assistant-enter absolute right-0 top-0 w-full max-w-xl origin-top-right rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-400 ease-out ${scale} ${translate} ${opacity} ${z}`}
                  >
                    {/* header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-medium text-white">A</span>
                        <div className="leading-tight">
                          <p className="text-sm font-medium text-gray-900">Arqivo Assistant</p>
                          <p className="text-[11px] text-gray-500">notifications@arqivo.app</p>
                        </div>
                      </div>
                      {isTop && (
                        <span className="rounded-full bg-[#f1998d]/15 px-2 py-0.5 text-[11px] font-medium text-[#f1998d] ring-1 ring-[#f1998d]/30">New</span>
                      )}
                    </div>
                    {/* content */}
                    <div className="mt-3 flex items-start gap-3">
                      <div className="mt-0.5 text-gray-400">
                        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                          <path d="M4 7l8 5 8-5" />
                          <rect x="4" y="7" width="16" height="10" rx="2" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900">{m.title}</p>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">{m.meta}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{m.subtitle}</p>
                        {m.actions && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {m.actions.map((a) => (
                              <button key={a.label} className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-black">
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">{m.id === 'invoice' ? 'Now' : m.meta}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .assistant-enter { animation: assistantIn 600ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes assistantIn {
          from { opacity: 0; transform: translate(10px,-10px) scale(0.98); }
          to { opacity: 1; transform: translate(0,0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .assistant-enter { animation: none; }
        }
      `}</style>
    </section>
  );
}
export function AssistantNotify() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Arqivo Assistant</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Get notified before warranties expire
          </h2>
          <p className="mt-4 text-base text-gray-600">We detect warranty dates in receipts and nudge you in time — privately.</p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-0 shadow-sm">
              {/* Mock inbox header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-medium text-white">A</span>
                  <div className="leading-tight">
                    <p className="text-sm font-medium text-gray-900">Arqivo Assistant</p>
                    <p className="text-[11px] text-gray-500">notifications@arqivo.app</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">New</span>
              </div>

              {/* Mock message row */}
              <div className="flex items-start gap-3 px-4 py-4">
                <div className="mt-0.5 text-gray-400">
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <path d="M4 7l8 5 8-5" />
                    <rect x="4" y="7" width="16" height="10" rx="2" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">Warranty expiring soon: MacBook Air receipt</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 ring-1 ring-gray-200">in 30 days</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">We found your Apple Store receipt from 2022. Your 3‑year warranty ends on 2025‑10‑06. Would you like to set a reminder or view the document?</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-black">Set reminder</button>
                    <button className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-50">View document</button>
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


