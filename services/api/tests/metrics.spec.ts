import request from 'supertest';
import { startServer, stopServer } from './utils/server';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer({ USE_MEMORY_LIMITER: 'true' } as any)));
afterAll(async () => await stopServer());

it('exposes prometheus metrics with histograms and counters', async () => {
  await request(baseUrl).get('/health');
  const res = await request(baseUrl).get('/metrics');
  expect(res.status).toBe(200);
  const body = res.text;
  expect(body).toContain('arqivo_requests_total');
  expect(body).toContain('arqivo_route_latency_seconds_bucket');
  expect(body).toContain('arqivo_status_code_total');
});


