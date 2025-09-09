'use client';

import React from 'react';

type ExtractionFields = { total?: number; currency?: string; dueDate?: string; vendor?: string };
type Message = { id: string; title: string; body: string; ts: number; fields?: ExtractionFields; read?: boolean };
type Props = { open: boolean; onClose: () => void; onUnreadChange?: (n: number) => void };

export function Inbox({ open, onClose, onUnreadChange }: Props) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  React.useEffect(() => {
    function onNotify(e: CustomEvent) {
      const m = e.detail as Partial<Message>;
      const withId: Message = {
        id: String(Date.now()),
        title: m.title || 'Notification',
        body: m.body || '',
        ts: m.ts || Date.now(),
        fields: m.fields,
        read: false,
      };
      setMessages((prev) => {
        const next = [withId, ...prev].slice(0, 50);
        onUnreadChange?.(next.filter(x => !x.read).length);
        return next;
      });
    }
    window.addEventListener('arqivo:inbox', onNotify as any);
    return () => window.removeEventListener('arqivo:inbox', onNotify as any);
  }, []);

  // Mark all as read when opened
  React.useEffect(() => {
    if (open && messages.some(m => !m.read)) {
      setMessages((prev) => prev.map(m => ({ ...m, read: true })));
      onUnreadChange?.(0);
    }
  }, [open]);
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[120]" aria-hidden onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute right-4 top-16 w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl" role="dialog" aria-modal aria-label="Inbox" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Inbox</h2>
          <button aria-label="Close inbox" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-gray-600 hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="max-h-96 overflow-auto p-2 space-y-2">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-gray-100 p-4 text-sm text-gray-700">No messages yet.</div>
          ) : messages.map((m) => (
            <div key={m.id} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{m.title}</div>
                <div className="text-[11px] text-gray-500">{new Date(m.ts).toLocaleTimeString()}</div>
              </div>
              <div className="mt-1 text-sm text-gray-700">{m.body}</div>
              {m.fields && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  {m.fields.vendor && <div>Vendor: <span className="text-gray-800">{m.fields.vendor}</span></div>}
                  {m.fields.total !== undefined && <div>Total: <span className="text-gray-800">{m.fields.total} {m.fields.currency || ''}</span></div>}
                  {m.fields.dueDate && <div>Due: <span className="text-gray-800">{new Date(m.fields.dueDate).toLocaleDateString()}</span></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


