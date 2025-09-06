import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../env.js';
import { query } from '../db.js';

type Plan = 'standard' | 'pro';

async function ensureBillingTables() {
  await query(`
    create table if not exists billing_customers (
      account_id uuid primary key references accounts(account_id) on delete cascade,
      stripe_customer_id text unique not null,
      created_at timestamptz not null default now()
    );
    create table if not exists billing_subscriptions (
      account_id uuid primary key references accounts(account_id) on delete cascade,
      stripe_subscription_id text unique not null,
      plan text not null,
      status text not null,
      current_period_end timestamptz,
      cancel_at_period_end boolean not null default false,
      raw jsonb not null default '{}'::jsonb,
      updated_at timestamptz not null default now()
    );
  `);
}

async function getOrCreateCustomer(accountId: string, stripe: any): Promise<string> {
  const existing = await query<{ stripe_customer_id: string }>(
    'select stripe_customer_id from billing_customers where account_id = $1',
    [accountId]
  );
  if (existing.rows.length > 0) return existing.rows[0].stripe_customer_id;
  const customer = await stripe.customers.create({ metadata: { account_id: accountId } });
  await query('insert into billing_customers(account_id, stripe_customer_id) values ($1,$2)', [accountId, customer.id]);
  return customer.id as string;
}

export async function billingRoutes(app: FastifyInstance) {
  try { await ensureBillingTables(); } catch {}
  let stripe: any = null;
  if (env.STRIPE_SECRET_KEY) {
    const mod = await import('stripe');
    stripe = new mod.default(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }

  app.post('/billing/checkout', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!stripe) return reply.code(503).send({ ok: false, code: 'stripe_unconfigured' });
    const accountId = (req as any).accountId as string;
    const body = (req.body as any) || {};
    const plan = (String(body.plan || '') as Plan).toLowerCase() as Plan;
    const priceId = plan === 'standard' ? env.STRIPE_PRICE_STANDARD : plan === 'pro' ? env.STRIPE_PRICE_PRO : null;
    if (!priceId) return reply.code(400).send({ ok: false, code: 'invalid_plan' });

    const customerId = await getOrCreateCustomer(accountId, stripe);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: env.BILLING_RETURN_URL || 'http://localhost:3000/return?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: env.BILLING_CANCEL_URL || 'http://localhost:3000/pricing',
      metadata: { account_id: accountId, plan },
    });
    return { url: session.url };
  });

  app.post('/billing/portal', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!stripe) return reply.code(503).send({ ok: false, code: 'stripe_unconfigured' });
    const accountId = (req as any).accountId as string;
    const customerId = await getOrCreateCustomer(accountId, stripe);
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: env.BILLING_RETURN_URL || 'http://localhost:3000/return',
    });
    return { url: portal.url };
  });

  app.get('/billing/status', async (req: FastifyRequest, _reply: FastifyReply) => {
    const accountId = (req as any).accountId as string;
    const sub = await query<{ plan: string; status: string; current_period_end: string | null }>(
      'select plan, status, current_period_end from billing_subscriptions where account_id = $1',
      [accountId]
    );
    if (sub.rows.length === 0) return { plan: 'free', status: 'none' };
    return sub.rows[0];
  });
}


