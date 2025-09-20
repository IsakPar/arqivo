'use client';

export type Extracted = {
  vendor?: string;
  total?: number;
  dueDate?: string; // ISO
  labels: string[];
};

const moneyRe = /(?:total|amount)\s*[:\-]?\s*\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i;
const dateRe = /(?:due|expires|expiration)\s*[:\-]?\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i;

export function extractFields(text: string): Extracted {
  const out: Extracted = { labels: [] };
  const norm = text.replace(/\s+/g, ' ').trim();

  // naive vendor: first capitalized word run
  const vendor = (norm.match(/^[A-Z][A-Za-z0-9&\- ]{2,30}/)?.[0] || '').trim();
  if (vendor) out.vendor = vendor;

  const m = norm.match(moneyRe);
  if (m) out.total = Number(m[1].replace(/,/g, ''));

  const d = norm.match(dateRe)?.[1];
  if (d) {
    const iso = d.includes('-') ? d : toIso(d);
    if (iso) out.dueDate = iso;
  }

  // labels
  if (/invoice/i.test(norm)) out.labels.push('Invoice');
  if (/receipt/i.test(norm)) out.labels.push('Receipt');
  if (/warranty|expires/i.test(norm)) out.labels.push('Warranty');

  return out;
}

function toIso(s: string): string | null {
  const [mm, dd, yy] = s.split('/').map((x) => Number(x));
  if (!mm || !dd || !yy) return null;
  const yyyy = yy < 100 ? 2000 + yy : yy;
  const m = String(mm).padStart(2, '0');
  const d = String(dd).padStart(2, '0');
  return `${yyyy}-${m}-${d}`;
}


