'use client';

import React from 'react';

type Props = {
  open: boolean;
};

export function Sidebar({ open }: Props) {
  return (
    <aside aria-label="Sidebar" className={`sticky top-12 ${open ? 'md:flex' : 'md:hidden'} hidden h-[calc(100vh-48px)] flex-col border-r border-gray-100 bg-white/60 p-3`}> 
      <div className="text-xs font-medium text-gray-700">Files</div>
      <div className="mt-3 space-y-1 text-sm">
        <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100">All documents</button>
        <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100">Recents</button>
        <button className="w-full rounded-md px-2 py-1.5 text-left text-gray-800 hover:bg-gray-100">Shared with me</button>
      </div>
      <div className="mt-auto rounded-md border border-gray-100 p-2 text-xs text-gray-600">Storage: coming soon</div>
    </aside>
  );
}


