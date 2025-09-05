import { spawn } from 'node:child_process';
import getPort from 'get-port';
import http from 'node:http';

let proc: any;
export let baseUrl: string;

export async function startStrictServer() {
  const port = await getPort({ port: 4000 });
  baseUrl = `http://127.0.0.1:${port}`;
  proc = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      PORT: String(port),
      STRICT_AUTH: 'true',
      DEV_AUTH_BYPASS: '',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_dummy',
      NODE_ENV: 'test',
    },
    stdio: 'ignore',
  });
  // Poll /health
  const start = Date.now();
  while (Date.now() - start < 5000) {
    const ok = await new Promise<boolean>((resolve) => {
      const req = http.get(`${baseUrl}/health`, (res) => resolve(res.statusCode === 200));
      req.on('error', () => resolve(false));
    });
    if (ok) return { baseUrl };
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('server failed to start');
}

export async function stopStrictServer() {
  if (proc) proc.kill('SIGTERM');
}


