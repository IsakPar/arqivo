import request from 'supertest';
import { startServer, stopServer } from './utils/server';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer()));
afterAll(async () => await stopServer());

it('413 on oversize metadata (>1MB)', async () => {
  const buf = Buffer.alloc(1_000_001, 1);
  const r = await request(baseUrl)
    .put('/v1/metadata/doc-1')
    .set('content-type', 'application/cbor')
    .send(buf);
  expect(r.status).toBe(413);
});

it('413 on oversize index shard (>5MB)', async () => {
  const buf = Buffer.alloc(5_000_001, 2);
  const r = await request(baseUrl)
    .put('/v1/index/shard-1')
    .set('content-type', 'application/cbor')
    .send(buf);
  expect(r.status).toBe(413);
});


