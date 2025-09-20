'use client';

import React from 'react';

type Tab = 'account' | 'security' | 'workspace' | 'appearance' | 'billing' | 'danger';

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('account');
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


