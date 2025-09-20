'use client';

import React from 'react';
import { getBindings, setBinding, resetBindings, type HotkeyAction, normalizeCombo, comboFromEvent } from '../../../components/../lib/hotkeys';

type Tab = 'account' | 'security' | 'workspace' | 'appearance' | 'billing' | 'hotkeys' | 'danger';

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('account');
  const [bindings, setBindings] = React.useState(getBindings());
  const [capturing, setCapturing] = React.useState<HotkeyAction | null>(null);
  React.useEffect(() => {
    if (!capturing) return;
    function onKey(e: KeyboardEvent) {
      e.preventDefault();
      const combo = comboFromEvent(e);
      setBinding(capturing as HotkeyAction, combo);
      setBindings(getBindings());
      setCapturing(null);
    }
    window.addEventListener('keydown', onKey, { once: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [capturing]);
  return (
    <main className="mx-auto max-w-5xl px-6 py-6">
      <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
      <div className="mt-4 grid grid-cols-[220px,1fr] gap-6">
        <nav className="rounded-md border border-gray-100 bg-white p-2 text-sm">
          <button className={`w-full rounded px-2 py-1 text-left hover:bg-gray-50 ${tab==='account'?'bg-gray-50 font-medium':''}`} onClick={() => setTab('account')}>Account</button>
          <button className={`mt-1 w-full rounded px-2 py-1 text-left hover:bg-gray-50 ${tab==='security'?'bg-gray-50 font-medium':''}`} onClick={() => setTab('security')}>Security & Devices</button>
          <button className={`mt-1 w-full rounded px-2 py-1 text-left hover:bg-gray-50 ${tab==='workspace'?'bg-gray-50 font-medium':''}`} onClick={() => setTab('workspace')}>Workspace</button>
          <button className={`mt-1 w-full rounded px-2 py-1 text-left hover:bg-gray-50 ${tab==='appearance'?'bg-gray-50 font-medium':''}`} onClick={() => setTab('appearance')}>Appearance</button>
          <button className={`mt-1 w-full rounded px-2 py-1 text-left hover:bg-gray-50 ${tab==='billing'?'bg-gray-50 font-medium':''}`} onClick={() => setTab('billing')}>Billing</button>
          <button className={`mt-1 w-full rounded px-2 py-1 text-left hover:bg-gray-50 ${tab==='hotkeys'?'bg-gray-50 font-medium':''}`} onClick={() => setTab('hotkeys')}>Hotkeys</button>
          <div className="my-2 h-px bg-gray-100" />
          <button className={`w-full rounded px-2 py-1 text-left text-red-600 hover:bg-red-50 ${tab==='danger'?'bg-red-50 font-medium':''}`} onClick={() => setTab('danger')}>Danger zone</button>
        </nav>
        <section className="rounded-md border border-gray-100 bg-white p-4">
          {tab === 'account' && (
            <div className="text-sm text-gray-800">
              <div className="font-medium text-gray-900">Account</div>
              <p className="mt-1 text-xs text-gray-600">Profile, contact methods, locale. Coming soon.</p>
            </div>
          )}
          {tab === 'security' && (
            <div className="text-sm text-gray-800">
              <div className="font-medium text-gray-900">Security & Devices</div>
              <p className="mt-1 text-xs text-gray-600">Passkeys/2FA, sessions, API keys, key management. Coming soon.</p>
            </div>
          )}
          {tab === 'workspace' && (
            <div className="text-sm text-gray-800">
              <div className="font-medium text-gray-900">Workspace</div>
              <p className="mt-1 text-xs text-gray-600">Default view, tree behavior, label rules, narration settings. Coming soon.</p>
            </div>
          )}
          {tab === 'appearance' && (
            <div className="text-sm text-gray-800">
              <div className="font-medium text-gray-900">Appearance</div>
              <p className="mt-1 text-xs text-gray-600">Theme, density, reduced motion, color accents. Coming soon.</p>
            </div>
          )}
          {tab === 'billing' && (
            <div className="text-sm text-gray-800">
              <div className="font-medium text-gray-900">Billing</div>
              <p className="mt-1 text-xs text-gray-600">Plan, payment method, invoices, usage. Coming soon.</p>
            </div>
          )}
          {tab === 'hotkeys' && (
            <div className="text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">Hotkeys</div>
                <button className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => { resetBindings(); setBindings(getBindings()); }}>Reset defaults</button>
              </div>
              <p className="mt-1 text-xs text-gray-600">Click “Change” then press the new shortcut. Modifiers supported: Control, Alt, Shift, Meta.</p>
              <div className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-100">
                {([
                  ['openCommand','Open command palette'],
                  ['openSearch','Open local search overlay'],
                  ['openInbox','Toggle inbox'],
                  ['uploadFile','Upload file'],
                  ['openSettings','Open settings'],
                ] as Array<[HotkeyAction,string]>).map(([action, label]) => (
                  <div key={action} className="flex items-center justify-between px-3 py-2">
                    <div className="text-gray-800">{label}</div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-gray-50 px-2 py-1 text-xs text-gray-800 border border-gray-200">{bindings[action]}</code>
                      <button className="rounded border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50" onClick={() => setCapturing(action)} disabled={capturing!==null}>
                        {capturing===action ? 'Press keys…' : 'Change'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'danger' && (
            <div className="text-sm text-gray-800">
              <div className="font-medium text-red-600">Danger zone</div>
              <ul className="mt-2 list-disc pl-5 text-xs text-gray-700">
                <li>Delete workspace (requires re-auth, 7–30 day grace)</li>
                <li>Delete account (requires 2FA/passkey, export prompt)</li>
                <li>Rotate workspace data key (advanced)</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">Actions disabled in this build. Coming soon.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


