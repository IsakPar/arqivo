'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type StepId = 'idle' | 'dropped' | 'summary' | 'upload' | 'done';

export function UploadSteps() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timers = useRef<number[]>([]);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState<StepId>('idle');
  const [fileName, setFileName] = useState<string>('Receipt_MacBook_Air_2015.pdf');
  const [tags, setTags] = useState<string[]>(['receipt','apple','laptop']);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  function clearTimers() { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; }

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

  function runOnce(name: string) {
    clearTimers();
    setFileName(name);
    setTags(inferTags(name));
    setProgress(0);
    setStep('dropped');
    timers.current.push(window.setTimeout(() => setStep('summary'), 1200));
    timers.current.push(window.setTimeout(() => {
      setStep('upload');
      // smooth progress to 100%
      let p = 0;
      const tick = () => {
        p = Math.min(100, p + 2);
        setProgress(p);
        if (p < 100) timers.current.push(window.setTimeout(tick, 50));
      };
      tick();
    }, 2800));
    timers.current.push(window.setTimeout(() => setStep('done'), 5600));
  }

  function startLoop() {
    if (reduced) { setStep('summary'); setProgress(100); return; }
    clearTimers();
    setProgress(0); setStep('idle');
    timers.current.push(window.setTimeout(() => runOnce(fileName), 1500));
    timers.current.push(window.setTimeout(() => { setStep('idle'); setProgress(0); }, 8200));
    timers.current.push(window.setTimeout(() => startLoop(), 9800));
  }

  // Scroll trigger
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const io = new IntersectionObserver(entries => setActive(entries[0]?.isIntersecting ?? false), { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); clearTimers(); };
  }, []);

  useEffect(() => {
    if (active) startLoop(); else { clearTimers(); setStep('idle'); setProgress(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    clearTimers();
    runOnce(f.name);
  }

  return (
    <section id="upload" ref={sectionRef} className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 sm:py-24 md:grid-cols-2 lg:px-8">
        {/* Left: fixed-height glass panel */}
        <div>
          <div className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            <div className="min-h-[360px]">
              {/* Idle dropzone */}
              {step === 'idle' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
                  onClick={() => inputRef.current?.click()}
                  className={`flex h-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${drag ? 'border-gray-900 bg-white/70' : 'border-gray-300 bg-white/60 hover:bg-white/70'}`}
                >
                  <input ref={inputRef} type="file" className="hidden" onChange={(e) => onFiles(e.target.files)} />
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-gray-800"><path d="M12 3v12M7 8l5-5 5 5" /><rect x="3" y="12" width="18" height="8" rx="2" /></svg>
                  <p className="mt-3 text-sm font-medium text-gray-900">Drag & drop a document</p>
                  <p className="text-xs text-gray-600">or click to choose</p>
                </div>
              )}

              {/* Dropped + Summary + Upload + Done */}
              {step !== 'idle' && (
                <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm">
                  {/* Top row: filename + replay */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <span className="rounded bg-gray-900/90 px-1.5 py-0.5 text-[11px] text-white">PDF</span>
                      {fileName}
                    </div>
                    <button className="text-xs text-gray-600 hover:text-gray-900" onClick={() => { clearTimers(); startLoop(); }}>Replay</button>
                  </div>

                  {/* Steps list */}
                  <ol className="mt-4 space-y-2">
                    <Step n={1} label="Drop your file" active={step === 'dropped' || step === 'summary' || step === 'upload' || step === 'done'} done={step !== 'idle'} />
                    <Step n={2} label="Encrypt & tag (on‑device)" active={step === 'summary' || step === 'upload' || step === 'done'} done={step === 'upload' || step === 'done'} />
                    <Step n={3} label="Verify & upload" active={step === 'upload' || step === 'done'} done={step === 'done'} />
                    <Step n={4} label="Done" active={step === 'done'} done={step === 'done'} />
                  </ol>

                  {/* Progress + success pill, stable area */}
                  <div className="mt-4">
                    {step === 'upload' && (
                      <div className="h-2 w-full overflow-hidden rounded bg-gray-100"><div className="h-full bg-gray-900 transition-[width]" style={{ width: `${progress}%` }} /></div>
                    )}
                    {step === 'done' && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white"><LockIcon className="h-3 w-3" /> Securely uploaded</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: copy */}
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Upload</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Add a document in seconds.</h2>
          <p className="mt-4 text-base text-gray-600">Encrypt and tag on your device, verify integrity, then upload privately to your region.</p>
          <ul className="mt-6 space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Per‑document AES‑GCM encryption</li>
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> On‑device entity tagging (receipt, passport, warranty)</li>
            <li className="flex items-start gap-2"><span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-400" /> Content‑addressed storage for integrity</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Step({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${done ? 'bg-gray-900 text-white' : active ? 'bg-gray-800/10 text-gray-800' : 'bg-gray-100 text-gray-400'}`}>{done ? '✓' : n}</span>
      <span className={`text-sm ${active ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
    </li>
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


