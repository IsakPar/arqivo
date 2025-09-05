export type Bytes = Uint8Array;

export interface AesGcmResult {
  iv: Bytes;
  authTag: Bytes;
  ciphertext: Bytes;
}

export function notImplemented(): never {
  throw new Error('Crypto implementation to be provided per platform (web/iOS/server)');
}

