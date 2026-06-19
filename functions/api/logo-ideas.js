// Logo idea helper (Cloudflare Workers AI). Turns a typed brand name + business
// description into concrete icon search terms + a tagline, to make the Logo
// Maker's auto-generator relevant for ANY business (not just the curated list).
//
// Privacy: only the brand name + description the user types are sent, and only
// to Cloudflare's own edge AI (already this site's host). No files, nothing else.
// If the AI binding isn't set or anything fails, it returns an error and the
// Logo Maker falls back to its fully client-side generator.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function extractJson(text) {
  if (!text) return null;
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

const STYLES = ['minimal', 'bold', 'luxury', 'playful', 'modern'];
const MOODS = ['dark', 'light', 'vibrant', 'calm', 'luxury'];

const RATE_LIMIT = 15;       // max AI requests …
const RATE_WINDOW_SEC = 60;  // … per IP per minute

async function hashIp(ip, salt) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}|${salt}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Per-IP throttle backed by D1. Fails OPEN: any DB issue lets the request
// through rather than breaking the feature. Returns true if the caller is over
// the limit and should be refused.
async function isRateLimited(env, request) {
  if (!env.DB) return false; // no DB bound → can't throttle, don't block
  try {
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const ipHash = await hashIp(ip, env.IP_SALT || 'riyo-logo');
    const since = new Date(Date.now() - RATE_WINDOW_SEC * 1000).toISOString();
    const { results } = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM ai_hits WHERE ip_hash = ? AND created_at > ?'
    ).bind(ipHash, since).all();
    if (results && results[0] && results[0].n >= RATE_LIMIT) return true;
    await env.DB.prepare('INSERT INTO ai_hits (ip_hash, created_at) VALUES (?, ?)')
      .bind(ipHash, new Date().toISOString()).run();
    // Opportunistic cleanup so the table can't grow unbounded.
    await env.DB.prepare('DELETE FROM ai_hits WHERE created_at < ?')
      .bind(new Date(Date.now() - 10 * 60 * 1000).toISOString()).run();
    return false;
  } catch (e) {
    return false; // fail open
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.AI) return json({ error: 'AI not configured' }, 503);

  let data;
  try { data = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  const brand = String(data.brand || '').slice(0, 80).trim();
  const description = String(data.description || '').slice(0, 300).trim();
  if (!brand && !description) return json({ error: 'empty' }, 400);

  if (await isRateLimited(env, request)) return json({ error: 'rate_limited' }, 429);

  const system = 'You are a senior brand/logo designer. You reply with ONLY a JSON object, no prose, no code fences.';
  const user =
    'Business name: ' + (brand || '(not given)') + '\n' +
    'What it does: ' + (description || '(not given)') + '\n\n' +
    'Return JSON exactly like: {"iconKeywords":["shield","lock","fingerprint","camera","eye"],"tagline":"Protecting what matters","style":"bold","paletteMood":"dark"}\n' +
    '- iconKeywords: 6-8 SINGLE-WORD, concrete, literal objects that an icon library would have and that strongly represent THIS business (for a security firm: shield, lock, fingerprint, camera, eye, key, radar). No abstract words.\n' +
    '- tagline: a short 3-6 word marketing tagline.\n' +
    '- style: one of minimal, bold, luxury, playful, modern.\n' +
    '- paletteMood: one of dark, light, vibrant, calm, luxury.';

  let text = '';
  try {
    const resp = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 300,
      temperature: 0.4,
    });
    text = (resp && (resp.response || resp.result || resp.text)) || '';
  } catch (e) {
    return json({ error: 'ai_failed' }, 502);
  }

  const parsed = extractJson(text);
  if (!parsed) return json({ error: 'no_json' }, 502);

  // Sanitise: keep clean, short, icon-able keywords.
  let keywords = Array.isArray(parsed.iconKeywords) ? parsed.iconKeywords : [];
  keywords = keywords
    .map((k) => String(k || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ').trim())
    .filter((k) => k.length >= 2 && k.length <= 24);
  keywords = [...new Set(keywords)].slice(0, 8);

  const tagline = String(parsed.tagline || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const style = STYLES.includes(parsed.style) ? parsed.style : 'modern';
  const paletteMood = MOODS.includes(parsed.paletteMood) ? parsed.paletteMood : 'dark';

  if (!keywords.length) return json({ error: 'no_keywords' }, 502);
  return json({ iconKeywords: keywords, tagline, style, paletteMood });
}
