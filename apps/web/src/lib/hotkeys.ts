'use client';

export type HotkeyAction = 'openInbox' | 'openSearch' | 'openSettings' | 'openCommand' | 'uploadFile';

export const defaultBindings: Record<HotkeyAction, string> = {
  openInbox: 'Meta+I',
  openSearch: 'Meta+F',
  openSettings: 'Meta+,',
  openCommand: 'Meta+K',
  uploadFile: 'Meta+U',
};

const STORAGE_KEY = 'hotkeys';

export function getBindings(): Record<HotkeyAction, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultBindings };
    const parsed = JSON.parse(raw) as Partial<Record<HotkeyAction, string>>;
    return { ...defaultBindings, ...parsed } as Record<HotkeyAction, string>;
  } catch {
    return { ...defaultBindings };
  }
}

export function setBinding(action: HotkeyAction, combo: string) {
  try {
    const current = getBindings();
    current[action] = normalizeCombo(combo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

export function resetBindings() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBindings)); } catch {}
}

export function normalizeCombo(combo: string): string {
  const parts = combo.split('+').map(s => s.trim()).filter(Boolean);
  const mods: string[] = [];
  let key = '';
  for (const p of parts) {
    const u = p.toLowerCase();
    if (u === 'meta' || u === 'cmd' || u === 'command') mods.push('Meta');
    else if (u === 'control' || u === 'ctrl') mods.push('Control');
    else if (u === 'alt' || u === 'option') mods.push('Alt');
    else if (u === 'shift') mods.push('Shift');
    else key = p; // keep punctuation as-is
  }
  const ordered = ['Control','Alt','Shift','Meta'].filter(m => mods.includes(m));
  return [...ordered, key].filter(Boolean).join('+');
}

export function matchEvent(combo: string, e: KeyboardEvent): boolean {
  const parts = combo.split('+').map(s => s.trim()).filter(Boolean);
  let wantMeta = false, wantCtrl = false, wantAlt = false, wantShift = false;
  let key = '';
  for (const p of parts) {
    if (p === 'Meta' || p.toLowerCase() === 'cmd' || p === 'Command') wantMeta = true;
    else if (p === 'Control' || p.toLowerCase() === 'ctrl') wantCtrl = true;
    else if (p === 'Alt' || p.toLowerCase() === 'option') wantAlt = true;
    else if (p === 'Shift') wantShift = true;
    else key = p;
  }
  if (e.metaKey !== wantMeta) return false;
  if (e.ctrlKey !== wantCtrl) return false;
  if (e.altKey !== wantAlt) return false;
  if (e.shiftKey !== wantShift) return false;
  const eventKey = (e.key || '').toLowerCase();
  const wantKey = key.toLowerCase();
  return eventKey === wantKey;
}

export function comboFromEvent(e: KeyboardEvent): string {
  const mods: string[] = [];
  if (e.ctrlKey) mods.push('Control');
  if (e.altKey) mods.push('Alt');
  if (e.shiftKey) mods.push('Shift');
  if (e.metaKey) mods.push('Meta');
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  return normalizeCombo([...mods, key].join('+'));
}


