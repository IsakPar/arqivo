'use client';

import React from 'react';
import { useCommandPalette } from './CommandPalette';
import { useAuth } from '@clerk/nextjs';
import { encryptAndUploadFile } from '../../lib/workspace';
import { Inbox } from './Inbox';
import { searchIndex, indexFileName } from '../../lib/localdb';

type Props = { children: React.ReactNode };

export function AppShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<'system' | 'light' | 'dark'>('system');
  const [digest, setDigest] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadTotal, setUploadTotal] = React.useState(0);
  const [uploadDone, setUploadDone] = React.useState(0);
  const MAX_FILES_PER_BATCH = 10;

  React.useEffect(() => {
    try { const v = localStorage.getItem('ws_sidebar'); if (v) setSidebarOpen(v === '1'); } catch {}
    try { const t = localStorage.getItem('theme'); if (t === 'light' || t === 'dark' || t === 'system') setTheme(t); } catch {}
    try { const d = localStorage.getItem('notif_digest'); if (d) setDigest(d === '1'); } catch {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem('ws_sidebar', sidebarOpen ? '1' : '0'); } catch {}
  }, [sidebarOpen]);
  React.useEffect(() => {
    try { localStorage.setItem('theme', theme); } catch {}
    try {
      const root = document.documentElement;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
      root.classList.toggle('dark', isDark);
      root.setAttribute('data-theme', theme);
    } catch {}
  }, [theme]);
  React.useEffect(() => {
    try { localStorage.setItem('notif_digest', digest ? '1' : '0'); } catch {}
  }, [digest]);

  function onDragEnter(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); setDragging(false); }

  type Task = { name: string; progress: number; done: boolean; aborter: AbortController };
  const [tasks, setTasks] = React.useState<Task[]>([]);

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const slice = arr.slice(0, MAX_FILES_PER_BATCH);
    setUploading(true);
    setUploadTotal(slice.length);
    setUploadDone(0);
    setTasks(slice.map(f => ({ name: f.name, progress: 0, done: false, aborter: new AbortController() })));
    try {
      const token = await getToken?.();
      for (let i = 0; i < slice.length; i++) {
        const idx = i;
        const f = slice[i];
        const result = await encryptAndUploadFile(f, 'us', token || undefined, (p, phase) => {
          setTasks((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], progress: p, done: p >= 1 };
            return next;
          });
          if (p >= 1) {
            try {
              window.dispatchEvent(new CustomEvent('arqivo:inbox', { detail: { title: 'Document indexed', body: `Extracted fields for ${f.name}. Suggest reminders for expiry/payment.`, ts: Date.now() } }));
            } catch {}
          }
        }, tasks[idx].aborter);
        // Index filename locally for Cmd+F recall
        try { await indexFileName(result.id, f.name); } catch {}
        setUploadDone(i + 1);
      }
      // notify list to refresh
      try { window.dispatchEvent(new CustomEvent('arqivo:refresh-docs')); } catch {}
    } finally {
      setUploading(false);
      setDragging(false);
    }
  }

  const { getToken } = useAuth();
  const [inboxOpen, setInboxOpen] = React.useState(false);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem('inbox_unread');
      if (v) setUnread(Number(v) || 0);
    } catch {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem('inbox_unread', String(unread)); } catch {}
  }, [unread]);
  const { Modal, setOpen, setQ } = useCommandPalette([
    { id: 'upload', label: 'Upload file…', shortcut: '⌘U', run: async () => {
      // trigger hidden file input via synthetic click
      const input = document.getElementById('ws-hidden-file') as HTMLInputElement | null;
      input?.click();
    }},
    { id: 'settings', label: 'Open Settings', shortcut: '⌘,', run: () => { setSettingsOpen(true); }},
    { id: 'inbox', label: 'Open Inbox', shortcut: '⌘I', run: () => { setInboxOpen(true); }},
  ]);

  async function onHiddenFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadFiles(e.target.files);
    e.currentTarget.value = '';
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') { e.preventDefault(); setInboxOpen(o => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); setSearchOpen(true); setSearchQuery(''); setSearchResults([]); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Cmd+F overlay
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Array<{ id: string; name?: string; excerpt?: string }>>([]);
  React.useEffect(() => {
    const t = setTimeout(async () => {
      if (!searchOpen) return;
      const q = searchQuery.trim();
      if (!q) { setSearchResults([]); return; }
      const res = await searchIndex(q);
      setSearchResults(res);
    }, 180);
    return () => clearTimeout(t);
  }, [searchQuery, searchOpen]);

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr] bg-white" onDragEnter={onDragEnter}>
      {/* Global header */}
      <header className="z-40 flex h-12 items-center gap-3 border-b border-gray-100 bg-white/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gray-900" aria-hidden />
          <span className="text-sm font-semibold text-gray-900">Arqivo</span>
        </div>
        <div className="mx-3 h-5 w-px bg-gray-200" aria-hidden />
        <div className="flex-1">
          <input
            aria-label="Search"
            placeholder="Search workspace"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-300"
          />
        </div>
        <div className="ml-3 flex items-center gap-3">
          <button onClick={() => { setOpen(true); setQ(''); }} className="text-sm text-gray-700 hover:text-gray-900">⌘K</button>
          <input id="ws-hidden-file" type="file" className="hidden" onChange={onHiddenFileChange} />
          <div className="relative">
            <button aria-label="Inbox" onClick={() => setInboxOpen(true)} className="grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5 7h14"></path><path d="M5 17h14"></path><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
            </button>
            {/* Unread badge */}
            {unread > 0 && <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-[#f1998d] text-[9px] font-semibold text-white">{unread > 9 ? '9+' : unread}</span>}
          </div>
          <button aria-label="Settings" onClick={() => setSettingsOpen(true)} className="grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8c0 .23.03.45.09.67A1.65 1.65 0 0 0 22 10h0a2 2 0 1 1 0 4h0a1.65 1.65 0 0 0-1.6 1z"/></svg>
          </button>
        </div>
      </header>

      {/* Body: left rail, contextual sidebar, main content */}
      <div className={`grid w-full gap-0`} style={{ gridTemplateColumns: `${sidebarOpen ? 'minmax(0,240px)' : 'minmax(0,0px)'} minmax(0,1fr)` }}>

        {/* Contextual sidebar */}
        <aside aria-label="Sidebar" className={`sticky top-12 ${sidebarOpen ? 'md:flex' : 'md:hidden'} hidden h-[calc(100vh-48px)] flex-col border-r border-gray-100 bg-white/60 p-3`}>
          <div className="text-xs font-medium text-gray-700">Files</div>
          <div className="mt-3 space-y-1 text-sm">
            <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100">All documents</button>
            <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100">Recents</button>
            <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100">Shared with me</button>
          </div>
          <div className="mt-auto rounded-md border border-gray-100 p-2 text-xs text-gray-600">Storage: coming soon</div>
        </aside>

        {/* Main content */}
        <section aria-label="Content" className="relative min-h-[calc(100vh-48px)] min-w-0 bg-white px-4 py-6" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer?.files?.length) void uploadFiles(e.dataTransfer.files); }}>
          {/* Collapse control */}
          <button aria-label="Toggle sidebar" onClick={() => setSidebarOpen(v => !v)} className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
            {sidebarOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </button>
          {children}
          {/* DnD overlay */}
          {(dragging || uploading) && (
            <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-dashed border-gray-300 bg-white/70" />
          )}
        </section>
      </div>
      {/* Cmd+F Overlay */}
      {searchOpen && (
        <div role="dialog" aria-modal className="fixed inset-0 z-[100] grid place-items-start bg-black/10 p-4" onClick={() => setSearchOpen(false)}>
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-100 p-3">
              <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search local index…" className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none" />
            </div>
            <ul className="max-h-64 overflow-auto p-2">
              {searchResults.length === 0 && <li className="px-2 py-3 text-sm text-gray-600">No results</li>}
              {searchResults.map(r => (
                <li key={r.id} className="px-3 py-2 text-sm hover:bg-gray-50">
                  <div className="font-medium text-gray-900">{r.name || r.id}</div>
                  {r.excerpt && <div className="text-xs text-gray-600">…{r.excerpt}…</div>}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-600">
              <div>Local-only. Press Esc to close.</div>
              <button onClick={() => setSearchOpen(false)} className="rounded-md border border-gray-200 bg-white px-2 py-1 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Upload taskbar */}
      {(uploading || tasks.length > 0) && (
        <div className="fixed bottom-4 right-4 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <div className="text-xs font-semibold text-gray-900">Uploads</div>
            <div className="text-xs text-gray-600">{uploadDone}/{uploadTotal}</div>
          </div>
          <div className="max-h-64 space-y-2 overflow-auto p-3">
            {tasks.map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs text-gray-800">{t.name}</div>
                  {!t.done && (
                    <button className="text-[11px] text-gray-600 hover:text-gray-900" onClick={() => { try { t.aborter.abort(); } catch {} setTasks(prev => prev.filter((_, idx) => idx !== i)); }}>Cancel</button>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded bg-gray-100">
                  <div className="h-1.5 bg-gray-900" style={{ width: `${Math.round(t.progress * 100)}%` }} />
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-xs text-gray-600">No tasks</div>}
          </div>
        </div>
      )}
      <footer className="flex items-center justify-between border-t border-gray-100 bg-white/80 px-4 py-2 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <a href="/status" className="hover:text-gray-900">Status</a>
          <a href="/security" className="hover:text-gray-900">Security</a>
          <button onClick={() => { setOpen(true); setQ(''); }} className="hover:text-gray-900">Command (⌘K)</button>
        </div>
        <div>Arqivo</div>
      </footer>
      <Modal />
      <Inbox open={inboxOpen} onClose={() => setInboxOpen(false)} onUnreadChange={(n) => setUnread(n)} />
      {settingsOpen && (
        <div role="dialog" aria-modal className="fixed inset-0 z-[110] grid place-items-start bg-black/10 p-4" onClick={() => setSettingsOpen(false)}>
          <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-100 p-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Workspace Settings</div>
              <div className="flex items-center gap-2">
                <a href="/workspace/settings" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50">Open full settings</a>
                <button onClick={() => setSettingsOpen(false)} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50">Close</button>
              </div>
            </div>
            <div className="p-4 space-y-4 text-sm text-gray-800">
              <div>
                <div className="font-medium text-gray-900">Default view</div>
                <div className="mt-1 text-xs text-gray-600">Choose how to browse your documents by default.</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => { try { localStorage.setItem('view','list'); } catch {} window.dispatchEvent(new CustomEvent('arqivo:view', { detail: 'list' })); }} className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">List</button>
                  <button onClick={() => { try { localStorage.setItem('view','tree'); } catch {} window.dispatchEvent(new CustomEvent('arqivo:view', { detail: 'tree' })); }} className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50">Tree</button>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Appearance</div>
                <div className="mt-1 text-xs text-gray-600">Theme preference for this device.</div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input type="radio" name="theme" checked={theme==='system'} onChange={() => setTheme('system')} /> System
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input type="radio" name="theme" checked={theme==='light'} onChange={() => setTheme('light')} /> Light
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs">
                    <input type="radio" name="theme" checked={theme==='dark'} onChange={() => setTheme('dark')} /> Dark
                  </label>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Sidebar</div>
                <div className="mt-1 text-xs text-gray-600">Show or hide the left sidebar by default.</div>
                <div className="mt-2 flex items-center gap-2">
                  <input id="sbdef" type="checkbox" checked={sidebarOpen} onChange={(e) => setSidebarOpen(e.target.checked)} />
                  <label htmlFor="sbdef">Sidebar open</label>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Notifications</div>
                <div className="mt-1 text-xs text-gray-600">Email a daily digest of important items (e.g., upcoming warranties).</div>
                <div className="mt-2 flex items-center gap-2">
                  <input id="digest" type="checkbox" checked={digest} onChange={(e) => setDigest(e.target.checked)} />
                  <label htmlFor="digest">Daily digest</label>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Hotkeys</div>
                <div className="mt-1 text-xs text-gray-600">Quick actions available in this workspace.</div>
                <ul className="mt-2 space-y-1 text-xs text-gray-700">
                  <li><span className="font-medium text-gray-900">⌘K</span> — Command palette</li>
                  <li><span className="font-medium text-gray-900">⌘F</span> — Local search overlay</li>
                  <li><span className="font-medium text-gray-900">⌘U</span> — Upload file</li>
                  <li><span className="font-medium text-gray-900">⌘,</span> — Open settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


