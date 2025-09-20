import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { query, withAccount } from '../db.js';
import { getRedis } from '../lib/redis.js';
import { incTaxEdgesAdded, incTaxEdgesRemoved, incTaxCacheHit, incTaxCacheMiss } from '../metrics.js';

const Cipher = z.object({ data: z.string(), nonce: z.string(), tag: z.string().optional() });
const CreateLabel = z.object({ name: Cipher, slugToken: z.string().length(52) });
const EdgeParams = z.object({ id: z.string().uuid() });
const AddEdgeBody = z.object({ parentId: z.string().uuid() });
const RemoveEdgeBody = z.object({ parentId: z.string().uuid() });
const MoveBody = z.object({ from: z.array(z.string().uuid()).min(1), to: z.string().uuid() });
const PatchLabel = z.object({ name: Cipher.optional(), slugToken: z.string().length(52).optional() });
const DeleteLabelQuery = z.object({ cascade: z.coerce.boolean().optional() });
const ChildrenQuery = z.object({ id: z.string().uuid(), after: z.string().uuid().optional(), limit: z.coerce.number().min(1).max(500).optional() });
const AncestorsQuery = z.object({ id: z.string().uuid() });
const ParentsQuery = z.object({ id: z.string().uuid() });
const FileParams = z.object({ fileId: z.string() });
const AttachBody = z.object({ labelId: z.string().uuid() });
const FileLabelParams = z.object({ fileId: z.string(), labelId: z.string().uuid() });

export async function taxonomyRoutes(app: FastifyInstance) {
  app.post('/v1/labels', async (req, rep) => {
    const b = CreateLabel.parse(req.body);
    const data = Buffer.from(b.name.data, 'base64');
    const nonce = Buffer.from(b.name.nonce, 'base64');
    const tag = b.name.tag ? Buffer.from(b.name.tag, 'base64') : Buffer.alloc(0);
    const acct = (req as any).accountId as string;
    const id = await withAccount<string>(acct, async (c) => {
      const r = await c.query<{ id: string }>("select create_label($1,$2,$3,$4) as id", [data, nonce, tag, b.slugToken]);
      return r.rows[0].id;
    });
    return rep.send({ id });
  });

  app.post('/v1/labels/:id/edges', async (req, rep) => {
    const p = EdgeParams.parse(req.params);
    const b = AddEdgeBody.parse(req.body);
    const acct = (req as any).accountId as string;
    await withAccount(acct, async (c) => { await c.query("select add_edge($1,$2)", [b.parentId, p.id]); return null as any; });
    incTaxEdgesAdded(1);
    try {
      const r = await getRedis();
      const acct = (req as any).accountId as string;
      await r?.del(`tax:${acct}:${b.parentId}:children`);
    } catch {}
    return rep.status(204).send();
  });

  app.post('/v1/labels/:id/move', async (req, rep) => {
    const p = EdgeParams.parse(req.params);
    const b = MoveBody.parse(req.body);
    const acct = (req as any).accountId as string;
    await query('begin');
    try {
      await withAccount(acct, async (c) => { await c.query("select move_label($1,$2,$3)", [p.id, b.from, b.to]); return null as any; });
      await query('commit');
    } catch (e) {
      await query('rollback');
      throw e;
    }
    incTaxEdgesRemoved(b.from.length);
    incTaxEdgesAdded(1);
    try {
      const r = await getRedis();
      const acct = (req as any).accountId as string;
      await r?.del(`tax:${acct}:${b.to}:children`);
      for (const op of b.from) await r?.del(`tax:${acct}:${op}:children`);
    } catch {}
    return rep.status(204).send();
  });

  app.delete('/v1/labels/:id/edges', async (req, rep) => {
    const p = EdgeParams.parse(req.params);
    const b = RemoveEdgeBody.parse(req.body);
    const acct = (req as any).accountId as string;
    await withAccount(acct, async (c) => { await c.query("select remove_edge($1,$2)", [b.parentId, p.id]); return null as any; });
    incTaxEdgesRemoved(1);
    try {
      const r = await getRedis();
      const acct = (req as any).accountId as string;
      await r?.del(`tax:${acct}:${b.parentId}:children`);
    } catch {}
    return rep.status(204).send();
  });

  app.delete('/v1/labels/:id', async (req, rep) => {
    const p = EdgeParams.parse(req.params);
    const q = DeleteLabelQuery.parse(req.query);
    const acct = (req as any).accountId as string;
    await withAccount(acct, async (c) => { await c.query("select delete_label($1,$2)", [p.id, q.cascade ?? false]); return null as any; });
    return rep.status(204).send();
  });

  app.patch('/v1/labels/:id', async (req, rep) => {
    const p = EdgeParams.parse(req.params);
    const b = PatchLabel.parse(req.body);
    if (b.name || b.slugToken) {
      const acct = (req as any).accountId as string;
      const data = b.name ? Buffer.from(b.name.data, 'base64') : null;
      const nonce = b.name ? Buffer.from(b.name.nonce, 'base64') : null;
      const tag = b.name?.tag ? Buffer.from(b.name.tag, 'base64') : null;
      await withAccount(acct, async (c) => { await c.query("select rename_label($1,$2,$3,$4,$5)", [p.id, data, nonce, tag, b.slugToken ?? null]); return null as any; });
    }
    return rep.status(204).send();
  });

  app.get('/v1/labels/children', async (req, rep) => {
    const q = ChildrenQuery.parse(req.query);
    const ZERO = '00000000-0000-0000-0000-000000000000';
    const acct = (req as any).accountId as string;
    try {
      const r = await getRedis();
      const cacheKey = `tax:${acct}:${q.id}:children:${q.after ?? ''}:${q.limit ?? 200}`;
      const cached = await r?.get(cacheKey);
      if (cached) { incTaxCacheHit(1); return rep.send(JSON.parse(cached)); }
      const build = async () => {
        if (q.id === ZERO) {
          const res = await withAccount(acct, async (c) => c.query<any>(`
             select l.id, l.name_cipher as data, l.name_nonce as nonce, l.name_tag as tag
             from label l
             where l.account_id = current_setting('app.account_id')::uuid
               and not exists (select 1 from label_edge e where e.account_id = l.account_id and e.child_id = l.id)
               and ($2::uuid is null or l.id > $2::uuid)
             order by l.id limit $2`, [q.after ?? null, q.limit ?? 200]));
          return { children: res.rows.map((r: any) => ({ id: r.id, name: { data: (r.data || Buffer.alloc(0)).toString('base64'), nonce: (r.nonce || Buffer.alloc(0)).toString('base64'), tag: (r.tag || Buffer.alloc(0)).toString('base64') } })) };
        } else {
          const res = await withAccount(acct, async (c) => c.query<any>(`with c as (
               select lc.descendant_id from label_closure lc
               where lc.account_id = current_setting('app.account_id')::uuid and lc.ancestor_id = $1 and lc.depth = 1
                 and ($2::uuid is null or lc.descendant_id > $2::uuid)
               order by lc.descendant_id limit $3)
             select l.id, l.name_cipher as data, l.name_nonce as nonce, l.name_tag as tag
             from c join label l on l.id = c.descendant_id`, [q.id, q.after ?? null, q.limit ?? 200]));
          return { children: res.rows.map((r: any) => ({ id: r.id, name: { data: (r.data || Buffer.alloc(0)).toString('base64'), nonce: (r.nonce || Buffer.alloc(0)).toString('base64'), tag: (r.tag || Buffer.alloc(0)).toString('base64') } })) };
        }
      };
      const payload = await build(); incTaxCacheMiss(1);
      await r?.set(cacheKey, JSON.stringify(payload), { EX: 30 });
      return rep.send(payload);
    } catch {}
    if (q.id === ZERO) {
      const acct = (req as any).accountId as string;
      const res = await withAccount(acct, async (c) => c.query<any>(`
         select l.id, l.name_cipher as data, l.name_nonce as nonce, l.name_tag as tag
         from label l
         where l.account_id = current_setting('app.account_id')::uuid
           and not exists (select 1 from label_edge e where e.account_id = l.account_id and e.child_id = l.id)
           and ($2::uuid is null or l.id > $2::uuid)
         order by l.id limit $2`, [q.after ?? null, q.limit ?? 200]));
      return rep.send({ children: res.rows.map((r: any) => ({ id: r.id, name: { data: (r.data || Buffer.alloc(0)).toString('base64'), nonce: (r.nonce || Buffer.alloc(0)).toString('base64'), tag: (r.tag || Buffer.alloc(0)).toString('base64') } })) });
    } else {
      const acct = (req as any).accountId as string;
      const res = await withAccount(acct, async (c) => c.query<any>(`with c as (
           select lc.descendant_id from label_closure lc
           where lc.account_id = current_setting('app.account_id')::uuid and lc.ancestor_id = $1 and lc.depth = 1
             and ($2::uuid is null or lc.descendant_id > $2::uuid)
           order by lc.descendant_id limit $3)
         select l.id, l.name_cipher as data, l.name_nonce as nonce, l.name_tag as tag
         from c join label l on l.id = c.descendant_id`, [q.id, q.after ?? null, q.limit ?? 200]));
      return rep.send({ children: res.rows.map((r: any) => ({ id: r.id, name: { data: (r.data || Buffer.alloc(0)).toString('base64'), nonce: (r.nonce || Buffer.alloc(0)).toString('base64'), tag: (r.tag || Buffer.alloc(0)).toString('base64') } })) });
    }
  });

  app.get('/v1/labels/ancestors', async (req, rep) => {
    const q = AncestorsQuery.parse(req.query);
    const acct = (req as any).accountId as string;
    const { rows } = await withAccount(acct, async (c) => c.query<{ ancestor_id: string }>(
      "select ancestor_id from label_closure where account_id = current_setting('app.account_id')::uuid and descendant_id = $1 order by depth asc",
      [q.id]
    ));
    return rep.send({ ancestors: rows.map(r => r.ancestor_id) });
  });

  app.get('/v1/labels/parents', async (req, rep) => {
    const q = ParentsQuery.parse(req.query);
    const acct = (req as any).accountId as string;
    const { rows } = await withAccount(acct, async (c) => c.query<{ parent_id: string }>(
      "select parent_id from label_edge where account_id = current_setting('app.account_id')::uuid and child_id = $1",
      [q.id]
    ));
    return rep.send({ parents: rows.map(r => r.parent_id) });
  });

  app.post('/v1/files/:fileId/labels', async (req, rep) => {
    const p = FileParams.parse(req.params);
    const b = AttachBody.parse(req.body);
    const acct = (req as any).accountId as string;
    await withAccount(acct, async (c) => { await c.query("select attach_file($1,$2)", [p.fileId, b.labelId]); return null as any; });
    return rep.status(204).send();
  });

  app.delete('/v1/files/:fileId/labels/:labelId', async (req, rep) => {
    const p = FileLabelParams.parse(req.params);
    const acct = (req as any).accountId as string;
    await withAccount(acct, async (c) => { await c.query("select detach_file($1,$2)", [p.fileId, p.labelId]); return null as any; });
    return rep.status(204).send();
  });
}


