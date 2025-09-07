import type { FastifyReply } from 'fastify';

export type ErrorCode =
  | 'invalid_input'
  | 'unauthorized'
  | 'auth_required'
  | 'id_mismatch'
  | 'hash_mismatch'
  | 'bad_integrity'
  | 'payload_too_large'
  | 'metadata_too_large'
  | 'index_shard_too_large'
  | 'not_found'
  | 'conflict'
  | 'internal';

export function sendError(reply: FastifyReply, status: number, code: ErrorCode, requestId?: string, extra?: Record<string, unknown>) {
  const body: Record<string, unknown> = { ok: false, code };
  if (requestId) body.requestId = requestId;
  if (extra) {
    // Shallow sanitize: trim long strings and drop tokens
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(extra)) {
      if (typeof v === 'string') {
        if (/token|authorization|password/i.test(k)) continue;
        safe[k] = v.length > 200 ? v.slice(0, 200) : v;
      } else {
        safe[k] = v as unknown;
      }
    }
    Object.assign(body, safe);
  }
  return reply.code(status).send(body);
}


