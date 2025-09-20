'use client';

import React from 'react';

export type TreeDataNode = {
  id: string;
  name: string;
  type?: 'folder' | 'file';
  children?: TreeDataNode[];
};

export type TreeEdge = { from: string; to: string };

type TreeCanvasProps = {
  root: TreeDataNode;
  activePathIds?: string[];
  secondaryEdges?: TreeEdge[]; // dashed edges (e.g., multi-parent)
  onNodeClick?: (id: string) => void;
  onLayout?: (
    positions: Map<string, { x: number; y: number }>,
    size: { width: number; height: number }
  ) => void;
  className?: string;
  style?: React.CSSProperties;
};

// Compute total leaf count (used to size horizontal space)
function countLeaves(node: TreeDataNode): number {
  if (!node.children || node.children.length === 0) return 1;
  let sum = 0;
  for (const c of node.children) sum += countLeaves(c);
  return sum;
}

function maxDepth(node: TreeDataNode, depth = 0): number {
  if (!node.children || node.children.length === 0) return depth;
  let d = depth;
  for (const c of node.children) d = Math.max(d, maxDepth(c, depth + 1));
  return d;
}

export function TreeCanvas({
  root,
  activePathIds,
  secondaryEdges,
  onNodeClick,
  onLayout,
  className,
  style,
}: TreeCanvasProps) {
  const leafs = React.useMemo(() => countLeaves(root), [root]);
  const depth = React.useMemo(() => maxDepth(root, 0), [root]);

  const hUnit = 120; // horizontal spacing per leaf
  const vGap = 110; // vertical gap between levels
  const margin = 24;

  const width = leafs * hUnit + margin * 2;
  const height = (depth + 1) * vGap + margin * 2;

  const pos = React.useMemo(() => new Map<string, { x: number; y: number }>(), [root]);

  // Assign positions based on leaf distribution
  const assignPositions = React.useCallback(
    (node: TreeDataNode, leftUnit: number, level: number) => {
      const sub = countLeaves(node);
      const centerUnit = leftUnit + sub / 2;
      const x = margin + centerUnit * hUnit;
      const y = margin + level * vGap;
      pos.set(node.id, { x, y });
      if (node.children && node.children.length > 0) {
        let cursor = leftUnit;
        for (const c of node.children) {
          const w = countLeaves(c);
          assignPositions(c, cursor, level + 1);
          cursor += w;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [root]
  );

  React.useMemo(() => {
    assignPositions(root, 0, 0);
    return pos;
  }, [root, assignPositions, pos]);

  React.useEffect(() => {
    if (onLayout) onLayout(pos, { width, height });
  }, [onLayout, pos, width, height]);

  const activeSet = React.useMemo(() => new Set(activePathIds ?? []), [activePathIds]);

  function eachEdge(cb: (parent: TreeDataNode, child: TreeDataNode) => void) {
    function walk(n: TreeDataNode) {
      if (!n.children) return;
      for (const c of n.children) {
        cb(n, c);
        walk(c);
      }
    }
    walk(root);
  }

  const edges: Array<{ from: { x: number; y: number; id: string }; to: { x: number; y: number; id: string } }> = [];
  eachEdge((p, c) => {
    const pp = pos.get(p.id);
    const cp = pos.get(c.id);
    if (pp && cp) edges.push({ from: { ...pp, id: p.id }, to: { ...cp, id: c.id } });
  });

  function edgePath(x1: number, y1: number, x2: number, y2: number): string {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1 + 16} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2 - 16}`;
  }

  function isActiveEdge(fromId: string, toId: string): boolean {
    if (!activePathIds || activePathIds.length < 2) return false;
    for (let i = 0; i < activePathIds.length - 1; i++) {
      if (activePathIds[i] === fromId && activePathIds[i + 1] === toId) return true;
    }
    return false;
  }

  function renderNodeGlyph(id: string, type: 'folder' | 'file', isActive: boolean) {
    const p = pos.get(id)!;
    const stroke = isActive ? '#fb7185' : '#d1d5db'; // coral-400 vs gray-300
    const fill = '#ffffff';
    if (type === 'folder') {
      return (
        <g key={id} transform={`translate(${p.x},${p.y})`}>
          <rect x={-18} y={-8} width={36} height={26} rx={5} fill={fill} stroke={stroke} strokeWidth={1.5} />
          <rect x={-10} y={-14} width={14} height={8} rx={2} fill={fill} stroke={stroke} strokeWidth={1.5} />
        </g>
      );
    }
    // file
    return (
      <g key={id} transform={`translate(${p.x},${p.y})`}>
        <path d="M-14 -12 h18 l8 8 v22 h-26 z M4 -12 v8 h8" fill={fill} stroke={stroke} strokeWidth={1.5} />
      </g>
    );
  }

  function renderLabel(id: string, name: string) {
    const p = pos.get(id)!;
    return (
      <text key={`${id}:label`} x={p.x} y={p.y + 32} textAnchor="middle" className="fill-gray-800 text-[10px]">
        {name}
      </text>
    );
  }

  function flatten(n: TreeDataNode, out: TreeDataNode[] = []): TreeDataNode[] {
    out.push(n);
    if (n.children) for (const c of n.children) flatten(c, out);
    return out;
  }

  const nodes = flatten(root);

  // Build a single continuous trace path for the active path
  const traceD = React.useMemo(() => {
    if (!activePathIds || activePathIds.length < 2) return '';
    let d = '';
    for (let i = 0; i < activePathIds.length - 1; i++) {
      const a = pos.get(activePathIds[i]);
      const b = pos.get(activePathIds[i + 1]);
      if (!a || !b) continue;
      const midY = (a.y + b.y) / 2;
      if (d === '') {
        d += `M ${a.x} ${a.y + 16} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y - 16}`;
      } else {
        d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y - 16}`;
      }
    }
    return d;
  }, [activePathIds, pos]);

  const traceRef = React.useRef<SVGPathElement | null>(null);

  React.useEffect(() => {
    const el = traceRef.current;
    if (!el) return;
    if (!traceD) { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; return; }
    try {
      const length = el.getTotalLength();
      // Initialize dash for animation
      el.style.transition = 'none';
      el.style.strokeDasharray = String(length);
      el.style.strokeDashoffset = String(length);
      // Force reflow then animate
      void el.getBoundingClientRect();
      el.style.transition = 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)';
      el.style.strokeDashoffset = '0';
    } catch {}
  }, [traceD]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      role="img"
      aria-label="Tree"
    >
      {/* continuous trace glow */}
      {traceD && (
        <path d={traceD} fill="none" stroke="rgba(251, 113, 133, 0.22)" strokeWidth={6} strokeLinecap="round" />
      )}
      {/* active node glow */}
      {nodes.filter(n => activeSet.has(n.id)).map(n => {
        const p = pos.get(n.id)!;
        return <circle key={`glow:${n.id}`} cx={p.x} cy={p.y} r={24} fill="rgba(251, 113, 133, 0.12)" />; // coral-400 with alpha
      })}

      {/* primary edges */}
      {edges.map((e, i) => (
        <path
          key={`e:${i}`}
          d={edgePath(e.from.x, e.from.y, e.to.x, e.to.y)}
          fill="none"
          stroke={isActiveEdge(e.from.id, e.to.id) ? '#fb7185' : '#d1d5db'}
          strokeWidth={isActiveEdge(e.from.id, e.to.id) ? 2 : 1.5}
        />
      ))}
      {/* secondary (dashed) edges */}
      {secondaryEdges?.map((se, i) => {
        const a = pos.get(se.from);
        const b = pos.get(se.to);
        if (!a || !b) return null;
        return (
          <path
            key={`s:${i}`}
            d={edgePath(a.x, a.y, b.x, b.y)}
            fill="none"
            stroke="#94a3b8" // slate-400
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
        );
      })}

      {/* continuous trace on top */}
      {traceD && (
        <path ref={traceRef} d={traceD} fill="none" stroke="#fb7185" strokeWidth={2.5} strokeLinecap="round" />
      )}

      {/* nodes */}
      {nodes.map((n) => renderNodeGlyph(n.id, n.type === 'file' ? 'file' : 'folder', activeSet.has(n.id)))}

      {/* labels */}
      {nodes.map((n) => renderLabel(n.id, n.name))}

      {/* overlay hit targets for a11y/clicks */}
      {nodes.map((n) => {
        const p = pos.get(n.id)!;
        return (
          <g key={`hit:${n.id}`} transform={`translate(${p.x},${p.y})`}>
            <rect
              x={-28}
              y={-22}
              width={56}
              height={56}
              rx={8}
              fill="transparent"
              onClick={() => onNodeClick?.(n.id)}
              aria-label={n.name}
              role="button"
              tabIndex={0}
            />
          </g>
        );
      })}
    </svg>
  );
}
