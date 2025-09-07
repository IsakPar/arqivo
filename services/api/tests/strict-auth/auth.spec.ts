import request from 'supertest';
import { startStrictServer, stopStrictServer, baseUrl } from './setup';

beforeAll(async () => {
  await startStrictServer();
});

afterAll(async () => {
  await stopStrictServer();
});

it('rejects unauthenticated blob PUT when STRICT_AUTH=true', async () => {
  const res = await request(baseUrl)
    .put('/v1/blobs/test-id')
    .set('x-cipher-hash', 'deadbeef')
    .send(Buffer.from('ciphertext'));
  expect(res.status).toBe(401);
  expect(res.body.code).toBe('auth_required');
});


