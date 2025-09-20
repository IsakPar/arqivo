'use client';

import React from 'react';

type Props = {
  open: boolean;
  onSelect?: (id: 'all' | 'recents' | 'shared') => void;
};

export function Sidebar({ open, onSelect }: Props) {
  return (
    <aside aria-label="Sidebar" className={`sticky top-12 ${open ? 'md:flex' : 'md:hidden'} hidden h-[calc(100vh-48px)] flex-col border-r border-gray-100 bg-white/60 p-3`}> 
      <div className="text-xs font-medium text-gray-700">Files</div>
      <div className="mt-3 space-y-1 text-sm">
        <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100" onClick={() => onSelect?.('all')}>All documents</button>
        <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100" onClick={() => onSelect?.('recents')}>Recents</button>
        <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100" onClick={() => onSelect?.('shared')}>Shared with me</button>
      </div>
      <div className="mt-auto rounded-md border border-gray-100 p-2 text-xs text-gray-600">Storage: coming soon</div>
    </aside>
  );
}


