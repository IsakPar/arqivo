import http from 'node:http';

function get(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    http.get({ host: 'localhost', port: 3001, path }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

async function main() {
  const health = await get('/health');
  if (!health.includes('"ok":true')) throw new Error('health failed');
  const metrics = await get('/metrics');
  if (!metrics.includes('arqivo_requests_total')) throw new Error('metrics failed');
  // Strict auth rejection check (unauthenticated)
  process.env.STRICT_AUTH = 'true';
  await new Promise<void>((resolve, reject) => {
    const req = http.request({ host: 'localhost', port: 3001, path: '/v1/blobs/test-id', method: 'PUT' }, (res) => {
      if (res.statusCode !== 401) reject(new Error('expected 401 for unauthenticated PUT'));
      else resolve();
    });
    req.on('error', reject);
    req.end(Buffer.from('ciphertext'));
  });
  console.log('integration tests passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


