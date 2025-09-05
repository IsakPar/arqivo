let totalRequests = 0;
let totalUploadBytes = 0;
const routeCounters = new Map<string, number>();

export function incRequest(method: string, path: string) {
  totalRequests += 1;
  const key = `${method} ${path}`;
  routeCounters.set(key, (routeCounters.get(key) || 0) + 1);
}

export function addUploadBytes(n: number) {
  totalUploadBytes += n;
}

export function renderPrometheus(): string {
  const lines: string[] = [];
  lines.push('# HELP arqivo_requests_total Total HTTP requests');
  lines.push('# TYPE arqivo_requests_total counter');
  lines.push(`arqivo_requests_total ${totalRequests}`);
  lines.push('# HELP arqivo_upload_bytes_total Total uploaded bytes');
  lines.push('# TYPE arqivo_upload_bytes_total counter');
  lines.push(`arqivo_upload_bytes_total ${totalUploadBytes}`);
  for (const [key, value] of routeCounters.entries()) {
    const [method, path] = key.split(' ');
    lines.push(`arqivo_route_requests_total{method="${method}",path="${path}"} ${value}`);
  }
  return lines.join('\n') + '\n';
}


