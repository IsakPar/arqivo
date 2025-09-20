'use client';

import React from 'react';
import { getBindings, matchEvent, type HotkeyAction } from '../lib/hotkeys';

type Handlers = Partial<Record<HotkeyAction, (e: KeyboardEvent) => void>>;

export function useHotkeys(handlers: Handlers) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const bindings = getBindings();
      for (const [action, combo] of Object.entries(bindings) as Array<[HotkeyAction, string]>) {
        const handler = handlers[action];
        if (!handler) continue;
        if (matchEvent(combo, e)) {
          e.preventDefault();
          try { handler(e); } catch {}
          break;
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers]);
}


