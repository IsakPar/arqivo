'use client';

export function PrivacyEngine() {
  return (
    <section id="how-it-works" aria-labelledby="privacy-engine-title" className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">The Privacy Engine</p>
          <h2 id="privacy-engine-title" className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-gray-600">Clear. Technical. No fluff.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:gap-8 md:grid-cols-3">
          <Card
            title="On‑device index"
            body="All search happens locally. Nothing leaves your machine."
            icon={
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                <path d="M4 5h16v14H4z" />
                <path d="M8 3v4M16 3v4" />
              </svg>
            }
          />
          <Card
            title="Per‑document keys"
            body="Each file sealed independently. One compromise ≠ total compromise."
            icon={
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                <circle cx="8" cy="15" r="4" />
                <path d="M12 15h8l-2 2m0-4l2 2" />
              </svg>
            }
          />
          <Card
            title="Zero metadata leakage"
            body="No filenames, sizes, or access graphs visible to us."
            icon={
              <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                <path d="M4 7l16 10M4 17L20 7" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}

function Card({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gray-50 p-3 text-gray-800 ring-1 ring-gray-200 group-hover:bg-gray-100">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{body}</p>
        </div>
      </div>
    </div>
  );
}


