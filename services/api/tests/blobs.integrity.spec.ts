import request from 'supertest';
import { startServer, stopServer } from './utils/server';

let baseUrl: string;

beforeAll(async () => ({ baseUrl } = await startServer()));
afterAll(async () => await stopServer());

it('400 on integrity mismatch', async () => {
  const res = await request(baseUrl)
    .put('/v1/blobs/mismatch')
    .set('content-type', 'application/octet-stream')
    .set('x-cipher-hash', 'sha256:aaaaaaaa')
    .send(Buffer.from('ciphertext'));
  expect(res.status).toBe(400);
});

it('413 on >50MB payload', async () => {
  const big = Buffer.alloc(50_000_001, 1);
  const res = await request(baseUrl)
    .put('/v1/blobs/too-big')
    .set('content-type', 'application/octet-stream')
    .set('x-cipher-hash', 'sha256:deadbeef')
    .send(big);
  expect(res.status).toBe(413);
});


