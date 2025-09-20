'use client';

import React from 'react';

type Props = {
  onOpenCommand: () => void;
  onUploadClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenInbox: () => void;
  unread: number;
  onOpenSettings: () => void;
};

export function Header({ onOpenCommand, onUploadClick, onOpenInbox, unread, onOpenSettings }: Props) {
  return (
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
        <button onClick={onOpenCommand} className="text-sm text-gray-700 hover:text-gray-900">⌘K</button>
        <input id="ws-hidden-file" type="file" className="hidden" onChange={onUploadClick as any} />
        <div className="relative">
          <button aria-label="Inbox" onClick={onOpenInbox} className="grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5 7h14"></path><path d="M5 17h14"></path><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
          </button>
          {unread > 0 && <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-[#f1998d] text-[9px] font-semibold text-white">{unread > 9 ? '9+' : unread}</span>}
        </div>
        <button aria-label="Settings" onClick={onOpenSettings} className="grid h-7 w-7 place-items-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 3.6a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8c0 .23.03.45.09.67A1.65 1.65 0 0 0 22 10h0a2 2 0 1 1 0 4h0a1.65 1.65 0 0 0-1.6 1z"/></svg>
        </button>
      </div>
    </header>
  );
}


