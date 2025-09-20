'use client';

import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker&url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function extractPdfText(file: File | Blob): Promise<string> {
  const ab = await file.arrayBuffer();
  const loadingTask = (pdfjsLib as any).getDocument({ data: ab });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strs = content.items.map((it: any) => it.str).filter(Boolean);
    text += strs.join(' ') + '\n';
  }
  try { await pdf.destroy(); } catch {}
  return text;
}


