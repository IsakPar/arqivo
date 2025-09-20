'use client';

import Tesseract from 'tesseract.js';

export type OcrJob = { id: string; file: File | Blob; lang?: string };
export type OcrProgress = { id: string; progress: number; status?: string };
export type OcrResult = { id: string; text: string; words: Array<{ text: string; confidence: number }> };

export class OcrManager {
  private queue: OcrJob[] = [];
  private running = false;
  onProgress?: (p: OcrProgress) => void;
  onDone?: (r: OcrResult) => void;

  enqueue(job: OcrJob) {
    this.queue.push(job);
    if (!this.running) void this.next();
  }

  private async next() {
    const job = this.queue.shift();
    if (!job) { this.running = false; return; }
    this.running = true;
    try {
      await this.run(job);
    } finally {
      this.running = false;
      void this.next();
    }
  }

  private async run(job: OcrJob) {
    const lang = job.lang || 'eng';
    const worker: any = await (Tesseract as any).createWorker({
      logger: (m: any) => {
        if (m.status && typeof m.progress === 'number') {
          this.onProgress?.({ id: job.id, progress: m.progress, status: m.status });
        }
      }
    });
    try {
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
      const { data } = await worker.recognize(job.file);
      const text = data.text || '';
      const words = (data.words || []).map((w: any) => ({ text: w.text, confidence: w.confidence }));
      this.onDone?.({ id: job.id, text, words });
    } finally {
      await worker.terminate();
    }
  }
}


