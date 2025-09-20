'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

function RibbonBackground() {
  const cryptoString = '41727169766f20697320707269766163792d66697273742e205a65726f2d6b6e6f776c656467652e20456e642d746f2d656e6420656e637279707465642e';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono text-[#d9e2f1] opacity-[0.08] rotate-[-8deg] animate-crypto-drift">
            {cryptoString.repeat(18)}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes crypto-drift { 0% { transform: translate(-50%, -50%) rotate(-8deg) translateX(0); } 100% { transform: translate(-50%, -50%) rotate(-8deg) translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .animate-crypto-drift { animation: none; } }
      `}</style>
    </div>
  );
}

function SectionHeader() {
  return (
    <section id="overview" className="relative isolate overflow-hidden bg-white">
      <RibbonBackground />
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-10 sm:pt-20 sm:pb-12 lg:px-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">How Arqivo works.</h1>
        <p className="mt-3 text-sm text-gray-600">Private by design. Everything important happens on your device.</p>
        <div className="mt-4">
          <Link href="#magic-loop" className="inline-flex items-center text-sm font-medium text-gray-900 hover:underline underline-offset-4">Skip to the magic →</Link>
        </div>
      </div>
    </section>
  );
}

function SystemAtAGlance() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [locked, setLocked] = useState(false);
  const [autoInfo, setAutoInfo] = useState(true); // show popover automatically on load
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inViewRef = useRef(false);
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // viewport start/stop
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => { inViewRef.current = !!entries[0]?.isIntersecting; }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // auto-advance loop
  // Auto-advance while in view; pauses on hover/focus or when locked
  useEffect(() => {
    if (paused || locked || !inViewRef.current) return;
    const t = setTimeout(() => setIdx((v) => (v + 1) % 4), 3000);
    return () => clearTimeout(t);
  }, [idx, paused, locked]);

  const nodes = [
    { x: 80, y: 120, title: 'Your device', sub: 'Local compute' },
    { x: 360, y: 120, title: 'On‑device intelligence', sub: 'OCR · NER · embeddings' },
    { x: 640, y: 120, title: 'Per‑document keys', sub: 'AES‑256‑GCM · Argon2id' },
    { x: 920, y: 120, title: 'Encrypted storage', sub: 'R2/S3 versioning' },
  ] as const;

  const captions = [
    'Your device — Local compute',
    'On‑device intelligence — OCR · NER · embeddings',
    'Per‑document keys — AES‑GCM · Argon2id',
    'Encrypted storage — R2/S3 with versioning',
  ];

  function onKeyNavigate(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') { e.preventDefault(); setIdx((v) => (v + 1) % 4); setLocked(false); setAutoInfo(true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx((v) => (v + 3) % 4); setLocked(false); setAutoInfo(true); }
    if (e.key === 'Escape') { setLocked(false); setAutoInfo(false); }
  }

  return (
    <section className="bg-[#fafafb]">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16 lg:px-8">
        <div ref={containerRef} className="rounded-3xl border border-white/50 bg-white/30 p-10 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl"
             onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onKeyDown={onKeyNavigate}>
          <h2 className="text-center text-xl font-semibold text-gray-900">System at a glance</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Search happens on your device. The cloud only stores ciphertext.</p>

          {/* Unified blueprint diagram */}
          <div className="relative mt-8" onClick={() => { if (locked) setLocked(false); else setAutoInfo(false); }}>
            <svg
              role="img"
              aria-labelledby="glance-title glance-desc"
              viewBox="0 0 1000 240"
              className="h-auto w-full"
            >
              <title id="glance-title">System at a glance</title>
              <desc id="glance-desc">Data flows from your device through on-device intelligence and encryption to encrypted storage, with recall from a local index.</desc>

              {/* Blueprint line */}
              <path
                d="M80 120 C 270 120, 430 120, 520 120 S 770 120, 920 120"
                fill="none"
                stroke="#93a3b8"
                strokeOpacity="0.28"
                strokeWidth="2.5"
                strokeDasharray="6 6"
              />

              {/* Coral pathline animation */}
              <path
                className="animate-dash-flow"
                d="M80 120 C 270 120, 430 120, 520 120 S 770 120, 920 120"
                fill="none"
                stroke="#f1998d"
                strokeWidth="2.5"
                strokeDasharray="10 10"
                strokeLinecap="round"
              />

              {/* Nodes */}
              {nodes.map((n, i) => (
                <g key={n.title} tabIndex={0} role="button" aria-label={`${n.title}. ${n.sub}. Press Enter to continue.`}
                   onClick={(e) => { e.stopPropagation(); setIdx(i); setLocked(true); setAutoInfo(false); }}
                   onKeyDown={(e) => { if (e.key === 'Enter') { setIdx(i); setLocked((v)=>!v); setAutoInfo(false); } e.stopPropagation(); }}>
                  <circle cx={n.x} cy={n.y} r="22" fill="#ffffff" stroke="#e5e7eb" />
                  <circle cx={n.x} cy={n.y} r="12" fill="#0f172a" opacity={idx === i ? 0.85 : 0.5}
                          style={{ transformOrigin: 'center', transformBox: 'fill-box', transform: idx === i ? 'scale(1.08) translateY(-1px)' : 'scale(1)', transition: 'transform 300ms ease-out' }} />
                  <text x={n.x} y={n.y + 40} textAnchor="middle" fontSize="12" fill="#0f172a" fontWeight={600}>{n.title}</text>
                  <text x={n.x} y={n.y + 58} textAnchor="middle" fontSize="10" fill="#64748b">{n.sub}</text>
                </g>
              ))}
            </svg>

            {/* Popover details */}
            {(autoInfo || locked) && (
              <div
                role="dialog"
                aria-modal={false}
                aria-label={nodes[idx].title}
                className="pointer-events-auto absolute w-72 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-xl animate-pop"
                style={{ left: `calc(${nodes[idx].x / 1000 * 100}% - 144px)`, top: `calc(${nodes[idx].y / 240 * 100}% - 120px)` }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-sm font-semibold text-gray-900">{nodes[idx].title}</div>
                <div className="mt-1 text-xs text-gray-600">{nodes[idx].sub}</div>
                <div className="mt-3 text-xs text-gray-700">
                  {idx === 0 && 'Inference and index stay local. No raw data leaves your device.'}
                  {idx === 1 && 'OCR, NER, and embeddings are computed locally for private understanding.'}
                  {idx === 2 && 'Each file is sealed with AES‑256‑GCM; keys derived using Argon2id per account.'}
                  {idx === 3 && 'Only ciphertext is stored; buckets use versioning and content‑addressed keys.'}
                </div>
                <div className="mt-3">
                  <Link href="#magic-loop" className="group inline-flex items-center text-xs font-medium text-gray-900 hover:underline underline-offset-4">Learn more
                    <svg aria-hidden viewBox="0 0 24 24" className="ml-1.5 h-3.5 w-3.5"><path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" fill="none"/><path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Caption reveal (aria-live) */}
          <div className="relative mt-4 h-6 text-center text-sm text-gray-700" aria-live="polite">
            <div key={idx} className="absolute inset-0 flex items-center justify-center opacity-0 animate-fade-in">
              {captions[idx]}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {['Upload','Index','Encrypt','Recall'].map((c, i) => (
              <button key={c} aria-current={idx===i} onClick={() => { setIdx(i); setLocked(true); }}
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ring-1 transition-colors ${idx===i ? 'bg-[#f1998d] text-white ring-[#f1998d]' : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes dash-flow { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
        .animate-dash-flow { animation: dash-flow 8s linear infinite; }
        @keyframes pop { from { opacity: 0; transform: translateY(4px) scale(.98);} to { opacity: 1; transform: translateY(0) scale(1);} }
        .animate-pop, .animate-pop * { animation: pop 180ms ease-out both; }
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        .animate-fade-in, .animate-fade-in * { animation: fade-in 300ms ease both; }
        @media (prefers-reduced-motion: reduce) { .animate-dash-flow, .glance-node { animation: none !important; } }
      `}</style>
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <SectionHeader />
      <TaxonomyModel />
      <TaxonomyClientSide />
      <ActTwo />
      <ActThree />
    </main>
  );
}

function TaxonomyModel() {
  return (
    <section id="tree" className="bg-[#fafafb]">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-3xl border border-white/50 bg-white/30 p-6 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-gray-900">How the taxonomy works</h2>
          <p className="mt-1 text-sm text-gray-700">A DAG (multi‑parent) with a closure table for fast ancestor/descendant queries, E2EE label names, and cached hot subtrees.</p>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Tables: <span className="font-medium">label</span>, <span className="font-medium">label_edge</span>, <span className="font-medium">label_closure</span>, <span className="font-medium">document_label</span>.</li>
                <li>Integrity: sibling uniqueness, cycle guard, atomic stored procedures.</li>
                <li>Queries: children, ancestors, descendants with keyset pagination.</li>
                <li>Tenancy: PostgreSQL RLS via <code className="font-mono">app.account_id</code>.</li>
                <li>Caching: Redis children/descendants lists; invalidate on writes.</li>
              </ul>
            </div>
            <div>
              <div className="relative h-56 rounded-2xl border border-gray-200 bg-white/70 p-3 shadow-sm">
                <svg viewBox="0 0 500 200" className="h-full w-full">
                  <g>
                    <circle cx="80" cy="40" r="14" fill="#fff" stroke="#e5e7eb" />
                    <text x="60" y="70" fontSize="10" fill="#0f172a">Workspace</text>
                  </g>
                  <g>
                    <circle cx="200" cy="40" r="14" fill="#fff" stroke="#e5e7eb" />
                    <text x="188" y="70" fontSize="10" fill="#0f172a">Clients</text>
                  </g>
                  <g>
                    <circle cx="200" cy="120" r="14" fill="#fff" stroke="#e5e7eb" />
                    <text x="186" y="150" fontSize="10" fill="#0f172a">Finances</text>
                  </g>
                  <path d="M94 40 C 130 40, 160 40, 186 40" stroke="#93a3b8" strokeWidth="1.5" fill="none" />
                  <path d="M94 40 C 130 40, 160 120, 186 120" stroke="#93a3b8" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TaxonomyClientSide() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Client‑side labels and naming engine</h3>
          <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>E2EE label names: AES‑GCM on device; server stores ciphertext + <code className="font-mono">slug_token</code>.</li>
                <li>Deterministic equality: NFKC → lowercase → HMAC‑SHA256 → base32.</li>
                <li>Naming engine maps fields → labels: Who/What/When/Where/Why/How.</li>
                <li>Attach/detach are idempotent; move = remove + add (atomic).</li>
                <li>Explain‑why panel shows reasons and next actions.</li>
              </ul>
            </div>
            <div>
              <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-800 overflow-auto"><code>{`// Equality without plaintext\nconst slug = base32(hmacSha256(k_label, canonicalName));\n\n// Create label (client)\nconst encName = aesGcmEncrypt(k_vault, name);\nPOST /v1/labels { name: encName, slugToken: slug }\n\n// Attach file\nPOST /v1/files/:fileId/labels { labelId }`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActTwo() {
  const [stage, setStage] = useState(0);
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const chaptersRef = useRef<Array<HTMLDivElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);
  const [hoverPause, setHoverPause] = useState(false);
  const followScroll = false; // keep minimal; do not drive by scroll

  useEffect(() => {
    if (!followScroll) return;
    const els = chaptersRef.current.filter(Boolean) as HTMLDivElement[];
    if (els.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      let best = { idx: 0, ratio: 0 };
      for (const e of entries) {
        const i = Number((e.target as HTMLElement).dataset.idx || 0);
        if (e.intersectionRatio > best.ratio) best = { idx: i, ratio: e.intersectionRatio };
      }
      setStage(best.idx);
    }, { root: null, threshold: [0.1, 0.25, 0.5, 0.75] });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [followScroll]);

  // mark as started when the section is first visible (one-shot)
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const vis = !!entries[0]?.isIntersecting;
      if (vis) {
        setStarted(true);
        setStage(0);
      }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const steps = [
    { t: 'It starts on your device.', d: 'Drop any file. We begin locally.' },
    { t: 'On‑device intelligence.', d: 'OCR, NER, embeddings — offline.' },
    { t: 'Per‑file keys.', d: 'AES‑256‑GCM with Argon2id.' },
    { t: 'Zero‑knowledge upload.', d: 'Only ciphertext goes to the cloud.' },
    { t: 'Private recall.', d: 'Search runs on your device.' },
  ];

  // simple auto-loop once started (independent of scroll)
  useEffect(() => {
    if (!started) return;
    if (hoverPause) return;
    const stepCount = steps.length;
    const t = setTimeout(() => setStage((v) => (v + 1) % stepCount), 3000);
    return () => clearTimeout(t);
  }, [started, hoverPause, stage]);

  return (
    <section id="magic-loop" ref={sectionRef} className="bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl grid grid-cols-1 gap-10 px-6 py-20 sm:py-24 md:grid-cols-2 lg:px-8">
        {/* Left: expanded step rail (replaces chapter blocks) */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/50 bg-white/30 p-6 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl min-h-[600px] flex flex-col">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">The Anatomy of a Private Search</h2>
            <ol className="mt-2 flex-1 flex flex-col justify-between" role="listbox" aria-label="Steps">
              {steps.map((s, i) => (
                <li key={s.t} className="flex min-h-[72px] items-start gap-3">
                  <button
                    role="option"
                    aria-selected={stage===i}
                    onClick={() => { setStage(i); setStarted(true); }}
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] transition-colors ${stage===i ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {i+1}
                  </button>
                  <div>
                    <div className={`text-sm ${stage===i ? 'text-gray-900' : 'text-gray-700'}`}>{s.t.replace('.', '')}</div>
                    <div className="mt-1 max-w-sm text-xs text-gray-600">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: sticky visual canvas */}
        <div className="relative">
          <div ref={containerRef} className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/30 p-6 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl"
               onMouseEnter={() => setHoverPause(true)} onMouseLeave={() => setHoverPause(false)}>
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Blueprint</div>
            <div className="relative mt-3 h-[420px]">
              {/* Device boundary */}
              <div className="absolute left-4 top-6 h-[360px] w-[55%] rounded-2xl border border-gray-200 bg-white/70 shadow-sm" />
              <div className="absolute left-6 top-8 text-xs font-semibold text-gray-700">Your device</div>
              {/* Cloud boundary */}
              <div className="absolute right-4 top-6 h-[360px] w-[35%] rounded-2xl border border-gray-200 bg-white/70 shadow-sm" />
              <div className="absolute right-6 top-8 text-xs font-semibold text-gray-700">Cloud</div>

              {/* Cloud DB glyph */}
              <div className="absolute right-[10%] top-[42%] h-16 w-14">
                <div className="mx-auto h-3 w-12 rounded-full bg-gray-200" />
                <div className="mx-auto mt-1 h-3 w-12 rounded-full bg-gray-200" />
                <div className="mx-auto mt-1 h-3 w-12 rounded-full bg-gray-200" />
              </div>

              {/* File icon / ciphertext block */}
              <div
                className={`absolute transition-all duration-700 ${stage < 3 || stage===4 ? 'bg-white border border-gray-300 text-gray-900' : 'bg-gray-900 text-white'} rounded-xl shadow-sm ${stage===1 ? 'px-3 py-2 text-[12px]' : 'px-2 py-1.5 text-[11px]'} ${stage===3 ? 'font-mono' : ''}`}
                style={{
                  left: stage < 3 ? '10%' : stage === 3 ? '62%' : stage === 4 ? '10%' : '10%',
                  top: stage === 0 ? '35%' : stage === 1 ? '32%' : stage >= 2 ? '40%' : '35%',
                  transform: stage===1 ? 'scale(1.12)' : 'scale(1)'
                }}
              >
                {stage < 3 || stage===4 ? 'receipt.pdf' : 'C0x4f…' }
              </div>

              {/* Tags (only inside device) */}
              <div className={`absolute left-[12%] top-[55%] flex flex-wrap gap-2 transition-opacity duration-500 ${stage===1 ? 'opacity-100' : 'opacity-0'}`}>
                {['Receipt','Warranty','Expires: 2026'].map((t) => (
                  <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-800 ring-1 ring-gray-200">{t}</span>
                ))}
              </div>

              {/* Coral key (wrap animation) */}
              <div className={`absolute left-[28%] top-[38%] h-6 w-6 rounded-full bg-[#f1998d] shadow-xl transition-transform duration-500 ${stage===2 ? 'scale-100' : 'scale-0'}`} />

              {/* Travel pathline device → cloud */}
              <svg aria-hidden viewBox="0 0 600 120" className="absolute left-[46%] top-[44%] h-20 w-[46%]">
                <path d="M10 60 C 120 60, 260 60, 590 60" fill="none" stroke="#93a3b8" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="6 6" />
                <path className={stage===3 ? 'animate-dash-flow' : ''} d="M10 60 C 120 60, 260 60, 590 60" fill="none" stroke="#f1998d" strokeWidth="3" strokeDasharray="10 10" />
              </svg>

              {/* Return pathline cloud → device (decrypt on device) */}
              <svg aria-hidden viewBox="0 0 600 120" className="absolute left-[46%] top-[54%] h-20 w-[46%]">
                <path d="M590 60 C 260 60, 120 60, 10 60" fill="none" stroke="#93a3b8" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="6 6" />
                <path className={stage===4 ? 'animate-dash-flow' : ''} d="M590 60 C 260 60, 120 60, 10 60" fill="none" stroke="#f1998d" strokeWidth="3" strokeDasharray="10 10" />
              </svg>

              {/* Search bar and highlight for recall */}
              <div className={`absolute left-[7%] top-[22%] flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-2 shadow-sm transition-opacity duration-500 ${stage===4 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="h-3 w-3 rounded-full bg-gray-400" />
                <div className="text-[11px] text-gray-700">MacBook warranty</div>
              </div>
              <div className={`absolute left-[10%] top-[40%] h-6 w-24 rounded-md bg-[#f1998d]/15 ring-1 ring-[#f1998d]/30 transition-opacity duration-500 ${stage===4 ? 'opacity-100' : 'opacity-0'}`} />

              {/* Decrypt key pulse on device for recall */}
              <div className={`absolute left-[26%] top-[38%] h-6 w-6 rounded-full bg-[#f1998d] shadow-xl transition-transform duration-500 ${stage===4 ? 'scale-100' : 'scale-0'}`} />

              {/* Ciphertext badge in cloud */}
              <div className={`absolute right-[9%] top-[32%] transition-opacity duration-300 ${stage===3 ? 'opacity-100' : 'opacity-0'}`}>
                <span className="inline-flex items-center rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
                  Ciphertext
                  <svg viewBox="0 0 24 24" className="ml-1 h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V8a4 4 0 1 1 8 0v2"/></svg>
                </span>
              </div>

              {/* Decrypting badge on device */}
              <div className={`absolute left-[7%] top-[31%] transition-opacity duration-300 ${stage===4 ? 'opacity-100' : 'opacity-0'}`}>
                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-900 ring-1 ring-gray-200 shadow-sm">
                  Decrypting…
                </span>
              </div>

              {/* Adjusted key pulse to avoid overlap with file chip */}
              <div className={`absolute left-[18%] top-[36%] h-6 w-6 rounded-full bg-[#f1998d] shadow-xl transition-transform duration-500 ${stage===4 ? 'scale-100' : 'scale-0'}`} />
            </div>

            {/* Caption */}
            <div className="mt-3 text-center text-sm text-gray-700" aria-live="polite">{steps[stage].t}</div>

            {/* Dynamic legend chips under canvas */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {(stage===0 ? ['Local','Offline']
                : stage===1 ? ['On‑device AI','No cloud']
                : stage===2 ? ['AES‑256‑GCM','Argon2id']
                : stage===3 ? ['Ciphertext only','Zero‑knowledge']
                : ['Local search','Cloud untouched']).map((c) => (
                <span key={c} className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-700 ring-1 ring-gray-200">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link href="/how-it-works#overview" className="group inline-flex items-center text-sm font-medium text-gray-900 hover:underline underline-offset-4">View docs
          <svg aria-hidden viewBox="0 0 24 24" className="ml-1.5 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
        </Link>
      </div>
      <style jsx global>{`
        @keyframes dash-flow { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
        .animate-dash-flow { animation: dash-flow 1200ms linear 1; }
      `}</style>
    </section>
  );
}

function ActThree() {
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  return (
    <section className="relative isolate overflow-hidden bg-[#fafafb]">
      <RibbonBackground />
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="rounded-3xl border border-white/50 bg-white/30 p-6 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl">
          <h2 className="text-center text-xl font-semibold text-gray-900">Trust, at every layer.</h2>

          {/* Tabs */}
          <div className="mt-6 flex items-center justify-center gap-2" role="tablist">
            {['Architecture & Integrity','Security & Policy','Limits & Practicalities'].map((t, i) => (
              <button key={t} role="tab" aria-selected={tab===i}
                onClick={() => setTab(i as 0|1|2)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${tab===i ? 'bg-[#f1998d] text-white' : 'bg-white text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50'}`}>{t}</button>
            ))}
          </div>

          {/* Panel */}
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              {tab===0 && (
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Content‑addressed blobs; versioning; region‑prefixed keys.</li>
                  <li>Multi‑device sync with X25519 key wrap; revoke anytime.</li>
                  <li>Immutable audit trail; per‑account metadata isolation.</li>
                </ul>
              )}
              {tab===1 && (
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>TLS only; strict CORS; zero third‑party trackers.</li>
                  <li>Bucket policies: block public access; deny insecure transport.</li>
                  <li>Clear boundaries in threat model; honest guarantees.</li>
                </ul>
              )}
              {tab===2 && (
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>Blob ≤ 50MB; metadata ≤ 1MB; index shard ≤ 5MB.</li>
                  <li>Offline‑first; local search; graceful backoff on network.</li>
                  <li>Performance tuned for transforms/opacity; low CPU.</li>
                </ul>
              )}
            </div>
            <div>
              {/* Minimal blueprint per tab */}
              <div className="relative h-56 rounded-2xl border border-gray-200 bg-white/70 p-3 shadow-sm"
                   style={{ backgroundImage: 'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)', backgroundSize: '26px 26px', backgroundPosition: '0 0' }}>
                {tab===0 && (
                  <svg viewBox="0 0 500 200" className="h-full w-full">
                    <rect x="320" y="40" width="150" height="120" rx="10" fill="#fff" stroke="#e5e7eb" />
                    <rect x="335" y="55" width="120" height="10" rx="5" fill="#e5e7eb" />
                    <rect x="335" y="72" width="120" height="10" rx="5" fill="#e5e7eb" />
                    <rect x="335" y="89" width="120" height="10" rx="5" fill="#e5e7eb" />
                    <text x="40" y="70" fontSize="12" fill="#0f172a">hash(doc)</text>
                    <text x="40" y="95" fontSize="12" fill="#0f172a">versioning</text>
                    <text x="40" y="120" fontSize="12" fill="#0f172a">us‑/eu‑prefixed keys</text>
                    <path d="M140 100 C 210 100, 260 100, 320 100" stroke="#93a3b8" strokeOpacity="0.5" strokeWidth="2" fill="none" strokeDasharray="6 6" />
                  </svg>
                )}
                {tab===1 && (
                  <svg viewBox="0 0 500 200" className="h-full w-full">
                    <circle cx="120" cy="100" r="32" fill="#fff" stroke="#e5e7eb" />
                    <path d="M120 78 l18 10 v24 l-18 10 l-18 -10 v-24z" fill="#f1998d" opacity="0.25" />
                    <text x="180" y="92" fontSize="12" fill="#0f172a">TLS only</text>
                    <text x="180" y="114" fontSize="12" fill="#0f172a">Bucket policies enforced</text>
                  </svg>
                )}
                {tab===2 && (
                  <svg viewBox="0 0 500 200" className="h-full w-full">
                    <rect x="40" y="50" width="100" height="20" rx="10" fill="#fff" stroke="#e5e7eb" />
                    <text x="55" y="65" fontSize="11" fill="#0f172a">50MB blob</text>
                    <rect x="40" y="90" width="100" height="20" rx="10" fill="#fff" stroke="#e5e7eb" />
                    <text x="52" y="105" fontSize="11" fill="#0f172a">1MB metadata</text>
                    <rect x="40" y="130" width="120" height="20" rx="10" fill="#fff" stroke="#e5e7eb" />
                    <text x="52" y="145" fontSize="11" fill="#0f172a">5MB index shard</text>
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link href="/sign-up" className="inline-flex items-center rounded-full bg-[#f1998d] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#ee8a7c]">Get started
              <svg aria-hidden viewBox="0 0 24 24" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


