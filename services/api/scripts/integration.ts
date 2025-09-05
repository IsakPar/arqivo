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
  console.log('integration tests passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


