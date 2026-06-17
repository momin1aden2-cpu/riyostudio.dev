/* ================================================================
   RIYO STUDIO — Unified Navigation
   One persistent top bar + left slide-in drawer across every page.
   Single source of truth: edit the link list here, all pages update.
   ================================================================ */

(function () {
  'use strict';

  // Hosting serves canonical clean URLs (/qr, not /qr.html) and 308-redirects
  // the .html form. iOS WebKit refuses a redirected response served from a
  // service worker, so every internal link points at the clean URL — no
  // redirect ever happens. match[] accepts both forms so the active state is
  // correct whether a page is opened as /qr or the legacy /qr.html.
  var TOOLS = [
    { href: '/',        icon: '🏠', label: 'Home',          match: ['', 'index', 'index.html'] },
    { href: '/qr',      icon: '📱', label: 'QR Hub',        match: ['qr', 'qr.html'] },
    { href: '/invoice', icon: '📄', label: 'Invoice Maker', match: ['invoice', 'invoice.html'] },
    { href: '/scanner', icon: '🎨', label: 'Mockup Studio', match: ['scanner', 'scanner.html'] },
    { href: '/video',   icon: '🎬', label: 'Video Studio',  match: ['video', 'video.html'] },
    { href: '/forge',   icon: '🔧', label: 'File Forge',    match: ['forge', 'forge.html'] },
    { href: '/logo',    icon: '✨',       label: 'Logo Maker',    match: ['logo', 'logo.html'] }
  ];

  var COMPANY = [
    { href: '/#about', icon: '💡', label: 'About Us' }
  ];

  var LEGAL = [
    { href: '/privacy',    icon: '🔒', label: 'Privacy Policy',  match: ['privacy', 'privacy.html'] },
    { href: '/terms',      icon: '📋', label: 'Terms of Service', match: ['terms', 'terms.html'] },
    { href: '/disclaimer', icon: '⚠️', label: 'Disclaimer',      match: ['disclaimer', 'disclaimer.html'] }
  ];

  // Mobile bottom quick-access bar (the full list still lives in the drawer)
  var BOTTOM = [
    { href: '/',        icon: '🏠', label: 'Home',    match: ['', 'index', 'index.html'] },
    { href: '/invoice', icon: '📄', label: 'Invoice', match: ['invoice', 'invoice.html'] },
    { href: '/qr',      icon: '📱', label: 'QR Hub',  match: ['qr', 'qr.html'] },
    { href: '/video',   icon: '🎬', label: 'Video',   match: ['video', 'video.html'] },
    { href: '/forge',   icon: '🔧', label: 'Forge',   match: ['forge', 'forge.html'] }
  ];

  function currentPage() {
    var path = (location.pathname || '').split('/').pop();
    return path.toLowerCase();
  }

  function isActive(item, page) {
    return item.match && item.match.indexOf(page) !== -1;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  function linkHtml(item, page) {
    var active = isActive(item, page) ? ' active' : '';
    var cur = active ? ' aria-current="page"' : '';
    return '<a class="drawer-link' + active + '" href="' + esc(item.href) + '"' + cur + '>' +
             '<span class="drawer-ico" aria-hidden="true">' + item.icon + '</span>' +
             '<span class="drawer-label">' + esc(item.label) + '</span>' +
           '</a>';
  }

  function groupHtml(title, items, page) {
    var out = '<p class="drawer-group">' + esc(title) + '</p>';
    for (var i = 0; i < items.length; i++) out += linkHtml(items[i], page);
    return out;
  }

  function build() {
    var nav = document.getElementById('main-nav');
    if (!nav) return;

    document.body.classList.add('drawer-nav');
    var page = currentPage();

    // The drawer lists only what the bottom bar doesn't already cover, so the
    // two menus never duplicate each other on mobile.
    var bottomHrefs = BOTTOM.map(function (b) { return b.href; });
    var drawerTools = TOOLS.filter(function (t) { return bottomHrefs.indexOf(t.href) === -1; });

    // 1. Hamburger button into the existing top bar (first child of nav-inner)
    var inner = nav.querySelector('.nav-inner') || nav;
    if (!document.getElementById('nav-burger')) {
      var burger = document.createElement('button');
      burger.id = 'nav-burger';
      burger.className = 'nav-burger';
      burger.type = 'button';
      burger.setAttribute('aria-label', 'Open menu');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-controls', 'site-drawer');
      burger.innerHTML = '<span class="nav-burger-box"><span class="nav-burger-line"></span></span>';
      inner.insertBefore(burger, inner.firstChild);
    }

    // 2. Drawer + overlay
    var overlay = document.createElement('div');
    overlay.id = 'site-drawer-overlay';
    overlay.className = 'site-drawer-overlay';

    var drawer = document.createElement('aside');
    drawer.id = 'site-drawer';
    drawer.className = 'site-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-label', 'Site menu');
    drawer.innerHTML =
      '<div class="drawer-head">' +
        '<a class="drawer-brand" href="/" aria-label="Riyo Studio home">' +
          '<img src="assets/icon.svg?v=2" alt="" width="34" height="34">' +
          '<span class="drawer-brand-text"><span class="drawer-brand-name">Riyo Studio</span>' +
          '<span class="drawer-brand-tag">Local Developer Tools</span></span>' +
        '</a>' +
        '<button class="drawer-close" type="button" aria-label="Close menu">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<nav class="drawer-nav" aria-label="All pages">' +
        groupHtml('More tools', drawerTools, page) +
        groupHtml('Company', COMPANY, page) +
        groupHtml('Legal', LEGAL, page) +
      '</nav>' +
      '<a class="drawer-cta" href="/#contact">Get in Touch</a>' +
      '<p class="drawer-foot">100% client-side · your files never leave your browser</p>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // 3. Mobile bottom quick-access bar
    buildBottomBar(page);

    wire(drawer, overlay);
    prefetch(document);
    scrollToHashOnLoad();
  }

  // When a page is opened with a #section hash (e.g. arriving at /#about from
  // another page), scroll to it allowing for the fixed nav bar.
  function scrollToHashOnLoad() {
    if (!location.hash || location.hash.length < 2) return;
    var t = document.getElementById(location.hash.slice(1));
    if (!t) return;
    setTimeout(function () {
      window.scrollTo({ top: t.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 72, behavior: 'smooth' });
    }, 400);
  }

  function buildBottomBar(page) {
    var bar = document.createElement('nav');
    bar.id = 'riyo-bottom-nav';
    bar.className = 'riyo-bottom-nav';
    bar.setAttribute('aria-label', 'Quick navigation');
    var html = '';
    for (var i = 0; i < BOTTOM.length; i++) {
      var item = BOTTOM[i];
      var active = isActive(item, page) ? ' active' : '';
      var cur = active ? ' aria-current="page"' : '';
      html += '<a class="rbn-tab' + active + '" href="' + esc(item.href) + '"' + cur + '>' +
                '<span class="rbn-ico" aria-hidden="true">' + item.icon + '</span>' +
                '<span class="rbn-label">' + esc(item.label) + '</span>' +
              '</a>';
    }
    bar.innerHTML = html;
    document.body.appendChild(bar);
  }

  function wire(drawer, overlay) {
    var burger = document.getElementById('nav-burger');
    var closeBtn = drawer.querySelector('.drawer-close');
    var lastFocus = null;

    function focusable() {
      return drawer.querySelectorAll('a[href], button:not([disabled])');
    }

    function open() {
      lastFocus = document.activeElement;
      document.body.classList.add('drawer-open');
      drawer.classList.add('open');
      overlay.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      if (burger) { burger.setAttribute('aria-expanded', 'true'); burger.classList.add('is-open'); }
      var first = focusable()[0];
      if (first) first.focus();
      document.addEventListener('keydown', onKey, true);
    }

    function close() {
      document.body.classList.remove('drawer-open');
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.classList.remove('is-open'); }
      document.removeEventListener('keydown', onKey, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function toggle() {
      if (drawer.classList.contains('open')) close(); else open();
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        var f = focusable();
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    if (burger) burger.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    // Close after picking a destination. For a link to a section ON THIS page
    // (e.g. /#about while already on the home page), the open drawer's scroll
    // lock swallows the jump — so close first, then scroll once unlocked. This
    // is why About did nothing in the installed PWA but worked on desktop.
    drawer.querySelectorAll('.drawer-link, .drawer-cta, .drawer-brand').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        var hi = href.indexOf('#');
        if (hi === -1) { close(); return; } // plain page link → let it navigate
        var id = href.slice(hi + 1);
        var target = id ? document.getElementById(id) : null;
        e.preventDefault();
        close();
        if (target) {
          // Section is on THIS page — smooth-scroll once the drawer unlocks scroll.
          setTimeout(function () {
            var y = target.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 72;
            window.scrollTo({ top: y, behavior: 'smooth' });
            try { history.replaceState(null, '', href.slice(hi)); } catch (err) {}
          }, 300);
        } else {
          // Section is on another page — navigate explicitly. Installed PWAs don't
          // reliably follow the default <a> action when JS handled the tap.
          setTimeout(function () { window.location.href = href; }, 60);
        }
      });
    });

    // Swipe-left to dismiss
    var startX = 0, startY = 0, tracking = false;
    drawer.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    drawer.addEventListener('touchmove', function (e) {
      if (!tracking) return;
      var dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
      if (dx < -55 && Math.abs(dx) > Math.abs(dy)) { tracking = false; close(); }
    }, { passive: true });
    drawer.addEventListener('touchend', function () { tracking = false; }, { passive: true });
  }

  // Warm the cache for instant navigation on first intent (hover / touch / focus)
  function prefetch(root) {
    var done = {};
    function warm(e) {
      var a = e.currentTarget;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      var file = href.split('#')[0];
      if (!file || done[file]) return;
      done[file] = true;
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = file;
      document.head.appendChild(link);
    }
    root.querySelectorAll('.drawer-link, .rbn-tab').forEach(function (a) {
      a.addEventListener('pointerenter', warm, { passive: true });
      a.addEventListener('touchstart', warm, { passive: true });
      a.addEventListener('focus', warm, true);
    });
  }

  // nav.js loads after #main-nav, so build the moment it runs — don't wait for
  // DOMContentLoaded, which heavy deferred libraries (e.g. on File Forge) delay.
  if (document.getElementById('main-nav')) {
    build();
  } else {
    document.addEventListener('DOMContentLoaded', build);
  }
})();
