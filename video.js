document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('vs-dropzone');
  const fileInput = document.getElementById('vs-file-input');
  const editor = document.getElementById('vs-editor');
  const video = document.getElementById('vs-video');
  const playBtn = document.getElementById('vs-play');
  const timeLabel = document.getElementById('vs-time');
  // Global timeline (the whole video)
  const gtrack = document.getElementById('vs-gtrack');
  const gRegions = document.getElementById('vs-g-regions');
  const gplayhead = document.getElementById('vs-gplayhead');
  const dropEl = document.getElementById('vs-drop');
  const dropTag = document.getElementById('vs-drop-tag');
  // Per-clip trim bar
  const track = document.getElementById('vs-track');
  const playhead = document.getElementById('vs-playhead');
  const dimLEl = document.getElementById('vs-dim-l');
  const dimREl = document.getElementById('vs-dim-r');
  const keepEl = document.getElementById('vs-keep');
  const handleLEl = document.getElementById('vs-handle-l');
  const handleREl = document.getElementById('vs-handle-r');
  const trimSub = document.getElementById('vs-trim-sub');
  // Tools
  const insertBtn = document.getElementById('vs-insert-btn');
  const splitBtn = document.getElementById('vs-split-btn');
  const resetTrimBtn = document.getElementById('vs-reset-trim');
  const removeClipBtn = document.getElementById('vs-remove-clip');
  const storyEl = document.getElementById('vs-story');
  const clipMetaEl = document.getElementById('vs-clip-meta');
  const cutHint = document.getElementById('vs-cut-hint');
  const cutHintDefault = cutHint ? cutHint.innerHTML : null;
  // Guided mode UI
  const banner = document.getElementById('vs-banner');
  const actAdd = document.getElementById('vs-act-add');
  const actTrim = document.getElementById('vs-act-trim');
  const actText = document.getElementById('vs-act-text');
  const actExport = document.getElementById('vs-act-export');
  const addPanel = document.getElementById('vs-add-panel');
  const trimPanel = document.getElementById('vs-trim-panel');
  const formatSel = document.getElementById('vs-format');
  const qualitySel = document.getElementById('vs-quality');
  const exportBtn = document.getElementById('vs-export');
  const progressWrap = document.getElementById('vs-progress-wrap');
  const progressBar = document.getElementById('vs-progress-bar');
  const statusEl = document.getElementById('vs-status');

  if (!dropzone) return;

  // Resolutions kept modest because the single-threaded WASM encoder is slow at 1080p.
  const QUALITY = {
    social: { w: 720, h: 720, crf: 30 },
    youtube: { w: 1280, h: 720, crf: 28 },
    hq: { w: 1920, h: 1080, crf: 24 }
  };

  // Each clip plays a contiguous [in, out] slice of its file. The storyboard order
  // is the final video. dropGlobal is one marker measured across the WHOLE video.
  let sources = [];
  let activeId = null;
  let uid = 0;
  let fileSeq = 0;
  let pendingInsert = null;   // { clipId, time } — where the next picked video drops in
  let dropGlobal = 0;         // amber marker, in seconds across the whole combined video
  let mode = 'home';          // guided mode: 'home' | 'add' | 'trim'
  let exporting = false;
  let ffmpegInstance = null;  // single-threaded FFmpeg 0.12 engine, loaded on first export
  let ffLogs = [];            // recent FFmpeg log lines, for surfacing real errors
  let exportStart = 0;

  const fmtTime = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  const ext = (name) => (name.split('.').pop() || 'mp4').toLowerCase();
  const activeSource = () => sources.find((s) => s.id === activeId) || null;

  const clamp01 = (f) => Math.min(1, Math.max(0, f));
  const inOf = (s) => s.in || 0;
  const outOf = (s) => (s.out != null ? s.out : s.duration) || 0;
  const winLen = (s) => Math.max(0, outOf(s) - inOf(s));
  const clampWin = (s, t) => Math.min(outOf(s), Math.max(inOf(s), t));
  const keptDuration = (s) => winLen(s);

  const totalDur = () => sources.reduce((a, s) => a + keptDuration(s), 0);
  const globalStartOf = (idx) => { let acc = 0; for (let i = 0; i < idx; i++) acc += keptDuration(sources[i]); return acc; };
  function clipAtGlobal(gt) {
    if (!sources.length) return null;
    let acc = 0;
    for (let i = 0; i < sources.length; i++) {
      const len = keptDuration(sources[i]);
      if (gt < acc + len || i === sources.length - 1) {
        return { idx: i, clip: sources[i], local: Math.max(0, Math.min(len, gt - acc)) };
      }
      acc += len;
    }
    return null;
  }

  // ── Loading & thumbnails ──────────────────────────────────────────
  function getMeta(url) {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.playsInline = true;
      let settled = false;
      const done = (data) => { if (!settled) { settled = true; resolve(data); } };
      const grabThumb = (dur) => {
        const d = (isFinite(dur) && dur > 0) ? dur : 0;
        v.onseeked = () => {
          v.onseeked = null;
          let thumb = '';
          try {
            const vw = v.videoWidth || 16, vh = v.videoHeight || 9;
            const c = document.createElement('canvas');
            c.width = 200;
            c.height = Math.max(1, Math.round(200 * vh / vw));
            c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
            thumb = c.toDataURL('image/jpeg', 0.6);
          } catch (e) { /* tainted or undrawable — skip thumbnail */ }
          done({ duration: d, w: v.videoWidth, h: v.videoHeight, thumb });
        };
        v.currentTime = Math.min(d * 0.1, 2);
      };
      v.onloadedmetadata = () => {
        if (v.duration === Infinity || isNaN(v.duration)) {
          v.ontimeupdate = () => { v.ontimeupdate = null; grabThumb(v.duration); };
          v.currentTime = 1e7;
        } else {
          grabThumb(v.duration);
        }
      };
      v.onerror = () => done({ duration: 0, w: 0, h: 0, thumb: '' });
      v.src = url;
    });
  }

  function captureThumb(url, time) {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'auto'; v.muted = true; v.playsInline = true;
      let done = false;
      const finish = (val) => { if (!done) { done = true; resolve(val); } };
      v.onseeked = () => {
        try {
          const vw = v.videoWidth || 16, vh = v.videoHeight || 9;
          const c = document.createElement('canvas');
          c.width = 200; c.height = Math.max(1, Math.round(200 * vh / vw));
          c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
          finish(c.toDataURL('image/jpeg', 0.6));
        } catch (e) { finish(''); }
      };
      v.onloadeddata = () => { try { v.currentTime = Math.max(0, time || 0); } catch (e) { finish(''); } };
      v.onerror = () => finish('');
      v.src = url;
    });
  }

  function refreshThumb(clip, time) {
    captureThumb(clip.url, time).then((t) => { if (t) { clip.thumb = t; renderAll(); } });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('video/'));
    if (!files.length) { pendingInsert = null; return; }
    const added = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const meta = await getMeta(url);
      added.push({ id: ++uid, fileKey: 'f' + (++fileSeq), file, url, name: file.name, duration: meta.duration, w: meta.w, h: meta.h, thumb: meta.thumb, in: 0, out: meta.duration });
    }

    // Where do the new clips go? "Insert" records a spot inside a clip; split it there.
    let at = sources.length;
    if (pendingInsert) {
      const i = sources.findIndex((s) => s.id === pendingInsert.clipId);
      if (i >= 0) {
        const s = sources[i], t = pendingInsert.time;
        if (t > inOf(s) + 0.2 && t < outOf(s) - 0.2) {
          const left = Object.assign({}, s, { id: ++uid, in: inOf(s), out: t });
          const right = Object.assign({}, s, { id: ++uid, in: t, out: outOf(s) });
          sources.splice(i, 1, left, right);
          refreshThumb(left, (left.in + left.out) / 2);
          refreshThumb(right, (right.in + right.out) / 2);
          at = i + 1;
        } else if (t <= inOf(s) + 0.2) {
          at = i;
        } else {
          at = i + 1;
        }
      }
    }
    pendingInsert = null;
    sources.splice(at, 0, ...added);

    dropzone.style.display = 'none';
    editor.style.display = 'block';
    selectClip(added[added.length - 1].id);
  }

  // ── Selecting / positioning ───────────────────────────────────────
  // Load a clip into the <video> and play it (used for whole-video playback).
  function gotoClip(id, autoplay) {
    activeId = id;
    const s = activeSource();
    if (!s) return;
    const start = () => {
      try { video.currentTime = inOf(s); } catch (e) { /* not seekable yet */ }
      if (autoplay) { const p = video.play(); if (p && p.catch) p.catch(() => {}); }
    };
    if (video.src !== s.url) { video.src = s.url; video.addEventListener('loadedmetadata', start, { once: true }); }
    else if (video.readyState >= 1) { start(); }
    else { video.addEventListener('loadedmetadata', start, { once: true }); }
    if (!autoplay) video.pause();
    renderAll();
  }

  // Move the marker to an absolute position in the WHOLE video; select & preview that clip.
  function goToGlobal(gt, seek) {
    const T = totalDur();
    dropGlobal = Math.max(0, Math.min(T, gt));
    const at = clipAtGlobal(dropGlobal);
    if (at) {
      const s = at.clip;
      const ft = inOf(s) + at.local;
      if (activeId !== s.id && video.src !== s.url) { video.pause(); video.src = s.url; }
      activeId = s.id;
      if (seek) {
        const apply = () => { try { video.currentTime = ft; } catch (e) { /* not seekable yet */ } };
        if (video.readyState >= 1 && video.src === s.url) apply();
        else video.addEventListener('loadedmetadata', apply, { once: true });
        video.pause();
      }
    }
    renderAll();
  }

  // Tapping a clip card parks the marker at that clip's start.
  function selectClip(id) {
    const idx = sources.findIndex((s) => s.id === id);
    if (idx < 0) return;
    goToGlobal(globalStartOf(idx), true);
  }

  function removeSource(id) {
    const idx = sources.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const [removed] = sources.splice(idx, 1);
    if (removed && !sources.some((s) => s.url === removed.url)) { try { URL.revokeObjectURL(removed.url); } catch (e) { /* ignore */ } }
    if (!sources.length) { resetToDropzone(); return; }
    selectClip(sources[Math.min(idx, sources.length - 1)].id);
  }

  function resetToDropzone() {
    activeId = null; dropGlobal = 0;
    video.pause();
    video.removeAttribute('src');
    video.load();
    texts = [];
    selectedTextId = null;
    renderOverlay();
    renderTextList();
    renderAll();
    editor.style.display = 'none';
    dropzone.style.display = '';
  }

  function flashHint(msg) {
    if (!cutHint) return;
    cutHint.innerHTML = msg;
    setTimeout(() => { if (cutHintDefault != null) cutHint.innerHTML = cutHintDefault; }, 3000);
  }

  // ── Guided modes ──────────────────────────────────────────────────
  function setMode(m) {
    mode = (mode === m && m !== 'home') ? 'home' : m;
    if (addPanel) addPanel.style.display = (mode === 'add') ? '' : 'none';
    if (trimPanel) trimPanel.style.display = (mode === 'trim') ? '' : 'none';
    if (actAdd) actAdd.classList.toggle('active', mode === 'add');
    if (actTrim) actTrim.classList.toggle('active', mode === 'trim');
    renderAll();
  }

  function updateBanner() {
    if (!banner || exporting) return;
    if (!sources.length) { banner.innerHTML = 'Add a video to get started.'; return; }
    if (mode === 'trim') {
      const n = Math.max(1, sources.findIndex((x) => x.id === activeId) + 1);
      banner.innerHTML = `✂️ <b>Trimming clip ${n}.</b> Drag the <b style="color:#34D399;">green edges</b> in to keep only the part you want (dimmed = removed). Tap another clip below to trim that one instead.`;
    } else if (mode === 'add') {
      banner.innerHTML = '➕ <b>Add a video.</b> ① Drag the amber <b style="color:#FBBF24;">⬇</b> marker to the spot. ② Tap <b>“Choose video to add”</b> — it drops in right there.';
    } else {
      banner.innerHTML = 'What next? <b>➕ Add a video</b>, <b>✂️ Trim / cut</b> a clip, <b>🔤 Add text</b>, or <b>⬇ Download</b>. (Tap a clip below to pick which one to trim.)';
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────
  function renderAll() { renderTimeline(); renderTrim(); renderStory(); updateBanner(); }

  function updateClipMeta() {
    if (!clipMetaEl) return;
    if (!sources.length) { clipMetaEl.textContent = ''; return; }
    clipMetaEl.textContent = `· ${sources.length} clip${sources.length > 1 ? 's' : ''} · ${fmtTime(totalDur())}`;
  }

  function updateInsertLabel() {
    if (!insertBtn) return;
    insertBtn.textContent = sources.length ? `② 📁 Choose video to add at ${fmtTime(dropGlobal)}` : '📁 Choose a video';
  }

  // The amber marker always sits where the preview is "looking" — scrub or play,
  // and that becomes the insert/split point. Insert reads the live position too.
  function updatePlayhead() {
    const s = activeSource();
    const T = totalDur() || 1;
    if (!s) { if (timeLabel) timeLabel.textContent = '0:00 / 0:00'; if (dropTag) dropTag.textContent = '⬇'; return; }
    const idx = sources.findIndex((x) => x.id === s.id);
    const local = Math.max(0, Math.min(keptDuration(s), video.currentTime - inOf(s)));
    const g = globalStartOf(idx) + local;
    dropGlobal = g;
    if (dropEl) dropEl.style.left = (g / T * 100) + '%';
    if (dropTag) dropTag.textContent = '⬇ ' + fmtTime(g);
    if (s.duration && playhead) playhead.style.left = clamp01(video.currentTime / s.duration) * 100 + '%';
    if (timeLabel) timeLabel.textContent = `${fmtTime(g)} / ${fmtTime(T)}`;
    updateInsertLabel();
  }

  // Global timeline: one proportional block per clip + the amber marker.
  function renderTimeline() {
    const T = totalDur() || 1;
    if (gRegions) {
      gRegions.innerHTML = '';
      sources.forEach((s) => {
        const r = document.createElement('div');
        r.className = 'vs-g-region' + (s.id === activeId ? ' active' : '');
        r.style.width = (keptDuration(s) / T * 100) + '%';
        if (s.thumb) r.style.backgroundImage = `url("${s.thumb}")`;
        gRegions.appendChild(r);
      });
    }
    updatePlayhead();
    updateClipMeta();
  }

  // Per-clip trim bar: full footage of the selected clip; green = the part you keep.
  function renderTrim() {
    const s = activeSource();
    if (!s || !s.duration) { if (trimSub) trimSub.textContent = ''; return; }
    const d = s.duration;
    const pi = inOf(s) / d * 100, po = outOf(s) / d * 100;
    if (dimLEl) { dimLEl.style.left = '0%'; dimLEl.style.width = pi + '%'; }
    if (dimREl) { dimREl.style.left = po + '%'; dimREl.style.width = (100 - po) + '%'; }
    if (keepEl) { keepEl.style.left = pi + '%'; keepEl.style.width = (po - pi) + '%'; }
    if (handleLEl) handleLEl.style.left = pi + '%';
    if (handleREl) handleREl.style.left = po + '%';
    if (trimSub) trimSub.textContent = `keeping ${fmtTime(winLen(s))} of ${fmtTime(d)}`;
  }

  // ── Storyboard (reorder + remove + tap-to-select) ─────────────────
  function renderStory() {
    if (!storyEl) return;
    storyEl.innerHTML = '';
    sources.forEach((s, idx) => {
      if (idx > 0) { const chev = document.createElement('div'); chev.className = 'vs-chev'; chev.textContent = '›'; storyEl.appendChild(chev); }
      const card = document.createElement('div');
      card.className = 'vs-card' + (s.id === activeId ? ' active' : '');
      card.dataset.id = s.id;
      if (s.thumb) card.style.backgroundImage = `url("${s.thumb}")`;
      const grad = document.createElement('div'); grad.className = 'vs-card-grad'; card.appendChild(grad);
      const num = document.createElement('div'); num.className = 'vs-card-num'; num.textContent = idx + 1; card.appendChild(num);
      const dur = document.createElement('div'); dur.className = 'vs-card-dur'; dur.textContent = fmtTime(keptDuration(s)); card.appendChild(dur);
      const x = document.createElement('button'); x.className = 'vs-card-x'; x.innerHTML = '✕'; x.title = 'Remove clip';
      x.addEventListener('click', (e) => { e.stopPropagation(); removeSource(s.id); });
      card.appendChild(x);
      card.addEventListener('pointerdown', (e) => cardPointerDown(e, s.id));
      storyEl.appendChild(card);
    });
    const add = document.createElement('button');
    add.className = 'vs-add-card';
    add.innerHTML = '<span style="font-size:1.4rem;line-height:1;">＋</span><span>Add at marker</span>';
    add.title = 'Adds the video at the amber ⬇ marker';
    // Same behaviour as the green Insert button — always drops at the marker, never the end.
    add.addEventListener('click', insertHere);
    storyEl.appendChild(add);
  }

  function cardPointerDown(e, id) {
    if (e.target.closest('.vs-card-x')) return;
    const startX = e.clientX, startY = e.clientY;
    let moved = false;
    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
        moved = true;
        const c = storyEl.querySelector(`.vs-card[data-id="${id}"]`);
        if (c) c.classList.add('dragging');
      }
      if (!moved) return;
      ev.preventDefault();
      const cards = Array.from(storyEl.querySelectorAll('.vs-card'));
      let target = cards.length - 1;
      for (let i = 0; i < cards.length; i++) {
        const r = cards[i].getBoundingClientRect();
        if (ev.clientX < r.left + r.width / 2) { target = i; break; }
      }
      const from = sources.findIndex((s) => s.id === id);
      if (target !== from && target >= 0 && target < sources.length) {
        const [m] = sources.splice(from, 1);
        sources.splice(target, 0, m);
        renderAll();
        const nc = storyEl.querySelector(`.vs-card[data-id="${id}"]`);
        if (nc) nc.classList.add('dragging');
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      if (!moved) selectClip(id);
      else renderAll();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  // ── Insert / Split / Trim ─────────────────────────────────────────
  function insertHere() {
    const s = activeSource();
    if (s) {
      const local = Math.max(0, Math.min(keptDuration(s), video.currentTime - inOf(s)));
      pendingInsert = { clipId: s.id, time: inOf(s) + local };
    } else {
      pendingInsert = null;
    }
    fileInput.click();
  }

  function splitActive() {
    const s = activeSource();
    if (!s) return;
    const t = clampWin(s, video.currentTime);
    if (t <= inOf(s) + 0.2 || t >= outOf(s) - 0.2) {
      flashHint('Drag the <b>🎬 whole-video bar</b> so the amber <b style="color:#FBBF24;">⬇</b> marker is inside a clip, then tap <b>✂️ Split</b>.');
      return;
    }
    const idx = sources.findIndex((x) => x.id === s.id);
    const left = Object.assign({}, s, { id: ++uid, in: inOf(s), out: t });
    const right = Object.assign({}, s, { id: ++uid, in: t, out: outOf(s) });
    sources.splice(idx, 1, left, right);
    refreshThumb(left, (left.in + left.out) / 2);
    refreshThumb(right, (right.in + right.out) / 2);
    renderAll();
  }

  function resetTrim() {
    const s = activeSource();
    if (!s) return;
    s.in = 0; s.out = s.duration;
    renderAll();
  }

  function trimHandle(which) {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      const s = activeSource();
      if (!s || !s.duration) return;
      const d = s.duration;
      const rect = track.getBoundingClientRect();
      const move = (ev) => {
        const t = clamp01((ev.clientX - rect.left) / rect.width) * d;
        if (which === 'L') s.in = Math.max(0, Math.min(t, s.out - 0.2));
        else s.out = Math.min(d, Math.max(t, s.in + 0.2));
        try { video.currentTime = which === 'L' ? s.in : s.out; } catch (e2) { /* ignore */ }
        renderAll();
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    };
  }

  // ── Playback (plays the whole video; the marker stays put) ─────────
  const nextClipId = () => {
    const i = sources.findIndex((x) => x.id === activeId);
    return (i >= 0 && i < sources.length - 1) ? sources[i + 1].id : null;
  };

  playBtn.addEventListener('click', () => {
    const s = activeSource();
    if (!s) return;
    if (video.paused) {
      if (video.currentTime < inOf(s) || video.currentTime >= outOf(s) - 0.03) video.currentTime = inOf(s);
      video.play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', () => { playBtn.textContent = '❚❚'; });
  video.addEventListener('pause', () => { playBtn.textContent = '▶'; });
  video.addEventListener('timeupdate', () => {
    const s = activeSource();
    if (s) {
      const t = video.currentTime;
      if (t < inOf(s) - 0.05) {
        video.currentTime = inOf(s);
      } else if (t >= outOf(s) - 0.03 && outOf(s) < (s.duration || 1e9) - 0.02) {
        const next = nextClipId();
        if (!video.paused && next != null) { gotoClip(next, true); return; }
        video.pause();
        video.currentTime = outOf(s);
      }
    }
    updatePlayhead();
  });
  video.addEventListener('ended', () => {
    const next = nextClipId();
    if (next != null) gotoClip(next, true);
  });
  video.addEventListener('loadedmetadata', renderTrim);

  // Global timeline: drag the amber marker (or tap) to choose a spot in the whole video.
  if (gtrack) gtrack.addEventListener('pointerdown', (e) => {
    if (!sources.length) return;
    e.preventDefault();
    if (!video.paused) video.pause();
    const T = totalDur();
    const rect = gtrack.getBoundingClientRect();
    const moveTo = (cx) => goToGlobal(clamp01((cx - rect.left) / rect.width) * T, true);
    moveTo(e.clientX);
    const move = (ev) => { ev.preventDefault(); moveTo(ev.clientX); };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  // Per-clip trim bar: drag the green handles to trim; click elsewhere to scrub this clip.
  track.addEventListener('pointerdown', (e) => {
    const s = activeSource();
    if (!s || !s.duration || e.target === handleLEl || e.target === handleREl) return;
    e.preventDefault();
    if (!video.paused) video.pause();
    const rect = track.getBoundingClientRect();
    const idx = sources.findIndex((x) => x.id === s.id);
    const scrub = (cx) => {
      const ft = clampWin(s, clamp01((cx - rect.left) / rect.width) * s.duration);
      try { video.currentTime = ft; } catch (e2) { /* ignore */ }
      dropGlobal = globalStartOf(idx) + (ft - inOf(s));
      renderAll();
    };
    scrub(e.clientX);
    const move = (ev) => { ev.preventDefault(); scrub(ev.clientX); };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  if (handleLEl) handleLEl.addEventListener('pointerdown', trimHandle('L'));
  if (handleREl) handleREl.addEventListener('pointerdown', trimHandle('R'));
  if (insertBtn) insertBtn.addEventListener('click', insertHere);
  if (splitBtn) splitBtn.addEventListener('click', splitActive);
  if (resetTrimBtn) resetTrimBtn.addEventListener('click', resetTrim);
  if (removeClipBtn) removeClipBtn.addEventListener('click', () => { if (activeId != null) removeSource(activeId); });

  // Guided action buttons
  if (actAdd) actAdd.addEventListener('click', () => setMode('add'));
  if (actTrim) actTrim.addEventListener('click', () => setMode('trim'));
  if (actText) actText.addEventListener('click', () => { addTextOverlay('clean'); });
  if (actExport) actExport.addEventListener('click', () => { if (!exporting) exportBtn.click(); });

  // ── Upload wiring ─────────────────────────────────────────────────
  dropzone.addEventListener('click', () => { pendingInsert = null; fileInput.click(); });
  fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

  // ── Text & Titles ─────────────────────────────────────────────────
  const overlay = document.getElementById('vs-overlay');
  const addTextBtn = document.getElementById('vs-add-text');
  const textListEl = document.getElementById('vs-text-list');
  const textEditor = document.getElementById('vs-text-editor');
  const tContent = document.getElementById('vs-text-content');
  const tFont = document.getElementById('vs-text-font');
  const tSize = document.getElementById('vs-text-size');
  const tColor = document.getElementById('vs-text-color');
  const tBg = document.getElementById('vs-text-bg');
  const tWhole = document.getElementById('vs-text-whole');
  const tTiming = document.getElementById('vs-text-timing');
  const tSetIn = document.getElementById('vs-text-setin');
  const tSetOut = document.getElementById('vs-text-setout');
  const tTimeLabel = document.getElementById('vs-text-timelabel');
  const tDelete = document.getElementById('vs-text-delete');
  const presetBtns = document.querySelectorAll('.vs-preset');
  const posBtns = document.querySelectorAll('.vs-pos-btns [data-pos]');

  const FONTS_VS = {
    inter: { file: 'Inter-Bold.ttf', css: "'VS Inter', sans-serif" },
    anton: { file: 'Anton.ttf', css: "'VS Anton', sans-serif" },
    montserrat: { file: 'Montserrat-Bold.ttf', css: "'VS Montserrat', sans-serif" }
  };
  const TEXT_PRESETS = {
    clean: { font: 'inter', sizeFrac: 0.06, color: '#ffffff', bg: false, cy: 0.5 },
    bold: { font: 'anton', sizeFrac: 0.10, color: '#ffffff', bg: false, cy: 0.5 },
    caption: { font: 'montserrat', sizeFrac: 0.05, color: '#ffffff', bg: true, cy: 0.86 }
  };
  let texts = [];
  let selectedTextId = null;
  const selectedText = () => texts.find((t) => t.id === selectedTextId) || null;
  const overlayH = () => (overlay ? overlay.clientHeight : 0);

  function addTextOverlay(presetKey) {
    const p = TEXT_PRESETS[presetKey] || TEXT_PRESETS.clean;
    texts.push({ id: ++uid, content: 'Your text', font: p.font, sizeFrac: p.sizeFrac, color: p.color, bg: p.bg, cx: 0.5, cy: p.cy, whole: true, start: 0, end: 0, _el: null });
    selectedTextId = uid;
    renderOverlay(); renderTextList(); syncEditor();
    if (tContent) { tContent.focus(); tContent.select(); }
  }

  function renderTextList() {
    if (!textListEl) return;
    textListEl.innerHTML = '';
    texts.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'vs-text-row' + (t.id === selectedTextId ? ' active' : '');
      const name = document.createElement('div'); name.className = 'vs-name'; name.textContent = t.content || '(empty)';
      row.appendChild(name);
      row.addEventListener('click', () => { selectedTextId = t.id; renderOverlay(); renderTextList(); syncEditor(); });
      textListEl.appendChild(row);
    });
    if (textEditor) textEditor.style.display = (texts.length && selectedText()) ? 'flex' : 'none';
  }

  function renderOverlay() {
    if (!overlay) return;
    overlay.innerHTML = '';
    const h = overlayH();
    texts.forEach((t) => {
      const el = document.createElement('div');
      el.className = 'vs-text-item' + (t.bg ? ' has-bg' : '') + (t.id === selectedTextId ? ' selected' : '');
      el.textContent = t.content;
      el.style.left = (t.cx * 100) + '%';
      el.style.top = (t.cy * 100) + '%';
      el.style.fontFamily = FONTS_VS[t.font].css;
      el.style.fontSize = Math.max(8, t.sizeFrac * h) + 'px';
      el.style.color = t.color;
      t._el = el;
      attachDrag(el, t);
      overlay.appendChild(el);
    });
    updateTextVisibility();
  }

  function updateTextVisibility() {
    const now = video.currentTime || 0;
    texts.forEach((t) => {
      if (!t._el) return;
      t._el.style.display = (t.whole || (now >= t.start && now <= (t.end || 1e9))) ? '' : 'none';
    });
  }

  function attachDrag(el, t) {
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      selectedTextId = t.id; renderTextList(); syncEditor();
      texts.forEach((x) => x._el && x._el.classList.toggle('selected', x.id === t.id));
      const rect = overlay.getBoundingClientRect();
      const move = (ev) => {
        t.cx = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
        t.cy = Math.min(1, Math.max(0, (ev.clientY - rect.top) / rect.height));
        el.style.left = (t.cx * 100) + '%';
        el.style.top = (t.cy * 100) + '%';
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }

  function syncEditor() {
    const t = selectedText();
    if (!textEditor) return;
    if (!t) { textEditor.style.display = 'none'; return; }
    textEditor.style.display = 'flex';
    tContent.value = t.content;
    tFont.value = t.font;
    tSize.value = (t.sizeFrac * 100).toFixed(1);
    tColor.value = t.color;
    tBg.checked = t.bg;
    tWhole.checked = t.whole;
    tTiming.style.display = t.whole ? 'none' : 'flex';
    tTimeLabel.textContent = t.whole ? '' : `${fmtTime(t.start)}–${fmtTime(t.end)}`;
  }

  function updateSelected(fn) { const t = selectedText(); if (!t) return; fn(t); renderOverlay(); renderTextList(); }

  if (addTextBtn) addTextBtn.addEventListener('click', () => addTextOverlay('clean'));
  if (tContent) tContent.addEventListener('input', () => updateSelected((t) => { t.content = tContent.value; }));
  if (tFont) tFont.addEventListener('change', () => updateSelected((t) => { t.font = tFont.value; }));
  if (tSize) tSize.addEventListener('input', () => updateSelected((t) => { t.sizeFrac = parseFloat(tSize.value) / 100; }));
  if (tColor) tColor.addEventListener('input', () => updateSelected((t) => { t.color = tColor.value; }));
  if (tBg) tBg.addEventListener('change', () => updateSelected((t) => { t.bg = tBg.checked; }));
  if (tWhole) tWhole.addEventListener('change', () => {
    updateSelected((t) => {
      t.whole = tWhole.checked;
      if (!t.whole && !t.end) { t.start = video.currentTime; const d = activeSource() ? activeSource().duration : t.start + 3; t.end = Math.min(d, t.start + 3); }
    });
    syncEditor();
  });
  if (tSetIn) tSetIn.addEventListener('click', () => { updateSelected((t) => { t.start = video.currentTime; }); syncEditor(); });
  if (tSetOut) tSetOut.addEventListener('click', () => { updateSelected((t) => { t.end = video.currentTime; }); syncEditor(); });
  if (tDelete) tDelete.addEventListener('click', () => {
    texts = texts.filter((t) => t.id !== selectedTextId);
    selectedTextId = texts.length ? texts[texts.length - 1].id : null;
    renderOverlay(); renderTextList(); syncEditor();
  });
  presetBtns.forEach((b) => b.addEventListener('click', () => {
    const p = TEXT_PRESETS[b.dataset.preset]; if (!p) return;
    updateSelected((t) => { t.font = p.font; t.sizeFrac = p.sizeFrac; t.color = p.color; t.bg = p.bg; t.cy = p.cy; });
    presetBtns.forEach((x) => x.classList.remove('active')); b.classList.add('active');
    syncEditor();
  }));
  posBtns.forEach((b) => b.addEventListener('click', () => {
    const map = { top: 0.12, mid: 0.5, bottom: 0.86 };
    updateSelected((t) => { t.cy = map[b.dataset.pos]; t.cx = 0.5; });
  }));

  video.addEventListener('timeupdate', updateTextVisibility);
  video.addEventListener('loadedmetadata', renderOverlay);
  window.addEventListener('resize', renderOverlay);

  // ── FFmpeg (self-hosted single-threaded 0.12 core — no pthread worker, so no
  //    "function signature mismatch". Served same-origin so the worker can
  //    importScripts the core (a blob-worker importing a blob-core fails). ──
  const FF_BASE = new URL('/assets/ffmpeg012/', location.href).href;

  function withTimeout(promise, ms, msg) {
    return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);
  }

  // Drive the FFmpeg worker DIRECTLY (the wrapper's auto worker-path detection
  // picks the wrong folder and hangs). This mirrors the isolated test that worked:
  // create the classic worker at the known same-origin path and speak its protocol.
  function ensureFFmpeg() {
    if (ffmpegInstance) return Promise.resolve(ffmpegInstance);
    status('Loading engine… (first time can take a moment)');
    const start = new Promise((resolve, reject) => {
      let worker;
      try { worker = new Worker(FF_BASE + '814.ffmpeg.js'); }
      catch (e) { return reject(new Error('Could not start the video engine.')); }
      let nextId = 1, loaded = false;
      const pending = {};
      worker.onmessage = ({ data }) => {
        const id = data.id, type = data.type, payload = data.data;
        if (type === 'LOG') { if (payload && payload.message) { ffLogs.push(payload.message); if (ffLogs.length > 120) ffLogs.shift(); } return; }
        if (type === 'PROGRESS') { if (payload && payload.progress >= 0 && payload.progress <= 1) updateProgress(payload.progress); return; }
        const p = pending[id];
        if (!p) return;
        delete pending[id];
        if (type === 'ERROR') p.reject(new Error(typeof payload === 'string' ? payload : 'engine error'));
        else p.resolve(payload);
      };
      worker.onerror = (e) => {
        const msg = 'Engine worker failed to load' + (e && e.message ? (': ' + e.message) : '');
        if (!loaded) reject(new Error(msg));
        Object.keys(pending).forEach((k) => { pending[k].reject(new Error(msg)); delete pending[k]; });
      };
      const send = (type, payload, transfer) => new Promise((res, rej) => {
        const id = nextId++;
        pending[id] = { resolve: res, reject: rej };
        worker.postMessage({ id, type, data: payload }, transfer || []);
      });
      const client = {
        writeFile: (path, u8) => send('WRITE_FILE', { path, data: u8 }, [u8.buffer]),
        exec: (args) => send('EXEC', { args, timeout: -1 }),
        readFile: (path) => send('READ_FILE', { path, encoding: 'binary' })
      };
      send('LOAD', { coreURL: FF_BASE + 'ffmpeg-core.js', wasmURL: FF_BASE + 'ffmpeg-core.wasm' })
        .then(() => { loaded = true; ffmpegInstance = client; resolve(client); })
        .catch(reject);
    });
    return withTimeout(start, 60000, 'Engine took too long to load — please retry.');
  }

  function updateProgress(frac) {
    frac = Math.min(1, Math.max(0, frac));
    progressBar.style.width = (frac * 100) + '%';
    if (frac > 0.001 && exportStart) {
      const elapsed = (performance.now() - exportStart) / 1000;
      const total = elapsed / frac;
      const remain = Math.max(0, total - elapsed);
      status(`Rendering… ${Math.round(frac * 100)}% · ~${fmtTime(remain)} left`);
    }
  }

  function status(msg) { statusEl.textContent = msg; if (exporting && banner) banner.textContent = msg; }

  function triggerDownload(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  exportBtn.addEventListener('click', async () => {
    const exportClips = [];
    sources.forEach((s) => {
      const a = inOf(s), b = outOf(s);
      if (b > a + 0.05) exportClips.push({ sourceId: s.id, start: a, end: b });
    });
    if (!exportClips.length) { status('Nothing to export — add a clip first.'); return; }

    exporting = true;
    exportBtn.disabled = true;
    progressWrap.style.display = 'block';
    updateProgress(0);
    exportStart = performance.now();

    const fmt = formatSel.value;
    const preset = QUALITY[qualitySel.value];
    const W = preset.w, H = preset.h;
    const vcodec = fmt === 'webm'
      ? ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(preset.crf), '-deadline', 'realtime', '-cpu-used', '8']
      : ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', String(preset.crf), '-pix_fmt', 'yuv420p'];
    const acodec = fmt === 'webm' ? ['-c:a', 'libopus', '-ar', '48000', '-ac', '2'] : ['-c:a', 'aac', '-ar', '44100', '-ac', '2'];
    const outName = `out.${fmt}`;

    const fileKeyToIndex = {};
    const inputs = [];
    exportClips.forEach((seg) => {
      const src = sources.find((x) => x.id === seg.sourceId);
      seg._fk = src.fileKey;
      if (!(src.fileKey in fileKeyToIndex)) {
        fileKeyToIndex[src.fileKey] = inputs.length;
        inputs.push({ fileKey: src.fileKey, name: `in_${src.fileKey}.${ext(src.name)}`, file: src.file });
      }
    });

    const drawChain = () => texts.map((t, i) => {
      const size = Math.max(8, Math.round(t.sizeFrac * H));
      const col = '0x' + (t.color || '#ffffff').replace('#', '');
      let d = `drawtext=fontfile=${FONTS_VS[t.font].file}:textfile=txt_${i}.txt:expansion=none`;
      d += `:fontsize=${size}:fontcolor=${col}`;
      d += `:x=w*${t.cx.toFixed(4)}-text_w/2:y=h*${t.cy.toFixed(4)}-text_h/2`;
      if (t.bg) d += `:box=1:boxcolor=black@0.55:boxborderw=${Math.round(size * 0.35)}`;
      else d += `:shadowcolor=black@0.5:shadowx=2:shadowy=2`;
      if (!t.whole) d += `:enable=between(t\\,${(+t.start).toFixed(2)}\\,${(+t.end || 1e6).toFixed(2)})`;
      return d;
    }).join(',');

    // One pass: real audio where a clip has it, silent filler where it doesn't,
    // so the concat always has an audio track and audio is never silently dropped.
    const buildGraph = () => {
      const parts = [];
      inputs.forEach((inp) => {
        const k = fileKeyToIndex[inp.fileKey];
        const cnt = exportClips.filter((s) => s._fk === inp.fileKey).length;
        const vl = [];
        for (let j = 0; j < cnt; j++) vl.push(`vv${k}_${j}`);
        parts.push(`[${k}:v]split=${cnt}[${vl.join('][')}]`);
        inp._vl = vl; inp._vn = 0;
        if (inp.hasAudio) {
          const al = [];
          for (let j = 0; j < cnt; j++) al.push(`aa${k}_${j}`);
          parts.push(`[${k}:a]asplit=${cnt}[${al.join('][')}]`);
          inp._al = al; inp._an = 0;
        }
      });
      exportClips.forEach((seg, i) => {
        const inp = inputs[fileKeyToIndex[seg._fk]];
        const vlbl = inp._vl[inp._vn++];
        parts.push(`[${vlbl}]trim=${seg.start.toFixed(3)}:${seg.end.toFixed(3)},setpts=PTS-STARTPTS,scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`);
        if (inp.hasAudio) {
          const albl = inp._al[inp._an++];
          parts.push(`[${albl}]atrim=${seg.start.toFixed(3)}:${seg.end.toFixed(3)},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo[a${i}]`);
        } else {
          parts.push(`anullsrc=r=44100:cl=stereo:d=${(seg.end - seg.start).toFixed(3)}[a${i}]`);
        }
      });
      const n = exportClips.length;
      // concat wants inputs interleaved per segment: [v0][a0][v1][a1]…
      let cat = '';
      for (let i = 0; i < n; i++) cat += `[v${i}][a${i}]`;
      parts.push(`${cat}concat=n=${n}:v=1:a=1[cv][ca]`);
      let vOut = '[cv]';
      if (texts.length) { parts.push(`[cv]${drawChain()}[outv]`); vOut = '[outv]'; }
      return { graph: parts.join(';'), vOut };
    };

    const u8FromFile = async (file) => new Uint8Array(await file.arrayBuffer());
    const u8FromURL = async (url) => new Uint8Array(await (await fetch(url)).arrayBuffer());

    async function prepFS(ff) {
      for (const inp of inputs) await ff.writeFile(inp.name, await u8FromFile(inp.file));
      if (texts.length) {
        const usedFonts = Array.from(new Set(texts.map((t) => t.font)));
        for (const fk of usedFonts) {
          const file = FONTS_VS[fk].file;
          await ff.writeFile(file, await u8FromURL(new URL('/assets/fonts/' + file, location.href).href));
        }
        for (let i = 0; i < texts.length; i++) await ff.writeFile(`txt_${i}.txt`, new TextEncoder().encode(texts[i].content || ' '));
      }
    }

    // Deterministic audio check: try to pull a sliver of the first audio stream.
    // Exit code 0 → the clip has audio; non-zero ("matches no streams") → it doesn't.
    async function probeAudio(ff) {
      for (let i = 0; i < inputs.length; i++) {
        const inp = inputs[i];
        const probeOut = `probe_${i}.m4a`;
        let has = false;
        ffLogs = [];
        try {
          const code = await ff.exec(['-i', inp.name, '-map', '0:a:0', '-t', '0.1', '-c:a', 'aac', '-y', probeOut]);
          has = (code === 0) && !ffLogs.some((l) => /matches no streams|does not contain/i.test(l));
        } catch (e) { has = false; }
        try { await ff.readFile(probeOut); } catch (e) { /* may not exist */ }
        inp.hasAudio = has;
        console.log('[VideoStudio] audio in ' + inp.name + ': ' + has);
      }
    }

    ffLogs = [];
    try {
      const ff = await ensureFFmpeg();
      await prepFS(ff);
      status('Checking clips…');
      await probeAudio(ff);
      status(exportClips.length > 1 ? 'Combining your clips…' : 'Rendering…');
      const g = buildGraph();
      const args = [];
      inputs.forEach((inp) => args.push('-i', inp.name));
      args.push('-filter_complex', g.graph, '-map', g.vOut, '-map', '[ca]', ...vcodec, ...acodec, outName);
      console.log('[VideoStudio] filtergraph:', g.graph);
      console.log('[VideoStudio] ffmpeg args:', args.join(' '));
      ffLogs = [];
      await ff.exec(args);
      const data = await ff.readFile(outName);
      if (!data || !data.length) throw new Error('no output produced');
      updateProgress(1);
      const blob = new Blob([data.buffer], { type: fmt === 'webm' ? 'video/webm' : 'video/mp4' });
      triggerDownload(blob, `riyo-video.${fmt}`);
      status('Done! Saved to your downloads.');
    } catch (err) {
      console.error('[VideoStudio] export failed:', err);
      console.error('[VideoStudio] ffmpeg log tail:\n' + ffLogs.slice(-30).join('\n'));
      const ffErr = ffLogs.filter((l) => /error|invalid|no such|unable|failed|not found|signature/i.test(l)).slice(-1)[0];
      status('Export failed: ' + (ffErr || (err && err.message) || 'unknown error'));
    }
    exportBtn.disabled = false;
    exporting = false;
    setTimeout(() => { progressWrap.style.display = 'none'; }, 1500);
    setTimeout(updateBanner, 2600);
  });
});
