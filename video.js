document.addEventListener('DOMContentLoaded', () => {
  const dropzone = document.getElementById('vs-dropzone');
  const fileInput = document.getElementById('vs-file-input');
  const editor = document.getElementById('vs-editor');
  const video = document.getElementById('vs-video');
  const playBtn = document.getElementById('vs-play');
  const timeLabel = document.getElementById('vs-time');
  const track = document.getElementById('vs-track');
  const region = document.getElementById('vs-region');
  const playhead = document.getElementById('vs-playhead');
  const inSlider = document.getElementById('vs-in');
  const outSlider = document.getElementById('vs-out');
  const setInBtn = document.getElementById('vs-set-in');
  const setOutBtn = document.getElementById('vs-set-out');
  const rangeLabel = document.getElementById('vs-range-label');
  const addSegBtn = document.getElementById('vs-add-segment');
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
  let segments = [];
  let activeId = null;
  let uid = 0;
  let ffmpegInstance = null;
  let overallBase = 0, overallTotal = 1, exportStart = 0;

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
      v.onloadedmetadata = () => resolve({ duration: v.duration || 0, w: v.videoWidth, h: v.videoHeight });
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
      sources.push({ id: ++uid, file, url, name: file.name, duration: meta.duration, w: meta.w, h: meta.h });
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
    inSlider.min = 0; inSlider.max = s.duration; inSlider.step = 0.01; inSlider.value = 0;
    outSlider.min = 0; outSlider.max = s.duration; outSlider.step = 0.01; outSlider.value = s.duration;
    updateRange();
    renderSources();
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

  function inVal() { return Math.min(parseFloat(inSlider.value), parseFloat(outSlider.value) - 0.1); }
  function outVal() { return Math.max(parseFloat(outSlider.value), parseFloat(inSlider.value) + 0.1); }

  function updateRange() {
    const s = activeSource();
    if (!s || !s.duration) return;
    const i = inVal(), o = outVal();
    inSlider.value = i; outSlider.value = o;
    region.style.left = (i / s.duration * 100) + '%';
    region.style.width = ((o - i) / s.duration * 100) + '%';
    rangeLabel.textContent = `In ${fmtTime(i)} · Out ${fmtTime(o)} · ${fmtTime(o - i)} kept`;
  }

  function updatePlayhead() {
    const s = activeSource();
    if (!s || !s.duration) return;
    playhead.style.left = (video.currentTime / s.duration * 100) + '%';
    timeLabel.textContent = `${fmtTime(video.currentTime)} / ${fmtTime(s.duration)}`;
  }

  // ── Playback ──────────────────────────────────────────────────────
  playBtn.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
  video.addEventListener('play', () => { playBtn.textContent = '❚❚'; });
  video.addEventListener('pause', () => { playBtn.textContent = '▶'; });
  video.addEventListener('timeupdate', updatePlayhead);
  video.addEventListener('loadedmetadata', updatePlayhead);

  track.addEventListener('click', (e) => {
    const s = activeSource();
    if (!s || !s.duration) return;
    const rect = track.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = frac * s.duration;
  });

  inSlider.addEventListener('input', () => { updateRange(); video.currentTime = inVal(); });
  outSlider.addEventListener('input', () => { updateRange(); video.currentTime = outVal(); });
  setInBtn.addEventListener('click', () => { inSlider.value = video.currentTime; updateRange(); });
  setOutBtn.addEventListener('click', () => { outSlider.value = video.currentTime; updateRange(); });

  // ── Segments ──────────────────────────────────────────────────────
  addSegBtn.addEventListener('click', () => {
    const s = activeSource();
    if (!s) return;
    segments.push({ id: ++uid, sourceId: s.id, in: inVal(), out: outVal() });
    renderSegments();
  });

  function moveSegment(idx, dir) {
    const j = idx + dir;
    if (j < 0 || j >= segments.length) return;
    [segments[idx], segments[j]] = [segments[j], segments[idx]];
    renderSegments();
  }

  function renderSegments() {
    segmentsEl.innerHTML = '';
    let total = 0;
    segments.forEach((seg, idx) => {
      const src = sources.find((x) => x.id === seg.sourceId);
      const dur = seg.out - seg.in;
      total += dur;
      const row = document.createElement('div');
      row.className = 'vs-segment';
      const order = document.createElement('span'); order.className = 'vs-meta'; order.textContent = (idx + 1) + '.';
      const name = document.createElement('div'); name.className = 'vs-name';
      name.textContent = (src ? src.name : 'clip');
      const meta = document.createElement('div'); meta.className = 'vs-meta'; meta.textContent = `${fmtTime(seg.in)}–${fmtTime(seg.out)}`;
      const up = document.createElement('button'); up.className = 'vs-mini'; up.textContent = '↑'; up.addEventListener('click', () => moveSegment(idx, -1));
      const down = document.createElement('button'); down.className = 'vs-mini'; down.textContent = '↓'; down.addEventListener('click', () => moveSegment(idx, 1));
      const del = document.createElement('button'); del.className = 'vs-mini danger'; del.textContent = '✕';
      del.addEventListener('click', () => { segments.splice(idx, 1); renderSegments(); });
      row.appendChild(order); row.appendChild(name); row.appendChild(meta); row.appendChild(up); row.appendChild(down); row.appendChild(del);
      segmentsEl.appendChild(row);
    });
    timelineDur.textContent = segments.length ? fmtTime(total) + ' total' : '';
  }

  // ── Upload wiring ─────────────────────────────────────────────────
  dropzone.addEventListener('click', () => fileInput.click());
  addMoreBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });

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
    if (!segments.length) { status('Add at least one segment to the timeline first.'); return; }
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

      overallTotal = segments.length + (segments.length > 1 ? 1 : 0) || 1;
      exportStart = performance.now();

      const written = {};
      const segFiles = [];
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const src = sources.find((x) => x.id === seg.sourceId);
        const inName = `src_${seg.sourceId}.${ext(src.name)}`;
        if (!written[inName]) { ffmpegInstance.FS('writeFile', inName, await fetchFile(src.file)); written[inName] = true; }
        const outName = `seg_${i}.${fmt}`;
        overallBase = i;
        status(`Rendering segment ${i + 1} of ${segments.length}…`);
        await ffmpegInstance.run('-i', inName, '-ss', String(seg.in), '-to', String(seg.out), '-vf', vf, '-r', '30', ...vcodec, ...acodec, outName);
        segFiles.push(outName);
      }

      let finalName;
      if (segFiles.length === 1) {
        finalName = segFiles[0];
        updateProgress(1);
      } else {
        overallBase = segments.length;
        status('Joining segments…');
        const listTxt = segFiles.map((f) => `file '${f}'`).join('\n');
        ffmpegInstance.FS('writeFile', 'concat.txt', new TextEncoder().encode(listTxt));
        finalName = `final.${fmt}`;
        await ffmpegInstance.run('-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', finalName);
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
