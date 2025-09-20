'use client';

// Minimal browser crypto helpers for v0

export function randomBytes(length: number): Uint8Array {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function toStrictArrayBuffer(view: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(view.byteLength);
  new Uint8Array(ab).set(view);
  return ab;
}

async function importAesKey(keyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    toStrictArrayBuffer(keyBytes),
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function aesGcmEncrypt(keyBytes: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array) {
  const key = await importAesKey(keyBytes);
  const iv = randomBytes(12);
  const ivBuffer = toStrictArrayBuffer(iv);
  const additionalData = aad ? toStrictArrayBuffer(aad) : undefined;
  const params: AesGcmParams = { name: 'AES-GCM', iv: ivBuffer, additionalData };
  const ct = new Uint8Array(await crypto.subtle.encrypt(params, key, toStrictArrayBuffer(plaintext)));
  // Return iv || ct packed for storage
  return { iv, ciphertext: ct, packed: concatBytes(iv, ct) };
}

export async function aesGcmDecrypt(keyBytes: Uint8Array, packed: Uint8Array, aad?: Uint8Array) {
  const key = await importAesKey(keyBytes);
  const iv = packed.slice(0, 12);
  const ct = packed.slice(12);
  const params: AesGcmParams = { name: 'AES-GCM', iv: toStrictArrayBuffer(iv), additionalData: aad ? toStrictArrayBuffer(aad) : undefined };
  const pt = await crypto.subtle.decrypt(params, key, toStrictArrayBuffer(ct));
  return new Uint8Array(pt);
}

export async function sha256Hex(input: Uint8Array): Promise<string> {
  const ab = toStrictArrayBuffer(input);
  const hash = await crypto.subtle.digest('SHA-256', ab);
  return toHex(new Uint8Array(hash));
}

export async function sha256Bytes(input: Uint8Array): Promise<Uint8Array> {
  const ab = toStrictArrayBuffer(input);
  const hash = await crypto.subtle.digest('SHA-256', ab);
  return new Uint8Array(hash);
}

export function canonicalizeLabel(input: string): string {
  let s = input.normalize('NFKC').toLowerCase().trim();
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');
  return s.replace(/ /g, '-');
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}


// Simple local vault key for v0 (replace with device-bound K_v later)
const KV_STORAGE_KEY = 'arqivo_kv_hex';

export function getOrCreateVaultKey(): Uint8Array {
  try {
    const hex = localStorage.getItem(KV_STORAGE_KEY);
    if (hex && hex.length >= 64) return fromHex(hex);
  } catch {}
  const key = randomBytes(32);
  try { localStorage.setItem(KV_STORAGE_KEY, toHex(key)); } catch {}
  return key;
}



