import request from 'supertest';
import { startServer, stopServer } from './utils/server';

let baseUrl: string;

beforeAll(async () => ({ baseUrl } = await startServer({ USE_MEMORY_LIMITER: 'true' } as any)));
afterAll(async () => await stopServer());

describe('Idempotency middleware', () => {
  it('replays the same response for identical Idempotency-Key on PUT /v1/blobs/:id', async () => {
    const body = Buffer.from('ciphertext');
    // sha256 of 'ciphertext'
    const id = '5a7163d75d5c9bf58eca7b14543156e749642f4b40877b6faaa61f44926a2f90';
    const key = 'test-idem-1';
    // First request
    const r1 = await request(baseUrl)
      .put('/v1/blobs/' + id)
      .set('Authorization', 'Bearer dev')
      .set('Idempotency-Key', key)
      .send(body);
    // Second request (replay)
    const r2 = await request(baseUrl)
      .put('/v1/blobs/' + id)
      .set('Authorization', 'Bearer dev')
      .set('Idempotency-Key', key)
      .send(body);
    expect(r2.status).toBe(r1.status);
    expect(r2.headers['idempotent-replay']).toBe('true');
    expect(r2.body.ok).toBe(r1.body.ok);
    expect(r2.body.code).toBe(r1.body.code);
  });
});


