import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { env } from './env.js';

const connection = env.REDIS_URL ? { url: env.REDIS_URL } : undefined as any;

export const extractQueue = new Queue('extract', { connection });
export const webhookQueue = new Queue('webhook', { connection });
export const cleanupQueue = new Queue('cleanup', { connection });

export function getQueueDepthLimit(): number {
  return Number(env.QUEUE_MAX_DEPTH ?? 10000);
}

export function defaultJobOpts(): JobsOptions {
  return { attempts: 3, backoff: { type: 'exponential', delay: 500 }, removeOnComplete: 1000, removeOnFail: 1000 };
}

export function startWorkers() {
  const extractConcurrency = Number(env.EXTRACT_CONCURRENCY ?? 4);
  const webhookConcurrency = Number(env.WEBHOOK_CONCURRENCY ?? 4);
  const cleanupConcurrency = Number(env.CLEANUP_CONCURRENCY ?? 2);

  new Worker('extract', async (job) => {
    // TODO: run local extraction or trigger device job; placeholder
    return { ok: true };
  }, { connection, concurrency: extractConcurrency });

  new Worker('webhook', async (job) => {
    // TODO: deliver webhook; placeholder
    return { ok: true };
  }, { connection, concurrency: webhookConcurrency });

  new Worker('cleanup', async (job) => {
    // TODO: sweep tmp keys / abort stale uploads; placeholder
    return { ok: true };
  }, { connection, concurrency: cleanupConcurrency });

  new QueueEvents('extract', { connection });
  new QueueEvents('webhook', { connection });
  new QueueEvents('cleanup', { connection });
}


