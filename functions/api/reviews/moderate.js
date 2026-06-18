// Moderation endpoint (Cloudflare D1) — owner only.
//   POST /api/reviews/moderate  { id, action: 'approve' | 'reject' | 'delete' }
// Requires the ADMIN_TOKEN (set in Pages → Settings → Environment variables)
// sent as  Authorization: Bearer <token>.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'Reviews are not configured yet.' }, 500);

  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return json({ error: 'unauthorized' }, 401);

  let data;
  try { data = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  const id = parseInt(data.id, 10);
  const action = data.action;
  if (!id || !['approve', 'reject', 'delete'].includes(action)) return json({ error: 'Bad request.' }, 400);

  if (action === 'delete') {
    await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
  } else {
    await env.DB.prepare('UPDATE reviews SET status = ? WHERE id = ?')
      .bind(action === 'approve' ? 'approved' : 'rejected', id).run();
  }
  return json({ ok: true });
}
