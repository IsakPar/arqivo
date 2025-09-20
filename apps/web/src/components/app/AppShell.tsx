'use client';

import React from 'react';
import { useCommandPalette } from './CommandPalette';
import { useAuth } from '@clerk/nextjs';
import { encryptAndUploadFile } from '../../lib/workspace';
import { Inbox } from './Inbox';
import { SettingsModal } from './SettingsModal';
import { useHotkeys } from '../../hooks/useHotkeys';
import { searchIndex, indexFileName } from '../../lib/localdb';
import { CmdFOverlay } from './CmdFOverlay';
import { UploadTaskbar } from './UploadTaskbar';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

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

  useHotkeys({
    openInbox: () => setInboxOpen(o => !o),
    openSearch: () => { setSearchOpen(true); setSearchQuery(''); setSearchResults([]); },
    openSettings: () => setSettingsOpen(true),
    openCommand: () => { setOpen(true); setQ(''); },
    uploadFile: () => { const input = document.getElementById('ws-hidden-file') as HTMLInputElement | null; input?.click(); },
  });

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
      <Header
        onOpenCommand={() => { setOpen(true); setQ(''); }}
        onUploadClick={onHiddenFileChange}
        onOpenInbox={() => setInboxOpen(true)}
        unread={unread}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Body: left rail, contextual sidebar, main content */}
      <div className={`grid w-full gap-0`} style={{ gridTemplateColumns: `${sidebarOpen ? 'minmax(0,240px)' : 'minmax(0,0px)'} minmax(0,1fr)` }}>

        {/* Contextual sidebar */}
        <Sidebar open={sidebarOpen} />

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
      <CmdFOverlay open={searchOpen} query={searchQuery} results={searchResults} onClose={() => setSearchOpen(false)} onQueryChange={(v) => setSearchQuery(v)} />
      {/* Upload taskbar */}
      <UploadTaskbar
        visible={uploading || tasks.length > 0}
        tasks={tasks}
        uploadDone={uploadDone}
        uploadTotal={uploadTotal}
        onCancel={(i) => { try { tasks[i]?.aborter.abort(); } catch {} setTasks(prev => prev.filter((_, idx) => idx !== i)); }}
      />
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
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
        setTheme={setTheme}
        digest={digest}
        setDigest={setDigest}
      />
    </div>
  );
}


