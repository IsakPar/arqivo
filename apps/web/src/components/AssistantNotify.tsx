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
  { id: 'warranty', title: 'Warranty expiring soon: MacBook Air receipt', subtitle: 'We found your Apple Store receipt from 2022. Your 3‑year warranty ends on 2025‑10‑06.', meta: 'in 30 days', actions: [ { label: 'Set reminder' }, { label: 'View document' } ] },
  { id: 'passport', title: 'Passport expiring: renewal window opens', subtitle: 'Your passport is due in 6 months. We prepared the renewal checklist and forms.', meta: 'in 6 months' },
  { id: 'invoice', title: 'Invoice available: Subscription billing', subtitle: 'Your monthly invoice is ready. We’ve filed the PDF to your Receipts.', meta: 'Now' },
];

export function AssistantNotify() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (paused || viewerOpen) return; const t = setTimeout(() => setSelectedIndex((i) => (i + 1) % MESSAGES.length), 7000); return () => clearTimeout(t); }, [selectedIndex, paused, viewerOpen]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Arqivo Assistant</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Get notified before warranties expire</h2>
          <p className="mt-4 text-base text-gray-600">We detect warranty dates in receipts and nudge you in time — privately.</p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="relative rounded-3xl border border-white/40 bg-white/40 p-8 shadow-xl backdrop-blur-xl min-h-[360px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Inbox list */}
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-2 shadow-sm">
                <ul role="listbox" aria-label="Assistant inbox" className="divide-y divide-gray-100">
                  {MESSAGES.map((m, i) => {
                    const active = i === selectedIndex;
                    return (
                      <li key={m.id}>
                        <button
                          role="option"
                          aria-selected={active}
                          onClick={() => { setSelectedIndex(i); setViewerOpen(false); }}
                          className={`flex w-full items-center justify-between gap-2 px-3 py-3 text-left transition-colors ${active ? 'bg-white' : 'hover:bg-white/70'}`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-gray-900">{m.title}</span>
                              {i === 0 && <span className="rounded-full bg-[#f1998d]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#f1998d] ring-1 ring-[#f1998d]/30">New</span>}
                            </div>
                            <p className="truncate text-[12px] text-gray-600">{m.subtitle}</p>
                          </div>
                          <span className="shrink-0 text-[11px] text-gray-500">{m.meta}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Expanded view */}
              <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                {(() => {
                  const m = MESSAGES[selectedIndex];
                  const isNew = selectedIndex === 0;
                  return (
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-medium text-white">A</span>
                          <div className="leading-tight">
                            <p className="text-sm font-medium text-gray-900">Arqivo Assistant</p>
                            <p className="text-[11px] text-gray-500">notifications@arqivo.app</p>
                          </div>
                        </div>
                        {isNew && <span className="rounded-full bg-[#f1998d]/15 px-2 py-0.5 text-[11px] font-medium text-[#f1998d] ring-1 ring-[#f1998d]/30">New</span>}
                      </div>
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
                          <p className="mt-1 text-sm text-gray-600">{m.subtitle}</p>
                          {m.actions && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {m.actions.map((a) => (
                                <button
                                  key={a.label}
                                  onClick={() => { if (a.label.toLowerCase().includes('view')) setViewerOpen(true); }}
                                  className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-black"
                                >
                                  {a.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500">{m.meta}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Contained mock document viewer */}
            {viewerOpen && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                <div role="dialog" aria-modal="true" aria-label="Document preview" className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <div className="truncate text-sm font-medium text-gray-900">MacBook Air Receipt — 2022.pdf</div>
                    <button onClick={() => setViewerOpen(false)} className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">Close</button>
                  </div>
                  <div className="p-4">
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                      {/* Mocked PDF preview: simple receipt layout */}
                      <div className="h-full w-full bg-white">
                        <div className="border-b border-gray-200 p-4 text-center">
                          <div className="text-sm font-semibold text-gray-900">APPLE STORE</div>
                          <div className="text-[11px] text-gray-600">Receipt — 2022-04-12</div>
                        </div>
                        <div className="p-4 text-[12px] text-gray-800">
                          <div className="flex items-center justify-between">
                            <span>MacBook Air 13&quot;</span>
                            <span>$999.00</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-gray-600">
                            <span>Warranty (3 years)</span>
                            <span>Included</span>
                          </div>
                          <div className="mt-3 h-px w-full bg-gray-200" />
                          <div className="mt-2 flex items-center justify-between font-medium">
                            <span>Total</span>
                            <span>$999.00</span>
                          </div>
                          <div className="mt-4 rounded-md bg-gray-50 p-3 text-[11px] text-gray-600">
                            Warranty ends on <span className="font-medium text-gray-900">2025-10-06</span>
                          </div>
                        </div>
                        <div className="mt-auto border-t border-gray-200 p-3 text-center text-[10px] text-gray-500">
                          Thank you for your purchase
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button onClick={() => setViewerOpen(false)} className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm hover:bg-gray-50">Close</button>
                      <button className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-black">Download</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


