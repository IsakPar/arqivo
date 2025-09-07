import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '@clerk/backend';
import { env } from '../env.js';
import { query } from '../db.js';
import { randomUUID } from 'node:crypto';
import { sendError } from '../error.js';

export async function authMiddleware(app: FastifyInstance) {
	app.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
		// Allow health and metrics without auth in v0
		if (req.url === '/health' || req.url === '/metrics') return;

		let clerkUserId: string | undefined;
		const authHeader = req.headers.authorization;
		const strict = env.STRICT_AUTH === 'true';
		if (strict) {
			if (!env.CLERK_SECRET_KEY || !authHeader?.startsWith('Bearer ')) {
				return sendError(reply, 401, 'auth_required', req.id as string);
			}
			try {
				const token = authHeader.slice('Bearer '.length);
				const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
				clerkUserId = (payload as any).sub as string;
			} catch {
				return sendError(reply, 401, 'unauthorized', req.id as string);
			}
		} else {
			// Dev mode: validate if header present, else fallback to a demo user
			if (authHeader?.startsWith('Bearer ') && env.CLERK_SECRET_KEY) {
				try {
					const token = authHeader.slice('Bearer '.length);
					const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
					clerkUserId = (payload as any).sub as string;
				} catch {
					clerkUserId = 'dev_user';
				}
			} else {
				clerkUserId = 'dev_user';
			}
		}

		// Map to account
		const { rows } = await query<{ account_id: string; region_code: string }>(
			'select account_id, region_code from accounts where clerk_user_id = $1',
			[clerkUserId]
		);
		if (rows.length === 0) {
			const newId = randomUUID();
			await query('insert into accounts(account_id, clerk_user_id, region_code) values ($1,$2,$3)', [newId, clerkUserId, env.ACCOUNT_REGION_DEFAULT]);
			req.accountId = newId;
			req.regionCode = env.ACCOUNT_REGION_DEFAULT as 'us' | 'eu';
		} else {
			req.accountId = rows[0].account_id;
			req.regionCode = (rows[0].region_code as 'us' | 'eu') || (env.ACCOUNT_REGION_DEFAULT as 'us');
		}

		// Expose account id to DB session for RLS
		try { await query('select set_app_account($1)', [req.accountId as string]); } catch {}
	});
}



