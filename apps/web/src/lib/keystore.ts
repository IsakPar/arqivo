'use client';

import { aesGcmDecrypt, aesGcmEncrypt, fromHex, randomBytes, toHex } from './crypto';

const DEV_KEK_KEY = 'arqivo_device_kek_hex';
const WRAPPED_AK_KEY = 'arqivo_wrapped_ak_hex';

export function getOrCreateDeviceKEK(): Uint8Array {
  try { const h = localStorage.getItem(DEV_KEK_KEY); if (h) return fromHex(h); } catch {}
  const key = randomBytes(32);
  try { localStorage.setItem(DEV_KEK_KEY, toHex(key)); } catch {}
  return key;
}

export async function getOrCreateAccountKey(): Promise<Uint8Array> {
  const kek = getOrCreateDeviceKEK();
  try {
    const wrapped = localStorage.getItem(WRAPPED_AK_KEY);
    if (wrapped) {
      const packed = fromHex(wrapped);
      return await aesGcmDecrypt(kek, packed);
    }
  } catch {}
  const ak = randomBytes(32);
  const { packed } = await aesGcmEncrypt(kek, ak);
  try { localStorage.setItem(WRAPPED_AK_KEY, toHex(packed)); } catch {}
  return ak;
}

export async function wrapFileKey(fileKey: Uint8Array): Promise<Uint8Array> {
  const ak = await getOrCreateAccountKey();
  const { packed } = await aesGcmEncrypt(ak, fileKey);
  return packed;
}


