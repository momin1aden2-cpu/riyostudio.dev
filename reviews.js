(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const wall = $('rv-wall');
  const empty = $('rv-empty');
  const aggEl = $('rv-agg');
  const filtersEl = $('rv-filters');
  const form = $('rv-form');
  const msg = $('rv-msg');
  const submitBtn = $('rv-submit');
  const starpick = $('rv-starpick');
  const toolSelect = $('rv-tool');

  const TOOL_NAMES = { scanner: 'Mockup Studio', forge: 'File Forge', qr: 'QR Hub', invoice: 'Invoice Maker', logo: 'Logo Maker', video: 'Video Studio' };
  const toolName = (s) => TOOL_NAMES[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

  let rating = 0;
  let allReviews = [];
  let filter = 'all';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function starHTML(n) {
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>';
    return s;
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch (e) { return ''; }
  }
  function hashOf(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function avatar(name) {
    const label = name ? esc(name.trim().charAt(0).toUpperCase()) : '★';
    const h = hashOf(name || 'anon');
    const h1 = h % 360, h2 = (h1 + 42) % 360;
    return '<div class="rv-av" style="background:linear-gradient(135deg,hsl(' + h1 + ',62%,46%),hsl(' + h2 + ',68%,38%))">' + label + '</div>';
  }
  function card(r) {
    const who = r.name ? esc(r.name) : 'Anonymous';
    const chip = r.tool ? '<span class="rv-chip">' + esc(toolName(r.tool)) + '</span>' : '';
    return '<article class="rv-card">' +
      '<div class="rv-quote">&#8221;</div>' +
      '<div class="rv-stars">' + starHTML(r.rating) + '</div>' +
      '<p class="rv-body">' + esc(r.body) + '</p>' +
      '<div class="rv-foot">' + avatar(r.name) +
        '<div class="rv-who"><span class="rv-name">' + who + '</span><span class="rv-date">' + esc(fmtDate(r.created_at)) + '</span></div>' +
        chip +
      '</div></article>';
  }

  function countUp(el, target) {
    const start = performance.now(), dur = 900;
    function step(t) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(1);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(1);
    }
    requestAnimationFrame(step);
  }

  function renderAggregate(data) {
    if (!data.count) return;
    aggEl.style.display = 'grid';
    countUp($('rv-score'), data.average || 0);
    $('rv-agg-stars').innerHTML = starHTML(Math.round(data.average || 0));
    $('rv-count').textContent = 'from ' + data.count + ' review' + (data.count === 1 ? '' : 's');

    const dist = data.distribution || {};
    const total = data.count || 1;
    let rows = '';
    for (let s = 5; s >= 1; s--) {
      const n = dist[s] || 0;
      const pct = Math.round((n / total) * 100);
      rows += '<div class="row"><span class="lbl">' + s + '★</span><span class="bar"><i data-w="' + pct + '"></i></span><span class="pct">' + pct + '%</span></div>';
    }
    $('rv-dist').innerHTML = rows;
    // animate bar widths next frame
    requestAnimationFrame(() => {
      $('rv-dist').querySelectorAll('i').forEach((b) => { b.style.width = b.getAttribute('data-w') + '%'; });
    });
  }

  function renderFilters() {
    const tools = [];
    allReviews.forEach((r) => { if (r.tool && tools.indexOf(r.tool) === -1) tools.push(r.tool); });
    if (!tools.length) { filtersEl.innerHTML = ''; return; }
    let html = '<button class="rv-filter on" data-f="all">All</button>';
    tools.forEach((t) => { html += '<button class="rv-filter" data-f="' + esc(t) + '">' + esc(toolName(t)) + '</button>'; });
    filtersEl.innerHTML = html;
  }

  function renderWall() {
    const items = filter === 'all' ? allReviews : allReviews.filter((r) => r.tool === filter);
    if (!items.length) {
      wall.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    wall.innerHTML = items.map(card).join('');
  }

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.rv-filter');
    if (!btn) return;
    filter = btn.dataset.f;
    Array.from(filtersEl.children).forEach((b) => b.classList.toggle('on', b === btn));
    renderWall();
  });

  function load() {
    fetch('/api/reviews', { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((data) => {
        allReviews = data.reviews || [];
        renderAggregate(data);
        renderFilters();
        // honour ?tool= deep-link
        const pTool = new URLSearchParams(location.search).get('tool');
        if (pTool && allReviews.some((r) => r.tool === pTool)) {
          filter = pTool;
          const btn = filtersEl.querySelector('[data-f="' + pTool + '"]');
          if (btn) { Array.from(filtersEl.children).forEach((b) => b.classList.toggle('on', b === btn)); }
        }
        renderWall();
      })
      .catch(() => { empty.textContent = 'Reviews are taking a moment to load — please refresh.'; empty.style.display = 'block'; });
  }

  // ---- submission ----
  function setRating(n) {
    rating = n;
    Array.from(starpick.children).forEach((b) => b.classList.toggle('on', parseInt(b.dataset.v, 10) <= n));
  }
  starpick.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (btn) setRating(parseInt(btn.dataset.v, 10));
  });
  function showMsg(text, kind) { msg.textContent = text; msg.className = 'rv-msg ' + kind; }

  // preselect tool from ?tool=
  (function () {
    const pTool = new URLSearchParams(location.search).get('tool');
    if (pTool && toolSelect) {
      const opt = Array.from(toolSelect.options).find((o) => o.value === pTool);
      if (opt) toolSelect.value = pTool;
    }
  })();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const body = $('rv-body').value.trim();
    if (!rating) return showMsg('Please pick a star rating first.', 'err');
    if (body.length < 3) return showMsg('Please write a short review.', 'err');

    const payload = {
      rating: rating,
      body: body,
      name: $('rv-name').value.trim(),
      website: $('rv-website').value,
      tool: (toolSelect && toolSelect.value) || '',
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok && d.ok) {
          form.reset();
          setRating(0);
          showMsg('Thanks! Your review will appear here once it’s been checked. 🙌', 'ok');
          try { localStorage.setItem('riyoReviewDone', '1'); } catch (e) {}
        } else {
          showMsg((d && d.error) || 'Something went wrong — please try again.', 'err');
        }
      })
      .catch(() => showMsg('Couldn’t submit right now — please try again.', 'err'))
      .finally(() => { submitBtn.disabled = false; submitBtn.textContent = 'Submit review'; });
  });

  load();
})();
