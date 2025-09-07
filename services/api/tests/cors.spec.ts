import request from 'supertest';
import { startServer, stopServer } from './utils/server';

let baseUrl: string;
beforeAll(async () => ({ baseUrl } = await startServer({ WEB_ORIGIN: 'http://localhost:3000' } as any)));
afterAll(async () => await stopServer());

it('allows allowed origin', async () => {
  const res = await request(baseUrl).get('/health').set('Origin', 'http://localhost:3000');
  expect(res.status).toBe(200);
  expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
});

it('blocks disallowed origin', async () => {
  const res = await request(baseUrl).get('/health').set('Origin', 'https://evil.example');
  // CORS failure often returns 500 or no ACAO header depending on framework behavior
  expect(res.headers['access-control-allow-origin']).toBeUndefined();
});


