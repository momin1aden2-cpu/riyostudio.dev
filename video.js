document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('vs-dropzone');
  const fileInput = document.getElementById('vs-file-input');
  const editor = document.getElementById('vs-editor');
  const video = document.getElementById('vs-video');
  const playBtn = document.getElementById('vs-play');
  const timeLabel = document.getElementById('vs-time');
  const track = document.getElementById('vs-track');
  const playhead = document.getElementById('vs-playhead');
  const keepLeftEl = document.getElementById('vs-keep-left');
  const cutBandEl = document.getElementById('vs-cut-band');
  const keepRightEl = document.getElementById('vs-keep-right');
  const handleLEl = document.getElementById('vs-handle-l');
  const handleREl = document.getElementById('vs-handle-r');
  const cutMidBtn = document.getElementById('vs-cut-mid-btn');
  const keepWholeBtn = document.getElementById('vs-keep-whole');
  const sourcesEl = document.getElementById('vs-sources');
  const addMoreBtn = document.getElementById('vs-add-more');
  const segmentsEl = document.getElementById('vs-segments');
  const timelineDur = document.getElementById('vs-timeline-dur');
  const formatSel = document.getElementById('vs-format');
  const qualitySel = document.getElementById('vs-quality');
  const exportBtn = document.getElementById('vs-export');
  const progressWrap = document.getElementById('vs-progress-wrap');
  const progressBar = document.getElementById('vs-progress-bar');
  const statusEl = document.getElementById('vs-status');

  if (!dropzone) return;

  const QUALITY = {
    social: { w: 1080, h: 1080, crf: 30 },
    youtube: { w: 1920, h: 1080, crf: 23 },
    hq: { w: 1920, h: 1080, crf: 18 }
  };

  let sources = [];
  let activeId = null;
  let uid = 0;
  let ffmpegInstance = null;
  let overallBase = 0, overallTotal = 1, exportStart = 0;
  let fontLoaded = {};

  const fmtTime = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  const ext = (name) => (name.split('.').pop() || 'mp4').toLowerCase();
  const activeSource = () => sources.find((s) => s.id === activeId) || null;

  function getDuration(url) {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      const done = (d) => resolve({ duration: (isFinite(d) && d > 0) ? d : 0, w: v.videoWidth, h: v.videoHeight });
      v.onloadedmetadata = () => {
        if (v.duration === Infinity || isNaN(v.duration)) {
          // Some WebM / recorded files report Infinity until seeked — force a real duration
          v.ontimeupdate = () => { v.ontimeupdate = null; const d = v.duration; v.currentTime = 0; done(d); };
          v.currentTime = 1e7;
        } else {
          done(v.duration);
        }
      };
      v.onerror = () => resolve({ duration: 0, w: 0, h: 0 });
      v.src = url;
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('video/'));
    if (!files.length) return;
    for (const file of files) {
      const url = URL.createObjectURL(file);
      const meta = await getDuration(url);
      const src = { id: ++uid, file, url, name: file.name, duration: meta.duration, w: meta.w, h: meta.h, cutStart: meta.duration, cutEnd: meta.duration };
      sources.push(src);
    }
    dropzone.style.display = 'none';
    editor.style.display = 'block';
    if (!activeId) selectSource(sources[sources.length - 1].id);
    renderSources();
  }

  function selectSource(id) {
    activeId = id;
    const s = activeSource();
    if (!s) return;
    video.src = s.url;
    video.currentTime = 0;
    renderSources();
    renderTimeline();
  }

  function renderSources() {
    sourcesEl.innerHTML = '';
    sources.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'vs-source' + (s.id === activeId ? ' active' : '');
      const name = document.createElement('div'); name.className = 'vs-name'; name.textContent = s.name;
      const meta = document.createElement('div'); meta.className = 'vs-meta'; meta.textContent = fmtTime(s.duration);
      row.appendChild(name); row.appendChild(meta);
      row.addEventListener('click', () => selectSource(s.id));
      sourcesEl.appendChild(row);
    });
  }

  const clampTime = (t, dur) => Math.min(dur, Math.max(0, t));
  const hasCut = (s) => s && s.cutStart < s.cutEnd - 0.05;

  function updatePlayhead() {
    const s = activeSource();
    if (!s || !s.duration) return;
    playhead.style.left = (video.currentTime / s.duration * 100) + '%';
    timeLabel.textContent = `${fmtTime(video.currentTime)} / ${fmtTime(s.duration)}`;
  }

  // ── Timeline: keep green start + end, remove red middle ───────────
  function renderTimeline() {
    const s = activeSource();
    if (!s || !s.duration) return;
    const d = s.duration, cut = hasCut(s);
    const a = cut ? s.cutStart : 0, b = cut ? s.cutEnd : d;
    if (keepLeftEl) { keepLeftEl.style.left = '0%'; keepLeftEl.style.width = (cut ? a / d * 100 : 100) + '%'; }
    if (cutBandEl) { cutBandEl.style.display = cut ? 'block' : 'none'; cutBandEl.style.left = (a / d * 100) + '%'; cutBandEl.style.width = ((b - a) / d * 100) + '%'; }
    if (keepRightEl) { keepRightEl.style.display = cut ? 'block' : 'none'; keepRightEl.style.left = (b / d * 100) + '%'; keepRightEl.style.width = ((d - b) / d * 100) + '%'; }
    if (handleLEl) { handleLEl.classList.toggle('hidden', !cut); handleLEl.style.left = (a / d * 100) + '%'; }
    if (handleREl) { handleREl.classList.toggle('hidden', !cut); handleREl.style.left = (b / d * 100) + '%'; }
    updatePlayhead();
    renderSummary();
  }

  function renderSummary() {
    if (!segmentsEl) return;
    const s = activeSource();
    if (!s) { segmentsEl.innerHTML = ''; return; }
    if (hasCut(s)) {
      segmentsEl.innerHTML = `<div class="vs-segment"><div class="vs-name">Keeping 0:00–${fmtTime(s.cutStart)} + ${fmtTime(s.cutEnd)}–${fmtTime(s.duration)}</div></div>`;
      if (timelineDur) timelineDur.textContent = `−${fmtTime(s.cutEnd - s.cutStart)} removed`;
    } else {
      segmentsEl.innerHTML = `<div class="vs-segment"><div class="vs-name">Whole video kept (${fmtTime(s.duration)})</div></div>`;
      if (timelineDur) timelineDur.textContent = '';
    }
  }

  function startMiddleCut() {
    const s = activeSource();
    if (!s) return;
    s.cutStart = s.duration * 0.4;
    s.cutEnd = s.duration * 0.6;
    renderTimeline();
  }

  function keepWhole() {
    const s = activeSource();
    if (!s) return;
    s.cutStart = s.duration; s.cutEnd = s.duration;
    renderTimeline();
  }

  function dragHandle(which) {
    return (e) => {
      e.preventDefault();
      const s = activeSource();
      if (!s) return;
      const rect = track.getBoundingClientRect();
      const move = (ev) => {
        const t = clampTime(((ev.clientX - rect.left) / rect.width) * s.duration, s.duration);
        if (which === 'L') s.cutStart = Math.min(t, s.cutEnd);
        else s.cutEnd = Math.max(t, s.cutStart);
        const seekT = clampTime(which === 'L' ? s.cutStart : s.cutEnd, s.duration);
        if (isFinite(seekT)) video.currentTime = seekT;
        renderTimeline();
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    };
  }

  // ── Playback ──────────────────────────────────────────────────────
  playBtn.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
  video.addEventListener('play', () => { playBtn.textContent = '❚❚'; });
  video.addEventListener('pause', () => { playBtn.textContent = '▶'; });
  video.addEventListener('timeupdate', () => {
    const s = activeSource();
    if (hasCut(s)) {
      const t = video.currentTime;
      if (t >= s.cutStart - 0.05 && t < s.cutEnd) video.currentTime = s.cutEnd;
    }
    updatePlayhead();
  });
  video.addEventListener('loadedmetadata', renderTimeline);

  track.addEventListener('click', (e) => {
    const s = activeSource();
    if (!s || !isFinite(s.duration) || !s.duration || e.target === handleLEl || e.target === handleREl) return;
    const rect = track.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const t = frac * s.duration;
    if (isFinite(t)) video.currentTime = t;
  });

  if (handleLEl) handleLEl.addEventListener('pointerdown', dragHandle('L'));
  if (handleREl) handleREl.addEventListener('pointerdown', dragHandle('R'));
  if (cutMidBtn) cutMidBtn.addEventListener('click', startMiddleCut);
  if (keepWholeBtn) keepWholeBtn.addEventListener('click', keepWhole);

  // ── Upload wiring ─────────────────────────────────────────────────
  dropzone.addEventListener('click', () => fileInput.click());
  addMoreBtn.addEventListener('click', () => fileInput.click());
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

  // ── FFmpeg ────────────────────────────────────────────────────────
  function loadFFmpegScript() {
    if (window.FFmpeg || document.getElementById('vs-ffmpeg-script')) return;
    const script = document.createElement('script');
    script.id = 'vs-ffmpeg-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
    document.head.appendChild(script);
  }

  function waitForFFmpeg() {
    return new Promise((resolve, reject) => {
      let tries = 0;
      const tick = () => {
        if (window.FFmpeg) return resolve();
        if (++tries > 80) return reject(new Error('FFmpeg failed to load — check your connection and retry.'));
        setTimeout(tick, 150);
      };
      tick();
    });
  }

  async function ensureFFmpeg() {
    loadFFmpegScript();
    await waitForFFmpeg();
    if (!ffmpegInstance) {
      const { createFFmpeg } = window.FFmpeg;
      ffmpegInstance = createFFmpeg({ log: false, corePath: new URL('/assets/ffmpeg/ffmpeg-core.js', window.location.href).href });
      ffmpegInstance.setProgress(({ ratio }) => {
        if (ratio >= 0 && ratio <= 1) updateProgress((overallBase + ratio) / overallTotal);
      });
      status('Loading engine…');
      await ffmpegInstance.load();
    }
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

  function status(msg) { statusEl.textContent = msg; }
  function safeUnlink(name) { try { ffmpegInstance.FS('unlink', name); } catch (e) { /* ignore */ } }
  function triggerDownload(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  exportBtn.addEventListener('click', async () => {
    const exportClips = [];
    sources.forEach((s) => {
      if (hasCut(s)) {
        if (s.cutStart > 0.05) exportClips.push({ sourceId: s.id, start: 0, end: s.cutStart });
        if (s.cutEnd < s.duration - 0.05) exportClips.push({ sourceId: s.id, start: s.cutEnd, end: s.duration });
      } else {
        exportClips.push({ sourceId: s.id, start: 0, end: s.duration });
      }
    });
    if (!exportClips.length) { status('Nothing to export — the whole video was removed.'); return; }
    exportBtn.disabled = true;
    progressWrap.style.display = 'block';
    updateProgress(0);
    try {
      await ensureFFmpeg();
      const fmt = formatSel.value;
      const preset = QUALITY[qualitySel.value];
      const { fetchFile } = window.FFmpeg;
      const vf = `scale=${preset.w}:${preset.h}:force_original_aspect_ratio=decrease,pad=${preset.w}:${preset.h}:(ow-iw)/2:(oh-ih)/2`;
      const vcodec = fmt === 'webm'
        ? ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(preset.crf), '-deadline', 'realtime', '-cpu-used', '5']
        : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(preset.crf), '-pix_fmt', 'yuv420p'];
      const acodec = fmt === 'webm' ? ['-c:a', 'libopus', '-ar', '48000', '-ac', '2'] : ['-c:a', 'aac', '-ar', '44100', '-ac', '2'];

      overallTotal = (exportClips.length + (exportClips.length > 1 ? 1 : 0) + (texts.length ? 1 : 0)) || 1;
      exportStart = performance.now();

      const written = {};
      const segFiles = [];
      for (let i = 0; i < exportClips.length; i++) {
        const seg = exportClips[i];
        const src = sources.find((x) => x.id === seg.sourceId);
        const inName = `src_${seg.sourceId}.${ext(src.name)}`;
        if (!written[inName]) { ffmpegInstance.FS('writeFile', inName, await fetchFile(src.file)); written[inName] = true; }
        const outName = `seg_${i}.${fmt}`;
        overallBase = i;
        status(`Rendering part ${i + 1} of ${exportClips.length}…`);
        await ffmpegInstance.run('-i', inName, '-ss', String(seg.start), '-to', String(seg.end), '-vf', vf, '-r', '30', ...vcodec, ...acodec, outName);
        segFiles.push(outName);
      }

      let finalName;
      if (segFiles.length === 1) {
        finalName = segFiles[0];
        updateProgress(1);
      } else {
        overallBase = exportClips.length;
        status('Joining parts…');
        const listTxt = segFiles.map((f) => `file '${f}'`).join('\n');
        ffmpegInstance.FS('writeFile', 'concat.txt', new TextEncoder().encode(listTxt));
        finalName = `final.${fmt}`;
        await ffmpegInstance.run('-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', finalName);
        updateProgress(1);
      }

      // Text & Titles burn-in pass
      if (texts.length) {
        overallBase = overallTotal - 1;
        status('Adding text…');
        const usedFonts = Array.from(new Set(texts.map((t) => t.font)));
        for (const fk of usedFonts) {
          const file = FONTS_VS[fk].file;
          if (!fontLoaded[file]) {
            ffmpegInstance.FS('writeFile', file, await fetchFile(new URL('/assets/fonts/' + file, location.href).href));
            fontLoaded[file] = true;
          }
        }
        const draws = texts.map((t, i) => {
          ffmpegInstance.FS('writeFile', `txt_${i}.txt`, new TextEncoder().encode(t.content || ' '));
          const size = Math.max(8, Math.round(t.sizeFrac * preset.h));
          const col = '0x' + (t.color || '#ffffff').replace('#', '');
          let d = `drawtext=fontfile=${FONTS_VS[t.font].file}:textfile=txt_${i}.txt:expansion=none`;
          d += `:fontsize=${size}:fontcolor=${col}`;
          d += `:x=w*${t.cx.toFixed(4)}-text_w/2:y=h*${t.cy.toFixed(4)}-text_h/2`;
          if (t.bg) d += `:box=1:boxcolor=black@0.55:boxborderw=${Math.round(size * 0.35)}`;
          else d += `:shadowcolor=black@0.5:shadowx=2:shadowy=2`;
          if (!t.whole) d += `:enable=between(t\\,${(+t.start).toFixed(2)}\\,${(+t.end || 1e6).toFixed(2)})`;
          return d;
        }).join(',');
        const textOut = `texted.${fmt}`;
        const inputMerged = finalName;
        await ffmpegInstance.run('-i', inputMerged, '-vf', draws, ...vcodec, '-c:a', 'copy', textOut);
        safeUnlink(inputMerged);
        for (let i = 0; i < texts.length; i++) safeUnlink(`txt_${i}.txt`);
        finalName = textOut;
        updateProgress(1);
      }

      const data = ffmpegInstance.FS('readFile', finalName);
      const blob = new Blob([data.buffer], { type: fmt === 'webm' ? 'video/webm' : 'video/mp4' });
      triggerDownload(blob, `riyo-video.${fmt}`);

      segFiles.forEach(safeUnlink);
      safeUnlink('concat.txt');
      if (segFiles.length > 1) safeUnlink(finalName);
      Object.keys(written).forEach(safeUnlink);

      status('Done! Saved to your downloads.');
    } catch (err) {
      console.error(err);
      status('Export failed: ' + (err && err.message ? err.message : 'unknown error'));
    }
    exportBtn.disabled = false;
    setTimeout(() => { progressWrap.style.display = 'none'; }, 1500);
  });
});
