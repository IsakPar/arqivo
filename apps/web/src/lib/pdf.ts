// On-device PDF text extraction using pdfjs-dist
export async function pdfToText(file: File): Promise<string> {
  const { getDocument } = await import('pdfjs-dist');
  // pdf.js expects URL or typed array
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await getDocument({ data }).promise as any;
  let text = '';
  const pageCount = doc.numPages || 0;
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = (content.items || []) as Array<{ str: string } & any>;
    text += items.map((it) => it.str).join('\n') + '\n';
  }
  try { await doc.destroy?.(); } catch {}
  return text;
}


