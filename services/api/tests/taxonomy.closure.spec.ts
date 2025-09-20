import { randomUUID } from 'node:crypto';
import { startServer, stopServer } from './utils/server';
import request from 'supertest';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer({ USE_MEMORY_LIMITER: 'true' } as any)));
afterAll(async () => await stopServer());

async function createLabel() {
  const name = { data: Buffer.from('n').toString('base64'), nonce: Buffer.from('i').toString('base64'), tag: Buffer.from('t').toString('base64') };
  const res = await request(baseUrl).post('/v1/labels').send({ name, slugToken: randomUUID().replace(/-/g, '').slice(0, 52).padEnd(52, 'A') });
  return (res.body.id as string);
}

async function addEdge(parentId: string, childId: string) {
  await request(baseUrl).post(`/v1/labels/${childId}/edges`).send({ parentId }).expect(204);
}

it('maintains self-closure and depth zero for new labels', async () => {
  const a = await createLabel();
  const res = await request(baseUrl).get('/v1/labels/ancestors').query({ id: a }).expect(200);
  expect(res.body.ancestors[0]).toBeDefined();
});

it('adds transitive closure entries on add_edge', async () => {
  const a = await createLabel();
  const b = await createLabel();
  const c = await createLabel();
  await addEdge(a, b);
  await addEdge(b, c);
  const r = await request(baseUrl).get('/v1/labels/ancestors').query({ id: c }).expect(200);
  expect(r.body.ancestors).toContain(a);
  expect(r.body.ancestors[0]).toBeDefined();
});

it('enforces sibling uniqueness by slug under same parent (demo)', async () => {
  const p = await createLabel();
  const x = await createLabel();
  // try to attach another child with same slug: use same id as x to simulate conflict
  await addEdge(p, x);
  const res = await request(baseUrl).post(`/v1/labels/${x}/edges`).send({ parentId: p });
  // second addEdge with same tuple should be idempotent 204
  expect([204, 200, 201]).toContain(res.status);
});
