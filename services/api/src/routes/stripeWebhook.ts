import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import getRawBody from 'raw-body';
import { env } from '../env.js';
import { query } from '../db.js';

export async function stripeWebhookRoute(app: FastifyInstance) {
  let stripe: any = null;
  if (env.STRIPE_SECRET_KEY) {
    const mod = await import('stripe');
    stripe = new mod.default(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }

  app.post('/webhooks/stripe', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return reply.code(503).send({ ok: false });
    const buf = await getRawBody(req.raw as any);
    const sig = req.headers['stripe-signature'] as string | undefined;
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return reply.code(400).send({ ok: false, code: 'bad_signature' });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const plan = (session.metadata?.plan || 'standard') as string;
          // Find account by billing_customers
          const cust = await query<{ account_id: string }>('select account_id from billing_customers where stripe_customer_id = $1', [customerId]);
          if (cust.rows.length > 0) {
            await query(
              `insert into billing_subscriptions(account_id, stripe_subscription_id, plan, status, raw)
               values ($1,$2,$3,$4,$5)
               on conflict (account_id) do update set stripe_subscription_id=EXCLUDED.stripe_subscription_id, plan=EXCLUDED.plan, status=EXCLUDED.status, raw=EXCLUDED.raw, updated_at=now()`,
              [cust.rows[0].account_id, subscriptionId, plan, 'active', JSON.stringify(session)]
            );
          }
          break;
        }
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
        case 'customer.subscription.created': {
          const sub = event.data.object;
          const customerId = sub.customer as string;
          const status = sub.status as string;
          const plan = (sub.items?.data?.[0]?.price?.nickname || 'standard').toString().toLowerCase();
          const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
          const cust = await query<{ account_id: string }>('select account_id from billing_customers where stripe_customer_id = $1', [customerId]);
          if (cust.rows.length > 0) {
            await query(
              `insert into billing_subscriptions(account_id, stripe_subscription_id, plan, status, current_period_end, cancel_at_period_end, raw)
               values ($1,$2,$3,$4,$5,$6,$7)
               on conflict (account_id) do update set stripe_subscription_id=EXCLUDED.stripe_subscription_id, plan=EXCLUDED.plan, status=EXCLUDED.status, current_period_end=EXCLUDED.current_period_end, cancel_at_period_end=EXCLUDED.cancel_at_period_end, raw=EXCLUDED.raw, updated_at=now()`,
              [cust.rows[0].account_id, sub.id, plan, status, periodEnd, Boolean(sub.cancel_at_period_end), JSON.stringify(sub)]
            );
          }
          break;
        }
        default:
          break;
      }
    } catch (e) {
      // swallow errors to avoid retries storms during dev
    }
    return reply.code(200).send({ received: true });
  });
}


