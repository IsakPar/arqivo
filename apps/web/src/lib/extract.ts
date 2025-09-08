export type ExtractedFields = {
  vendor?: string;
  total?: number;
  currency?: string;
  dueDate?: string; // ISO
  tags?: string[];
};

// Extremely lightweight heuristics for receipts/invoices
export function extractFromText(text: string): ExtractedFields {
  const out: ExtractedFields = {};
  const t = text || '';
  const lines = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  // Vendor: first non-empty line with letters, excluding obvious non-vendor headings
  for (const line of lines.slice(0, 10)) {
    if (/invoice|receipt|paid|total|subtotal|tax/i.test(line)) continue;
    if (/^[A-Za-z][A-Za-z0-9 .,'&\-]{2,}$/.test(line)) { out.vendor = line; break; }
  }

  // Totals: look for currency + number patterns
  const moneyMatch = t.match(/(?:(USD|EUR|SEK|GBP|NOK|DKK)\s*)?(\d{1,3}(?:[\s,]\d{3})*(?:[.,]\d{2})?)(?:\s*(USD|EUR|SEK|GBP|NOK|DKK))?/i);
  if (moneyMatch) {
    out.currency = (moneyMatch[1] || moneyMatch[3] || '').toUpperCase() || undefined;
    const numRaw = moneyMatch[2].replace(/\s|,/g, '').replace(/,(\d{2})$/, '.$1');
    const n = Number(numRaw);
    if (!Number.isNaN(n)) out.total = n;
  }

  // Due date: naive date finder
  const dateMatch = t.match(/\b(\d{4}[\/-]\d{1,2}[\/-]\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\b/);
  if (dateMatch) {
    const parsed = new Date(dateMatch[1]);
    if (!isNaN(parsed.getTime())) out.dueDate = parsed.toISOString();
  }

  // Tags: pick keywords
  const tags: string[] = [];
  if (/invoice/i.test(t)) tags.push('invoice');
  if (/receipt/i.test(t)) tags.push('receipt');
  if (/tax/i.test(t)) tags.push('tax');
  if (out.vendor) tags.push(out.vendor.toLowerCase());
  out.tags = Array.from(new Set(tags)).slice(0, 8);

  return out;
}


