'use client';

import { useRef, useState } from 'react';

type Stage = 'idle' | 'dropped' | 'encrypt' | 'tag' | 'upload' | 'done';

export function UploadDemo() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);

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

  function runDemo(name: string) {
    setStage('dropped');
    setProgress(5);
    setTimeout(() => { setStage('encrypt'); setProgress(35); }, 400);
    setTimeout(() => { setStage('tag'); setTags(inferTags(name)); setProgress(65); }, 900);
    setTimeout(() => { setStage('upload'); setProgress(90); }, 1400);
    setTimeout(() => { setStage('done'); setProgress(100); }, 1900);
  }

  function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFileName(f.name);
    runDemo(f.name);
  }

  return (
    <section id="upload" className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 sm:py-28 md:grid-cols-2 lg:px-8">
        {/* Left: live demo panel */}
        <div>
          <div className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl">
            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
              className={
                `flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ` +
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

            {/* File + steps */}
            {fileName && (
              <div className="mt-5 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <span className="rounded bg-gray-900/90 px-1.5 py-0.5 text-[11px] text-white">PDF</span>
                  {fileName}
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <Step label="Encrypting" active={stage === 'encrypt' || stage === 'tag' || stage === 'upload' || stage === 'done'} done={stage !== 'encrypt' && stage !== 'dropped' && stage !== 'idle'} />
                  <Step label="Tagging" active={stage === 'tag' || stage === 'upload' || stage === 'done'} done={stage === 'upload' || stage === 'done'} />
                  <Step label="Uploading" active={stage === 'upload' || stage === 'done'} done={stage === 'done'} />
                  <Step label="Done" active={stage === 'done'} done={stage === 'done'} />
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded bg-gray-100">
                  <div className="h-full bg-gray-900 transition-[width]" style={{ width: `${progress}%` }} />
                </div>

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 ring-1 ring-gray-200">{t}</span>
                    ))}
                  </div>
                )}

                {stage === 'done' && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    <LockIcon className="h-3 w-3" /> Securely uploaded
                  </div>
                )}
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

function Step({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={
        `inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ` +
        (done ? 'bg-gray-900 text-white' : active ? 'bg-gray-800/10 text-gray-800' : 'bg-gray-100 text-gray-400')
      }>
        {done ? '✓' : '•'}
      </span>
      <span className={"text-gray-700 " + (active ? 'font-medium' : '')}>{label}</span>
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


