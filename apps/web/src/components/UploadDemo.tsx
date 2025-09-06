'use client';

import { useEffect, useRef, useState } from 'react';

type Stage = 'idle' | 'dropped' | 'summary' | 'approve' | 'done';

export function UploadDemo() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>('idle');
  const [active, setActive] = useState(false);

  function clearTimers() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }

  function inferTags(name: string) {
    const n = name.toLowerCase();
    const t: string[] = [];
    if (/(receipt|invoice)/.test(n)) t.push('receipt');
    if (/passport/.test(n)) t.push('passport');
    if (/warranty/.test(n)) t.push('warranty');
    if (/tax|irs|hmrc|skatteverket/.test(n)) t.push('tax');
    if (t.length === 0) t.push('document');
    return t;
  }

  // Looping demo: idle → dropped → summary → approve → done → restart
  function startLoop(name = 'Receipt_MacBook_Air_2015.pdf') {
    clearTimers();
    setFileName(null);
    setTags([]);
    setStage('idle');
    // slower, smoother timings
    timers.current.push(window.setTimeout(() => {
      setFileName(name);
      setStage('dropped');
    }, 1200));
    timers.current.push(window.setTimeout(() => {
      setTags(inferTags(name));
      setStage('summary');
    }, 2600));
    timers.current.push(window.setTimeout(() => {
      setStage('approve');
    }, 4200));
    timers.current.push(window.setTimeout(() => {
      setStage('done');
    }, 5800));
    timers.current.push(window.setTimeout(() => {
      startLoop(name);
    }, 9000));
  }

  // Start/stop demo based on viewport visibility (no jolt until in view)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries[0]?.isIntersecting ?? false;
        setActive(vis);
      },
      { root: null, threshold: 0.35 }
    );
    io.observe(el);
    return () => { io.disconnect(); clearTimers(); };
  }, []);

  useEffect(() => {
    if (active) startLoop();
    else { clearTimers(); setStage('idle'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    clearTimers();
    setFileName(f.name);
    setTags(inferTags(f.name));
    setStage('summary');
  }

  return (
    <section id="upload" ref={sectionRef} className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 sm:py-28 md:grid-cols-2 lg:px-8">
        {/* Left: live demo panel */}
        <div>
          <div className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            {/* Dropzone (idle) */}
            {stage === 'idle' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
                className={
                  `flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ` +
                  (drag ? 'border-gray-900 bg-white/70' : 'border-gray-300 bg-white/60 hover:bg-white/70')
                }
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" className="hidden" onChange={(e) => onFiles(e.target.files)} />
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-gray-800">
                  <path d="M12 3v12M7 8l5-5 5 5" />
                  <rect x="3" y="12" width="18" height="8" rx="2" />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-900">Drag & drop a document</p>
                <p className="text-xs text-gray-600">or click to choose</p>
              </div>
            )}

            {/* Dropped (brief state) */}
            {fileName && stage === 'dropped' && (
              <div className="min-h-[280px] rounded-2xl border border-gray-200 bg-white/80 p-5 text-sm text-gray-900 shadow-sm transition-all">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-gray-900/90 px-1.5 py-0.5 text-[11px] text-white">PDF</span>
                  {fileName}
                </div>
                <p className="mt-2 text-xs text-gray-600">Processing…</p>
              </div>
            )}

            {/* Summary + approve */}
            {fileName && (stage === 'summary' || stage === 'approve' || stage === 'done') && (
              <div className="min-h-[280px] rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm transition-all">
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <span className="rounded bg-gray-900/90 px-1.5 py-0.5 text-[11px] text-white">PDF</span>
                  {fileName}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-gray-700">
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Summary</div>
                    <div className="mt-1 text-sm text-gray-900">Receipt — MacBook Air 13&quot;</div>
                    <div className="text-gray-600">April 2015 · Apple Store</div>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Tags</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span key={t} className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-gray-200">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">Security</div>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                      <LockIcon className="h-3 w-3" /> E2E encrypted
                    </div>
                  </div>
                </div>

                {/* Minimal chat bubbles to explain steps */}
                <div className="mt-4 space-y-2">
                  <Bubble text="Encrypting on device (AES‑GCM)…" show={stage === 'summary' || stage === 'approve' || stage === 'done'} delay={0} />
                  <Bubble text={`Detected entities: ${tags.join(', ')}`} show={stage === 'summary' || stage === 'approve' || stage === 'done'} delay={150} />
                  <Bubble text="Computing content hash and verifying integrity…" show={stage === 'approve' || stage === 'done'} delay={300} />
                  <Bubble text="Uploading securely to your region" show={stage === 'done'} delay={450} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[12px] text-gray-600">Content‑address verified</div>
                  <button
                    className={`rounded-full px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${stage === 'approve' || stage === 'done' ? 'bg-gray-700' : 'bg-gray-900 hover:bg-black'}`}
                    onClick={() => { setStage('approve'); setTimeout(() => setStage('done'), 600); }}
                  >
                    {stage === 'done' ? 'Uploaded' : stage === 'approve' ? 'Approving…' : 'Approve upload'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: text content */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Upload</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Add a document in seconds.</h2>
          <p className="mt-4 text-base text-gray-600">Drag, auto‑label, and upload — all encrypted on your device.</p>
          <ul className="mt-6 space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Auto tagging (receipt, passport, warranty, taxes)</li>
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Per‑document AES‑GCM encryption</li>
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Content‑addressed storage for integrity</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Bubble({ text, show, delay = 0 }: { text: string; show: boolean; delay?: number }) {
  return (
    <div
      className={
        `max-w-max rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-800 shadow-sm transition-all ` +
        (show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1')
      }
      style={{ transitionDuration: '500ms', transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${delay}ms` }}
    >
      {text}
    </div>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
    </svg>
  );
}


