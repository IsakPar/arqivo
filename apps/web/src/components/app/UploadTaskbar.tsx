'use client';

import React from 'react';

type Task = { name: string; progress: number; done: boolean; aborter: AbortController };

type Props = {
  visible: boolean;
  tasks: Task[];
  uploadDone: number;
  uploadTotal: number;
  onCancel: (index: number) => void;
};

export function UploadTaskbar({ visible, tasks, uploadDone, uploadTotal, onCancel }: Props) {
  if (!visible) return null;
  return (
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
                <button className="text-[11px] text-gray-600 hover:text-gray-900" onClick={() => onCancel(i)}>Cancel</button>
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
  );
}


