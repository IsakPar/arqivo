'use client';

import React from 'react';

type Result = { id: string; name?: string; excerpt?: string };

type Props = {
  open: boolean;
  query: string;
  results: Result[];
  onClose: () => void;
  onQueryChange: (v: string) => void;
};

export function CmdFOverlay({ open, query, results, onClose, onQueryChange }: Props) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[100] grid place-items-start bg-black/10 p-4" onClick={onClose}>
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 p-3">
          <input autoFocus value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Search local index…" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none" />
        </div>
        <ul className="max-h-64 overflow-auto p-2">
          {results.length === 0 && <li className="px-2 py-3 text-sm text-gray-600">No results</li>}
          {results.map(r => (
            <li key={r.id} className="px-3 py-2 text-sm hover:bg-gray-50">
              <div className="font-medium text-gray-900">{r.name || r.id}</div>
              {r.excerpt && <div className="text-xs text-gray-600">…{r.excerpt}…</div>}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
          <div>Local-only. Press Esc to close.</div>
          <button onClick={onClose} className="rounded-md border border-gray-200 bg-white px-2 py-1 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}


