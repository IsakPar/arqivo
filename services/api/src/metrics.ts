let totalRequests = 0;
let totalUploadBytes = 0;
let totalRequestBytes = 0;
let totalResponseBytes = 0;
const routeCounters = new Map<string, number>();
const statusCounters = new Map<number, number>();
let taxonomyEdgesAdded = 0;
let taxonomyEdgesRemoved = 0;
let taxonomyCacheHit = 0;
let taxonomyCacheMiss = 0;

// Prometheus-style histogram buckets (seconds)
const latencyBuckets = [
  0.005, 0.01, 0.025, 0.05, 0.1,
  0.25, 0.5, 1, 2.5, 5, 10
];
type LatencyStats = { buckets: number[]; sum: number; count: number };
const latencyByRoute = new Map<string, LatencyStats>();

export function incRequest(method: string, path: string) {
  totalRequests += 1;
  const key = `${method} ${path}`;
  routeCounters.set(key, (routeCounters.get(key) || 0) + 1);
}

export function addUploadBytes(n: number) {
  totalUploadBytes += n;
}

export function addRequestBytes(n: number) {
  if (Number.isFinite(n) && n > 0) totalRequestBytes += n;
}

export function addResponseBytes(n: number) {
  if (Number.isFinite(n) && n > 0) totalResponseBytes += n;
}

export function incStatus(code: number) {
  statusCounters.set(code, (statusCounters.get(code) || 0) + 1);
}

export function observeLatency(method: string, path: string, seconds: number) {
  const key = `${method} ${path}`;
  let stats = latencyByRoute.get(key);
  if (!stats) {
    stats = { buckets: Array(latencyBuckets.length).fill(0), sum: 0, count: 0 };
    latencyByRoute.set(key, stats);
  }
  stats.sum += seconds;
  stats.count += 1;
  for (let i = 0; i < latencyBuckets.length; i++) {
    if (seconds <= latencyBuckets[i]) {
      stats.buckets[i] += 1;
    }
  }
}

export function incTaxEdgesAdded(n: number) { taxonomyEdgesAdded += n; }
export function incTaxEdgesRemoved(n: number) { taxonomyEdgesRemoved += n; }
export function incTaxCacheHit(n: number) { taxonomyCacheHit += n; }
export function incTaxCacheMiss(n: number) { taxonomyCacheMiss += n; }

export function renderPrometheus(): string {
  const lines: string[] = [];
  lines.push('# HELP arqivo_requests_total Total HTTP requests');
  lines.push('# TYPE arqivo_requests_total counter');
  lines.push(`arqivo_requests_total ${totalRequests}`);
  lines.push('# HELP arqivo_upload_bytes_total Total uploaded bytes');
  lines.push('# TYPE arqivo_upload_bytes_total counter');
  lines.push(`arqivo_upload_bytes_total ${totalUploadBytes}`);
  lines.push('# HELP arqivo_request_bytes_total Total request bytes (Content-Length)');
  lines.push('# TYPE arqivo_request_bytes_total counter');
  lines.push(`arqivo_request_bytes_total ${totalRequestBytes}`);
  lines.push('# HELP arqivo_response_bytes_total Total response bytes');
  lines.push('# TYPE arqivo_response_bytes_total counter');
  lines.push(`arqivo_response_bytes_total ${totalResponseBytes}`);
  for (const [key, value] of routeCounters.entries()) {
    const [method, path] = key.split(' ');
    lines.push(`arqivo_route_requests_total{method="${method}",path="${path}"} ${value}`);
  }
  lines.push('# HELP arqivo_taxonomy_edges_added_total Taxonomy edges added');
  lines.push('# TYPE arqivo_taxonomy_edges_added_total counter');
  lines.push(`arqivo_taxonomy_edges_added_total ${taxonomyEdgesAdded}`);
  lines.push('# HELP arqivo_taxonomy_edges_removed_total Taxonomy edges removed');
  lines.push('# TYPE arqivo_taxonomy_edges_removed_total counter');
  lines.push(`arqivo_taxonomy_edges_removed_total ${taxonomyEdgesRemoved}`);
  lines.push('# HELP arqivo_taxonomy_cache_hits_total Taxonomy cache hits');
  lines.push('# TYPE arqivo_taxonomy_cache_hits_total counter');
  lines.push(`arqivo_taxonomy_cache_hits_total ${taxonomyCacheHit}`);
  lines.push('# HELP arqivo_taxonomy_cache_misses_total Taxonomy cache misses');
  lines.push('# TYPE arqivo_taxonomy_cache_misses_total counter');
  lines.push(`arqivo_taxonomy_cache_misses_total ${taxonomyCacheMiss}`);
  lines.push('# HELP arqivo_status_code_total HTTP responses by status code');
  lines.push('# TYPE arqivo_status_code_total counter');
  for (const [code, value] of statusCounters.entries()) {
    lines.push(`arqivo_status_code_total{code="${code}"} ${value}`);
  }
  lines.push('# HELP arqivo_route_latency_seconds Request latency in seconds');
  lines.push('# TYPE arqivo_route_latency_seconds histogram');
  for (const [key, stats] of latencyByRoute.entries()) {
    const [method, path] = key.split(' ');
    let cumulative = 0;
    for (let i = 0; i < latencyBuckets.length; i++) {
      cumulative += stats.buckets[i];
      const le = latencyBuckets[i];
      lines.push(`arqivo_route_latency_seconds_bucket{method="${method}",path="${path}",le="${le}"} ${cumulative}`);
    }
    // +Inf bucket
    lines.push(`arqivo_route_latency_seconds_bucket{method="${method}",path="${path}",le="+Inf"} ${stats.count}`);
    lines.push(`arqivo_route_latency_seconds_sum{method="${method}",path="${path}"} ${stats.sum}`);
    lines.push(`arqivo_route_latency_seconds_count{method="${method}",path="${path}"} ${stats.count}`);
  }
  return lines.join('\n') + '\n';
}


