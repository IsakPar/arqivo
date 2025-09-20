import { env } from '../env.js';

let client: any = null;
let connecting = false;

export async function getRedis(): Promise<any | null> {
  if (!env.REDIS_URL) return null;
  if (client) return client;
  if (connecting) {
    while (connecting && !client) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 10));
    }
    return client;
  }
  connecting = true;
  try {
    const { createClient } = await import('redis');
    client = createClient({ url: env.REDIS_URL });
    client.on('error', () => {});
    await client.connect();
    return client;
  } catch {
    client = null;
    return null;
  } finally {
    connecting = false;
  }
}


