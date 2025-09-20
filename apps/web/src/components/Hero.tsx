'use client';

import React from 'react';
import Link from 'next/link';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryTextLink } from './ui/SecondaryTextLink';
import Image from 'next/image';

function IconLock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
    </svg>
  );
}

function IconKey(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="M12 15h8l-2 2m0-4l2 2" />
    </svg>
  );
}

function IconFingerprint(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 11a3 3 0 0 0-3 3c0 2.5 1 4 2 6" />
      <path d="M12 7a7 7 0 0 0-7 7c0 3 1 5 2 7" />
      <path d="M12 7a7 7 0 0 1 7 7c0 3-1 5-2 7" />
      <path d="M12 11a3 3 0 0 1 3 3c0 2.5-1 4-2 6" />
    </svg>
  );
}

function IconShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
      <path d="M9.5 12.5l2 2 3-4" />
    </svg>
  );
}

export function Hero() {
  const heroRef = React.useRef<HTMLElement | null>(null);
  const ctaRef = React.useRef<HTMLDivElement | null>(null);
  const [animTop, setAnimTop] = React.useState<number | null>(null);

  React.useEffect(() => {
    const reposition = () => {
      const hero = heroRef.current;
      const cta = ctaRef.current;
      if (!hero || !cta) return;
      const heroRect = hero.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const top = ctaRect.bottom - heroRect.top + 2; // CTA bottom + 2px (hairline)
      setAnimTop(top);
    };
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, []);

  return (
    <section ref={heroRef} className="relative isolate overflow-hidden bg-white min-h-[96vh] lg:min-h-screen">
      {/* Theme + reduced-motion toggles for background animation */}
      <style jsx global>{`
        :root {
          --edge: rgba(2,6,23,0.16);
          --packet: #f1998d;
          --node: #0b3b7e;
          --file: #1f6feb;
        }
        @media (prefers-reduced-motion: reduce) { .motion-ok { display: none; } }
      `}</style>
      {/* background: minimalist grid like the reference */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(130%_70%_at_50%_10%,black,transparent)]"
        />
      </div>
      <div className="mx-auto max-w-5xl px-6 pt-8 pb-24 sm:pt-10 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Top-centered brand image */}
          <div className="flex justify-center">
            <Image
              src="/image.png"
              alt="Arqivo"
              width={480}
              height={480}
              priority
              className="h-24 w-auto md:h-32"
            />
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl leading-[1.05]">
            <span className="block">Privacy,</span>
            <span className="block">without&nbsp;compromise.</span>
          </h1>
          <p className="mt-6 text-lg leading-7 text-gray-600">
            Search everything instantly, without ever giving up control.
          </p>
          <p className="mt-1 text-base leading-7 text-gray-500">
            End-to-end encrypted. Zero-knowledge by design.
          </p>
          <div ref={ctaRef} className="mt-10 flex items-center justify-center gap-4">
            <PrimaryButton href="/sign-up">Get Started</PrimaryButton>
            <SecondaryTextLink href="/how-it-works#tree">See how it works</SecondaryTextLink>
          </div>
        </div>
      </div>
      {/* Background animation anchored just below the CTA */}
      <div aria-hidden className="pointer-events-none motion-ok absolute inset-x-0 -z-10 hidden sm:flex justify-center" style={{ top: animTop ?? undefined }}>
        <FileGraph />
      </div>
    </section>
  );
}

// --- Background animation: FileGraph ---
function FileGraph() {
  const width = 1000;
  const height = 280;
  const paths = [
    { id: 'pIngest', d: 'M150,220 C 320,160 460,160 520,210' },
    { id: 'pSeal',   d: 'M520,210 C 560,200 600,200 640,210' },
    { id: 'pUpload', d: 'M640,210 C 740,170 820,190 880,210' },
    { id: 'pQuery',  d: 'M880,210 C 800,240 700,240 640,210' },
    { id: 'pMulti',  d: 'M300,240 C 420,200 460,200 520,210', dashed: true },
  ];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-70">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {paths.map((p) => (
        <path key={p.id} id={p.id} d={p.d} fill="none" stroke="var(--edge)" strokeWidth={1.5} strokeDasharray={p.dashed ? '4 6' : undefined} />
      ))}

      {/* Nodes */}
      <FolderNode x={120} y={220} label="Workspace" />
      <IndexNode x={520} y={210} label="Index" />
      <EncryptNode x={640} y={210} label="Encrypt" />
      <StorageNode x={880} y={210} label="Encrypted storage" />

      {/* Files near workspace */}
      <FileNode x={300} y={220} />
      <FileNode x={340} y={250} />

      {/* Timeline packets */}
      <Packet pathId="pIngest" color="#1f6feb" dur="10s" begin="0s" />
      <Packet pathId="pIngest" color="#1f6feb" dur="12s" begin="-3s" />
      <Packet pathId="pSeal"   color="#f1998d" dur="1.8s" begin="4s" />
      <Packet pathId="pUpload" color="#f1998d" dur="7s" begin="6s" />
      <Packet pathId="pQuery"  color="#1f6feb" dur="3s" begin="9s" />
      <Packet pathId="pMulti"  color="#1f6feb" dur="11s" begin="-2s" />
    </svg>
  );
}

function FolderNode({ x, y, label = '' }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#glow)">
      <rect x={-26} y={-18} rx={8} ry={8} width={52} height={36} fill="white" stroke="var(--node)" strokeWidth={1.5} />
      <rect x={-20} y={-22} width={18} height={8} rx={2} fill="white" stroke="var(--node)" strokeWidth={1.5} />
      {label && (
        <text x={0} y={36} textAnchor="middle" fontSize={10} fill="rgba(2,6,23,0.55)">{label}</text>
      )}
    </g>
  );
}

function FileNode({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#glow)">
      <rect x={-18} y={-24} rx={4} ry={4} width={36} height={48} fill="white" stroke="var(--file)" strokeWidth={1.5} />
      <rect x={-12} y={-12} width={24} height={2.5} fill="rgba(31,111,235,0.9)" />
      <rect x={-12} y={-4} width={18} height={2.5} fill="rgba(31,111,235,0.6)" />
    </g>
  );
}

function IndexNode({ x, y, label = 'Index' }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#glow)">
      <circle r={20} fill="white" stroke="rgba(31,111,235,0.7)" strokeWidth={1.5} />
      <circle r={3} fill="rgba(31,111,235,0.9)" />
      <text x={0} y={36} textAnchor="middle" fontSize={10} fill="rgba(2,6,23,0.55)">{label}</text>
    </g>
  );
}

function EncryptNode({ x, y, label = 'Encrypt' }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#glow)">
      <circle r={18} fill="white" stroke="#f1998d" strokeOpacity={0.7} strokeWidth={1.5} />
      {/* simple lock glyph */}
      <rect x={-5} y={-10} width={10} height={8} rx={2} fill="#f1998d" fillOpacity={0.85} />
      <rect x={-2} y={-14} width={4} height={4} rx={1} fill="#f1998d" />
      <text x={0} y={34} textAnchor="middle" fontSize={10} fill="rgba(2,6,23,0.55)">{label}</text>
    </g>
  );
}

function StorageNode({ x, y, label = 'Encrypted storage' }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#glow)">
      <rect x={-20} y={-16} rx={4} ry={4} width={40} height={12} fill="white" stroke="#c9b2ab" strokeOpacity={0.7} strokeWidth={1.2} />
      <rect x={-18} y={-2} rx={4} ry={4} width={36} height={12} fill="white" stroke="#c9b2ab" strokeOpacity={0.7} strokeWidth={1.2} />
      <text x={0} y={34} textAnchor="middle" fontSize={10} fill="rgba(2,6,23,0.55)">{label}</text>
    </g>
  );
}

function Packet({ pathId, dur = '10s', begin = '0s', color = 'var(--packet)' }: { pathId: string; dur?: string; begin?: string; color?: string }) {
  return (
    <g>
      <circle r={3} fill={color}>
        <animateMotion dur={dur} begin={begin} repeatCount="indefinite">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </g>
  );
}
