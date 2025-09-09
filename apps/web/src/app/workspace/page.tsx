"use client";
import { useCallback, useEffect, useState } from 'react';
import { deleteDocument, getBlob, listDocuments } from '../../lib/api';
import { aesGcmDecrypt, getOrCreateVaultKey } from '../../lib/crypto';
import { useAuth } from '@clerk/nextjs';
import { encryptAndUploadFile } from '../../lib/workspace';
import { LocalDb } from '../../lib/localdb';

export default function WorkspacePage() {
  const [docs, setDocs] = useState<Array<{ id: string; sizeBytes: number; region: 'us'|'eu'; createdAt: string }>>([]);
  const [sort, setSort] = useState<{ key: 'name'|'size'|'date'; dir: 'asc'|'desc' }>(() => {
    try {
      const raw = localStorage.getItem('ws_sort');
      if (raw) return JSON.parse(raw);
    } catch {}
    return { key: 'date', dir: 'desc' };
  });
  const [cursor, setCursor] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken?.();
      let list = await listDocuments(token || undefined);
      list = list.sort((a, b) => {
        if (sort.key === 'name') return sort.dir === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
        if (sort.key === 'size') return sort.dir === 'asc' ? a.sizeBytes - b.sizeBytes : b.sizeBytes - a.sizeBytes;
        const ad = new Date(a.createdAt).getTime();
        const bd = new Date(b.createdAt).getTime();
        return sort.dir === 'asc' ? ad - bd : bd - ad;
      });
      setDocs(list);
    } finally {
      setLoading(false);
    }
  }, [getToken, sort.key, sort.dir]);

  useEffect(() => { try { localStorage.setItem('ws_sort', JSON.stringify(sort)); } catch {} ; void refresh(); }, [sort, refresh]);
  useEffect(() => {
    function onReq() { void refresh(); }
    window.addEventListener('arqivo:refresh-docs', onReq as any);
    return () => window.removeEventListener('arqivo:refresh-docs', onReq as any);
  }, [refresh]);

  async function onDownload(id: string, region: 'us'|'eu') {
    const token = await getToken?.();
    const packed = await getBlob(id, region, token || undefined);
    const kv = getOrCreateVaultKey();
    const pt = await aesGcmDecrypt(kv, packed);
    const blob = new Blob([pt], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = id;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onDelete(id: string) {
    const token = await getToken?.();
    await deleteDocument(id, token || undefined);
    await refresh();
  }

  const [view, setView] = useState<'list'|'tree'>(() => {
    try { return (localStorage.getItem('ws_view') as any) || 'list'; } catch { return 'list'; }
  });
  useEffect(() => { try { localStorage.setItem('ws_view', view); } catch {} }, [view]);

  // Sync with global header view toggle
  useEffect(() => {
    function onView(e: any) {
      const next = e?.detail === 'tree' ? 'tree' : 'list';
      setView(next);
    }
    window.addEventListener('arqivo:view', onView as any);
    return () => window.removeEventListener('arqivo:view', onView as any);
  }, []);

  function setViewAndEmit(next: 'list'|'tree') {
    setView(next);
    try { window.dispatchEvent(new CustomEvent('arqivo:view', { detail: next })); } catch {}
  }

  // Local search: maintain query and filter docs by LocalDb metadata (best-effort)
  const [q, setQ] = useState('');
  const [localIds, setLocalIds] = useState<string[]>([]);
  const [localFields, setLocalFields] = useState<Record<string, { vendor?: string; tags?: string[] }>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const keys = await LocalDb.listDocuments();
        if (!cancelled) setLocalIds(keys);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const map: Record<string, { vendor?: string; tags?: string[] }> = {};
        for (const id of localIds.slice(0, 200)) {
          const f = await LocalDb.getFields<any>(id);
          if (f) map[id] = { vendor: f.vendor, tags: f.tags };
        }
        if (!cancelled) setLocalFields(map);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [localIds]);
  useEffect(() => {
    function onSearch(e: any) {
      const nq = String(e?.detail?.q || '');
      setQ(nq);
    }
    window.addEventListener('arqivo:search', onSearch as any);
    return () => window.removeEventListener('arqivo:search', onSearch as any);
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="sr-only">Files</h1>
          <div className="ml-auto flex items-center gap-2">
            {/* Mobile view toggle (header has desktop toggle) */}
            <button onClick={() => setViewAndEmit('list')} className={`md:hidden rounded-md border px-2 py-1 text-xs ${view==='list' ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-700'}`}>List</button>
            <button onClick={() => setViewAndEmit('tree')} className={`md:hidden rounded-md border px-2 py-1 text-xs ${view==='tree' ? 'border-gray-900 text-gray-900' : 'border-gray-200 text-gray-700'}`}>Tree</button>
          </div>
        </div>
        {/* Empty state when no docs */}
        {docs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center md:p-16">
            <p className="text-sm text-gray-800">Your workspace is ready.</p>
            <p className="mt-1 text-sm text-gray-600">Drag a file here or press Cmd+U to upload.</p>
          </div>
        )}
      </section>

      <section className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-800">Your documents</h2>
          <div className="flex items-center gap-3">
            <label className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-50">
              <input type="file" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const token = await getToken?.();
                await encryptAndUploadFile(file, 'us', token || undefined);
                await refresh();
                e.currentTarget.value = '';
              }} />
              New…
            </label>
            <button onClick={() => refresh()} className="text-sm text-gray-900 hover:opacity-80">Refresh</button>
          </div>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-gray-600">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No documents yet.</p>
        ) : view === 'tree' ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
            {/* Tree scaffold: group by Year -> Month */}
            {Object.entries(
              docs
              // apply naive filter: if query present, include items whose id or local meta id matches q
              .filter((d) => {
                if (!q) return true;
                const s = q.toLowerCase();
                if (d.id.toLowerCase().includes(s)) return true;
                // if we have a local doc id that matches the file name, treat as match
                return localIds.some((k) => k.toLowerCase().includes(s));
              })
              .reduce((acc: Record<string, Record<string, typeof docs>>, d) => {
                const dt = new Date(d.createdAt);
                const y = String(dt.getFullYear());
                const m = String(dt.getMonth() + 1).padStart(2, '0');
                acc[y] = acc[y] || {};
                acc[y][m] = acc[y][m] || [];
                acc[y][m].push(d);
                return acc;
              }, {})
            ).map(([year, months]) => (
              <div key={year} className="border-b border-gray-100">
                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800">{year}</div>
                {Object.entries(months).map(([month, rows]) => (
                  <div key={month} className="px-3 py-2">
                    <div className="text-xs text-gray-700">{year}-{month}</div>
                    <ul className="mt-1 divide-y divide-gray-100 rounded-md border border-gray-100">
                      {rows.map((d) => (
                        <li key={d.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="truncate text-gray-900">{d.id}</span>
                          <span className="text-gray-600">{(d.sizeBytes/1024).toFixed(1)} KB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-100" onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c+1, docs.length-1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c-1, 0)); }
            if (e.key === 'Enter') { const d = docs[cursor]; if (d) void onDownload(d.id, d.region); }
            if (e.key === 'Backspace' || e.key === 'Delete') { const d = docs[cursor]; if (d) void onDelete(d.id); }
          }} tabIndex={0}>
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 text-left text-xs text-gray-600">
                <tr>
                  <th className="w-7/12 px-3 py-2 font-medium">
                    <button className="flex items-center gap-1" onClick={() => setSort(s => ({ key: 'name', dir: s.key==='name' && s.dir==='asc' ? 'desc' : 'asc' }))}>Name {sort.key==='name' ? (sort.dir==='asc' ? '↑' : '↓') : ''}</button>
                  </th>
                  <th className="w-2/12 px-3 py-2 font-medium">
                    <button className="flex items-center gap-1" onClick={() => setSort(s => ({ key: 'size', dir: s.key==='size' && s.dir==='asc' ? 'desc' : 'asc' }))}>Size {sort.key==='size' ? (sort.dir==='asc' ? '↑' : '↓') : ''}</button>
                  </th>
                  <th className="w-2/12 px-3 py-2 font-medium">
                    <button className="flex items-center gap-1" onClick={() => setSort(s => ({ key: 'date', dir: s.key==='date' && s.dir==='asc' ? 'desc' : 'asc' }))}>Modified {sort.key==='date' ? (sort.dir==='asc' ? '↑' : '↓') : ''}</button>
                  </th>
                  <th className="w-1/12 px-3 py-2 font-medium">Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {docs
                  .filter((d) => {
                    if (!q) return true;
                    const s = q.toLowerCase();
                    if (d.id.toLowerCase().includes(s)) return true;
                    if (localIds.some((k) => k.toLowerCase().includes(s))) return true;
                    const lf = localFields[d.id];
                    if (lf?.vendor && lf.vendor.toLowerCase().includes(s)) return true;
                    if (lf?.tags && lf.tags.some(t => t.toLowerCase().includes(s))) return true;
                    return false;
                  })
                  .map((d, i) => (
                  <tr key={d.id} className={`hover:bg-gray-50 focus-within:bg-gray-50 ${cursor===i ? 'bg-gray-50' : ''}`}>
                    <td className="truncate px-3 py-2 text-gray-900">
                      <div className="truncate">{d.id}</div>
                      {localFields[d.id]?.vendor && (
                        <div className="truncate text-xs text-gray-600">{localFields[d.id]?.vendor}</div>
                      )}
                      {localFields[d.id]?.tags && localFields[d.id]!.tags!.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {localFields[d.id]!.tags!.slice(0, 4).map((t, idx) => (
                            <span key={idx} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{(d.sizeBytes/1024).toFixed(1)} KB</td>
                    <td className="px-3 py-2 text-gray-700">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-gray-700">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
