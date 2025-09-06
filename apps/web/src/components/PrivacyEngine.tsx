'use client';

export function PrivacyEngine() {
  return (
    <section id="how-it-works" aria-labelledby="privacy-engine-title" className="relative overflow-hidden bg-white">
      {/* blueprint background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">The Privacy Engine</p>
          <h2 id="privacy-engine-title" className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-gray-600">Clear. Technical. No fluff.</p>
        </div>

        {/* Row 1: On-device index (diagram left, copy right) */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <svg viewBox="0 0 560 320" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Device boundary */}
              <rect x="24" y="24" width="360" height="232" rx="16" className="stroke-gray-300" strokeWidth="1.5"/>
              <text x="40" y="48" className="fill-gray-600" fontSize="12" fontFamily="ui-monospace, SFMono-Regular">Device boundary</text>
              {/* Local search */}
              <rect x="56" y="72" width="144" height="36" rx="8" className="stroke-gray-300" strokeWidth="1.5"/>
              <text x="68" y="94" className="fill-gray-800" fontSize="13">Local Search</text>
              {/* Encrypted index nodes */}
              <g className="stroke-gray-400">
                <circle cx="250" cy="100" r="6" />
                <circle cx="290" cy="132" r="6" />
                <circle cx="226" cy="152" r="6" />
                <circle cx="306" cy="92" r="6" />
                <path d="M256 102 L284 128" />
                <path d="M296 128 L232 150" />
                <path d="M256 102 L302 94" />
              </g>
              <text x="228" y="76" className="fill-gray-600" fontSize="12">Encrypted Index (HNSW)</text>
              {/* Crypto pathline (static) */}
              <path d="M200 90 C210 110, 230 120, 246 100" className="stroke-[#f1998d]" strokeOpacity="0.5" strokeWidth="2" />
              {/* Cloud outside with X */}
              <g transform="translate(420,40)">
                <path d="M40 36c0-9-7-16-16-16-2 0-3 0-5 1C17 12 9 18 9 28c-5 0-9 4-9 9s4 9 9 9h48c6 0 11-5 11-11s-5-11-11-11Z" className="stroke-gray-300" strokeWidth="1.5" fill="none"/>
                <path d="M16 52 L56 12 M16 12 L56 52" className="stroke-gray-300" strokeWidth="1.5" />
              </g>
              {/* E2EE badge at boundary */}
              <rect x="280" y="216" width="84" height="28" rx="6" className="fill-gray-900" />
              <text x="292" y="234" className="fill-white" fontSize="12">E2EE inside</text>
            </svg>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900">On‑device index</h3>
            <p className="mt-2 text-sm text-gray-600">All search happens locally. Nothing leaves your machine.</p>
          </div>
        </div>

        {/* Row 2: Per-document keys (copy left, diagram right) */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h3 className="text-base font-semibold text-gray-900">Per‑document keys</h3>
            <p className="mt-2 text-sm text-gray-600">Each file sealed independently. One compromise ≠ total compromise.</p>
          </div>
          <div className="order-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:order-2">
            <svg viewBox="0 0 560 320" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Vault Root */}
              <rect x="28" y="48" width="140" height="40" rx="8" className="stroke-gray-300" strokeWidth="1.5"/>
              <text x="44" y="72" className="fill-gray-800" fontSize="13">Vault Root</text>
              <text x="44" y="88" className="fill-gray-600" fontSize="11">X25519 / Argon2id</text>
              {/* One-way arrows to Kdoc */}
              <path d="M168 68 H260" className="stroke-[#f1998d]" strokeOpacity="0.8" strokeWidth="2" markerEnd="url(#arrow)"/>
              <path d="M168 68 C220 68, 220 128, 260 128" className="stroke-[#f1998d]" strokeOpacity="0.6" strokeWidth="2" markerEnd="url(#arrow)"/>
              <path d="M168 68 C220 68, 220 188, 260 188" className="stroke-[#f1998d]" strokeOpacity="0.4" strokeWidth="2" markerEnd="url(#arrow)"/>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="#f1998d" fillOpacity="0.8" />
                </marker>
              </defs>
              {/* Doc cards with locks */}
              <g>
                <rect x="260" y="48" width="120" height="48" rx="8" className="stroke-gray-300" strokeWidth="1.5"/>
                <text x="272" y="74" className="fill-gray-800" fontSize="13">Doc A</text>
                <path d="M352 76 v-8 a6 6 0 0 1 12 0 v8 h-12z" className="stroke-gray-400" />
              </g>
              <g>
                <rect x="260" y="108" width="120" height="48" rx="8" className="stroke-gray-300" strokeWidth="1.5"/>
                <text x="272" y="134" className="fill-gray-800" fontSize="13">Doc B</text>
                <path d="M352 136 v-8 a6 6 0 0 1 12 0 v8 h-12z" className="stroke-gray-400" />
              </g>
              <g>
                <rect x="260" y="168" width="120" height="48" rx="8" className="stroke-gray-300" strokeWidth="1.5"/>
                <text x="272" y="194" className="fill-gray-800" fontSize="13">Doc C</text>
                <path d="M352 196 v-8 a6 6 0 0 1 12 0 v8 h-12z" className="stroke-gray-400" />
              </g>
              {/* Blast radius note */}
              <rect x="404" y="64" width="112" height="28" rx="6" className="fill-gray-100"/>
              <text x="412" y="82" className="fill-gray-700" fontSize="11">blast radius: minimal</text>
            </svg>
          </div>
        </div>

        {/* Row 3: Zero metadata leakage (diagram left, copy right) */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <svg viewBox="0 0 560 320" className="h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Cloud bucket */}
              <g transform="translate(28,40)">
                <rect x="0" y="0" width="220" height="180" rx="12" className="stroke-gray-300" strokeWidth="1.5"/>
                <text x="12" y="20" className="fill-gray-600" fontSize="12">Cloud bucket</text>
                {/* ciphertext blobs */}
                <g className="stroke-gray-300">
                  <rect x="16" y="36" width="88" height="28" rx="6" />
                  <rect x="120" y="36" width="88" height="28" rx="6" />
                  <rect x="16" y="76" width="88" height="28" rx="6" />
                  <rect x="120" y="76" width="88" height="28" rx="6" />
                  <rect x="16" y="116" width="88" height="28" rx="6" />
                  <rect x="120" y="116" width="88" height="28" rx="6" />
                </g>
                <text x="20" y="56" className="fill-gray-600" fontSize="10">C0x…</text>
                <text x="124" y="56" className="fill-gray-600" fontSize="10">C0x…</text>
                <text x="20" y="96" className="fill-gray-600" fontSize="10">C0x…</text>
                <text x="124" y="96" className="fill-gray-600" fontSize="10">C0x…</text>
                <text x="20" y="136" className="fill-gray-600" fontSize="10">C0x…</text>
                <text x="124" y="136" className="fill-gray-600" fontSize="10">C0x…</text>
                {/* Metadata: None chip */}
                <rect x="120" y="152" width="84" height="20" rx="6" className="fill-gray-100" />
                <text x="126" y="166" className="fill-gray-700" fontSize="10">Metadata: None</text>
              </g>
              {/* Probe attempt with X */}
              <path d="M260 110 C300 110, 340 110, 380 110" className="stroke-gray-400" strokeDasharray="4 4" strokeWidth="1.5"/>
              <path d="M372 102 L388 118 M372 118 L388 102" className="stroke-gray-400" strokeWidth="1.5"/>
              <text x="300" y="100" className="fill-gray-600" fontSize="11">read attempt</text>
              {/* Local tags panel inside device */}
              <rect x="404" y="64" width="128" height="120" rx="12" className="stroke-gray-300" strokeWidth="1.5"/>
              <text x="416" y="84" className="fill-gray-600" fontSize="12">Local tags</text>
              <rect x="416" y="96" width="84" height="20" rx="6" className="fill-gray-100"/>
              <text x="422" y="110" className="fill-gray-700" fontSize="10">receipt, apple</text>
              <rect x="416" y="124" width="60" height="20" rx="6" className="fill-gray-100"/>
              <text x="422" y="138" className="fill-gray-700" fontSize="10">warranty</text>
              {/* Server sees: ciphertext only badge */}
              <rect x="28" y="236" width="180" height="26" rx="6" className="fill-gray-900"/>
              <text x="36" y="254" className="fill-white" fontSize="12">Server sees: ciphertext only</text>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Zero metadata leakage</h3>
            <p className="mt-2 text-sm text-gray-600">No filenames, sizes, or access graphs visible to us.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="#" className="text-sm font-medium text-gray-700 underline-offset-4 hover:underline">Learn more in the docs</a>
        </div>
      </div>
    </section>
  );
}
