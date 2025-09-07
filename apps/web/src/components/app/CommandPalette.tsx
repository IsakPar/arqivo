'use client';
import React from 'react';

type Action = { id: string; label: string; run: () => void; shortcut?: string };

export function useCommandPalette(actions: Action[]) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o); setQ(''); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') { e.preventDefault(); setOpen(true); setQ('upload'); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return actions;
    return actions.filter(a => a.label.toLowerCase().includes(term));
  }, [q, actions]);

  function Modal() {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[100] grid place-items-start bg-black/20 p-4 pt-24" onClick={() => setOpen(false)}>
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command…" className="w-full border-b border-gray-200 px-4 py-3 text-sm outline-none" />
          <div className="max-h-80 overflow-auto py-2">
            {filtered.map(a => (
              <button key={a.id} onClick={() => { setOpen(false); a.run(); }} className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50">
                <span>{a.label}</span>
                {a.shortcut && <kbd className="text-xs text-gray-500">{a.shortcut}</kbd>}
              </button>
            ))}
            {filtered.length === 0 && <div className="px-4 py-6 text-sm text-gray-500">No commands</div>}
          </div>
        </div>
      </div>
    );
  }

  return { open, setOpen, q, setQ, Modal } as const;
}


