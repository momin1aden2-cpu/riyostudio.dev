// Public reviews API (Cloudflare D1).
//   GET  /api/reviews              → approved reviews + aggregate (public)
//   GET  /api/reviews?status=pending → pending reviews (requires ADMIN_TOKEN)
//   POST /api/reviews              → submit a review (lands as 'pending')
//
// Privacy: we never store or return an email or a raw IP. The only identifier
// kept is a salted SHA-256 of the IP, used solely to rate-limit submissions.

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });

const tidy = (s, max) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, max);

async function hashIp(ip, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}|${salt}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'Reviews are not configured yet.' }, 500);

  const url = new URL(request.url);

  // Admin: list pending reviews (token required)
  if (url.searchParams.get('status') === 'pending') {
    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return json({ error: 'unauthorized' }, 401);
    const { results } = await env.DB.prepare(
      'SELECT id, name, rating, body, tool, created_at FROM reviews WHERE status = ? ORDER BY created_at DESC LIMIT 200'
    ).bind('pending').all();
    return json({ reviews: results || [] });
  }

  // Public: approved reviews (latest 200 for display) + accurate aggregate
  // computed over ALL approved rows, plus the per-star distribution.
  const { results } = await env.DB.prepare(
    "SELECT name, rating, body, tool, created_at FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT 200"
  ).all();
  const list = results || [];

  const { results: agg } = await env.DB.prepare(
    "SELECT rating, COUNT(*) AS n FROM reviews WHERE status = 'approved' GROUP BY rating"
  ).all();
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let count = 0, sum = 0;
  (agg || []).forEach((row) => { dist[row.rating] = row.n; count += row.n; sum += row.rating * row.n; });
  const average = count ? Math.round((sum / count) * 10) / 10 : 0;

  return json({ reviews: list, count, average, distribution: dist }, 200, { 'Cache-Control': 'public, max-age=60' });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) return json({ error: 'Reviews are not configured yet.' }, 500);

  let data;
  try { data = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  // Honeypot — real users never fill this hidden field; bots do. Accept silently and drop.
  if (data.website) return json({ ok: true });

  const rating = parseInt(data.rating, 10);
  const body = tidy(data.body, 1000);
  const name = tidy(data.name, 40);
  const tool = tidy(data.tool, 24);

  if (!(rating >= 1 && rating <= 5)) return json({ error: 'Please choose a 1–5 star rating.' }, 400);
  if (body.length < 3) return json({ error: 'Please write a short review.' }, 400);

  // Light rate-limit: at most 3 submissions per IP-hash per 24h.
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const ipHash = await hashIp(ip, env.IP_SALT || 'riyo-reviews');
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { results: recent } = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM reviews WHERE ip_hash = ? AND created_at > ?'
  ).bind(ipHash, since).all();
  if (recent && recent[0] && recent[0].n >= 3) {
    return json({ error: 'Thanks — you’ve already shared a few. Try again later.' }, 429);
  }

  await env.DB.prepare(
    'INSERT INTO reviews (name, rating, body, tool, status, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(name || null, rating, body, tool || null, 'pending', ipHash, new Date().toISOString()).run();

  return json({ ok: true });
}
