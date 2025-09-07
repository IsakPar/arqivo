import request from 'supertest';
import { startServer, stopServer } from './utils/server';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer({ USE_MEMORY_LIMITER: 'true', RATE_CAPACITY: '2', RATE_REFILL: '0', MAX_BLOB_BYTES: '50000000' } as any)));
afterAll(async () => await stopServer());

it('returns 429 after capacity is exceeded', async () => {
  const cap = 2;
  const requests = [
    request(baseUrl).get('/health'),
    request(baseUrl).get('/health'),
    request(baseUrl).get('/health'),
    request(baseUrl).get('/health'),
  ];
  const results = await Promise.all(requests);
  const codes = results.map(r => r.status).sort();
  expect(codes.filter(c => c === 200).length).toBeGreaterThanOrEqual(1);
  expect(codes.some(c => c === 429)).toBe(true);
});


