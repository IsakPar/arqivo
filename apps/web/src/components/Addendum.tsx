'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type DemoPhase = 'before' | 'process' | 'after';

function classNames(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Addendum() {
  const [phase, setPhase] = useState<DemoPhase>('before');
  const [isPaused, setIsPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(media.matches);
        const handler = () => setReduced(media.matches);
        media.addEventListener?.('change', handler);
        return () => media.removeEventListener?.('change', handler);
      } catch {}
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (reduced) {
      clearTimer();
      setPhase('after');
      return;
    }
    if (isPaused) {
      clearTimer();
      return;
    }
    clearTimer();
    const nextDelay = phase === 'before' ? 1200 : phase === 'process' ? 1600 : 2800; // include end pause
    timerRef.current = setTimeout(() => {
      setPhase((p) => (p === 'before' ? 'process' : p === 'process' ? 'after' : 'before'));
    }, nextDelay);
    return clearTimer;
  }, [phase, isPaused, reduced, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const ariaLiveText = useMemo(() => {
    if (phase === 'before') return 'Demo: cryptic file awaiting indexing';
    if (phase === 'process') return 'Demo: indexing in progress';
    return 'Demo: indexed. Extracted tags: Invoice, Adobe Inc., Subscription, Amount $29.99';
  }, [phase]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setIsPaused(false);
      setPhase('before');
    }
  }, []);

  return (
    <section aria-labelledby="addendum-title" className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h3 id="addendum-title" className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            From chaos to clarity.
          </h3>
          <p className="mt-2 text-sm text-gray-600">A simple, focused look at how Arqivo understands your files.</p>
        </div>

        <div
          role="region"
          aria-label="Indexing addendum demo"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          className="mx-auto mt-8 rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="sr-only" aria-live="polite">{ariaLiveText}</div>

          <div className="relative h-64">
            {/* Coral crypto pathline */}
            <svg aria-hidden viewBox="0 0 800 200" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="aglow" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#f1998d" stopOpacity="0.0" />
                  <stop offset="50%" stopColor="#f1998d" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f1998d" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M120 100 C 220 100, 360 100, 400 100 S 580 100, 680 100"
                fill="none"
                stroke="#f1998d"
                strokeWidth="1.25"
                strokeDasharray="6 6"
                className={classNames(
                  'transition-opacity duration-500',
                  phase === 'process' && !reduced ? 'opacity-100 animate-addendum-dash' : 'opacity-0'
                )}
              />
              {/* Subtle glow trail */}
              <path
                d="M120 100 C 220 100, 360 100, 400 100 S 580 100, 680 100"
                fill="none"
                stroke="url(#aglow)"
                strokeWidth="10"
                className={classNames(
                  'transition-opacity duration-500',
                  phase === 'process' && !reduced ? 'opacity-30' : 'opacity-0'
                )}
              />
            </svg>

            {/* Left: cryptic file */}
            <div
              className={classNames(
                'absolute left-6 top-1/2 -translate-y-1/2 w-64',
                'transition-all duration-700',
                phase === 'before' && !reduced && 'opacity-100 translate-x-0',
                phase === 'process' && !reduced && 'opacity-100 translate-x-4',
                phase === 'after' && !reduced && 'opacity-0 -translate-x-3',
                reduced && (phase === 'after' ? 'opacity-0' : 'opacity-100')
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
            >
              <FileCard title="Scan_Sept_06_2025.pdf" muted />
            </div>

            {/* Center: brand mark */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                className={classNames(
                  'flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm',
                  'transition-shadow duration-500'
                )}
                style={{
                  boxShadow:
                    phase === 'process' && !reduced
                      ? '0 0 40px rgba(241,153,141,0.35), 0 8px 20px rgba(15,23,42,0.08)'
                      : '0 8px 20px rgba(15,23,42,0.06)'
                }}
                aria-hidden
              >
                <Image src="/image.png" alt="Arqivo" width={28} height={28} className="h-6 w-auto" />
              </div>
            </div>

            {/* Right: understood file with tags */}
            <div
              className={classNames(
                'absolute right-6 top-1/2 -translate-y-1/2 w-72',
                'transition-all duration-700',
                phase === 'after' && !reduced && 'opacity-100 translate-x-0',
                phase !== 'after' && !reduced && 'opacity-0 translate-x-4',
                reduced && (phase === 'after' ? 'opacity-100' : 'opacity-0')
              )}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
            >
              <UnderstoodFile active={phase === 'after'} />
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Simply add your files. Arqivo’s on‑device intelligence indexes everything, so you never have to name a file again.
          </p>
        </div>

        <div className="mt-2 text-center text-[11px] text-gray-400">Press Space or Enter to replay • Hover to pause</div>
      </div>

      <style jsx global>{`
        @keyframes addendum-dash {
          from { stroke-dashoffset: 120; }
          to { stroke-dashoffset: 0; }
        }
        .animate-addendum-dash { animation: addendum-dash 2.4s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-addendum-dash { animation: none; }
        }
      `}</style>
    </section>
  );
}

function FileCard({ title, muted }: { title: string; muted?: boolean }) {
  return (
    <div className={classNames('rounded-2xl border p-4 shadow-sm bg-white', muted ? 'border-gray-200' : 'border-gray-100')}>
      <div className="flex items-center gap-2">
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-gray-400">
          <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="currentColor" />
          <path d="M14 2v4h4" fill="#fff" />
        </svg>
        <span className="truncate text-sm font-medium text-gray-800">{title}</span>
      </div>
      <div className="mt-3 h-24 rounded-xl border border-dashed border-gray-200 bg-gray-50" />
      <div className="mt-3 h-2 w-2/5 rounded-full bg-gray-100" />
    </div>
  );
}

function UnderstoodFile({ active = false }: { active?: boolean }) {
  const tags = [
    { label: 'Invoice', delayMs: 0 },
    { label: 'Adobe Inc.', delayMs: 90 },
    { label: 'Subscription', delayMs: 180 },
    { label: 'Amount: $29.99', delayMs: 270 }
  ];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-gray-400">
          <path d="M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="currentColor" />
          <path d="M14 2v4h4" fill="#fff" />
        </svg>
        <span className="truncate text-sm font-semibold text-gray-900">Invoice — Adobe Inc.</span>
      </div>
      <div className="mt-3 h-24 rounded-xl border border-dashed border-gray-200 bg-gray-50" />
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((t, i) => (
          <span
            key={t.label}
            className={classNames(
              'inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-800 shadow-sm transition-all duration-500',
              active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            )}
            style={{ transitionDelay: `${120 + t.delayMs}ms` }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}


