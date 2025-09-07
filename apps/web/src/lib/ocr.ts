"use client";

import Tesseract from 'tesseract.js';

export type OcrJob = {
  id: string;
  file: File;
  lang?: string;
};

export type OcrProgress = {
  id: string;
  progress: number; // 0..1
  status: string;
};

export type OcrResult = {
  id: string;
  text: string;
  words: Array<{ text: string; confidence: number }>;
};

export class OcrManager {
  private concurrency: number;
  private queue: OcrJob[] = [];
  private active = 0;
  private onProgress?: (p: OcrProgress) => void;
  private onDone?: (r: OcrResult) => void;

  constructor(opts?: { concurrency?: number; onProgress?: (p: OcrProgress) => void; onDone?: (r: OcrResult) => void }) {
    this.concurrency = Math.max(1, Math.min(4, opts?.concurrency ?? 2));
    this.onProgress = opts?.onProgress;
    this.onDone = opts?.onDone;
  }

  enqueue(job: OcrJob) {
    this.queue.push(job);
    this.pump();
  }

  private async pump() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift()!;
      this.active += 1;
      this.run(job).finally(() => {
        this.active -= 1;
        this.pump();
      });
    }
  }

  private async run(job: OcrJob) {
    const lang = job.lang || 'eng';
    const worker = await Tesseract.createWorker({
      logger: (m: any) => {
        if (m.status && typeof m.progress === 'number') {
          this.onProgress?.({ id: job.id, progress: m.progress, status: m.status });
        }
      },
    } as any);
    try {
      // Explicitly load and initialize language to satisfy types across versions
      try { await (worker as any).loadLanguage?.(lang); } catch {}
      try { await (worker as any).initialize?.(lang); } catch {}
      const { data } = await worker.recognize(job.file as any);
      const text = (data as any).text || '';
      const words = ((data as any).words || []).map((w: any) => ({ text: w.text, confidence: w.confidence }));
      this.onDone?.({ id: job.id, text, words });
    } finally {
      await worker.terminate();
    }
  }
}


