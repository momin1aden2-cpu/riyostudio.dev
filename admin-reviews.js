(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const tokenInput = $('adm-token');
  const list = $('adm-list');

  // Remember the token for the session only (not persisted to disk).
  try { tokenInput.value = sessionStorage.getItem('riyoAdminToken') || ''; } catch (e) {}

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  const stars = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

  function token() { return tokenInput.value.trim(); }

  function load() {
    const t = token();
    if (!t) { list.innerHTML = '<div class="msg">Enter your admin token, then Load.</div>'; return; }
    try { sessionStorage.setItem('riyoAdminToken', t); } catch (e) {}
    list.innerHTML = '<div class="msg">Loading…</div>';
    fetch('/api/reviews?status=pending', { headers: { Authorization: 'Bearer ' + t } })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) { list.innerHTML = '<div class="msg">' + esc((d && d.error) || 'Failed to load.') + '</div>'; return; }
        render(d.reviews || []);
      })
      .catch(() => { list.innerHTML = '<div class="msg">Network error.</div>'; });
  }

  function render(reviews) {
    if (!reviews.length) { list.innerHTML = '<div class="msg">No pending reviews. 🎉</div>'; return; }
    list.innerHTML = reviews.map((r) => {
      const who = r.name ? esc(r.name) : 'Anonymous';
      const tool = r.tool ? ' · ' + esc(r.tool) : '';
      return (
        '<div class="item" data-id="' + r.id + '">' +
        '<div class="stars">' + stars(r.rating) + '</div>' +
        '<p class="body">' + esc(r.body) + '</p>' +
        '<div class="meta">' + who + ' · ' + esc(r.created_at) + tool + '</div>' +
        '<div class="acts">' +
          '<button class="approve" data-act="approve">Approve</button>' +
          '<button class="reject" data-act="reject">Reject</button>' +
          '<button class="delete" data-act="delete">Delete</button>' +
        '</div></div>'
      );
    }).join('');
  }

  function moderate(id, action, itemEl) {
    fetch('/api/reviews/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
      body: JSON.stringify({ id: id, action: action }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.ok) { itemEl.style.opacity = '0.4'; itemEl.style.pointerEvents = 'none'; }
        else alert((d && d.error) || 'Action failed.');
      })
      .catch(() => alert('Network error.'));
  }

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const item = btn.closest('.item');
    moderate(parseInt(item.dataset.id, 10), btn.dataset.act, item);
  });

  $('adm-load').addEventListener('click', load);
  tokenInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
  if (tokenInput.value) load();
})();
