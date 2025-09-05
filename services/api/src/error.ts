import type { FastifyReply } from 'fastify';

export type ErrorCode =
  | 'invalid_input'
  | 'unauthorized'
  | 'id_mismatch'
  | 'bad_hash'
  | 'payload_too_large'
  | 'metadata_too_large'
  | 'index_shard_too_large'
  | 'not_found'
  | 'conflict'
  | 'internal';

export function sendError(reply: FastifyReply, status: number, code: ErrorCode, requestId?: string, extra?: Record<string, unknown>) {
  const body: Record<string, unknown> = { ok: false, code };
  if (requestId) body.requestId = requestId;
  if (extra) Object.assign(body, extra);
  return reply.code(status).send(body);
}


