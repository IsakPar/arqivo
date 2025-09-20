'use client';

import React from 'react';
import { TreeCanvas, type TreeDataNode, type TreeEdge } from '../TreeCanvas';
import { ZERO_ID, getChildren, decodeName, createLabel, addEdge, getAncestors, removeEdge, moveLabel, getParents, renameLabel } from '../../lib/taxonomy';

type NodeMap = Map<string, TreeDataNode>;

export default function LabelTree() {
  const [root, setRoot] = React.useState<TreeDataNode>({ id: 'root', name: 'Workspace', type: 'folder', children: [] });
  const [activePath, setActivePath] = React.useState<string[]>(['root']);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [ancestors, setAncestors] = React.useState<string[]>([]);
  const [renameText, setRenameText] = React.useState('');

  const nodesRef = React.useRef<NodeMap>(new Map([['root', root]]));

  async function loadChildren(parentId: string, treeParentId: string) {
    const kids = await getChildren(parentId === 'root' ? ZERO_ID : parentId, undefined);
    const current = nodesRef.current.get(treeParentId);
    if (!current) return;
    current.children = kids.map((k) => ({ id: k.id, name: decodeName(k.name), type: 'folder', children: [] }));
    for (const c of current.children) nodesRef.current.set(c.id, c);
    setRoot({ ...nodesRef.current.get('root')! });
    void refreshDashedEdges();
  }

  React.useEffect(() => { void loadChildren('root', 'root'); }, []);

  function onNodeClick(id: string) {
    setActivePath((p) => (p.includes(id) ? p.slice(0, p.indexOf(id) + 1) : [...p, id]));
    void loadChildren(id, id);
    setSelectedId(id);
    void fetchAnc(id);
    void refreshDashedEdges();
    const n = nodesRef.current.get(id);
    setRenameText(n?.name || '');
  }

  async function fetchAnc(id: string) {
    const list = await getAncestors(id === 'root' ? ZERO_ID : id, undefined);
    setAncestors(list);
  }

  const [dashed, setDashed] = React.useState<TreeEdge[]>([]);

  // After loading children, try to draw dashed edges from visible parents
  async function refreshDashedEdges() {
    const visibleIds = new Set<string>();
    for (const [id] of nodesRef.current) visibleIds.add(id);
    const edges: TreeEdge[] = [];
    // Fetch parents for visible nodes (skip root)
    const ids = Array.from(visibleIds).filter((id) => id !== 'root');
    for (const id of ids) {
      try {
        const parents = await getParents(id === 'root' ? ZERO_ID : id, undefined);
        for (const p of parents) {
          // Only draw if both endpoints are visible on canvas
          if (visibleIds.has(p)) edges.push({ from: p, to: id });
        }
      } catch {}
    }
    setDashed(edges);
  }

  return (
    <div className="relative h-[520px] w-full grid grid-cols-1 gap-4 md:grid-cols-[1fr,280px]">
      <div>
        <div className="mb-2 flex items-center gap-2">
        <button
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 hover:bg-gray-50"
          onClick={async () => {
            // Temporary: create a placeholder label under root
            const name: any = { data: btoa('placeholder'), nonce: btoa('n'), tag: btoa('t') };
            const id = await createLabel(name, 'PLACEHOLDER-SLUGTOKEN-BASE32-EXAMPLE-AAAAAAAAAA', undefined);
            await addEdge(id, activePath[activePath.length - 1] === 'root' ? ZERO_ID : activePath[activePath.length - 1], undefined);
            await loadChildren(activePath[activePath.length - 1], activePath[activePath.length - 1]);
          }}
        >
          + Label (demo)
        </button>
        </div>
        <TreeCanvas root={root} activePathIds={activePath} secondaryEdges={dashed} onNodeClick={onNodeClick} />
      </div>
      <aside className="rounded-lg border border-gray-100 bg-white p-3">
        <div className="text-xs font-semibold text-gray-900">Details</div>
        {!selectedId && <div className="mt-2 text-xs text-gray-600">Select a node to see details.</div>}
        {selectedId && (
          <div className="mt-2 space-y-2 text-xs">
            <div><span className="font-medium text-gray-900">ID:</span> {selectedId}</div>
            <div>
              <div className="font-medium text-gray-900">Name</div>
              <div className="mt-1 flex items-center gap-2">
                <input value={renameText} onChange={(e) => setRenameText(e.target.value)} className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs" />
                <button
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 hover:bg-gray-50"
                  onClick={async () => {
                    if (!selectedId) return;
                    // Demo: encode plaintext as fake cipher; slug unchanged
                    const name: any = { data: btoa(renameText || 'unnamed'), nonce: btoa('n'), tag: btoa('t') };
                    try { await renameLabel(selectedId === 'root' ? ZERO_ID : selectedId, name, undefined, undefined); } catch {}
                    const node = nodesRef.current.get(selectedId);
                    if (node) { node.name = renameText; setRoot({ ...nodesRef.current.get('root')! }); }
                  }}
                >Save</button>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-900">Explain why</div>
              <ul className="mt-1 list-disc pl-4 text-gray-700">
                <li>Deterministic labels; encrypted names resolved client‑side</li>
                <li>Multi‑parent DAG; closure table for fast traversal</li>
                <li>Sibling uniqueness via slug token</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-gray-900">Ancestors</div>
              <ul className="mt-1 list-disc pl-4 text-gray-700">
                {ancestors.length === 0 && <li>—</li>}
                {ancestors.map(a => (<li key={a} className="break-all">{a}</li>))}
              </ul>
            </div>
            <div className="pt-2">
              <button
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 hover:bg-gray-50"
                onClick={async () => {
                  // Demo detach from current parent (if not root)
                  if (activePath.length < 2) return;
                  const child = selectedId;
                  const parent = activePath[activePath.length - 2];
                  try { await removeEdge(child, parent === 'root' ? ZERO_ID : parent, undefined); } catch {}
                  await loadChildren(parent, parent);
                }}
              >Detach (demo)</button>
              <button
                className="ml-2 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-900 hover:bg-gray-50"
                onClick={async () => {
                  // Demo move to root
                  const from = ancestors.length ? [ancestors[ancestors.length - 1]] : [];
                  try { await moveLabel(selectedId === 'root' ? ZERO_ID : selectedId, from, ZERO_ID, undefined); } catch {}
                  await loadChildren('root', 'root');
                }}
              >Move to root (demo)</button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}


