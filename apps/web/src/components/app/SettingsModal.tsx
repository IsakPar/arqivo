'use client';

import React from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  theme: 'system' | 'light' | 'dark';
  setTheme: (t: 'system' | 'light' | 'dark') => void;
  digest: boolean;
  setDigest: (v: boolean) => void;
};

export function SettingsModal({ open, onClose, sidebarOpen, setSidebarOpen, theme, setTheme, digest, setDigest }: Props) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[110] grid place-items-start bg-black/10 p-4" onClick={onClose}>
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-100 p-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">Workspace Settings</div>
          <div className="flex items-center gap-2">
            <a href="/workspace/settings" className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50">Open full settings</a>
            <button onClick={onClose} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50">Close</button>
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
            <div className="mt-1 text-xs text-gray-600">Customize in full settings → Hotkeys tab (coming soon).</div>
          </div>
        </div>
      </div>
    </div>
  );
}


