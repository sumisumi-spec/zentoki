// ZENTOKI Plus license worker (Cloudflare Workers)
// POST /claim  { session_id }  -> verifies the Stripe Checkout session is paid, issues (or re-issues) a key
// POST /verify { key }         -> checks the key signature + KV record, returns a grant signature
// POST /issue  { note }        -> (admin, Authorization: Bearer ADMIN_TOKEN) issues a key by hand — for Airペイ / bank transfer sales
// POST /revoke { key }         -> (admin) marks a key revoked
// POST /keys   {}              -> (admin) lists issued keys (newest first, max 100)
// Keys look like ZK-XXXX-XXXX-XXXX-XXXX: 12 random chars + 4 chars of HMAC.

const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const enc = new TextEncoder();
async function hmac(secret, msg) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
  return Array.from(sig).map(b => ALPH[b % 32]).join('');
}
function rand(n) { const a = crypto.getRandomValues(new Uint8Array(n)); return Array.from(a).map(b => ALPH[b % 32]).join(''); }
function fmt(s) { return 'ZK-' + s.match(/.{4}/g).join('-'); }
async function makeKey(secret) { const body = rand(12); const tag = (await hmac(secret, 'key:' + body)).slice(0, 4); return fmt(body + tag); }
async function validKey(secret, key) { const m = /^ZK-([A-Z2-9]{4})-([A-Z2-9]{4})-([A-Z2-9]{4})-([A-Z2-9]{4})$/.exec(key || ''); if (!m) return false; const body = m[1] + m[2] + m[3]; return (await hmac(secret, 'key:' + body)).slice(0, 4) === m[4]; }

function cors(env, res) { res.headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN || '*'); res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); return res; }
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return cors(env, new Response(null, { status: 204 }));
    const url = new URL(req.url);
    if (req.method !== 'POST') return cors(env, json({ error: 'method' }, 405));
    let body = {}; try { body = await req.json(); } catch {}

    if (url.pathname === '/claim') {
      const sid = String(body.session_id || '');
      if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sid)) return cors(env, json({ ok: false, error: 'bad_session' }, 400));
      const r = await fetch('https://api.stripe.com/v1/checkout/sessions/' + sid, { headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY } });
      const sess = await r.json();
      if (!r.ok || sess.payment_status !== 'paid') return cors(env, json({ ok: false, error: 'unpaid' }, 402));
      const existing = await env.KEYS.get('sess:' + sid);
      if (existing) return cors(env, json({ ok: true, key: existing }));
      const key = await makeKey(env.LICENSE_SECRET);
      await env.KEYS.put('key:' + key, JSON.stringify({ session: sid, email: (sess.customer_details && sess.customer_details.email) || null, created: Date.now(), revoked: false }));
      await env.KEYS.put('sess:' + sid, key);
      return cors(env, json({ ok: true, key }));
    }

    if (url.pathname === '/issue' || url.pathname === '/revoke' || url.pathname === '/keys') {
      const auth = req.headers.get('Authorization') || '';
      if (!env.ADMIN_TOKEN || auth !== 'Bearer ' + env.ADMIN_TOKEN) return cors(env, json({ ok: false, error: 'unauthorized' }, 401));
      if (url.pathname === '/issue') {
        const key = await makeKey(env.LICENSE_SECRET);
        await env.KEYS.put('key:' + key, JSON.stringify({ session: null, note: String(body.note || '').slice(0, 200), created: Date.now(), revoked: false }));
        return cors(env, json({ ok: true, key }));
      }
      if (url.pathname === '/revoke') {
        const key = String(body.key || '').trim().toUpperCase();
        const rec = await env.KEYS.get('key:' + key, 'json');
        if (!rec) return cors(env, json({ ok: false, error: 'not_found' }, 404));
        rec.revoked = true; rec.revokedAt = Date.now();
        await env.KEYS.put('key:' + key, JSON.stringify(rec));
        return cors(env, json({ ok: true }));
      }
      const list = await env.KEYS.list({ prefix: 'key:', limit: 100 });
      const rows = await Promise.all(list.keys.map(async k => ({ key: k.name.slice(4), ...(await env.KEYS.get(k.name, 'json')) })));
      rows.sort((a, b) => (b.created || 0) - (a.created || 0));
      return cors(env, json({ ok: true, keys: rows }));
    }

    if (url.pathname === '/verify') {
      const key = String(body.key || '').trim().toUpperCase();
      if (!(await validKey(env.LICENSE_SECRET, key))) return cors(env, json({ ok: false, error: 'invalid' }, 400));
      const rec = await env.KEYS.get('key:' + key, 'json');
      if (!rec) return cors(env, json({ ok: false, error: 'invalid' }, 404));
      if (rec.revoked) return cors(env, json({ ok: false, error: 'revoked' }, 403));
      const sig = (await hmac(env.LICENSE_SECRET, 'grant:' + key)).slice(0, 12);
      return cors(env, json({ ok: true, sig }));
    }
    return cors(env, json({ error: 'not_found' }, 404));
  }
};
