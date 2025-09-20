'use client';

type Cipher = { data: string; nonce: string; tag?: string };

export type LabelNode = { id: string; name: Cipher };

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const ZERO_ID = '00000000-0000-0000-0000-000000000000';

export { ZERO_ID };

export async function getChildren(id: string, token?: string, after?: string, limit = 200): Promise<LabelNode[]> {
  const params = new URLSearchParams({ id, ...(after ? { after } : {}), limit: String(limit) });
  const res = await fetch(`${BASE_URL}/v1/labels/children?${params}`, { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.children ?? []) as LabelNode[];
}

export function decodeName(cipher: Cipher): string {
  // Placeholder: cannot decrypt without label key; return short tokenized placeholder
  return 'Label ' + cipher.data.slice(0, 6);
}

export async function createLabel(nameCipher: Cipher, slugToken: string, token?: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/labels`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name: nameCipher, slugToken }),
  });
  if (!res.ok) throw new Error('createLabel failed');
  const data = await res.json();
  return data.id as string;
}

export async function addEdge(childId: string, parentId: string, token?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/labels/${childId}/edges`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ parentId }),
  });
  if (!res.ok) throw new Error('addEdge failed');
}

export async function removeEdge(childId: string, parentId: string, token?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/labels/${childId}/edges`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ parentId }),
  });
  if (!res.ok) throw new Error('removeEdge failed');
}

export async function getAncestors(id: string, token?: string): Promise<string[]> {
  const params = new URLSearchParams({ id });
  const res = await fetch(`${BASE_URL}/v1/labels/ancestors?${params}`, { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.ancestors ?? []) as string[];
}

export async function moveLabel(id: string, from: string[], to: string, token?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/labels/${id}/move`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ from, to }),
  });
  if (!res.ok) throw new Error('moveLabel failed');
}

export async function getParents(id: string, token?: string): Promise<string[]> {
  const params = new URLSearchParams({ id });
  const res = await fetch(`${BASE_URL}/v1/labels/parents?${params}`, { headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.parents ?? []) as string[];
}

export async function renameLabel(id: string, nameCipher: Cipher, slugToken?: string, token?: string): Promise<void> {
  const body: any = { name: nameCipher };
  if (slugToken) body.slugToken = slugToken;
  const res = await fetch(`${BASE_URL}/v1/labels/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('renameLabel failed');
}


