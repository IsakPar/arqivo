'use client';

import React from 'react';
import { TreeCanvas, type TreeDataNode, type TreeEdge } from './TreeCanvas';

type PanelReason = { rule: string; value: string; confidence: 'High' | 'Medium' | 'Low' };
type PanelAction = { type: string; when?: string; target?: string; note?: string };
type PanelData = { title: string; subtitle?: string; path: string[]; also?: string[]; reasons: PanelReason[]; actions: PanelAction[] };

type Scene = { panel: PanelData; path: string[]; dwellMs?: number };

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);
  return reduced;
}

// Build the requested "Freelance Designer" demo structure
function buildFreelanceDemo(): { tree: TreeDataNode; dashed: TreeEdge[]; scenes: { path: string[]; dwellMs?: number }[]; panel: PanelData } {
  const root: TreeDataNode = { id: 'root', name: 'Workspace', type: 'folder', children: [] };
  const clients: TreeDataNode = { id: 'clients', name: 'Clients', type: 'folder', children: [] };
  const finances: TreeDataNode = { id: 'finances', name: 'Finances', type: 'folder', children: [] };
  const legal: TreeDataNode = { id: 'legal', name: 'Legal', type: 'folder', children: [] };
  root.children = [clients, finances, legal];

  // Clients (multiple)
  const globe: TreeDataNode = { id: 'globe', name: 'Globe', type: 'folder', children: [] };
  const nova: TreeDataNode = { id: 'nova', name: 'Nova Retail', type: 'folder', children: [] };
  const apex: TreeDataNode = { id: 'apex', name: 'Apex Labs', type: 'folder', children: [] };
  clients.children!.push(globe, nova, apex);

  const invoices: TreeDataNode = { id: 'invoices', name: 'Invoices', type: 'folder', children: [] };
  const y2025: TreeDataNode = { id: 'y2025', name: '2025', type: 'folder', children: [] };
  finances.children!.push(invoices);
  invoices.children!.push(y2025);

  const fileId = 'file:invoice_globe_july';
  const file: TreeDataNode = { id: fileId, name: 'Invoice_Globe_July.pdf', type: 'file' };
  y2025.children!.push(file);

  // Legal structure (contracts)
  const contracts: TreeDataNode = { id: 'contracts', name: 'Contracts', type: 'folder', children: [] };
  const msas: TreeDataNode = { id: 'msas', name: 'MSAs', type: 'folder', children: [] };
  const ndas: TreeDataNode = { id: 'ndas', name: 'NDAs', type: 'folder', children: [] };
  const sows: TreeDataNode = { id: 'sows', name: 'SOWs', type: 'folder', children: [] };
  legal.children!.push(contracts);
  contracts.children = [msas, ndas, sows];
  const globeSow: TreeDataNode = { id: 'globe-sow-2025', name: 'Globe SOW 2025', type: 'folder', children: [] };
  sows.children!.push(globeSow);

  const dashed: TreeEdge[] = [ { from: globe.id, to: file.id }, { from: globeSow.id, to: file.id } ];

  const panel: PanelData = {
    title: 'Invoice_Globe_July.pdf',
    subtitle: 'Smart Alias: Globe Invoice (July 2025)',
    path: ['Finances','Invoices','2025'],
    also: ['Clients › Globe','Legal › Contracts › SOWs › Globe SOW 2025'],
    reasons: [
      { rule: 'Vendor recognized', value: 'Globe (Client)', confidence: 'High' },
      { rule: 'Type', value: 'Invoice', confidence: 'High' },
      { rule: 'Dated', value: 'July 2025', confidence: 'Medium' },
      { rule: 'Linked to SOW', value: 'Globe SOW 2025', confidence: 'High' },
    ],
    actions: [ { type: 'Due date detected', when: '2025-08-15', note: 'Local reminder can be suggested' } ],
  };

  const scenes = [
    { path: ['root','finances','invoices','y2025', fileId], dwellMs: 380 },
    { path: ['root','clients','globe', fileId], dwellMs: 380 },
    { path: ['root','legal','contracts','sows','globe-sow-2025', fileId], dwellMs: 380 },
  ];

  return { tree: root, dashed, scenes, panel };
}

// Build data for the demo
const built = buildFreelanceDemo();
const treeData = built.tree;
const dashed = built.dashed;
const scenes: Scene[] = built.scenes.map((s, i) => ({ panel: built.panel, path: s.path, dwellMs: s.dwellMs ?? (360 + i * 20) }));

export function LandingTreeShowcase() {
  const reducedMotion = useReducedMotion();
  const [sceneIdx, setSceneIdx] = React.useState<number>(0);
  const [panelData, setPanelData] = React.useState<PanelData>(scenes[0].panel);
  const [activePath, setActivePath] = React.useState<string[]>(scenes[0].path.slice(0, 1));

  const timeoutsRef = React.useRef<number[]>([]);
  const clearAllTimeouts = React.useCallback(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const runScene = React.useCallback((idx: number) => {
    const scene = scenes[idx];
    setPanelData(scene.panel);
    setActivePath([scene.path[0]]);
    let acc = 300;
    for (let i = 1; i < scene.path.length; i++) {
      const t = window.setTimeout(() => {
        setActivePath(scene.path.slice(0, i + 1));
      }, acc);
      timeoutsRef.current.push(t);
      acc += scene.dwellMs ?? 350;
    }
    const endT = window.setTimeout(() => {
      setSceneIdx((s) => (s + 1) % scenes.length);
    }, acc + 900);
    timeoutsRef.current.push(endT);
  }, []);

  React.useEffect(() => {
    clearAllTimeouts();
    if (reducedMotion) {
      // Show first scene statically
      setPanelData(scenes[0].panel);
      setActivePath(scenes[0].path);
      return;
    }
    runScene(sceneIdx);
    return clearAllTimeouts;
  }, [sceneIdx, reducedMotion, runScene, clearAllTimeouts]);

  return (
    <section aria-labelledby="tree-demo" className="relative mx-auto w-full max-w-6xl px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white/70 p-6 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Smart Tree View</div>
            <h2 id="tree-demo" className="text-xl font-semibold text-gray-900">Your files, as a living tree.</h2>
            <p className="mt-1 text-sm text-gray-700">Not a mockup. A real folder tree built from encrypted labels—multi‑parent, deterministic, explainable.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <div className="md:w-1/2">
            <div className="relative mt-2 h-[420px] w-full rounded-md border border-gray-100 p-2">
              <TreeCanvas root={treeData} activePathIds={activePath} secondaryEdges={dashed} />
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-lg border border-gray-100 p-4" aria-live="polite">
              <div className="text-sm font-medium text-gray-900">{panelData.title}</div>
              {panelData.subtitle && (
                <div className="text-xs text-gray-600">{panelData.subtitle}</div>
              )}
              <div className="mt-2 text-xs text-gray-700">
                <div className="mb-2 grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="font-medium text-gray-900">Path</div>
                    <div>{panelData.path.join(' › ')}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Encryption</div>
                    <div>Label names are E2EE on your device; server stores ciphertext + slug token only.</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="font-medium text-gray-900">Why it’s here</div>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {panelData.reasons.map((r, i) => (
                      <li key={i}>
                        <span className="text-gray-900">{r.rule}:</span> {r.value} <span className="text-gray-500">({r.confidence})</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <div className="font-medium text-gray-900">What happens next</div>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {panelData.actions.map((a, i) => (
                      <li key={i}>
                        <span className="text-gray-900">{a.type}</span>
                        {a.when ? <> — {a.when}</> : null}
                        {a.target ? <> → {a.target}</> : null}
                        {a.note ? <> · {a.note}</> : null}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3">
                  <a href="/how-it-works#tree" className="text-coral-600 underline underline-offset-2">See how the taxonomy works →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
