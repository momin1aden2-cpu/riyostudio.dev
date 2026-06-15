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
  const tsBtns = document.querySelectorAll('[data-track]');
  const tsHint = document.getElementById('vs-ts-hint');
  const storyTitle = document.getElementById('vs-story-title');
  const clipMetaEl = document.getElementById('vs-clip-meta');
  const cutHint = document.getElementById('vs-cut-hint');
  const cutHintDefault = cutHint ? cutHint.innerHTML : null;
  // Guided mode UI
  const banner = document.getElementById('vs-banner');
  const actAdd = document.getElementById('vs-act-add');
  const actTrim = document.getElementById('vs-act-trim');
  const actText = document.getElementById('vs-act-text');
  const actCut = document.getElementById('vs-act-cut');
  const actAudio = document.getElementById('vs-act-audio');
  const actExport = document.getElementById('vs-act-export');
  const audioPanel = document.getElementById('vs-audio-panel');
  const recBtn = document.getElementById('vs-rec-btn');
  const musicBtn = document.getElementById('vs-music-btn');
  const musicInput = document.getElementById('vs-music-input');
  const aiBtn = document.getElementById('vs-ai-btn');
  const aiForm = document.getElementById('vs-ai-form');
  const aiText = document.getElementById('vs-ai-text');
  const aiVoiceSel = document.getElementById('vs-ai-voice');
  const aiKeyInput = document.getElementById('vs-ai-key');
  const aiGenBtn = document.getElementById('vs-ai-gen');
  const duckBtn = document.getElementById('vs-duck-btn');
  const audioListEl = document.getElementById('vs-audio-list');
  const addPanel = document.getElementById('vs-add-panel');
  const trimPanel = document.getElementById('vs-trim-panel');
  const cutPanel = document.getElementById('vs-cut-panel');
  const cutTrack = document.getElementById('vs-cut-track');
  const cutRegions = document.getElementById('vs-cut-regions');
  const cutBand = document.getElementById('vs-cut-band');
  const cutLEl = document.getElementById('vs-cut-l');
  const cutREl = document.getElementById('vs-cut-r');
  const cutSub = document.getElementById('vs-cut-sub');
  const cutRemoveBtn = document.getElementById('vs-cut-remove');
  const cutReplaceBtn = document.getElementById('vs-cut-replace');
  const actCaptions = document.getElementById('vs-act-captions');
  const captionsPanel = document.getElementById('vs-captions-panel');
  const capGenBtn = document.getElementById('vs-cap-generate');
  const capClearBtn = document.getElementById('vs-cap-clear');
  const capProgress = document.getElementById('vs-cap-progress');
  const capBar = document.getElementById('vs-cap-bar');
  const capStatusEl = document.getElementById('vs-cap-status');
  const capStyleBox = document.getElementById('vs-cap-style');
  const capColorInput = document.getElementById('vs-cap-color');
  const capListEl = document.getElementById('vs-cap-list');
  const capPresetBtns = document.querySelectorAll('.vs-cap-preset');
  const capPosBtns = document.querySelectorAll('[data-cappos]');
  const capLayoutBtns = document.querySelectorAll('[data-caplayout]');
  const actFormat = document.getElementById('vs-act-format');
  const formatPanel = document.getElementById('vs-format-panel');
  const videoWrap = document.getElementById('vs-video-wrap');
  const fmtAspectBtns = document.querySelectorAll('.vs-fmt-aspect');
  const fmtFillBtns = document.querySelectorAll('[data-fill]');
  const fmtRotateBtns = document.querySelectorAll('[data-rotate]');
  const fmtFlipHBtn = document.getElementById('vs-fmt-fliph');
  const fmtFlipVBtn = document.getElementById('vs-fmt-flipv');
  const bgColorInput = document.getElementById('vs-bg-color');
  const bgSwatchBtns = document.querySelectorAll('[data-bg]');
  const actOverlay = document.getElementById('vs-act-overlay');
  const overlayPanel = document.getElementById('vs-overlay-panel');
  const ovlVideo = document.getElementById('vs-ovl-video');
  const ovlAddBtn = document.getElementById('vs-ovl-add');
  const ovlRemoveBtn = document.getElementById('vs-ovl-remove');
  const ovlInput = document.getElementById('vs-ovl-input');
  const ovlNameEl = document.getElementById('vs-ovl-name');
  const ovlOpts = document.getElementById('vs-ovl-opts');
  const pipOpts = document.getElementById('vs-pip-opts');
  const sbsOpts = document.getElementById('vs-sbs-opts');
  const pipBtns = document.querySelectorAll('[data-pip]');
  const cornerBtns = document.querySelectorAll('[data-corner]');
  const sbsBtns = document.querySelectorAll('[data-sbs]');
  const pipSizeInput = document.getElementById('vs-pip-size');
  const sbsSwapBtn = document.getElementById('vs-sbs-swap');
  const mergeAudioBtns = document.querySelectorAll('[data-merge-audio]');
  const ovlTrack = document.getElementById('vs-ovl-track');
  const ovlDimL = document.getElementById('vs-ovl-dim-l');
  const ovlDimR = document.getElementById('vs-ovl-dim-r');
  const ovlKeep = document.getElementById('vs-ovl-keep');
  const ovlHandleL = document.getElementById('vs-ovl-handle-l');
  const ovlHandleR = document.getElementById('vs-ovl-handle-r');
  const ovlTrimSub = document.getElementById('vs-ovl-trim-sub');
  const actEffects = document.getElementById('vs-act-effects');
  const effectsPanel = document.getElementById('vs-effects-panel');
  const actLook = document.getElementById('vs-act-look');
  const actSpeed = document.getElementById('vs-act-speed');
  const actAppear = document.getElementById('vs-act-appear');
  const lookPanel = document.getElementById('vs-look-panel');
  const speedPanel = document.getElementById('vs-speed-panel');
  const appearPanel = document.getElementById('vs-appear-panel');
  const railGlobal = document.getElementById('vs-rail-global');
  const railClip = document.getElementById('vs-rail-clip');
  const clipBackBtn = document.getElementById('vs-clip-back');
  const clipSplitBtn = document.getElementById('vs-clip-split');
  const clipDelBtn = document.getElementById('vs-clip-del');
  const fxClipLabel = document.getElementById('vs-fx-clip');
  const fxAnimBtns = document.querySelectorAll('[data-anim]');
  const fxSpeedBtns = document.querySelectorAll('[data-speed]');
  const fxFilterBtns = document.querySelectorAll('.vs-fx-filter');
  const fxFadeInBtn = document.getElementById('vs-fx-fadein');
  const fxFadeOutBtn = document.getElementById('vs-fx-fadeout');
  const formatSel = document.getElementById('vs-format');
  const qualitySel = document.getElementById('vs-quality');
  const exportBtn = document.getElementById('vs-export');
  const progressWrap = document.getElementById('vs-progress-wrap');
  const progressBar = document.getElementById('vs-progress-bar');
  const statusEl = document.getElementById('vs-status');
  const textPanel = document.getElementById('vs-text-panel');
  const toCutBtn = document.getElementById('vs-to-cut');
  const toTrimBtn = document.getElementById('vs-to-trim');
  const shareBtn = document.getElementById('vs-share');
  const scrubEl = document.getElementById('vs-scrub');
  const scrubFill = document.getElementById('vs-scrub-fill');
  const tabBtns = document.querySelectorAll('.vs-tab[data-mode]');
  const imgEl = document.getElementById('vs-image');
  const trimVideoBox = document.getElementById('vs-trim-video');
  const trimImageBox = document.getElementById('vs-trim-image');
  const imgDurInput = document.getElementById('vs-img-dur');
  const imgDurVal = document.getElementById('vs-img-dur-val');
  const imgDurBtns = document.querySelectorAll('[data-imgdur]');
  const imgRotLBtn = document.getElementById('vs-img-rot-l');
  const imgRotRBtn = document.getElementById('vs-img-rot-r');
  const imgFlipBtn = document.getElementById('vs-img-flip');
  const cardTextEl = document.getElementById('vs-card-text');
  const cardAddBtn = document.getElementById('vs-card-add');
  const cardColorBtns = document.querySelectorAll('[data-cardbg]');
  let cardBg = '#0B1220';
  const recModeBtns = document.querySelectorAll('[data-rec]');
  const recBar = document.getElementById('vs-rec-bar');
  const recTimeEl = document.getElementById('vs-rec-time');
  const recPauseBtn = document.getElementById('vs-rec-pause');
  const recStopBtn = document.getElementById('vs-rec-stop');
  const recDropBtn = document.getElementById('vs-rec-dropzone');
  const recDropWrap = document.getElementById('vs-rec-dropzone-wrap');
  const addVideoBtn = document.getElementById('vs-add-video');
  const addPhotoBtn = document.getElementById('vs-add-photo');
  const addRecBtn = document.getElementById('vs-add-rec');
  const addCardBtn = document.getElementById('vs-add-card');
  const recSection = document.getElementById('vs-rec-section');
  const cardSection = document.getElementById('vs-card-section');
  // Screen / camera recording state
  let recScreenStream = null, recCamStream = null, recScreenRec = null, recCamRec = null;
  let recScreenChunks = [], recCamChunks = [], recTimerInt = null;
  let recStartTs = 0, recElapsed = 0, recPaused = false, recMode = null, recMime = '';
  let recording = false;   // true while a live screen/camera capture is showing in the stage

  if (!dropzone) return;

  // Images / screenshots can be added as clips that show for a set time.
  const IMG_DEFAULT = 3;     // default seconds an image shows
  const IMG_MAX = 15;        // longest a single image can show
  const ANIM_D = 0.5;        // entrance-animation length (seconds)
  const isImage = (s) => !!(s && s.kind === 'image');
  const animOf = (s) => (s && s.anim) || 'none';
  // A virtual clock drives playback through image clips (they have no <video> time).
  let imgLocal = 0, imgRAF = null, imgStartPerf = 0, imgStartLocal = 0;

  // Quality = the short side; the aspect ratio decides the other dimension. Kept
  // modest because the single-threaded WASM encoder is slow at 1080p.
  const QUALITY = { fast: { base: 480, crf: 30 }, sd: { base: 720, crf: 28 }, hd: { base: 1080, crf: 23 } };
  const ASPECTS = { '16:9': [16, 9], '9:16': [9, 16], '1:1': [1, 1], '4:5': [4, 5] };
  const aspectRatio = (key) => { const a = ASPECTS[key] || ASPECTS['16:9']; return a[0] / a[1]; };
  function computeWH(aspectKey, base) {
    const a = ASPECTS[aspectKey] || ASPECTS['16:9'];
    let W, H;
    if (a[0] >= a[1]) { H = base; W = Math.round(base * a[0] / a[1]); }
    else { W = base; H = Math.round(base * a[1] / a[0]); }
    return { W: W - (W % 2), H: H - (H % 2) };
  }

  // Each clip plays a contiguous [in, out] slice of its file. The storyboard order
  // is the final video. dropGlobal is one marker measured across the WHOLE video.
  // Two tracks: t1 (main) and t2 (second video). `sources` always points at the
  // track currently being edited, so every tool works on either track.
  const t1 = [];
  const t2 = [];
  let sources = t1;
  let editingTrack = 1;       // 1 = main video, 2 = second video
  let activeIdT = { 1: null, 2: null };
  let activeId = null;
  let uid = 0;
  let fileSeq = 0;
  let pendingInsert = null;   // { clipId, time } — where the next picked video drops in
  let dropGlobal = 0;         // amber marker, in seconds across the whole combined video
  let mode = 'home';          // guided mode: 'home' | 'add' | 'trim' | 'cut' | 'audio'
  let railMode = 'global';    // 'global' = add/whole-video tools · 'clip' = the tapped clip's tools
  let cutS = 0, cutE = 0;     // 'cut out a part' selection, in seconds across the whole video
  let exporting = false;
  let audios = [];            // overlay audio: { id, kind, name, file, url, duration, start, volume, el }
  let duckMusic = false;      // auto-dip music under voice (sidechain compress on export)
  let mediaRecorder = null, recChunks = [], recStartGlobal = 0;
  let capWords = [];          // raw transcribed words: { text, start, end } in whole-video seconds
  let captions = [];          // display segments derived from capWords: { id, text, start, end }
  let capStyle = { font: 'anton', color: '#FFE14D', bg: false, sizeFrac: 0.11, cy: 0.5, layout: 'word' };
  let capTranscriber = null;  // cached Whisper pipeline, loaded once
  let capBusy = false;
  // Output format: aspect ratio, how to fill the frame, and rotate/flip.
  let outAspect = '16:9';     // '16:9' | '9:16' | '1:1' | '4:5'
  let outFill = 'blur';       // 'blur' | 'crop' | 'color'
  let bgColor = '#000000';    // backdrop colour when fill = 'color'
  let outRotate = 'none';     // 'none' | 'cw' | 'ccw'
  let outFlipH = false, outFlipV = false;
  // Effects: per-clip speed (on each source) + global colour look and fades.
  let vfilter = 'none';       // colour look applied to the whole video
  let fadeIn = false, fadeOut = false;
  // Second video (PiP / side-by-side), composited over the whole main video.
  let overlay2 = null;        // { file, url, duration, w, h, in, out }
  let pipLayout = 'off';      // 'off' | 'pip' | 'sbs'
  let pipX = 0.66, pipY = 0.65; // PiP top-left position, as fractions of the frame
  let pipSize = 0.3;          // inset width as a fraction of the frame
  let sbsDir = 'lr';          // 'lr' | 'tb'
  let sbsSwap = false;        // which side each video sits on
  let mergeAudio = 'both';    // 'both' | 'v1' | 'v2' — which video's sound to keep when merging
  const FILTERS = {
    none: { css: 'none', ff: '' },
    vivid: { css: 'saturate(1.4) contrast(1.08)', ff: 'eq=saturation=1.4:contrast=1.08' },
    warm: { css: 'saturate(1.15) sepia(0.18)', ff: 'colorbalance=rm=0.09:rh=0.06:bm=-0.05:bh=-0.04,eq=saturation=1.12' },
    cool: { css: 'saturate(1.1) brightness(1.02) hue-rotate(-8deg)', ff: 'colorbalance=bm=0.09:bh=0.06:rm=-0.05,eq=saturation=1.08' },
    bw: { css: 'grayscale(1) contrast(1.12)', ff: 'hue=s=0,eq=contrast=1.12' },
    vintage: { css: 'sepia(0.4) saturate(0.85) contrast(0.95)', ff: 'colorbalance=rm=0.12:gm=0.04:bm=-0.08,eq=saturation=0.82:contrast=0.95' },
    cinematic: { css: 'contrast(1.18) saturate(1.06) brightness(0.97)', ff: 'eq=contrast=1.18:saturation=1.06:brightness=-0.03,colorbalance=bh=0.04:rs=0.03' }
  };
  const speedOf = (s) => s.speed || 1;
  let ffmpegInstance = null;  // single-threaded FFmpeg 0.12 engine, loaded on first export
  let webavMod = null;        // WebCodecs (WebAV) fast-export engine, loaded on first use
  let ffLogs = [];            // recent FFmpeg log lines, for surfacing real errors
  let ffExpectedDur = 0;      // expected output seconds — for accurate progress when the wrapper can't tell (looped inputs)
  let exportStart = 0;
  let exportPhase = '';
  let exportHeartbeat = null;
  let exportAction = 'download';   // 'download' | 'share' — set by the button that started the render
  let lastExportBlob = null, lastExportName = '';

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
  const winLen = (s) => Math.max(0, outOf(s) - inOf(s));     // source seconds kept
  const clampWin = (s, t) => Math.min(outOf(s), Math.max(inOf(s), t));
  const keptDuration = (s) => winLen(s) / speedOf(s);        // played (output) seconds

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

  // Same global→clip mapping, but against any track array (the live 2nd-video preview).
  const trackKept = (arr) => arr.reduce((a, s) => a + keptDuration(s), 0);
  function clipAtGlobalIn(arr, gt) {
    if (!arr.length) return null;
    let acc = 0;
    for (let i = 0; i < arr.length; i++) {
      const len = keptDuration(arr[i]);
      if (gt < acc + len || i === arr.length - 1) return { idx: i, clip: arr[i], local: Math.max(0, Math.min(len, gt - acc)) };
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

  function getImageMeta(url) {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve({ w: im.naturalWidth || 1280, h: im.naturalHeight || 720 });
      im.onerror = () => resolve({ w: 1280, h: 720 });
      im.src = url;
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('video/') || f.type.startsWith('image/'));
    if (!files.length) { pendingInsert = null; return; }
    const added = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('image/')) {
        const m = await getImageMeta(url);
        added.push({ id: ++uid, kind: 'image', fileKey: 'f' + (++fileSeq), file, url, name: file.name, duration: IMG_MAX, w: m.w, h: m.h, thumb: url, in: 0, out: IMG_DEFAULT, speed: 1 });
      } else {
        const meta = await getMeta(url);
        added.push({ id: ++uid, fileKey: 'f' + (++fileSeq), file, url, name: file.name, duration: meta.duration, w: meta.w, h: meta.h, thumb: meta.thumb, in: 0, out: meta.duration });
      }
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

    revealEditor();
    selectClip(added[added.length - 1].id);
  }

  function revealEditor() {
    if (dropzone) dropzone.style.display = 'none';
    if (recDropWrap) recDropWrap.style.display = 'none';
    if (editor) editor.style.display = 'block';
    if (mode === 'home') setMode('add');   // open the Media tab the first time
  }

  // ── Screen / camera recording ─────────────────────────────────────
  function pickRecMime() {
    const prefs = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const m of prefs) { try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; } catch (e) {} }
    return '';
  }
  const recExt = (mime) => (/mp4/.test(mime) ? 'mp4' : 'webm');

  function showRecUI(on) {
    if (recBar) recBar.style.display = on ? 'flex' : 'none';
    recModeBtns.forEach((b) => { b.disabled = on; b.style.opacity = on ? '0.5' : ''; });
    if (on && recPauseBtn) recPauseBtn.textContent = '⏸ Pause';
  }

  function setupRecPreview(mode) {
    recording = true;
    if (videoWrap) videoWrap.classList.add('recording');
    if (imgEl) imgEl.style.display = 'none';
    const mainStream = recScreenStream || recCamStream;
    if (video && mainStream) { video.srcObject = mainStream; video.style.display = ''; video.muted = true; const p = video.play(); if (p && p.catch) p.catch(() => {}); }
    if (mode === 'both' && recCamStream && ovlVideo) {
      ovlVideo.srcObject = recCamStream; ovlVideo.muted = true; ovlVideo.style.display = 'block'; ovlVideo.style.objectFit = 'cover';
      ovlVideo.style.right = 'auto'; ovlVideo.style.bottom = 'auto'; ovlVideo.style.height = 'auto';
      ovlVideo.style.width = (Math.max(0.18, Math.min(0.5, pipSize)) * 100) + '%';
      ovlVideo.style.left = (clamp01(pipX) * 100) + '%'; ovlVideo.style.top = (clamp01(pipY) * 100) + '%';
      ovlVideo.style.borderRadius = '10px';
      const p = ovlVideo.play(); if (p && p.catch) p.catch(() => {});
    }
  }
  function teardownRecPreview() {
    recording = false;
    if (videoWrap) videoWrap.classList.remove('recording');
    if (video) { try { video.srcObject = null; } catch (e) {} video.muted = false; }
    if (ovlVideo) { try { ovlVideo.srcObject = null; } catch (e) {} ovlVideo.style.display = 'none'; ovlVideo.classList.remove('draggable'); }
  }
  function cleanupRecStreams() {
    [recScreenStream, recCamStream].forEach((s) => { if (s) { try { s.getTracks().forEach((t) => t.stop()); } catch (e) {} } });
    recScreenStream = null; recCamStream = null; recScreenRec = null; recCamRec = null;
  }
  function updateRecTimer() {
    if (recPaused) return;
    if (recTimeEl) recTimeEl.textContent = fmtTime(recElapsed + (performance.now() - recStartTs) / 1000);
  }

  async function startRecording(mode) {
    if (recScreenRec || recCamRec) return;
    const needsScreen = (mode === 'screen' || mode === 'both');
    const needsCam = (mode === 'cam' || mode === 'both');
    if (needsScreen && !(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) { flashHint('Screen recording needs a desktop browser — try 📷 Camera instead.'); return; }
    if (needsCam && !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { flashHint('This browser can’t access the camera.'); return; }
    revealEditor(); setMode('add');
    recMode = mode;
    try {
      if (needsScreen) recScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
    } catch (e) { flashHint('Screen recording was cancelled.'); cleanupRecStreams(); return; }
    if (needsCam) {
      try { recCamStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true }); }
      catch (e) {
        if (mode === 'cam') { flashHint('Camera was blocked or unavailable.'); cleanupRecStreams(); return; }
        flashHint('Camera blocked — recording the screen only.'); recMode = 'screen';
      }
    }
    recMime = pickRecMime();
    recScreenChunks = []; recCamChunks = [];
    setupRecPreview(recMode);
    const mk = (stream, chunks) => { const r = new MediaRecorder(stream, recMime ? { mimeType: recMime } : undefined); r.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); }; return r; };
    if (recScreenStream) recScreenRec = mk(recScreenStream, recScreenChunks);
    if (recCamStream) recCamRec = mk(recCamStream, recCamChunks);
    if (recScreenStream) { const vt = recScreenStream.getVideoTracks()[0]; if (vt) vt.onended = () => stopRecording(); }
    recPaused = false; recElapsed = 0; recStartTs = performance.now();
    try { if (recScreenRec) recScreenRec.start(1000); if (recCamRec) recCamRec.start(1000); } catch (e) { flashHint('Could not start recording.'); cleanupRecStreams(); teardownRecPreview(); return; }
    recTimerInt = setInterval(updateRecTimer, 250);
    showRecUI(true);
  }

  function toggleRecPause() {
    if (!recScreenRec && !recCamRec) return;
    if (recPaused) {
      recPaused = false; recStartTs = performance.now();
      [recScreenRec, recCamRec].forEach((r) => { if (r && r.state === 'paused') try { r.resume(); } catch (e) {} });
      if (recPauseBtn) recPauseBtn.textContent = '⏸ Pause';
    } else {
      recPaused = true; recElapsed += (performance.now() - recStartTs) / 1000;
      [recScreenRec, recCamRec].forEach((r) => { if (r && r.state === 'recording') try { r.pause(); } catch (e) {} });
      if (recPauseBtn) recPauseBtn.textContent = '▶ Resume';
    }
  }

  async function addRecordedClip(file, arr) {
    const url = URL.createObjectURL(file);
    const meta = await getMeta(url);
    const clip = { id: ++uid, fileKey: 'f' + (++fileSeq), file, url, name: file.name, duration: meta.duration, w: meta.w, h: meta.h, thumb: meta.thumb, in: 0, out: meta.duration };
    arr.push(clip);
    return clip;
  }

  async function stopRecording() {
    if (!recScreenRec && !recCamRec) return;
    const sRec = recScreenRec, cRec = recCamRec;
    const finish = (rec) => new Promise((res) => { if (!rec) return res(); rec.onstop = res; try { if (rec.state !== 'inactive') rec.stop(); else res(); } catch (e) { res(); } });
    await Promise.all([finish(sRec), finish(cRec)]);
    if (recTimerInt) { clearInterval(recTimerInt); recTimerInt = null; }
    const mime = recMime, ext = recExt(mime);
    const screenBlob = recScreenChunks.length ? new Blob(recScreenChunks, { type: mime || 'video/webm' }) : null;
    const camBlob = recCamChunks.length ? new Blob(recCamChunks, { type: mime || 'video/webm' }) : null;
    const mode = recMode;
    cleanupRecStreams(); teardownRecPreview(); showRecUI(false);
    revealEditor();
    if (mode === 'both' && screenBlob && camBlob) {
      await addRecordedClip(new File([screenBlob], `screen-recording.${ext}`, { type: mime || 'video/webm' }), t1);
      await addRecordedClip(new File([camBlob], `camera-recording.${ext}`, { type: mime || 'video/webm' }), t2);
      pipLayout = 'pip';
      editingTrack = 1; sources = t1; activeId = t1.length ? t1[t1.length - 1].id : null;
      refreshTrackSwitch(); refreshOverlayButtons();
      if (activeId) selectClip(activeId);
      applyOverlayPreview();
      flashHint('Recorded! Screen = Video 1, camera = Video 2 (drag & resize it in the 🔀 Merge tab).');
    } else {
      const blob = screenBlob || camBlob;
      if (blob) {
        const name = (mode === 'cam' ? 'camera' : 'screen') + `-recording.${ext}`;
        const target = (editingTrack === 2) ? t2 : t1;
        const clip = await addRecordedClip(new File([blob], name, { type: mime || 'video/webm' }), target);
        selectClip(clip.id);
      }
      flashHint('Recorded! Trim it, add captions, voiceover or music — then download.');
    }
    recMode = null;
    renderAll();
  }

  // ── Selecting / positioning ───────────────────────────────────────
  // Show the right media element for a clip — the <video> or the <img>.
  function showMedia(s) {
    if (!imgEl || !video) return;
    if (isImage(s)) {
      if (imgEl.getAttribute('src') !== s.url) imgEl.src = s.url;
      imgEl.style.display = 'block';
      imgEl.style.objectFit = (outFill === 'crop') ? 'cover' : 'contain';
      video.style.display = 'none';
      if (!video.paused) video.pause();
    } else {
      imgEl.style.display = 'none';
      video.style.display = '';
    }
  }

  function stopImgClock() { if (imgRAF) { cancelAnimationFrame(imgRAF); imgRAF = null; } }

  // Virtual playback clock for image clips (no native <video> time to follow).
  function startImgClock() {
    stopImgClock();
    imgStartPerf = performance.now();
    imgStartLocal = imgLocal;
    previewPlaying = true;
    if (playBtn) playBtn.textContent = '❚❚';
    const tick = () => {
      const s = activeSource();
      if (!s || !isImage(s)) { imgRAF = null; return; }
      imgLocal = imgStartLocal + (performance.now() - imgStartPerf) / 1000;
      const dur = keptDuration(s);
      if (imgLocal >= dur - 0.001) {
        const next = nextClipId();
        if (next != null) { stopImgClock(); gotoClip(next, true); return; }
        imgLocal = dur; stopImgClock();
        previewPlaying = false; if (playBtn) playBtn.textContent = '▶';
        pauseAudioPreview(); updatePlayhead();
        return;
      }
      updatePlayhead();
      imgRAF = requestAnimationFrame(tick);
    };
    imgRAF = requestAnimationFrame(tick);
  }

  // Load a clip into the player and play it (used for whole-video playback).
  function gotoClip(id, autoplay) {
    activeId = id;
    const s = activeSource();
    if (!s) return;
    stopImgClock();
    if (isImage(s)) {
      showMedia(s);
      imgLocal = 0;
      if (autoplay) startImgClock();
      else { previewPlaying = false; if (playBtn) playBtn.textContent = '▶'; }
      renderAll();
      return;
    }
    showMedia(s);
    const start = () => {
      video.playbackRate = speedOf(s);
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
      activeId = s.id;
      stopImgClock();
      if (isImage(s)) {
        showMedia(s); imgLocal = at.local;
      } else {
        showMedia(s);
        const ft = inOf(s) + at.local * speedOf(s);
        if (video.src !== s.url) { video.pause(); video.src = s.url; }
        if (seek) {
          const apply = () => { try { video.currentTime = ft; } catch (e) { /* not seekable yet */ } };
          if (video.readyState >= 1 && video.src === s.url) apply();
          else video.addEventListener('loadedmetadata', apply, { once: true });
          video.pause();
        }
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
    if (!sources.length) {
      if (editingTrack === 1 && !t2.length) { resetToDropzone(); return; }
      activeId = null; dropGlobal = 0;
      video.pause(); video.removeAttribute('src'); video.load();
      renderAll(); refreshTrackSwitch();
      return;
    }
    selectClip(sources[Math.min(idx, sources.length - 1)].id);
  }

  // Switch which track every tool edits. The inactive track keeps its clips.
  function setEditingTrack(n) {
    if (n === editingTrack) return;
    activeIdT[editingTrack] = activeId;
    editingTrack = n;
    sources = (n === 1) ? t1 : t2;
    const saved = activeIdT[n];
    activeId = (saved && sources.some((s) => s.id === saved)) ? saved : (sources.length ? sources[0].id : null);
    pendingInsert = null; dropGlobal = 0;
    if (sources.length) {
      const idx = Math.max(0, sources.findIndex((s) => s.id === activeId));
      goToGlobal(globalStartOf(idx), true);
    } else {
      video.pause(); video.removeAttribute('src'); video.load();
      renderAll();
    }
    applyOverlayPreview();
    refreshOverlayButtons();
    refreshTrackSwitch();
  }

  function refreshTrackSwitch() {
    tsBtns.forEach((b) => b.classList.toggle('active', parseInt(b.dataset.track, 10) === editingTrack));
    if (storyTitle) storyTitle.textContent = editingTrack === 1 ? 'Video 1 clips' : 'Video 2 clips';
    if (tsHint) tsHint.textContent = (editingTrack === 2 && !t2.length) ? '— drop clips here for the second video' : '';
  }

  function resetToDropzone() {
    activeId = null; dropGlobal = 0;
    t2.length = 0; sources = t1; sources.length = 0;
    editingTrack = 1; activeIdT = { 1: null, 2: null };
    if (typeof refreshTrackSwitch === 'function') refreshTrackSwitch();
    video.pause();
    video.removeAttribute('src');
    video.load();
    audios.forEach((au) => { if (au.el) { try { au.el.pause(); } catch (e) { /* ignore */ } } try { URL.revokeObjectURL(au.url); } catch (e) { /* ignore */ } });
    audios = [];
    duckMusic = false; if (duckBtn) duckBtn.classList.remove('active');
    capWords = []; captions = [];
    if (capStyleBox) capStyleBox.style.display = 'none';
    if (capClearBtn) capClearBtn.style.display = 'none';
    if (capProgress) capProgress.style.display = 'none';
    if (capListEl) capListEl.innerHTML = '';
    if (capCue) { try { capCue.remove(); } catch (e) { /* ignore */ } capCue = null; }
    vfilter = 'none'; fadeIn = false; fadeOut = false;
    applyLook();
    if (overlay2) { try { URL.revokeObjectURL(overlay2.url); } catch (e) { /* ignore */ } }
    overlay2 = null; pipLayout = 'off';
    if (ovlVideo) { try { ovlVideo.pause(); ovlVideo.removeAttribute('src'); ovlVideo.load(); } catch (e) { /* ignore */ } applyOverlayPreview(); }
    if (typeof refreshOverlayButtons === 'function') refreshOverlayButtons();
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
    // Tabs behave like tabs — a click always selects (no toggle-off).
    mode = m;
    if (addPanel) addPanel.style.display = (mode === 'add') ? '' : 'none';
    if (trimPanel) trimPanel.style.display = (mode === 'trim') ? '' : 'none';
    if (cutPanel) cutPanel.style.display = (mode === 'cut') ? '' : 'none';
    if (audioPanel) audioPanel.style.display = (mode === 'audio') ? '' : 'none';
    if (captionsPanel) captionsPanel.style.display = (mode === 'captions') ? '' : 'none';
    if (formatPanel) formatPanel.style.display = (mode === 'format') ? '' : 'none';
    if (lookPanel) lookPanel.style.display = (mode === 'look') ? '' : 'none';
    if (speedPanel) speedPanel.style.display = (mode === 'speed') ? '' : 'none';
    if (appearPanel) appearPanel.style.display = (mode === 'appear') ? '' : 'none';
    if (overlayPanel) overlayPanel.style.display = (mode === 'overlay') ? '' : 'none';
    if (textPanel) textPanel.style.display = (mode === 'text') ? '' : 'none';
    if (mode === 'look' || mode === 'speed' || mode === 'appear') refreshFxButtons();
    if (mode === 'overlay') refreshOverlayButtons();
    // Highlight the matching tool. Trim + Cut share the Trim button.
    if (tabBtns && tabBtns.length) {
      tabBtns.forEach((b) => {
        const dm = b.dataset.mode;
        b.classList.toggle('active', dm === mode || (dm === 'trim' && mode === 'cut'));
      });
    }
    if (mode === 'cut') {
      // default selection: the middle third of the whole video
      const T = totalDur();
      cutS = T * 0.33; cutE = T * 0.66;
    }
    renderAll();
  }

  // The left rail swaps between whole-video/add tools and the tapped clip's tools.
  function setRailMode(m) {
    railMode = m;
    if (railGlobal) railGlobal.style.display = (m === 'clip') ? 'none' : '';
    if (railClip) railClip.style.display = (m === 'clip') ? '' : 'none';
    if (m === 'clip') {
      const s = activeSource(), img = isImage(s);
      if (actSpeed) actSpeed.style.display = img ? 'none' : '';   // images have a duration, not a speed
      if (clipSplitBtn) clipSplitBtn.style.display = img ? 'none' : '';
    }
  }
  function enterClipTools(id) {
    if (id != null) selectClip(id);
    setRailMode('clip');
    setMode('trim');
  }
  function exitClipTools() {
    setRailMode('global');
    setMode('home');
  }

  function updateBanner() {
    if (!banner || exporting) return;
    if (!sources.length) { banner.innerHTML = 'Add a video or image to get started.'; return; }
    if (mode === 'trim') {
      const n = Math.max(1, sources.findIndex((x) => x.id === activeId) + 1);
      banner.innerHTML = `✂️ <b>Shortening clip ${n}.</b> Drag the <b style="color:#34D399;">green edges</b> in to keep only the part you want (dimmed = removed). Tap another clip below to shorten that one instead.`;
    } else if (mode === 'add') {
      banner.innerHTML = '➕ <b>Add a video or image.</b> Mix camera clips, screen recordings &amp; screenshots into one video. ① Drag the amber <b style="color:#FBBF24;">⬇</b> marker to the spot. ② Tap <b>“Add video or image”</b> — it drops in right there (set how long an image shows under ✂️ Trim).';
    } else if (mode === 'cut') {
      banner.innerHTML = '🗑️ <b>Remove a section.</b> Drag the <b style="color:#f87171;">red edges</b> to mark the section to remove (e.g. 1:10 → 1:50), then <b>Remove</b> it (the rest joins up) or <b>Replace</b> it with another video.';
    } else if (mode === 'audio') {
      banner.innerHTML = '🎙️ <b>Add audio.</b> <b>Record</b> a voiceover, <b>add music</b> from your device, or generate an <b>AI voice</b>. Set each track’s volume below — they’re mixed into your video when you download.';
    } else if (mode === 'captions') {
      banner.innerHTML = '💬 <b>Captions.</b> Tap <b>✨ Generate captions</b> — your speech is transcribed <b>privately on your device</b> (first run downloads the AI once), then pick a style. They’re burned into your video on download.';
    } else if (mode === 'format') {
      const labels = { '16:9': 'Landscape 16:9', '9:16': 'Vertical 9:16', '1:1': 'Square 1:1', '4:5': 'Portrait 4:5' };
      banner.innerHTML = `📐 <b>Format: ${labels[outAspect]}.</b> Pick a shape for your platform and how to fill the frame — the preview reframes live. <b>Blur background</b> looks best when the shapes don’t match.`;
    } else if (mode === 'speed') {
      banner.innerHTML = '⏩ <b>Speed of this clip.</b> Slow it down for emphasis or speed it up — the preview updates live.';
    } else if (mode === 'appear') {
      banner.innerHTML = '🎞️ <b>How this clip appears.</b> Give it a PowerPoint-style entrance — fade, slide, or zoom. Press play to see it.';
    } else if (mode === 'look') {
      banner.innerHTML = '✨ <b>Look.</b> A colour grade for the <b>whole video</b>, plus <b>Fade</b> in/out — shown live on the preview (fade applies on download).';
    } else if (mode === 'overlay') {
      banner.innerHTML = '🔀 <b>Overlay a 2nd video</b> — for <b>reactions</b>, <b>facecam over a screen-recording</b>, <b>duets</b> or <b>before/after</b>. Add a second video, pick <b>corner inset (PiP)</b> or <b>split screen</b>, and the preview shows the <b>live result</b>. Drag the inset to place it; <b>tap it</b> to edit Video 2 on its own.';
    } else {
      banner.innerHTML = '<b>Add</b> a video, image, recording or title card — or <b>tap any clip below</b> to trim, speed, animate or delete it.';
    }
  }

  // Seek the preview to an absolute whole-video position (loads the right clip).
  function previewGlobal(g) {
    const at = clipAtGlobal(g);
    if (!at) return;
    const s = at.clip;
    if (isImage(s)) { stopImgClock(); activeId = s.id; showMedia(s); imgLocal = at.local; return; }
    const ft = inOf(s) + at.local * speedOf(s);
    if (activeId !== s.id) { activeId = s.id; showMedia(s); if (video.src !== s.url) video.src = s.url; }
    const apply = () => { try { video.currentTime = ft; } catch (e) { /* ignore */ } };
    if (video.readyState >= 1 && video.src === s.url) apply();
    else video.addEventListener('loadedmetadata', apply, { once: true });
  }

  // ── Rendering ─────────────────────────────────────────────────────
  function renderAll() { renderTimeline(); renderTrim(); renderCut(); renderStory(); renderAudioList(); refreshFxButtons(); updateBanner(); }

  function renderCut() {
    if (!cutTrack) return;
    const T = totalDur() || 1;
    if (cutRegions) {
      cutRegions.innerHTML = '';
      sources.forEach((s) => {
        const r = document.createElement('div');
        r.className = 'vs-g-region';
        r.style.width = (keptDuration(s) / T * 100) + '%';
        if (s.thumb) r.style.backgroundImage = `url("${s.thumb}")`;
        cutRegions.appendChild(r);
      });
    }
    cutS = Math.max(0, Math.min(cutS, T));
    cutE = Math.max(cutS + 0.1, Math.min(cutE, T));
    const ps = cutS / T * 100, pe = cutE / T * 100;
    if (cutBand) { cutBand.style.left = ps + '%'; cutBand.style.width = (pe - ps) + '%'; }
    if (cutLEl) cutLEl.style.left = ps + '%';
    if (cutREl) cutREl.style.left = pe + '%';
    if (cutSub) cutSub.textContent = `remove ${fmtTime(cutS)} → ${fmtTime(cutE)}  (−${fmtTime(cutE - cutS)})`;
  }

  function updateClipMeta() {
    if (!clipMetaEl) return;
    if (!sources.length) { clipMetaEl.textContent = ''; return; }
    clipMetaEl.textContent = `· ${sources.length} clip${sources.length > 1 ? 's' : ''} · ${fmtTime(totalDur())}`;
  }

  function updateInsertLabel() {
    if (!insertBtn) return;
    insertBtn.textContent = sources.length ? `② 📁 Add video or image at ${fmtTime(dropGlobal)}` : '📁 Choose a video or image';
  }

  // The amber marker always sits where the preview is "looking" — scrub or play,
  // and that becomes the insert/split point. Insert reads the live position too.
  function updatePlayhead() {
    if (recording) return;   // the stage is showing a live capture, not a clip
    const s = activeSource();
    const T = totalDur() || 1;
    if (!s) { if (timeLabel) timeLabel.textContent = '0:00 / 0:00'; if (dropTag) dropTag.textContent = '⬇'; return; }
    const idx = sources.findIndex((x) => x.id === s.id);
    const img = isImage(s);
    if (!img && video.playbackRate !== speedOf(s)) video.playbackRate = speedOf(s);
    const local = img
      ? Math.max(0, Math.min(keptDuration(s), imgLocal))
      : Math.max(0, Math.min(keptDuration(s), (video.currentTime - inOf(s)) / speedOf(s)));
    const g = globalStartOf(idx) + local;
    dropGlobal = g;
    if (dropEl) dropEl.style.left = (g / T * 100) + '%';
    if (dropTag) dropTag.textContent = '⬇ ' + fmtTime(g);
    if (scrubFill) scrubFill.style.width = (g / T * 100) + '%';
    if (playhead) playhead.style.left = clamp01(img ? (local / Math.max(0.1, keptDuration(s))) : (video.currentTime / (s.duration || 1))) * 100 + '%';
    if (timeLabel) timeLabel.textContent = `${fmtTime(g)} / ${fmtTime(T)}`;
    updateInsertLabel();
    if (audios.length) syncAudioPreview(g);
    renderCaptionPreview(g);
    syncOverlayPreview(g);
    updateTextVisibility();
    applyClipAnim(s, local);
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
    // Images use a "show for N seconds" control; videos use the green-edge trim bar.
    const img = isImage(s);
    if (trimVideoBox) trimVideoBox.style.display = img ? 'none' : '';
    if (trimImageBox) trimImageBox.style.display = img ? '' : 'none';
    if (img) {
      const dur = keptDuration(s);
      if (imgDurInput) imgDurInput.value = Math.max(0.5, Math.min(IMG_MAX, dur));
      if (imgDurVal) imgDurVal.textContent = dur.toFixed(1) + 's';
      imgDurBtns.forEach((b) => b.classList.toggle('active', Math.abs(parseFloat(b.dataset.imgdur) - dur) < 0.01));
      return;
    }
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

  // Set how long the active image clip shows.
  function setImageDuration(sec) {
    const s = activeSource();
    if (!isImage(s)) return;
    s.out = Math.max(0.5, Math.min(IMG_MAX, sec));
    renderAll();
  }

  // Rotate / flip an image clip by re-rendering it — baked in, so it shows the same
  // in the preview and the export with no special-case rotate logic anywhere else.
  async function transformImageClip(kind) {   // 'l' | 'r' | 'flip'
    const s = activeSource();
    if (!isImage(s)) return;
    try {
      const bmp = await createImageBitmap(s.file);
      const w = bmp.width, h = bmp.height;
      const cv = document.createElement('canvas');
      const cx = cv.getContext('2d');
      if (kind === 'flip') {
        cv.width = w; cv.height = h;
        cx.translate(w, 0); cx.scale(-1, 1); cx.drawImage(bmp, 0, 0);
      } else {
        cv.width = h; cv.height = w;   // 90° swaps the dimensions
        cx.translate(h / 2, w / 2);
        cx.rotate((kind === 'r' ? 1 : -1) * Math.PI / 2);
        cx.drawImage(bmp, -w / 2, -h / 2);
      }
      if (bmp.close) bmp.close();
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      if (!blob) return;
      const base = (s.name || 'image').replace(/\.[^.]+$/, '');
      const old = s.url;
      s.file = new File([blob], base + '.png', { type: 'image/png' });
      s.url = URL.createObjectURL(blob);
      s.thumb = s.url; s.w = cv.width; s.h = cv.height;
      if (imgEl && imgEl.getAttribute('src') === old) imgEl.src = s.url;
      renderAll();
    } catch (e) { console.warn('[VideoStudio] image transform failed', e); }
  }

  const isLightColor = (hex) => {
    const c = (hex || '#000').replace('#', '');
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
  };

  // A title / section card = big text on a colour, added to the timeline as an image clip.
  async function addTitleCard() {
    const text = ((cardTextEl && cardTextEl.value) || '').trim() || 'Title';
    const { W, H } = computeWH(outAspect, 720);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d');
    cx.fillStyle = cardBg; cx.fillRect(0, 0, W, H);
    try { await ensureVSFonts(); } catch (e) { /* fonts optional */ }
    const size = Math.round(Math.min(W, H) * 0.1);
    cx.font = `${size}px 'VS Anton', sans-serif`;
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = isLightColor(cardBg) ? '#0B1220' : '#ffffff';
    const lines = wrapTextPx(cx, text, W * 0.84);
    const lh = size * 1.22, y0 = H / 2 - (lines.length - 1) / 2 * lh;
    lines.forEach((ln, i) => cx.fillText(ln, W / 2, y0 + i * lh));
    const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
    if (!blob) return;
    await addFiles([new File([blob], 'title-card.png', { type: 'image/png' })]);
    if (cardTextEl) cardTextEl.value = '';
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
      if (isImage(s)) { const ib = document.createElement('div'); ib.className = 'vs-card-num'; ib.style.left = 'auto'; ib.style.right = '6px'; ib.textContent = '🖼️'; card.appendChild(ib); }
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
      if (!moved) enterClipTools(id);   // tapping a clip opens that clip's tools
      else renderAll();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  // ── Insert / Split / Trim / Cut-out ───────────────────────────────
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

  // Queue an insert at an absolute position in the whole video, then open the picker.
  function insertAtGlobal(gt) {
    const at = clipAtGlobal(gt);
    pendingInsert = at ? { clipId: at.clip.id, time: inOf(at.clip) + at.local * speedOf(at.clip) } : null;
    fileInput.click();
  }

  // Add a clip boundary exactly at a whole-video position (no-op if already a boundary).
  function splitAtGlobal(gt) {
    const at = clipAtGlobal(gt);
    if (!at) return;
    const s = at.clip, t = inOf(s) + at.local * speedOf(s);
    if (t <= inOf(s) + 0.05 || t >= outOf(s) - 0.05) return;
    const idx = sources.findIndex((x) => x.id === s.id);
    const left = Object.assign({}, s, { id: ++uid, in: inOf(s), out: t });
    const right = Object.assign({}, s, { id: ++uid, in: t, out: outOf(s) });
    sources.splice(idx, 1, left, right);
    refreshThumb(left, (left.in + left.out) / 2);
    refreshThumb(right, (right.in + right.out) / 2);
  }

  // Remove the whole-video range [gs, ge] and join what's left.
  function cutRange(gs, ge) {
    if (ge - gs < 0.1) return;
    splitAtGlobal(gs);
    splitAtGlobal(ge);
    const removed = [];
    const keep = [];
    let acc = 0;
    sources.forEach((s) => {
      const len = keptDuration(s);
      const cs = acc, cse = acc + len;
      acc = cse;
      if (cs >= gs - 0.05 && cse <= ge + 0.05) removed.push(s);
      else keep.push(s);
    });
    sources.length = 0;
    keep.forEach((s) => sources.push(s));
    const stillUsed = new Set(sources.map((s) => s.url));
    removed.forEach((s) => { if (!stillUsed.has(s.url)) { try { URL.revokeObjectURL(s.url); } catch (e) { /* ignore */ } } });
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
    if (isImage(s)) { s.in = 0; s.out = IMG_DEFAULT; renderAll(); return; }
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

  // Drag the red range handles to mark the part to cut out.
  function cutHandleDrag(which) {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!video.paused) video.pause();
      const T = totalDur();
      const rect = cutTrack.getBoundingClientRect();
      const move = (ev) => {
        const g = clamp01((ev.clientX - rect.left) / rect.width) * T;
        if (which === 'L') cutS = Math.min(g, cutE - 0.2);
        else cutE = Math.max(g, cutS + 0.2);
        previewGlobal(which === 'L' ? cutS : cutE);
        renderCut();
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    };
  }

  function doCut(replace) {
    const T = totalDur();
    const gs = Math.max(0, Math.min(cutS, T)), ge = Math.max(gs + 0.1, Math.min(cutE, T));
    if (ge - gs < 0.1) { flashHint('Mark a section to remove first (drag the red edges).'); return; }
    if (replace) {
      cutRange(gs, ge);
      if (!sources.length) { resetToDropzone(); return; }
      insertAtGlobal(gs); // opens the picker; addFiles drops the new clip into the gap
      setMode('add');
      return;
    }
    cutRange(gs, ge);
    if (!sources.length) { resetToDropzone(); return; }
    if (!activeSource()) activeId = sources[0].id;
    previewGlobal(Math.min(gs, Math.max(0, totalDur() - 0.05)));
    cutS = totalDur() * 0.33; cutE = totalDur() * 0.66;
    renderAll();
  }

  // ── Audio: voiceover / music / AI voice ───────────────────────────
  const fmtAudioMeta = (au) => {
    const tag = au.kind === 'music' ? '🎵 Music' : (au.kind === 'ai' ? '🤖 AI voice' : '🎤 Voiceover');
    const dur = au.duration ? ' · ' + fmtTime(au.duration) : '';
    const at = au.start > 0.05 ? ' · from ' + fmtTime(au.start) : '';
    const loop = (au.kind === 'music' && au.loop) ? ' · loops' : '';
    return tag + dur + at + loop;
  };

  function getAudioDuration(url) {
    return new Promise((resolve) => {
      const a = document.createElement('audio');
      a.preload = 'metadata';
      a.onloadedmetadata = () => resolve(isFinite(a.duration) ? a.duration : 0);
      a.onerror = () => resolve(0);
      a.src = url;
    });
  }

  async function addAudio(kind, file, name, start) {
    const url = URL.createObjectURL(file);
    const duration = await getAudioDuration(url);
    const au = {
      id: ++uid, kind, name: name || file.name || 'audio',
      file, url, duration,
      start: Math.max(0, start || 0),
      volume: kind === 'music' ? 0.45 : 1,
      loop: kind === 'music',
      el: null
    };
    audios.push(au);
    setMode('audio');
    renderAudioList();
  }

  function removeAudio(id) {
    const i = audios.findIndex((a) => a.id === id);
    if (i < 0) return;
    const [au] = audios.splice(i, 1);
    if (au.el) { try { au.el.pause(); } catch (e) { /* ignore */ } }
    try { URL.revokeObjectURL(au.url); } catch (e) { /* ignore */ }
    renderAudioList();
  }

  function renderAudioList() {
    if (!audioListEl) return;
    audioListEl.innerHTML = '';
    if (!audios.length) {
      const empty = document.createElement('p');
      empty.className = 'vs-hint';
      empty.style.margin = '12px 0 0';
      empty.textContent = 'No audio added yet. Record a voiceover, add music, or generate an AI voice above.';
      audioListEl.appendChild(empty);
      return;
    }
    audios.forEach((au) => {
      const row = document.createElement('div');
      row.className = 'vs-audio-row';
      const ico = document.createElement('span'); ico.className = 'vs-au-ico';
      ico.textContent = au.kind === 'music' ? '🎵' : (au.kind === 'ai' ? '🤖' : '🎤');
      const name = document.createElement('div'); name.className = 'vs-au-name';
      name.textContent = au.name;
      const meta = document.createElement('div'); meta.className = 'vs-au-meta';
      meta.textContent = fmtAudioMeta(au);
      const vol = document.createElement('input');
      vol.type = 'range'; vol.min = '0'; vol.max = '1.5'; vol.step = '0.05';
      vol.value = String(au.volume); vol.title = 'Volume';
      vol.addEventListener('input', () => { au.volume = parseFloat(vol.value); if (au.el) au.el.volume = Math.min(1, au.volume); });
      const x = document.createElement('button'); x.className = 'vs-au-x'; x.innerHTML = '✕'; x.title = 'Remove this audio';
      x.addEventListener('click', () => removeAudio(au.id));
      row.appendChild(ico); row.appendChild(name); row.appendChild(meta); row.appendChild(vol); row.appendChild(x);
      audioListEl.appendChild(row);
    });
  }

  // Live preview: keep each overlay track in sync with the whole-video clock.
  let previewPlaying = false;
  let isRecording = false;
  function syncAudioPreview(g) {
    if (isRecording) { audios.forEach((au) => { if (au.el && !au.el.paused) au.el.pause(); }); return; }
    audios.forEach((au) => {
      if (!au.el) { au.el = new Audio(au.url); au.el.preload = 'auto'; }
      au.el.volume = Math.min(1, au.volume);
      const rel = g - au.start;
      const within = au.kind === 'music' ? (rel >= 0) : (rel >= 0 && rel < au.duration + 0.05);
      if (!previewPlaying || !within || au.duration <= 0) {
        if (!au.el.paused) au.el.pause();
        return;
      }
      const target = au.loop ? (rel % au.duration) : rel;
      if (Math.abs(au.el.currentTime - target) > 0.32) { try { au.el.currentTime = target; } catch (e) { /* ignore */ } }
      if (au.el.paused) { const p = au.el.play(); if (p && p.catch) p.catch(() => {}); }
    });
  }
  function pauseAudioPreview() {
    previewPlaying = false;
    audios.forEach((au) => { if (au.el && !au.el.paused) au.el.pause(); });
  }

  // ── Mic recording ─────────────────────────────────────────────────
  async function toggleRecord() {
    if (mediaRecorder && mediaRecorder.state === 'recording') { mediaRecorder.stop(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { flashHint('Recording needs microphone access, which this browser does not support.'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { flashHint('Microphone blocked. Allow mic access and try again.'); return; }
    recChunks = [];
    recStartGlobal = dropGlobal || 0;
    const wasMuted = video.muted;
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
    mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size) recChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      isRecording = false;
      video.muted = wasMuted;
      if (recBtn) { recBtn.classList.remove('recording'); recBtn.textContent = '🎤 Record voiceover'; }
      if (!video.paused) video.pause();
      const blob = new Blob(recChunks, { type: mime || 'audio/webm' });
      if (blob.size) await addAudio('voice', blob, `Voiceover ${fmtTime(recStartGlobal)}`, recStartGlobal);
    };
    isRecording = true;
    video.muted = true; // narrate over the video without it bleeding into the mic
    mediaRecorder.start();
    if (recBtn) { recBtn.classList.add('recording'); recBtn.textContent = '⏹ Stop recording'; }
    // Play along from the marker so the voiceover lands in time.
    previewGlobal(recStartGlobal);
    const p = video.play(); if (p && p.catch) p.catch(() => {});
  }

  // ── AI voiceover (ElevenLabs, bring-your-own-key) ──────────────────
  async function generateAIVoice() {
    const text = (aiText && aiText.value || '').trim();
    if (!text) { flashHint('Type what the voice should say first.'); return; }
    const key = (aiKeyInput && aiKeyInput.value || '').trim();
    if (!key) { flashHint('Enter your ElevenLabs API key.'); if (aiKeyInput) aiKeyInput.focus(); return; }
    localStorage.setItem('elevenlabs_api_key', key);
    const voiceId = aiVoiceSel ? aiVoiceSel.value : 'pNInz6obpgDQGcFmaJgB';
    const orig = aiGenBtn ? aiGenBtn.textContent : '';
    if (aiGenBtn) { aiGenBtn.disabled = true; aiGenBtn.textContent = 'Generating…'; }
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': key },
        body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
      });
      if (!res.ok) {
        let detail = res.status + '';
        try { const j = await res.json(); detail = (j.detail && (j.detail.message || j.detail)) || detail; } catch (e) { /* ignore */ }
        throw new Error(typeof detail === 'string' ? detail : 'request failed');
      }
      const blob = await res.blob();
      await addAudio('ai', blob, 'AI voiceover', dropGlobal || 0);
      if (aiForm) aiForm.style.display = 'none';
      if (aiText) aiText.value = '';
    } catch (e) {
      flashHint('AI voice failed: ' + (e && e.message ? e.message : 'check your key and connection') + '.');
    } finally {
      if (aiGenBtn) { aiGenBtn.disabled = false; aiGenBtn.textContent = orig; }
    }
  }

  // ── Captions (on-device speech-to-text → burned-in subtitles) ──────
  const CAP_PRESETS = {
    clean: { font: 'inter', color: '#ffffff', bg: false, sizeFrac: 0.055, layout: 'phrase', cy: 0.85 },
    boxed: { font: 'montserrat', color: '#ffffff', bg: true, sizeFrac: 0.05, layout: 'phrase', cy: 0.85 },
    hype: { font: 'anton', color: '#FFE14D', bg: false, sizeFrac: 0.11, layout: 'word', cy: 0.5 },
    bold: { font: 'anton', color: '#ffffff', bg: false, sizeFrac: 0.072, layout: 'phrase', cy: 0.85 }
  };
  const setCapBar = (f) => { if (capBar) capBar.style.width = (Math.max(0, Math.min(1, f)) * 100) + '%'; };
  const capStatus = (m) => { if (capStatusEl) capStatusEl.textContent = m; };

  // Greedily break a caption into lines no longer than maxChars so it never
  // overflows a narrow (e.g. 9:16) frame; drawtext doesn't word-wrap on its own.
  function wrapToLines(text, maxChars) {
    const words = (text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [' '];
    const lines = []; let cur = '';
    words.forEach((w) => {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  // Render the WHOLE combined video's audio to a 16 kHz mono buffer (respecting
  // each clip's trim and order) so Whisper's word times line up with the export.
  async function extractTimelineAudio() {
    const T = totalDur();
    if (T <= 0) return null;
    const SR = 16000;
    const offline = new OfflineAudioContext(1, Math.max(SR, Math.ceil(T * SR)), SR);
    const AC = window.AudioContext || window.webkitAudioContext;
    const dec = new AC();
    const cache = {};
    let acc = 0, any = false;
    for (const s of sources) {
      const outLen = keptDuration(s);   // played seconds on the timeline
      const srcLen = winLen(s);         // source seconds consumed
      if (!(s.fileKey in cache)) {
        try { cache[s.fileKey] = await dec.decodeAudioData(await s.file.arrayBuffer()); }
        catch (e) { cache[s.fileKey] = null; }
      }
      const buf = cache[s.fileKey];
      if (buf) {
        const off = Math.min(inOf(s), buf.duration);
        const dur = Math.min(srcLen, Math.max(0, buf.duration - off));
        if (dur > 0.02) {
          const node = offline.createBufferSource();
          node.buffer = buf;
          node.playbackRate.value = speedOf(s);  // speed-shifts so word times match the export
          node.connect(offline.destination);
          node.start(acc, off, dur);
          any = true;
        }
      }
      acc += outLen;
    }
    try { dec.close(); } catch (e) { /* ignore */ }
    if (!any) return null;
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  }

  async function loadTranscriber(onProg) {
    if (capTranscriber) return capTranscriber;
    const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
    env.allowLocalModels = false;
    env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
    capTranscriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', { progress_callback: onProg });
    return capTranscriber;
  }

  // Group raw words into short on-screen segments: 1–2 words for the punchy
  // word-by-word look, or up to ~6 for readable phrases.
  function chunkCaptions() {
    captions = [];
    if (!capWords.length) return;
    const isWord = capStyle.layout === 'word';
    const maxWords = isWord ? 2 : 6;
    const maxDur = isWord ? 1.3 : 3.4;
    let cur = null;
    capWords.forEach((w, i) => {
      if (!cur) cur = { words: [], start: w.start };
      cur.words.push(w);
      cur.end = w.end;
      const next = capWords[i + 1];
      const gap = next ? (next.start - w.end) : 99;
      const dur = cur.end - cur.start;
      const sentenceEnd = /[.!?]$/.test(w.text);
      if (cur.words.length >= maxWords || dur >= maxDur || sentenceEnd || gap > 0.55 || !next) {
        const text = cur.words.map((x) => x.text).join(' ').replace(/\s+([,.!?;:])/g, '$1').trim();
        if (text) captions.push({ id: ++uid, text, start: cur.start, end: Math.max(cur.end, cur.start + 0.3) });
        cur = null;
      }
    });
  }

  async function generateCaptions() {
    if (capBusy) return;
    if (!sources.length) { capStatus('Add a video first.'); return; }
    capBusy = true;
    if (capGenBtn) capGenBtn.disabled = true;
    if (capProgress) capProgress.style.display = 'block';
    setCapBar(0);
    try {
      capStatus('Reading your video’s audio…');
      const audio = await extractTimelineAudio();
      if (!audio || !audio.length) { capStatus('No speech found — your clips have no audio track.'); return; }
      const tx = await loadTranscriber((d) => {
        if (d && d.status === 'progress' && d.progress != null) {
          setCapBar(d.progress / 100);
          capStatus(`Downloading the caption AI… ${Math.round(d.progress)}% (one time only)`);
        }
      });
      setCapBar(0);
      capStatus('Transcribing speech… this runs on your device and can take a minute.');
      const out = await tx(audio, { return_timestamps: 'word', chunk_length_s: 30, stride_length_s: 5 });
      const chunks = (out && out.chunks) || [];
      capWords = chunks.map((c) => ({
        text: (c.text || '').trim(),
        start: (c.timestamp && c.timestamp[0] != null) ? c.timestamp[0] : 0,
        end: (c.timestamp && c.timestamp[1] != null) ? c.timestamp[1] : (((c.timestamp && c.timestamp[0]) || 0) + 0.4)
      })).filter((w) => w.text);
      if (!capWords.length && out && out.text && out.text.trim()) capWords = [{ text: out.text.trim(), start: 0, end: totalDur() }];
      if (!capWords.length) { capStatus('Could not find any speech to caption.'); return; }
      chunkCaptions();
      if (capStyleBox) capStyleBox.style.display = 'block';
      if (capClearBtn) capClearBtn.style.display = '';
      refreshCapButtons();
      renderCaptionList();
      setCapBar(1);
      capStatus(`Added ${captions.length} caption${captions.length > 1 ? 's' : ''}. Tap one to fix a word, pick a style, then Download.`);
      renderAll();
    } catch (e) {
      console.error('[VideoStudio] captions failed:', e);
      capStatus('Captions failed: ' + ((e && e.message) || 'unknown error') + '.');
    } finally {
      capBusy = false;
      if (capGenBtn) capGenBtn.disabled = false;
    }
  }

  function renderCaptionList() {
    if (!capListEl) return;
    capListEl.innerHTML = '';
    captions.forEach((c) => {
      const row = document.createElement('div'); row.className = 'vs-cap-row';
      const time = document.createElement('span'); time.className = 'vs-cap-time'; time.textContent = fmtTime(c.start);
      const inp = document.createElement('input'); inp.className = 'vs-cap-text'; inp.type = 'text'; inp.value = c.text;
      inp.addEventListener('input', () => { c.text = inp.value; });
      inp.addEventListener('focus', () => { previewGlobal((c.start + c.end) / 2); });
      const x = document.createElement('button'); x.className = 'vs-cap-x'; x.innerHTML = '✕'; x.title = 'Delete this caption';
      x.addEventListener('click', () => { captions = captions.filter((k) => k.id !== c.id); renderCaptionList(); renderCaptionPreview(dropGlobal); });
      row.appendChild(time); row.appendChild(inp); row.appendChild(x);
      capListEl.appendChild(row);
    });
  }

  let capCue = null;
  function ensureCapCue() {
    if (capCue && capCue.isConnected) return capCue;
    const wrap = document.getElementById('vs-video-wrap');
    if (!wrap) return null;
    capCue = document.createElement('div'); capCue.className = 'vs-cap-cue'; capCue.style.display = 'none';
    wrap.appendChild(capCue);
    return capCue;
  }

  function renderCaptionPreview(g) {
    const cue = ensureCapCue();
    if (!cue) return;
    if (!captions.length) { cue.style.display = 'none'; return; }
    const gg = (g == null) ? dropGlobal : g;
    const c = captions.find((x) => gg >= x.start - 0.02 && gg <= x.end + 0.02);
    if (!c) { cue.style.display = 'none'; return; }
    const wrap = document.getElementById('vs-video-wrap');
    const w = wrap ? wrap.clientWidth : 0;
    const h = wrap ? wrap.clientHeight : 0;
    const baseDim = Math.min(w, h) || h;  // size off the short side, like the export
    cue.style.display = '';
    cue.textContent = c.text;
    cue.style.top = (capStyle.cy * 100) + '%';
    cue.style.fontFamily = FONTS_VS[capStyle.font].css;
    cue.style.color = capStyle.color;
    cue.style.fontSize = Math.max(11, capStyle.sizeFrac * baseDim) + 'px';
    cue.classList.toggle('boxed', capStyle.bg);
  }

  function applyCapPreset(key) {
    const p = CAP_PRESETS[key]; if (!p) return;
    const relayout = p.layout !== capStyle.layout;
    capStyle = { font: p.font, color: p.color, bg: p.bg, sizeFrac: p.sizeFrac, cy: p.cy, layout: p.layout };
    if (capColorInput) capColorInput.value = p.color;
    if (relayout) chunkCaptions();
    refreshCapButtons();
    renderCaptionList();
    renderCaptionPreview(dropGlobal);
  }

  function refreshCapButtons() {
    capPresetBtns.forEach((b) => {
      const p = CAP_PRESETS[b.dataset.preset];
      b.classList.toggle('active', !!p && p.font === capStyle.font && p.color === capStyle.color && p.layout === capStyle.layout && p.bg === capStyle.bg);
    });
    capLayoutBtns.forEach((b) => b.classList.toggle('active', b.dataset.caplayout === capStyle.layout));
    const map = { top: 0.14, mid: 0.5, bottom: 0.85 };
    capPosBtns.forEach((b) => b.classList.toggle('active', Math.abs(map[b.dataset.cappos] - capStyle.cy) < 0.001));
  }

  function clearCaptions() {
    capWords = []; captions = [];
    if (capStyleBox) capStyleBox.style.display = 'none';
    if (capClearBtn) capClearBtn.style.display = 'none';
    if (capProgress) capProgress.style.display = 'none';
    renderCaptionList();
    renderCaptionPreview(dropGlobal);
  }

  // ── Output format (aspect ratio, fill, rotate/flip) ────────────────
  function applyFormatPreview() {
    if (videoWrap) {
      videoWrap.style.setProperty('--vs-ar', aspectRatio(outAspect).toFixed(4));
      videoWrap.style.background = (outFill === 'color') ? bgColor : '#000';
    }
    if (video) {
      // crop fills the frame (cover); blur/bars fit it (contain). The blurred
      // backdrop itself is applied on export — preview shows the framing.
      video.style.objectFit = (outFill === 'crop') ? 'cover' : 'contain';
      const t = [];
      if (outRotate === 'cw') t.push('rotate(90deg)');
      else if (outRotate === 'ccw') t.push('rotate(-90deg)');
      if (outFlipH) t.push('scaleX(-1)');
      if (outFlipV) t.push('scaleY(-1)');
      video.style.transform = t.join(' ');
    }
    renderOverlay();
    renderCaptionPreview(dropGlobal);
    applyOverlayPreview();
  }

  function refreshFmtButtons() {
    fmtAspectBtns.forEach((b) => b.classList.toggle('active', b.dataset.aspect === outAspect));
    fmtFillBtns.forEach((b) => b.classList.toggle('active', b.dataset.fill === outFill));
    bgSwatchBtns.forEach((b) => b.classList.toggle('active', outFill === 'color' && b.dataset.bg.toLowerCase() === bgColor.toLowerCase()));
    fmtRotateBtns.forEach((b) => b.classList.toggle('active', b.dataset.rotate === outRotate));
    if (fmtFlipHBtn) fmtFlipHBtn.classList.toggle('active', outFlipH);
    if (fmtFlipVBtn) fmtFlipVBtn.classList.toggle('active', outFlipV);
  }

  // ── Effects (per-clip speed, colour look, fade) ────────────────────
  function applyLook() {
    if (!video) return;
    const f = FILTERS[vfilter];
    video.style.filter = (f && f.css !== 'none') ? f.css : '';
  }

  function setClipSpeed(v) {
    const s = activeSource();
    if (!s) { flashHint('Tap a clip below first, then set its speed.'); return; }
    s.speed = v;
    if (video) video.playbackRate = v;
    if (captions.length) flashHint('Speed changed — re-generate captions if you want them re-synced.');
    refreshFxButtons();
    renderAll();
  }

  function setClipAnim(a) {
    const s = activeSource();
    if (!s) { flashHint('Tap a clip below first, then pick how it appears.'); return; }
    s.anim = a;
    refreshFxButtons();
    // Replay the entrance so it's visible right away.
    if (isImage(s)) { imgLocal = 0; if (imgRAF) startImgClock(); else applyClipAnim(s, 0); }
    else { try { video.currentTime = inOf(s); } catch (e) {} }
    updatePlayhead();
  }

  // The Format rotate/flip transform (kept on the main video by applyFormatPreview).
  const fmtTransform = () => {
    const t = [];
    if (outRotate === 'cw') t.push('rotate(90deg)'); else if (outRotate === 'ccw') t.push('rotate(-90deg)');
    if (outFlipH) t.push('scaleX(-1)');
    if (outFlipV) t.push('scaleY(-1)');
    return t.join(' ');
  };

  // Apply a clip's entrance animation to its preview element, based on local time.
  function applyClipAnim(s, local) {
    const el = isImage(s) ? imgEl : video;
    if (!el) return;
    const base = isImage(s) ? '' : fmtTransform();   // compose with any Format rotate/flip
    const a = animOf(s);
    // Entrances only play during playback; a paused/scrubbed frame shows the settled clip.
    if (a === 'none' || !previewPlaying) { el.style.opacity = '1'; el.style.transform = base; return; }
    if (a === 'zoom') { el.style.opacity = '1'; el.style.transform = (base + ` scale(${(1 + 0.12 * Math.min(1, local / Math.max(0.1, keptDuration(s)))).toFixed(4)})`).trim(); return; }
    const p = Math.min(1, local / ANIM_D), e = 1 - Math.pow(1 - p, 3), off = (1 - e) * 100;
    el.style.opacity = e.toFixed(3);
    const map = { fade: '', slideUp: `translateY(${off}%)`, slideDown: `translateY(${-off}%)`, slideLeft: `translateX(${off}%)`, slideRight: `translateX(${-off}%)` };
    el.style.transform = (base + ' ' + (map[a] || '')).trim();
  }

  function refreshFxButtons() {
    const s = activeSource();
    const sp = s ? speedOf(s) : 1;
    fxAnimBtns.forEach((b) => b.classList.toggle('active', b.dataset.anim === animOf(s)));
    fxSpeedBtns.forEach((b) => b.classList.toggle('active', parseFloat(b.dataset.speed) === sp));
    fxFilterBtns.forEach((b) => b.classList.toggle('active', b.dataset.filter === vfilter));
    if (fxFadeInBtn) fxFadeInBtn.classList.toggle('active', fadeIn);
    if (fxFadeOutBtn) fxFadeOutBtn.classList.toggle('active', fadeOut);
    if (fxClipLabel) fxClipLabel.textContent = s ? `· clip ${sources.findIndex((x) => x.id === s.id) + 1}` : '· tap a clip below';
  }

  // ── Second video preview = the OTHER track, shown as PiP / split ────
  const otherTrackClips = () => (editingTrack === 1 ? t2 : t1);

  function addOverlay2() {            // "Add second video" → jump to the Video 2 track
    if (pipLayout === 'off') pipLayout = 'pip';
    setEditingTrack(2);
    if (!t2.length) fileInput.click();
  }

  // While editing Video 1, the preview shows the real composite — Video 2 as a PiP
  // inset or split-screen half, synced to the playhead — exactly how it merges on
  // download. Video 2 is edited fullscreen on its own tab (tap the inset to jump there).
  const compositeOn = () => editingTrack === 1 && t2.length > 0 && pipLayout !== 'off';

  function applyOverlayPreview() {
    if (!ovlVideo || !video || recording) return;
    // Reset the main video to a full, centred frame.
    video.style.left = ''; video.style.top = ''; video.style.right = ''; video.style.bottom = '';
    video.style.width = ''; video.style.height = '';
    video.style.objectFit = (outFill === 'crop') ? 'cover' : 'contain';
    if (!compositeOn()) {
      ovlVideo.style.display = 'none';
      ovlVideo.classList.remove('draggable', 'dimmed');
      if (!ovlVideo.paused) ovlVideo.pause();
      video.muted = false; ovlVideo.muted = true;
      return;
    }
    // Preview audio follows the "Which video's sound?" choice so you can hear it.
    video.muted = (mergeAudio === 'v2');
    ovlVideo.muted = (mergeAudio === 'v1');
    ovlVideo.style.filter = video.style.filter || '';   // match the colour look
    ovlVideo.style.display = 'block';
    ovlVideo.style.objectFit = 'cover';
    if (pipLayout === 'pip') {
      ovlVideo.classList.add('draggable'); ovlVideo.classList.remove('dimmed');
      ovlVideo.style.right = 'auto'; ovlVideo.style.bottom = 'auto'; ovlVideo.style.height = 'auto';
      ovlVideo.style.width = (clamp01(pipSize) * 100).toFixed(2) + '%';
      ovlVideo.style.left = (clamp01(pipX) * 100).toFixed(2) + '%';
      ovlVideo.style.top = (clamp01(pipY) * 100).toFixed(2) + '%';
      ovlVideo.style.borderRadius = '10px';
      ovlVideo.style.boxShadow = '0 4px 16px rgba(0,0,0,0.55)';
    } else {   // side-by-side: split the frame, both halves cropped to fill
      ovlVideo.classList.remove('draggable', 'dimmed');
      ovlVideo.style.borderRadius = '0'; ovlVideo.style.boxShadow = 'none';
      video.style.objectFit = 'cover';
      if (sbsDir === 'tb') {
        const mt = sbsSwap ? '50%' : '0%', ot = sbsSwap ? '0%' : '50%';
        Object.assign(video.style, { left: '0', top: mt, right: 'auto', bottom: 'auto', width: '100%', height: '50%' });
        Object.assign(ovlVideo.style, { left: '0', top: ot, right: 'auto', bottom: 'auto', width: '100%', height: '50%' });
      } else {
        const ml = sbsSwap ? '50%' : '0%', ol = sbsSwap ? '0%' : '50%';
        Object.assign(video.style, { left: ml, top: '0', right: 'auto', bottom: 'auto', width: '50%', height: '100%' });
        Object.assign(ovlVideo.style, { left: ol, top: '0', right: 'auto', bottom: 'auto', width: '50%', height: '100%' });
      }
    }
    syncOverlayPreview(dropGlobal);
  }

  // Seek the 2nd-video element to its frame at the whole-video time, and keep it
  // playing/paused in step with the main preview.
  function syncOverlayPreview(g) {
    if (!ovlVideo || recording) return;
    if (!compositeOn()) { if (!ovlVideo.paused) ovlVideo.pause(); return; }
    const total = trackKept(t2);
    const gg = (g == null) ? dropGlobal : g;
    if (gg >= total - 0.02) { if (!ovlVideo.paused) ovlVideo.pause(); return; }   // Video 2 ended → freeze
    const at = clipAtGlobalIn(t2, gg);
    if (!at) return;
    const s = at.clip;
    const ft = inOf(s) + at.local * speedOf(s);
    if (ovlVideo.src !== s.url) {
      ovlVideo.src = s.url;
      ovlVideo.addEventListener('loadedmetadata', () => { try { ovlVideo.currentTime = ft; } catch (e) {} }, { once: true });
      return;
    }
    if (ovlVideo.readyState >= 1 && Math.abs(ovlVideo.currentTime - ft) > 0.3) { try { ovlVideo.currentTime = ft; } catch (e) {} }
    ovlVideo.playbackRate = speedOf(s);
    if (!video.paused) { if (ovlVideo.paused) { const p = ovlVideo.play(); if (p && p.catch) p.catch(() => {}); } }
    else if (!ovlVideo.paused) ovlVideo.pause();
  }

  function refreshOverlayButtons() {
    const hasT2 = t2.length > 0;
    if (ovlRemoveBtn) ovlRemoveBtn.style.display = 'none';
    if (ovlOpts) ovlOpts.style.display = hasT2 ? '' : 'none';
    if (ovlAddBtn) ovlAddBtn.textContent = hasT2 ? '✏️ Edit Video 2 clips' : '➕ Add a second video';
    if (ovlNameEl) ovlNameEl.textContent = hasT2 ? `Video 2 · ${t2.length} clip${t2.length > 1 ? 's' : ''}` : '';
    if (pipOpts) pipOpts.style.display = (pipLayout === 'pip') ? '' : 'none';
    if (sbsOpts) sbsOpts.style.display = (pipLayout === 'sbs') ? '' : 'none';
    pipBtns.forEach((b) => b.classList.toggle('active', b.dataset.pip === pipLayout));
    sbsBtns.forEach((b) => b.classList.toggle('active', b.dataset.sbs === sbsDir));
    mergeAudioBtns.forEach((b) => b.classList.toggle('active', b.dataset.mergeAudio === mergeAudio));
    // The old single-video trim bar is gone — Video 2 is trimmed per clip on its track.
    if (ovlTrack) { ovlTrack.style.display = 'none'; if (ovlTrack.previousElementSibling) ovlTrack.previousElementSibling.style.display = 'none'; }
  }
  function ovlTrimHandle() { return function () {}; }   // legacy hook; Video 2 trims per clip now

  // Drag the inset around the preview (PiP only); a tap (no drag) edits that track.
  let ovlPointerMoved = false;
  function pipDragStart(e) {
    if (!otherTrackClips().length || !videoWrap) return;
    ovlPointerMoved = false;
    if (pipLayout !== 'pip') return;   // side-by-side isn't draggable; the click handler switches tracks
    e.preventDefault();
    const wrap = videoWrap.getBoundingClientRect();
    const move = (ev) => {
      ovlPointerMoved = true;
      const r = ovlVideo.getBoundingClientRect();
      const x = (ev.clientX - wrap.left - r.width / 2) / wrap.width;
      const y = (ev.clientY - wrap.top - r.height / 2) / wrap.height;
      pipX = Math.max(0, Math.min(1 - r.width / wrap.width, x));
      pipY = Math.max(0, Math.min(1 - r.height / wrap.height, y));
      applyOverlayPreview();
    };
    const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  // Corner buttons are quick presets for the drag position.
  function setPipCorner(corner) {
    const m = 0.03;
    let hFrac = pipSize * 0.6;
    if (ovlVideo && videoWrap) { const wr = videoWrap.getBoundingClientRect(); const r = ovlVideo.getBoundingClientRect(); if (wr.height && r.height) hFrac = r.height / wr.height; }
    pipX = (corner === 'tl' || corner === 'bl') ? m : (1 - pipSize - m);
    pipY = (corner === 'tl' || corner === 'tr') ? m : Math.max(0, 1 - hFrac - m);
    applyOverlayPreview();
  }

  // ── Playback (plays the whole video; the marker stays put) ─────────
  const nextClipId = () => {
    const i = sources.findIndex((x) => x.id === activeId);
    return (i >= 0 && i < sources.length - 1) ? sources[i + 1].id : null;
  };

  playBtn.addEventListener('click', () => {
    if (recording) return;
    const s = activeSource();
    if (!s) return;
    if (isImage(s)) {
      if (imgRAF) { stopImgClock(); previewPlaying = false; playBtn.textContent = '▶'; pauseAudioPreview(); }
      else { if (imgLocal >= keptDuration(s) - 0.03) imgLocal = 0; startImgClock(); }
      return;
    }
    if (video.paused) {
      if (video.currentTime < inOf(s) || video.currentTime >= outOf(s) - 0.03) video.currentTime = inOf(s);
      video.play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', () => { playBtn.textContent = '❚❚'; previewPlaying = true; });
  video.addEventListener('pause', () => { playBtn.textContent = '▶'; pauseAudioPreview(); if (ovlVideo && !ovlVideo.paused) ovlVideo.pause(); });

  // Transport scrubber — drag anywhere on the whole-video timeline to seek.
  if (scrubEl) {
    let scrubbing = false;
    const scrubTo = (clientX) => {
      const T = totalDur(); if (!T) return;
      const r = scrubEl.getBoundingClientRect();
      const frac = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      if (scrubFill) scrubFill.style.width = (frac * 100) + '%';
      previewGlobal(frac * T);
    };
    scrubEl.addEventListener('pointerdown', (e) => { scrubbing = true; try { scrubEl.setPointerCapture(e.pointerId); } catch (_) {} stopImgClock(); previewPlaying = false; if (playBtn) playBtn.textContent = '▶'; if (!video.paused) video.pause(); scrubTo(e.clientX); });
    scrubEl.addEventListener('pointermove', (e) => { if (scrubbing) scrubTo(e.clientX); });
    const endScrub = (e) => { scrubbing = false; try { scrubEl.releasePointerCapture(e.pointerId); } catch (_) {} };
    scrubEl.addEventListener('pointerup', endScrub);
    scrubEl.addEventListener('pointercancel', endScrub);
  }

  // Share — render the video, then open the native share sheet (post straight to socials).
  if (shareBtn) shareBtn.addEventListener('click', () => {
    if (exporting) return;
    if (!sources.length) { status('Add a video first, then tap Share.'); return; }
    exportAction = 'share';
    exportBtn.click();
  });
  video.addEventListener('timeupdate', () => {
    if (recording) return;
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
      dropGlobal = globalStartOf(idx) + (ft - inOf(s)) / speedOf(s);
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
  if (imgDurInput) imgDurInput.addEventListener('input', () => setImageDuration(parseFloat(imgDurInput.value)));
  imgDurBtns.forEach((b) => b.addEventListener('click', () => setImageDuration(parseFloat(b.dataset.imgdur))));
  if (imgRotLBtn) imgRotLBtn.addEventListener('click', () => transformImageClip('l'));
  if (imgRotRBtn) imgRotRBtn.addEventListener('click', () => transformImageClip('r'));
  if (imgFlipBtn) imgFlipBtn.addEventListener('click', () => transformImageClip('flip'));
  cardColorBtns.forEach((b) => b.addEventListener('click', () => { cardBg = b.dataset.cardbg; cardColorBtns.forEach((x) => x.classList.remove('active')); b.classList.add('active'); }));
  if (cardAddBtn) cardAddBtn.addEventListener('click', addTitleCard);
  const pickFiles = (acc) => { pendingInsert = null; if (fileInput) { fileInput.accept = acc; fileInput.value = ''; fileInput.click(); } };
  if (addVideoBtn) addVideoBtn.addEventListener('click', () => pickFiles('video/*'));
  if (addPhotoBtn) addPhotoBtn.addEventListener('click', () => pickFiles('image/*'));
  if (addRecBtn) addRecBtn.addEventListener('click', () => { const on = recSection && recSection.style.display === 'none'; if (recSection) recSection.style.display = on ? '' : 'none'; if (cardSection) cardSection.style.display = 'none'; });
  if (addCardBtn) addCardBtn.addEventListener('click', () => { const on = cardSection && cardSection.style.display === 'none'; if (cardSection) cardSection.style.display = on ? '' : 'none'; if (recSection) recSection.style.display = 'none'; });
  recModeBtns.forEach((b) => b.addEventListener('click', () => startRecording(b.dataset.rec)));
  if (recPauseBtn) recPauseBtn.addEventListener('click', toggleRecPause);
  if (recStopBtn) recStopBtn.addEventListener('click', stopRecording);
  if (recDropBtn) recDropBtn.addEventListener('click', () => { revealEditor(); setRailMode('global'); setMode('add'); if (recSection) recSection.style.display = ''; if (cardSection) cardSection.style.display = 'none'; flashHint('Pick what to record: 🖥️＋📷 Screen + Cam, 🖥️ Screen, or 📷 Camera.'); });

  // Tool tabs
  if (actAdd) actAdd.addEventListener('click', () => setMode('add'));
  if (actTrim) actTrim.addEventListener('click', () => setMode('trim'));
  if (actCut) actCut.addEventListener('click', () => setMode('cut'));
  if (actText) actText.addEventListener('click', () => setMode('text'));
  if (actExport) actExport.addEventListener('click', () => { if (!exporting) exportBtn.click(); });
  // Cross-links between Shorten (trim) and Remove-a-section (cut)
  if (toCutBtn) toCutBtn.addEventListener('click', () => setMode('cut'));
  if (toTrimBtn) toTrimBtn.addEventListener('click', () => { if (activeId != null) enterClipTools(activeId); else setMode('trim'); });

  // Cut-out-a-part controls
  if (cutLEl) cutLEl.addEventListener('pointerdown', cutHandleDrag('L'));
  if (cutREl) cutREl.addEventListener('pointerdown', cutHandleDrag('R'));
  if (cutRemoveBtn) cutRemoveBtn.addEventListener('click', () => doCut(false));
  if (cutReplaceBtn) cutReplaceBtn.addEventListener('click', () => doCut(true));

  // Audio controls
  if (actAudio) actAudio.addEventListener('click', () => setMode('audio'));
  if (recBtn) recBtn.addEventListener('click', toggleRecord);
  if (musicBtn) musicBtn.addEventListener('click', () => { if (musicInput) musicInput.click(); });
  if (musicInput) musicInput.addEventListener('change', () => {
    const f = musicInput.files && musicInput.files[0];
    if (f) addAudio('music', f, f.name, 0);
    musicInput.value = '';
  });
  if (aiBtn) aiBtn.addEventListener('click', () => {
    if (!aiForm) return;
    const show = aiForm.style.display === 'none';
    aiForm.style.display = show ? 'flex' : 'none';
    if (show && aiKeyInput && !aiKeyInput.value) aiKeyInput.value = localStorage.getItem('elevenlabs_api_key') || '';
    if (show && aiText) aiText.focus();
  });
  if (aiGenBtn) aiGenBtn.addEventListener('click', generateAIVoice);
  if (duckBtn) duckBtn.addEventListener('click', () => { duckMusic = !duckMusic; duckBtn.classList.toggle('active', duckMusic); });

  // Caption controls
  if (actCaptions) actCaptions.addEventListener('click', () => setMode('captions'));
  if (capGenBtn) capGenBtn.addEventListener('click', generateCaptions);
  if (capClearBtn) capClearBtn.addEventListener('click', clearCaptions);
  capPresetBtns.forEach((b) => b.addEventListener('click', () => applyCapPreset(b.dataset.preset)));
  capLayoutBtns.forEach((b) => b.addEventListener('click', () => {
    capStyle.layout = b.dataset.caplayout;
    capStyle.cy = (b.dataset.caplayout === 'word') ? 0.5 : 0.85;
    chunkCaptions(); refreshCapButtons(); renderCaptionList(); renderCaptionPreview(dropGlobal);
  }));
  capPosBtns.forEach((b) => b.addEventListener('click', () => {
    const map = { top: 0.14, mid: 0.5, bottom: 0.85 };
    capStyle.cy = map[b.dataset.cappos];
    refreshCapButtons(); renderCaptionPreview(dropGlobal);
  }));
  if (capColorInput) capColorInput.addEventListener('input', () => { capStyle.color = capColorInput.value; refreshCapButtons(); renderCaptionPreview(dropGlobal); });

  // Format controls
  if (actFormat) actFormat.addEventListener('click', () => setMode('format'));
  fmtAspectBtns.forEach((b) => b.addEventListener('click', () => { outAspect = b.dataset.aspect; applyFormatPreview(); refreshFmtButtons(); updateBanner(); }));
  fmtFillBtns.forEach((b) => b.addEventListener('click', () => { outFill = b.dataset.fill; applyFormatPreview(); refreshFmtButtons(); }));
  if (bgColorInput) bgColorInput.addEventListener('input', () => { bgColor = bgColorInput.value; outFill = 'color'; applyFormatPreview(); refreshFmtButtons(); });
  bgSwatchBtns.forEach((b) => b.addEventListener('click', () => { bgColor = b.dataset.bg; if (bgColorInput) bgColorInput.value = bgColor; outFill = 'color'; applyFormatPreview(); refreshFmtButtons(); }));
  fmtRotateBtns.forEach((b) => b.addEventListener('click', () => { outRotate = (outRotate === b.dataset.rotate) ? 'none' : b.dataset.rotate; applyFormatPreview(); refreshFmtButtons(); }));
  if (fmtFlipHBtn) fmtFlipHBtn.addEventListener('click', () => { outFlipH = !outFlipH; applyFormatPreview(); refreshFmtButtons(); });
  if (fmtFlipVBtn) fmtFlipVBtn.addEventListener('click', () => { outFlipV = !outFlipV; applyFormatPreview(); refreshFmtButtons(); });

  // Effects controls
  if (actLook) actLook.addEventListener('click', () => setMode('look'));
  if (actSpeed) actSpeed.addEventListener('click', () => setMode('speed'));
  if (actAppear) actAppear.addEventListener('click', () => setMode('appear'));
  if (clipBackBtn) clipBackBtn.addEventListener('click', exitClipTools);
  if (clipSplitBtn) clipSplitBtn.addEventListener('click', () => { splitActive(); flashHint('Split — the clip is now two pieces you can edit separately.'); });
  if (clipDelBtn) clipDelBtn.addEventListener('click', () => { if (activeId != null) removeSource(activeId); if (sources.length) { setRailMode('clip'); setMode('trim'); } else { exitClipTools(); } });
  fxAnimBtns.forEach((b) => b.addEventListener('click', () => setClipAnim(b.dataset.anim)));
  fxSpeedBtns.forEach((b) => b.addEventListener('click', () => setClipSpeed(parseFloat(b.dataset.speed))));
  fxFilterBtns.forEach((b) => b.addEventListener('click', () => { vfilter = b.dataset.filter; applyLook(); refreshFxButtons(); }));
  if (fxFadeInBtn) fxFadeInBtn.addEventListener('click', () => { fadeIn = !fadeIn; refreshFxButtons(); });
  if (fxFadeOutBtn) fxFadeOutBtn.addEventListener('click', () => { fadeOut = !fadeOut; refreshFxButtons(); });

  // Overlay (second video) controls
  if (actOverlay) actOverlay.addEventListener('click', () => setMode('overlay'));
  if (ovlAddBtn) ovlAddBtn.addEventListener('click', addOverlay2);
  // Choosing a layout / adjusting it shows the composite — that lives on the Video 1 view.
  const toComposite = () => { if (t2.length && editingTrack !== 1) setEditingTrack(1); };
  pipBtns.forEach((b) => b.addEventListener('click', () => { pipLayout = b.dataset.pip; toComposite(); applyOverlayPreview(); refreshOverlayButtons(); }));
  cornerBtns.forEach((b) => b.addEventListener('click', () => { toComposite(); setPipCorner(b.dataset.corner); }));
  sbsBtns.forEach((b) => b.addEventListener('click', () => { sbsDir = b.dataset.sbs; toComposite(); applyOverlayPreview(); refreshOverlayButtons(); }));
  if (sbsSwapBtn) sbsSwapBtn.addEventListener('click', () => { sbsSwap = !sbsSwap; toComposite(); applyOverlayPreview(); });
  if (pipSizeInput) pipSizeInput.addEventListener('input', () => { pipSize = parseFloat(pipSizeInput.value); toComposite(); applyOverlayPreview(); });
  mergeAudioBtns.forEach((b) => b.addEventListener('click', () => { mergeAudio = b.dataset.mergeAudio; applyOverlayPreview(); refreshOverlayButtons(); }));
  if (ovlHandleL) ovlHandleL.addEventListener('pointerdown', ovlTrimHandle('L'));
  if (ovlHandleR) ovlHandleR.addEventListener('pointerdown', ovlTrimHandle('R'));
  if (ovlVideo) ovlVideo.addEventListener('pointerdown', pipDragStart);
  if (ovlVideo) ovlVideo.addEventListener('click', () => { if (!ovlPointerMoved && otherTrackClips().length) setEditingTrack(editingTrack === 1 ? 2 : 1); });

  // Track switcher (Video 1 / Video 2)
  tsBtns.forEach((b) => b.addEventListener('click', () => setEditingTrack(parseInt(b.dataset.track, 10))));

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
    const now = dropGlobal || 0;   // whole-video time, so timing is consistent across clips (and over images)
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
      if (!t.whole && !t.end) { t.start = dropGlobal; t.end = Math.min(totalDur(), dropGlobal + 3); }
    });
    syncEditor();
  });
  if (tSetIn) tSetIn.addEventListener('click', () => { updateSelected((t) => { t.start = dropGlobal; }); syncEditor(); });
  if (tSetOut) tSetOut.addEventListener('click', () => { updateSelected((t) => { t.end = dropGlobal; }); syncEditor(); });
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
  // ffmpeg-core.wasm is ~30 MB — over Cloudflare Pages' 25 MB per-file limit — so
  // it is loaded from jsdelivr (the identical @ffmpeg/core@0.12.6 build) rather than
  // shipped in the repo. The worker + core.js stay self-hosted, so importScripts
  // still pulls a real-origin core (the old blob-origin failure doesn't return).
  const FF_CORE_WASM = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm';

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
        if (type === 'LOG') {
          if (payload && payload.message) {
            ffLogs.push(payload.message); if (ffLogs.length > 120) ffLogs.shift();
            // Drive progress from ffmpeg's own "time=HH:MM:SS.ss" — accurate even when a
            // looped (-stream_loop) input makes the wrapper's % unreliable.
            if (ffExpectedDur > 0) {
              const tm = /time=(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(payload.message);
              if (tm) updateProgress(Math.min(0.999, ((+tm[1]) * 3600 + (+tm[2]) * 60 + (+tm[3])) / ffExpectedDur));
            }
          }
          return;
        }
        if (type === 'PROGRESS') { if (ffExpectedDur <= 0 && payload && payload.progress >= 0 && payload.progress <= 1) updateProgress(payload.progress); return; }
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
      send('LOAD', { coreURL: FF_BASE + 'ffmpeg-core.js', wasmURL: FF_CORE_WASM })
        .then(() => { loaded = true; ffmpegInstance = client; resolve(client); })
        .catch(reject);
    });
    return withTimeout(start, 60000, 'Engine took too long to load — please retry.');
  }

  function updateProgress(frac) {
    // Only drives the bar — the status text is the ticking elapsed clock (heartbeat),
    // because the % is unreliable during a two-track merge (looped input).
    frac = Math.min(1, Math.max(0, frac));
    progressBar.style.width = (frac * 100) + '%';
  }

  function status(msg) { statusEl.textContent = msg; if (exporting && banner) banner.textContent = msg; }

  function triggerDownload(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  // Hand the finished video to the user — save it, or open the native share sheet
  // (post straight to Instagram / TikTok / WhatsApp on phones that support it).
  async function deliverOutput(blob, name, doneMsg) {
    const action = exportAction; exportAction = 'download';
    lastExportBlob = blob; lastExportName = name;
    if (action === 'share') {
      const file = new File([blob], name, { type: blob.type || 'video/mp4' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'My video', text: 'Made with Riyo Video Studio — riyostudio.dev' }); status('Shared ✓'); return; }
        catch (e) { if (e && e.name === 'AbortError') { status('Share cancelled — tap Share or Download again any time.'); return; } }
      }
      triggerDownload(blob, name);
      status('Saved to your downloads — this device can’t share the file directly, so post it from your photos/files.');
      return;
    }
    triggerDownload(blob, name);
    status(doneMsg);
  }

  // ── Fast export via WebCodecs (WebAV) — hardware-accelerated, minutes → seconds ──
  // Covers the full editor: concat, every aspect/fill, colour looks, fades, flip,
  // burned-in text + captions, voiceover/music, and the PiP / side-by-side merge.
  // Falls back to the ffmpeg engine only for what WebAV can't reproduce: GIF/WebM
  // output, per-clip speed (audio time-stretch), audio ducking, and 90° rotation.
  function webavEligible() {
    if (typeof VideoEncoder === 'undefined' || typeof OffscreenCanvas === 'undefined') return false;
    if (formatSel.value !== 'mp4') return false;
    if (outRotate !== 'none') return false;
    if (sources.some((s) => (s.speed || 1) !== 1) || t2.some((s) => (s.speed || 1) !== 1)) return false;
    if (duckMusic && audios.some((a) => a.kind === 'music')) return false;
    const vids = sources.concat(t2);
    return vids.every((s) => isImage(s) || /(mp4|m4v|mov|quicktime)/i.test(((s.file && s.file.type) || '') + ' ' + (s.name || '')));
  }

  async function loadWebAV() {
    if (webavMod) return webavMod;
    webavMod = await import('https://esm.sh/@webav/av-cliper@1.2.8');
    return webavMod;
  }

  async function ensureVSFonts() {
    if (!document.fonts) return;
    const fams = ["'VS Inter'", "'VS Anton'", "'VS Montserrat'"];
    try { await Promise.all(fams.map((f) => document.fonts.load('80px ' + f))); } catch (e) {}
    try { await document.fonts.ready; } catch (e) {}
  }

  // Word-wrap to a pixel width using the real font metrics.
  function wrapTextPx(ctx, text, maxW) {
    const words = (text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return [' '];
    const lines = []; let cur = words[0];
    for (let i = 1; i < words.length; i++) {
      const t = cur + ' ' + words[i];
      if (ctx.measureText(t).width <= maxW) cur = t; else { lines.push(cur); cur = words[i]; }
    }
    lines.push(cur); return lines;
  }

  // Render stacked, centred lines (caption or title) to a tight bitmap.
  function renderTextBitmap(lines, fontCss, size, color, withBox) {
    const probe = new OffscreenCanvas(8, 8).getContext('2d');
    probe.font = size + 'px ' + fontCss;
    let maxw = 1; lines.forEach((l) => { maxw = Math.max(maxw, probe.measureText(l).width); });
    const lineH = size * 1.2;
    const padX = withBox ? size * 0.45 : Math.max(8, size * 0.3);
    const padY = withBox ? size * 0.28 : Math.max(8, size * 0.22);
    const w = Math.max(2, Math.ceil(maxw + padX * 2)), h = Math.max(2, Math.ceil(lineH * lines.length + padY * 2));
    const cv = new OffscreenCanvas(w, h), x = cv.getContext('2d');
    x.font = size + 'px ' + fontCss; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (withBox) {
      const r = Math.min(h / 2, size * 0.32);
      x.fillStyle = 'rgba(0,0,0,0.6)'; x.beginPath();
      x.moveTo(r, 0); x.arcTo(w, 0, w, h, r); x.arcTo(w, h, 0, h, r); x.arcTo(0, h, 0, 0, r); x.arcTo(0, 0, w, 0, r); x.closePath(); x.fill();
    } else {
      x.shadowColor = 'rgba(0,0,0,0.65)'; x.shadowOffsetX = 2; x.shadowOffsetY = 2; x.shadowBlur = Math.max(2, size * 0.08);
    }
    x.fillStyle = color || '#ffffff';
    lines.forEach((l, i) => x.fillText(l, w / 2, padY + lineH * (i + 0.5)));
    return { bitmap: cv.transferToImageBitmap(), w, h };
  }

  async function exportWebAV(exportClips) {
    let mod;
    try { mod = await loadWebAV(); } catch (e) { console.warn('[VideoStudio] WebAV load failed:', e); return false; }
    const { Combinator, MP4Clip, OffscreenSprite, ImgClip, AudioClip } = mod;
    try { if (!(await Combinator.isSupported())) return false; } catch (e) { return false; }

    exporting = true; exportBtn.disabled = true;
    progressWrap.style.display = 'block'; updateProgress(0);
    exportStart = performance.now();
    exportPhase = '⚡ Fast render';
    if (exportHeartbeat) clearInterval(exportHeartbeat);
    exportHeartbeat = setInterval(() => { if (!exporting) return; status(`${exportPhase}… ${fmtTime((performance.now() - exportStart) / 1000)}`); }, 500);

    try {
      const qual = QUALITY[qualitySel.value] || QUALITY.sd;
      const { W, H } = computeWH(outAspect, qual.base);
      const bitrate = qual.base >= 1080 ? 8e6 : (qual.base >= 720 ? 5e6 : 2.5e6);
      const lookCss = (FILTERS[vfilter] && FILTERS[vfilter].css !== 'none') ? FILTERS[vfilter].css : '';
      const flipH = outFlipH, flipV = outFlipV;
      const com = new Combinator({ width: W, height: H, bitrate, bgColor: (outFill === 'color') ? bgColor : '#000' });

      if (texts.length || captions.length) await ensureVSFonts();

      // Side-by-side splits the frame into two viewports; PiP keeps the main full.
      const full = { x: 0, y: 0, w: W, h: H };
      const sbs = t2.length > 0 && pipLayout === 'sbs';
      const pip = t2.length > 0 && pipLayout === 'pip';
      let mainVP = full, t2VP = null;
      if (sbs) {
        if (sbsDir === 'tb') { const hh = Math.round(H / 2); const a = { x: 0, y: 0, w: W, h: hh }, b = { x: 0, y: hh, w: W, h: H - hh }; mainVP = sbsSwap ? b : a; t2VP = sbsSwap ? a : b; }
        else { const ww = Math.round(W / 2); const a = { x: 0, y: 0, w: ww, h: H }, b = { x: ww, y: 0, w: W - ww, h: H }; mainVP = sbsSwap ? b : a; t2VP = sbsSwap ? a : b; }
      }

      // Trim one MP4Clip to its [in, in+dur] window via split. Splits can fail on
      // variable-framerate footage (e.g. screen recordings) when there's no sample at
      // the exact cut time — that's non-fatal: the sprite's own time window still caps
      // playback, so we just fall back to the un-split clip.
      const trimClip = async (file, inUs, durUs, withAudio) => {
        const clip = new MP4Clip(file.stream(), { audio: withAudio });
        await clip.ready;
        let c = clip;
        if (inUs > 5000) { try { c = (await c.split(inUs))[1]; } catch (e) { /* keep from start */ } }
        const total = (clip.meta && clip.meta.duration) || (c.meta && c.meta.duration) || durUs;
        if (durUs < total - 50000) { try { c = (await c.split(durUs))[0]; } catch (e) { /* keep full; sprite.time caps it */ } }
        return { clip, c };
      };

      // A still image as a clip — decoded once, shown for its set duration, no audio.
      const imgClip = async (s) => { const c = new ImgClip(await createImageBitmap(s.file)); await c.ready; return c; };

      const fitRect = (cw, ch, vp, mode) => {
        const sc = mode === 'cover' ? Math.max(vp.w / cw, vp.h / ch) : Math.min(vp.w / cw, vp.h / ch);
        const dw = Math.round(cw * sc), dh = Math.round(ch * sc);
        return { x: Math.round(vp.x + (vp.w - dw) / 2), y: Math.round(vp.y + (vp.h - dh) / 2), w: dw, h: dh };
      };

      // Per-frame processor: draws each frame into a fixed-size canvas with the colour
      // look, flip and a cover/contain fit — used when the GPU can't just place the raw
      // frame (a look or flip is on, or a side-by-side half must be hard-cropped).
      const frameProc = (src, ow, oh, fit, look, fh, fv) => {
        const cv = new OffscreenCanvas(ow, oh), cx = cv.getContext('2d');
        return {
          ready: src.ready, meta: src.meta,
          async tick(t) {
            const r = await src.tick(t);
            if (!r) return { state: 'success' };
            if (!r.video) return { audio: r.audio, state: r.state || 'success' };
            const vw = r.video.displayWidth || r.video.codedWidth || r.video.width || ow;
            const vh = r.video.displayHeight || r.video.codedHeight || r.video.height || oh;
            const sc = fit === 'cover' ? Math.max(ow / vw, oh / vh) : Math.min(ow / vw, oh / vh);
            const dw = vw * sc, dh = vh * sc;
            cx.clearRect(0, 0, ow, oh); cx.save(); cx.filter = look || 'none';
            cx.translate(ow / 2, oh / 2); cx.scale(fh ? -1 : 1, fv ? -1 : 1);
            cx.drawImage(r.video, -dw / 2, -dh / 2, dw, dh); cx.restore();
            if (r.video.close) r.video.close();
            return { video: cv.transferToImageBitmap(), audio: r.audio, state: r.state || 'success' };
          },
          async split(t) { const [a, b] = await src.split(t); return [frameProc(a, ow, oh, fit, look, fh, fv), frameProc(b, ow, oh, fit, look, fh, fv)]; },
          async clone() { return frameProc(await src.clone(), ow, oh, fit, look, fh, fv); },
          destroy() { if (src.destroy) src.destroy(); }
        };
      };

      // Blurred cover backdrop that fills the bars when a clip doesn't match the frame.
      const blurBg = (src, w, h, look) => {
        const cv = new OffscreenCanvas(w, h), cx = cv.getContext('2d');
        return {
          ready: src.ready, meta: src.meta,
          async tick(t) {
            const r = await src.tick(t);
            if (!r || !r.video) return { state: (r && r.state) || 'success' };
            const vw = r.video.displayWidth || r.video.codedWidth || r.video.width || w, vh = r.video.displayHeight || r.video.codedHeight || r.video.height || h;
            const sc = Math.max(w / vw, h / vh), dw = vw * sc, dh = vh * sc;
            cx.clearRect(0, 0, w, h); cx.filter = (look ? look + ' ' : '') + 'blur(26px)';
            cx.drawImage(r.video, (w - dw) / 2, (h - dh) / 2, dw, dh); cx.filter = 'none';
            if (r.video.close) r.video.close();
            return { video: cv.transferToImageBitmap(), state: r.state || 'success' };
          },
          async split(t) { const [a, b] = await src.split(t); return [blurBg(a, w, h, look), blurBg(b, w, h, look)]; },
          async clone() { return blurBg(await src.clone(), w, h, look); },
          destroy() { if (src.destroy) src.destroy(); }
        };
      };

      // Entrance animation: wrap an already-fitted clip and slide/zoom/fade it in.
      const animClip = (src, type, animSec, totalSec, ow, oh) => {
        const cv = new OffscreenCanvas(ow, oh), cx = cv.getContext('2d');
        return {
          ready: src.ready, meta: src.meta,
          async tick(tu) {
            const r = await src.tick(tu);
            if (!r) return { state: 'success' };
            if (!r.video) return { audio: r.audio, state: r.state || 'success' };
            const t = tu / 1e6;
            let alpha = 1, tx = 0, ty = 0, sc = 1;
            if (type === 'zoom') { sc = 1 + 0.12 * Math.min(1, t / Math.max(0.1, totalSec)); }
            else { const p = Math.min(1, t / animSec), e = 1 - Math.pow(1 - p, 3), off = 1 - e; alpha = e;
              if (type === 'slideUp') ty = off * oh; else if (type === 'slideDown') ty = -off * oh;
              else if (type === 'slideLeft') tx = off * ow; else if (type === 'slideRight') tx = -off * ow; }
            cx.clearRect(0, 0, ow, oh); cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, alpha));
            cx.translate(ow / 2 + tx, oh / 2 + ty); cx.scale(sc, sc); cx.translate(-ow / 2, -oh / 2);
            cx.drawImage(r.video, 0, 0); cx.restore();
            if (r.video.close) r.video.close();
            return { video: cv.transferToImageBitmap(), audio: r.audio, state: r.state || 'success' };
          },
          async split(t) { const [a, b] = await src.split(t); return [animClip(a, type, animSec, totalSec, ow, oh), animClip(b, type, animSec, totalSec, ow, oh)]; },
          async clone() { return animClip(await src.clone(), type, animSec, totalSec, ow, oh); },
          destroy() { if (src.destroy) src.destroy(); }
        };
      };

      const needProc = !!lookCss || flipH || flipV || sbs;
      const mainFit = (outFill === 'crop' || sbs) ? 'cover' : 'contain';
      const useBlur = !sbs && outFill === 'blur';
      // Which video's sound to keep when merging two videos.
      const mergeActive = pip || sbs;
      const mainAudioOn = !(mergeActive && mergeAudio === 'v2');
      const t2AudioOn = mergeAudio !== 'v1';

      // ── MAIN TRACK: trim each clip, lay them end to end ──
      let offsetUs = 0;
      for (const seg of exportClips) {
        const s = sources.find((x) => x.id === seg.sourceId); if (!s) continue;
        const inUs = Math.round(seg.start * 1e6);
        const durUs = Math.max(1e5, Math.round((seg.end - seg.start) * 1e6));
        const image = isImage(s);
        if (useBlur) {
          const bgc = image ? await imgClip(s) : (await trimClip(s.file, inUs, durUs, false)).c;
          const bg = new OffscreenSprite(blurBg(bgc, W, H, lookCss));
          bg.time = { offset: offsetUs, duration: durUs }; bg.zIndex = 0;
          Object.assign(bg.rect, mainVP);
          await com.addSprite(bg);
        }
        let c, cw, ch;
        if (image) { c = await imgClip(s); cw = (c.meta && c.meta.width) || s.w || W; ch = (c.meta && c.meta.height) || s.h || H; }
        else { const r = await trimClip(s.file, inUs, durUs, mainAudioOn); c = r.c; cw = (r.clip.meta && r.clip.meta.width) || s.w || W; ch = (r.clip.meta && r.clip.meta.height) || s.h || H; }
        const anim = animOf(s);
        let clipObj, rect;
        if (anim !== 'none') {
          const fitted = frameProc(c, mainVP.w, mainVP.h, mainFit, lookCss, flipH, flipV);
          clipObj = animClip(fitted, anim, ANIM_D, durUs / 1e6, mainVP.w, mainVP.h);
          rect = mainVP;
        } else {
          clipObj = needProc ? frameProc(c, mainVP.w, mainVP.h, mainFit, lookCss, flipH, flipV) : c;
          rect = needProc ? mainVP : fitRect(cw, ch, mainVP, mainFit);
        }
        const spr = new OffscreenSprite(clipObj);
        spr.time = { offset: offsetUs, duration: durUs }; spr.zIndex = 1;
        Object.assign(spr.rect, rect);
        await com.addSprite(spr);
        offsetUs += durUs;
      }
      const totalUs = offsetUs, total = totalUs / 1e6;

      // ── SECOND VIDEO: PiP inset or side-by-side half ──
      if (pip || sbs) {
        const t2segs = [];
        t2.forEach((s) => { const a = inOf(s), b = outOf(s); if (b > a + 0.05) t2segs.push({ s, start: a, end: b }); });
        let t2off = 0;
        for (const seg of t2segs) {
          if (t2off >= totalUs) break;
          const inUs = Math.round(seg.start * 1e6);
          let durUs = Math.max(1e5, Math.round((seg.end - seg.start) * 1e6));
          if (t2off + durUs > totalUs) durUs = totalUs - t2off;
          const { clip, c } = await trimClip(seg.s.file, inUs, durUs, t2AudioOn);
          const tw = (clip.meta && clip.meta.width) || seg.s.w || 16, th = (clip.meta && clip.meta.height) || seg.s.h || 9;
          let spr, rect;
          if (pip) {
            const pw = Math.max(2, Math.round(W * pipSize)), ph = Math.max(2, Math.round(pw * th / tw));
            const px = Math.round(Math.max(0, Math.min(1 - pipSize, pipX)) * W);
            const py = Math.round(Math.max(0, Math.min(0.98, pipY)) * H);
            rect = { x: px, y: py, w: pw, h: ph };
            spr = new OffscreenSprite(c); spr.zIndex = 40;
          } else {
            rect = t2VP;
            spr = new OffscreenSprite(frameProc(c, t2VP.w, t2VP.h, 'cover', '', false, false)); spr.zIndex = 2;
          }
          spr.time = { offset: t2off, duration: durUs };
          Object.assign(spr.rect, rect);
          await com.addSprite(spr);
          t2off += durUs;
        }
      }

      // ── TEXT TITLES ──
      for (const t of texts) {
        const size = Math.max(8, Math.round(t.sizeFrac * H));
        const probe = new OffscreenCanvas(8, 8).getContext('2d'); probe.font = size + 'px ' + FONTS_VS[t.font].css;
        const lines = wrapTextPx(probe, t.content || ' ', W * 0.9);
        const { bitmap, w, h } = renderTextBitmap(lines, FONTS_VS[t.font].css, size, t.color, !!t.bg);
        const off = t.whole ? 0 : Math.max(0, Math.min(total, +t.start || 0));
        const end = t.whole ? total : Math.min(total, Math.max(off, (+t.end || total)));
        const dur = Math.max(0.05, (t.whole ? total : end - off));
        const spr = new OffscreenSprite(new ImgClip(bitmap));
        spr.time = { offset: Math.round(off * 1e6), duration: Math.round(dur * 1e6) }; spr.zIndex = 50;
        Object.assign(spr.rect, { x: Math.round(t.cx * W - w / 2), y: Math.round(t.cy * H - h / 2), w, h });
        await com.addSprite(spr);
      }

      // ── BURNED-IN CAPTIONS ──
      if (captions.length) {
        const capSize = Math.max(12, Math.round(capStyle.sizeFrac * Math.min(W, H)));
        const probe = new OffscreenCanvas(8, 8).getContext('2d'); probe.font = capSize + 'px ' + FONTS_VS[capStyle.font].css;
        for (const c of captions) {
          const start = Math.max(0, Math.min(total, +c.start || 0));
          const end = Math.max(start, Math.min(total, +c.end || total));
          if (end - start < 0.03) continue;
          const lines = wrapTextPx(probe, c.text || ' ', W * 0.9);
          const { bitmap, w, h } = renderTextBitmap(lines, FONTS_VS[capStyle.font].css, capSize, capStyle.color, !!capStyle.bg);
          const spr = new OffscreenSprite(new ImgClip(bitmap));
          spr.time = { offset: Math.round(start * 1e6), duration: Math.round((end - start) * 1e6) }; spr.zIndex = 60;
          Object.assign(spr.rect, { x: Math.round((W - w) / 2), y: Math.round(capStyle.cy * H - h / 2), w, h });
          await com.addSprite(spr);
        }
      }

      // ── VOICEOVER / MUSIC ──
      if (audios.length) {
        const ACtx = window.AudioContext || window.webkitAudioContext;
        const actx = new ACtx();
        for (const au of audios) {
          let buf;
          try { buf = await actx.decodeAudioData(await au.file.arrayBuffer()); }
          catch (e) { console.warn('[VideoStudio] skipped undecodable audio', au.name, e); continue; }
          const sr = buf.sampleRate;
          const vol = Math.max(0, au.volume != null ? au.volume : 1);
          const start = Math.max(0, Math.min(total, au.start || 0));
          const loop = au.kind === 'music' && au.loop !== false;
          const span = Math.max(0.05, total - start);
          const outLen = Math.round(span * sr);
          const nch = Math.max(1, Math.min(2, buf.numberOfChannels));
          const chans = [];
          for (let ch = 0; ch < nch; ch++) {
            const data = buf.getChannelData(Math.min(ch, buf.numberOfChannels - 1));
            const out = new Float32Array(outLen);
            if (loop) { for (let i = 0; i < outLen; i++) out[i] = data[i % data.length] * vol; }
            else { const n = Math.min(outLen, data.length); for (let i = 0; i < n; i++) out[i] = data[i] * vol; }
            chans.push(out);
          }
          const aclip = new AudioClip(chans, { sampleRate: sr });
          await aclip.ready;
          const spr = new OffscreenSprite(aclip);
          spr.time = { offset: Math.round(start * 1e6), duration: Math.round(span * 1e6) };
          await com.addSprite(spr);
        }
        try { actx.close(); } catch (e) {}
      }

      // ── FADE IN / OUT (animated black overlay) ──
      if ((fadeIn || fadeOut) && total > 0.1) {
        const FADE_D = Math.min(0.6, Math.max(0.2, total / 4));
        const fadeClip = (kind, dur) => {
          const durU = dur * 1e6;
          const cv = new OffscreenCanvas(W, H), cx = cv.getContext('2d');
          return {
            ready: Promise.resolve({ width: W, height: H, duration: durU }), meta: { width: W, height: H, duration: durU },
            async tick(tUs) {
              let a = kind === 'in' ? (1 - tUs / durU) : (tUs / durU); a = Math.min(1, Math.max(0, a));
              cx.clearRect(0, 0, W, H);
              if (a > 0.001) { cx.globalAlpha = a; cx.fillStyle = '#000'; cx.fillRect(0, 0, W, H); cx.globalAlpha = 1; }
              return { video: cv.transferToImageBitmap(), state: tUs >= durU ? 'done' : 'success' };
            },
            async split() { return [fadeClip(kind, dur), fadeClip(kind, dur)]; },
            async clone() { return fadeClip(kind, dur); }, destroy() {}
          };
        };
        if (fadeIn) { const sp = new OffscreenSprite(fadeClip('in', FADE_D)); sp.time = { offset: 0, duration: FADE_D * 1e6 }; sp.zIndex = 90; Object.assign(sp.rect, full); await com.addSprite(sp); }
        if (fadeOut) { const sp = new OffscreenSprite(fadeClip('out', FADE_D)); sp.time = { offset: Math.max(0, total - FADE_D) * 1e6, duration: FADE_D * 1e6 }; sp.zIndex = 90; Object.assign(sp.rect, full); await com.addSprite(sp); }
      }

      const reader = com.output().getReader();
      const parts = []; let prog = 0;
      while (true) { const { done, value } = await reader.read(); if (done) break; parts.push(value); prog = Math.min(0.95, prog + 0.04); updateProgress(prog); }
      const blob = new Blob(parts, { type: 'video/mp4' });
      if (!blob.size) throw new Error('empty output');
      updateProgress(1);
      if (exportHeartbeat) { clearInterval(exportHeartbeat); exportHeartbeat = null; }
      await deliverOutput(blob, 'riyo-video.mp4', `Done! Saved to your downloads. (⚡ ${fmtTime((performance.now() - exportStart) / 1000)})`);
      exportBtn.disabled = false; exporting = false;
      setTimeout(() => { progressWrap.style.display = 'none'; }, 1500);
      setTimeout(updateBanner, 2600);
      return true;
    } catch (e) {
      console.warn('[VideoStudio] fast (WebAV) export failed — using the standard engine:', e);
      if (exportHeartbeat) { clearInterval(exportHeartbeat); exportHeartbeat = null; }
      exporting = false; exportBtn.disabled = false;
      return false;
    }
  }

  exportBtn.addEventListener('click', async () => {
    if (editingTrack === 2) setEditingTrack(1);   // the main render is always Video 1
    const exportClips = [];
    sources.forEach((s) => {
      const a = inOf(s), b = outOf(s);
      if (b > a + 0.05) exportClips.push({ sourceId: s.id, start: a, end: b, speed: speedOf(s) });
    });
    if (!exportClips.length) { status('Nothing to export — add a clip first.'); return; }

    // Try the hardware-accelerated fast path first; it returns false (and we fall
    // through to the ffmpeg engine) for anything it doesn't yet handle.
    if (webavEligible()) { if (await exportWebAV(exportClips)) return; }

    // atempo only spans 0.5–2.0, so chain it for speeds outside that range.
    const atempoChain = (speed) => {
      if (Math.abs(speed - 1) < 0.001) return '';
      let s = speed; const ch = [];
      while (s > 2.0 + 1e-6) { ch.push('atempo=2.0'); s /= 2; }
      while (s < 0.5 - 1e-6) { ch.push('atempo=0.5'); s *= 2; }
      ch.push('atempo=' + s.toFixed(4));
      return ',' + ch.join(',');
    };

    pauseAudioPreview();
    const overlayAudios = audios.slice();
    const pipOn = t2.length > 0 && pipLayout !== 'off';
    let t2File = null, t2HasAudio = false, t2In = null, t2Len = 0;
    const audioExt = (au) => {
      const t = (au.file && au.file.type) || '';
      if (/mpeg|mp3/.test(t)) return 'mp3';
      if (/webm/.test(t)) return 'webm';
      if (/ogg|opus/.test(t)) return 'ogg';
      if (/wav/.test(t)) return 'wav';
      if (/mp4|m4a|aac/.test(t)) return 'm4a';
      const m = (au.name || '').toLowerCase().match(/\.(mp3|wav|ogg|m4a|aac|webm|opus|flac)$/);
      return m ? m[1] : 'dat';
    };

    exporting = true;
    exportBtn.disabled = true;
    progressWrap.style.display = 'block';
    updateProgress(0);
    exportStart = performance.now();

    // A ticking elapsed clock so a slow render never *looks* frozen.
    exportPhase = 'Preparing';
    if (exportHeartbeat) clearInterval(exportHeartbeat);
    exportHeartbeat = setInterval(() => {
      if (!exporting) return;
      const el = (performance.now() - exportStart) / 1000;
      const tip = el > 25 ? ' — long/HD clips take a few minutes, keep this tab open' : '';
      status(`${exportPhase}… ${fmtTime(el)}${tip}`);
    }, 1000);

    const fmt = formatSel.value;
    const qual = QUALITY[qualitySel.value] || QUALITY.sd;
    const { W, H } = computeWH(outAspect, qual.base);
    const crf = qual.crf;
    const vcodec = fmt === 'webm'
      ? ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', String(crf), '-deadline', 'realtime', '-cpu-used', '8']
      : ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', String(crf), '-pix_fmt', 'yuv420p'];
    const acodec = fmt === 'webm' ? ['-c:a', 'libopus', '-ar', '48000', '-ac', '2'] : ['-c:a', 'aac', '-ar', '44100', '-ac', '2'];
    const outName = `out.${fmt}`;

    // Captions are sized off the SHORT side (so they fit any aspect) and wrapped
    // to the frame width, then rendered as centered stacked lines.
    const capSize = Math.max(12, Math.round(capStyle.sizeFrac * Math.min(W, H)));
    const capMaxChars = Math.max(6, Math.floor((W * 0.92) / (capSize * 0.5)));
    const capLineH = Math.round(capSize * 1.18);
    captions.forEach((c) => { c._lines = wrapToLines(c.text || '', capMaxChars); });

    const imgExtOf = (s) => { const t = (s.file && s.file.type) || ''; if (/png/.test(t)) return 'png'; if (/webp/.test(t)) return 'webp'; if (/gif/.test(t)) return 'gif'; const m = (s.name || '').toLowerCase().match(/\.(png|jpe?g|webp|gif|bmp)$/); return m ? m[1] : 'jpg'; };
    const fileKeyToIndex = {};
    const inputs = [];
    exportClips.forEach((seg) => {
      const src = sources.find((x) => x.id === seg.sourceId);
      seg._fk = src.fileKey;
      if (!(src.fileKey in fileKeyToIndex)) {
        fileKeyToIndex[src.fileKey] = inputs.length;
        const im = isImage(src);
        inputs.push({ fileKey: src.fileKey, name: `in_${src.fileKey}.${im ? imgExtOf(src) : ext(src.name)}`, file: src.file, isImage: im, imgDur: im ? Math.max(0.5, keptDuration(src)) : 0 });
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

    // Burned-in captions: centered, one drawtext per segment, shown over its
    // whole-video time window (t in the filtergraph is the output timeline).
    const captionChain = () => {
      const out = [];
      const col = '0x' + (capStyle.color || '#ffffff').replace('#', '');
      captions.forEach((c, ci) => {
        const lines = c._lines || [c.text || ' '];
        const L = lines.length;
        lines.forEach((ln, li) => {
          const cyPx = H * capStyle.cy - ((L - 1) / 2 - li) * capLineH; // centre the stack on cy
          let d = `drawtext=fontfile=${FONTS_VS[capStyle.font].file}:textfile=cap_${ci}_${li}.txt:expansion=none`;
          d += `:fontsize=${capSize}:fontcolor=${col}`;
          d += `:x=(w-text_w)/2:y=${cyPx.toFixed(1)}-text_h/2`;
          if (capStyle.bg) d += `:box=1:boxcolor=black@0.62:boxborderw=${Math.round(capSize * 0.28)}`;
          else d += `:shadowcolor=black@0.6:shadowx=2:shadowy=2`;
          d += `:enable=between(t\\,${(+c.start).toFixed(2)}\\,${(+c.end).toFixed(2)})`;
          out.push(d);
        });
      });
      return out.join(',');
    };

    // One pass: real audio where a clip has it, silent filler where it doesn't,
    // so the concat always has an audio track and audio is never silently dropped.
    // Rotate / flip is applied to the raw frames before the clip is fit to the frame.
    const tf = (() => {
      let s = '';
      if (outRotate === 'cw') s += ',transpose=1';
      else if (outRotate === 'ccw') s += ',transpose=2';
      if (outFlipH) s += ',hflip';
      if (outFlipV) s += ',vflip';
      return s;
    })();

    const totalOut = exportClips.reduce((a, s) => a + (s.end - s.start) / s.speed, 0);
    const FADE_D = Math.min(0.6, Math.max(0.2, totalOut / 4));

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
        const base = `[${vlbl}]trim=${seg.start.toFixed(3)}:${seg.end.toFixed(3)},setpts=(PTS-STARTPTS)/${seg.speed}${tf},fps=30`;
        if (outFill === 'crop') {
          parts.push(`${base},scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1[v${i}]`);
        } else if (outFill === 'color') {
          parts.push(`${base},scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x${(bgColor || '#000000').replace('#', '')},setsar=1[v${i}]`);
        } else {
          // Blurred backdrop: blur a tiny downscaled copy then upscale it — visually the
          // same but far cheaper than blurring the full-size frame.
          const bw = Math.max(2, Math.round(W / 4 / 2) * 2), bh = Math.max(2, Math.round(H / 4 / 2) * 2);
          parts.push(`${base},split=2[v${i}a][v${i}b]`);
          parts.push(`[v${i}a]scale=${bw}:${bh}:force_original_aspect_ratio=increase,crop=${bw}:${bh},boxblur=6:1,scale=${W}:${H},setsar=1[v${i}bg]`);
          parts.push(`[v${i}b]scale=${W}:${H}:force_original_aspect_ratio=decrease,setsar=1[v${i}fg]`);
          parts.push(`[v${i}bg][v${i}fg]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[v${i}]`);
        }
        if (inp.hasAudio) {
          const albl = inp._al[inp._an++];
          parts.push(`[${albl}]atrim=${seg.start.toFixed(3)}:${seg.end.toFixed(3)},asetpts=PTS-STARTPTS${atempoChain(seg.speed)},aresample=44100,aformat=channel_layouts=stereo[a${i}]`);
        } else {
          parts.push(`anullsrc=r=44100:cl=stereo:d=${((seg.end - seg.start) / seg.speed).toFixed(3)}[a${i}]`);
        }
      });
      const n = exportClips.length;
      // concat wants inputs interleaved per segment: [v0][a0][v1][a1]…
      let cat = '';
      for (let i = 0; i < n; i++) cat += `[v${i}][a${i}]`;
      parts.push(`${cat}concat=n=${n}:v=1:a=1[cv][ca]`);
      // Post-processing on the combined video: colour look → text/captions → fade.
      const post = [];
      const lookFf = FILTERS[vfilter] && FILTERS[vfilter].ff;
      if (lookFf) post.push(lookFf);
      const draws = [texts.length ? drawChain() : '', captions.length ? captionChain() : ''].filter(Boolean).join(',');
      if (draws) post.push(draws);
      const fades = [];
      if (fadeIn) fades.push(`fade=t=in:st=0:d=${FADE_D.toFixed(2)}`);
      if (fadeOut) fades.push(`fade=t=out:st=${Math.max(0, totalOut - FADE_D).toFixed(2)}:d=${FADE_D.toFixed(2)}`);
      if (fades.length) post.push(fades.join(','));
      let vOut = '[cv]';
      if (post.length) { parts.push(`[cv]${post.join(',')}[outv]`); vOut = '[outv]'; }
      return { graph: parts.join(';'), vOut };
    };

    const u8FromFile = async (file) => new Uint8Array(await file.arrayBuffer());
    const u8FromURL = async (url) => new Uint8Array(await (await fetch(url)).arrayBuffer());

    async function prepFS(ff) {
      for (const inp of inputs) await ff.writeFile(inp.name, await u8FromFile(inp.file));
      for (let j = 0; j < overlayAudios.length; j++) {
        const au = overlayAudios[j];
        au._fsName = `aud_${j}.${audioExt(au)}`;
        await ff.writeFile(au._fsName, await u8FromFile(au.file));
      }
      const usedFonts = new Set(texts.map((t) => t.font));
      if (captions.length) usedFonts.add(capStyle.font);
      for (const fk of usedFonts) {
        const file = FONTS_VS[fk].file;
        await ff.writeFile(file, await u8FromURL(new URL('/assets/fonts/' + file, location.href).href));
      }
      for (let i = 0; i < texts.length; i++) await ff.writeFile(`txt_${i}.txt`, new TextEncoder().encode(texts[i].content || ' '));
      for (let i = 0; i < captions.length; i++) {
        const lines = captions[i]._lines || [captions[i].text || ' '];
        for (let li = 0; li < lines.length; li++) await ff.writeFile(`cap_${i}_${li}.txt`, new TextEncoder().encode(lines[li] || ' '));
      }
    }

    // Deterministic audio check: try to pull a sliver of the first audio stream.
    // Exit code 0 → the clip has audio; non-zero ("matches no streams") → it doesn't.
    async function probeAudio(ff) {
      for (let i = 0; i < inputs.length; i++) {
        const inp = inputs[i];
        if (inp.isImage) { inp.hasAudio = false; continue; }   // still images never have audio
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

    // Run 1 of the composite: concatenate the Video 2 track to its own file,
    // which the main pass then overlays / stacks (PiP or split screen).
    async function renderTrack2(ff) {
      const segs = [];
      t2.forEach((s) => { const a = inOf(s), b = outOf(s); if (b > a + 0.05) segs.push({ s, start: a, end: b, speed: speedOf(s) }); });
      if (!segs.length) return { ok: false };
      const fk2idx = {}; const t2in = [];
      segs.forEach((seg) => { const fk = seg.s.fileKey; if (!(fk in fk2idx)) { fk2idx[fk] = t2in.length; t2in.push({ fk, name: `t2_${fk}.${ext(seg.s.name)}`, file: seg.s.file, hasAudio: false }); } });
      for (const inp of t2in) await ff.writeFile(inp.name, await u8FromFile(inp.file));
      for (let i = 0; i < t2in.length; i++) {
        const inp = t2in[i]; ffLogs = [];
        try { const code = await ff.exec(['-i', inp.name, '-map', '0:a:0', '-t', '0.1', '-c:a', 'aac', '-y', `t2pr_${i}.m4a`]); inp.hasAudio = (code === 0) && !ffLogs.some((l) => /matches no streams|does not contain/i.test(l)); }
        catch (e) { inp.hasAudio = false; }
      }
      const parts = [];
      t2in.forEach((inp) => {
        const k = fk2idx[inp.fk];
        const cnt = segs.filter((s) => s.s.fileKey === inp.fk).length;
        const vl = []; for (let j = 0; j < cnt; j++) vl.push(`t2v${k}_${j}`);
        parts.push(`[${k}:v]split=${cnt}[${vl.join('][')}]`); inp._vl = vl; inp._vn = 0;
        if (inp.hasAudio) { const al = []; for (let j = 0; j < cnt; j++) al.push(`t2a${k}_${j}`); parts.push(`[${k}:a]asplit=${cnt}[${al.join('][')}]`); inp._al = al; inp._an = 0; }
      });
      segs.forEach((seg, i) => {
        const inp = t2in[fk2idx[seg.s.fileKey]];
        const vlbl = inp._vl[inp._vn++];
        parts.push(`[${vlbl}]trim=${seg.start.toFixed(3)}:${seg.end.toFixed(3)},setpts=(PTS-STARTPTS)/${seg.speed},fps=30,scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1[t2cv${i}]`);
        if (inp.hasAudio) { const albl = inp._al[inp._an++]; parts.push(`[${albl}]atrim=${seg.start.toFixed(3)}:${seg.end.toFixed(3)},asetpts=PTS-STARTPTS${atempoChain(seg.speed)},aresample=44100,aformat=channel_layouts=stereo[t2ca${i}]`); }
        else parts.push(`anullsrc=r=44100:cl=stereo:d=${((seg.end - seg.start) / seg.speed).toFixed(3)}[t2ca${i}]`);
      });
      const n = segs.length; let cat = ''; for (let i = 0; i < n; i++) cat += `[t2cv${i}][t2ca${i}]`;
      parts.push(`${cat}concat=n=${n}:v=1:a=1[t2vo][t2ao]`);
      const a2 = []; t2in.forEach((inp) => a2.push('-i', inp.name));
      a2.push('-filter_complex', parts.join(';'), '-map', '[t2vo]', '-map', '[t2ao]', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '44100', '-ac', '2', 'track2.mp4');
      ffLogs = [];
      await ff.exec(a2);
      return { ok: true, hasAudio: t2in.some((i) => i.hasAudio) };
    }

    ffLogs = [];
    try {
      const ff = await ensureFFmpeg();
      await prepFS(ff);
      exportPhase = 'Checking clips';
      await probeAudio(ff);
      if (pipOn) {
        if (t2.length === 1 && (t2[0].speed || 1) === 1) {
          // Single clip at normal speed → feed it straight to the composite (no extra encode).
          const s = t2[0];
          t2File = `ovl2.${ext(s.name)}`;
          await ff.writeFile(t2File, await u8FromFile(s.file));
          t2In = inOf(s); t2Len = Math.max(0.1, winLen(s));
          ffLogs = [];
          try { const code = await ff.exec(['-i', t2File, '-map', '0:a:0', '-t', '0.1', '-c:a', 'aac', '-y', 'ovlpr.m4a']); t2HasAudio = (code === 0) && !ffLogs.some((l) => /matches no streams|does not contain/i.test(l)); }
          catch (e) { t2HasAudio = false; }
        } else {
          exportPhase = 'Rendering the second video';
          const r = await renderTrack2(ff);
          if (r.ok) { t2File = 'track2.mp4'; t2HasAudio = r.hasAudio; }
        }
      }
      status(fmt === 'gif' ? 'Rendering GIF…' : (overlayAudios.length ? 'Mixing audio…' : (exportClips.length > 1 ? 'Combining your clips…' : 'Rendering…')));
      const g = buildGraph();
      let graphStr = g.graph;
      let vOut = g.vOut;
      const args = [];
      inputs.forEach((inp) => {
        if (inp.isImage) args.push('-loop', '1', '-framerate', '30', '-t', (inp.imgDur + 0.2).toFixed(2));
        args.push('-i', inp.name);
      });
      overlayAudios.forEach((au) => {
        if (au.kind === 'music' && au.loop) args.push('-stream_loop', '-1');
        args.push('-i', au._fsName);
      });
      const oi = inputs.length + overlayAudios.length;   // second-video (track 2) input index
      if (pipOn && t2File) {
        // NOTE: never use -stream_loop -1 here — an infinite input deadlocks the
        // filtergraph. The second video plays once; PiP freezes its last frame (overlay
        // eof_action=repeat) and side-by-side pads the last frame (tpad) to the main length.
        if (t2In != null) args.push('-ss', t2In.toFixed(3), '-t', t2Len.toFixed(3), '-i', t2File);
        else args.push('-i', t2File);
      }

      // Composite the second video over the main one (PiP corner or split screen).
      if (pipOn && t2File) {
        const pad = `tpad=stop_mode=clone:stop_duration=${Math.max(1, totalOut).toFixed(2)}`;
        if (pipLayout === 'pip') {
          const pw = Math.max(2, Math.round(W * pipSize / 2) * 2);
          const px = Math.round(Math.max(0, Math.min(1 - pipSize, pipX)) * W);
          const py = Math.round(Math.max(0, Math.min(0.98, pipY)) * H);
          graphStr += `;[${oi}:v]scale=${pw}:-2,setsar=1[pipv];${vOut}[pipv]overlay=${px}:${py}:eof_action=repeat[comp]`;
        } else {
          const order = sbsSwap ? '[sb][sa]' : '[sa][sb]';
          if (sbsDir === 'tb') {
            const hh = Math.max(2, Math.round(H / 4) * 2);
            graphStr += `;${vOut}scale=${W}:${hh}:force_original_aspect_ratio=increase,crop=${W}:${hh},setsar=1[sa];[${oi}:v]scale=${W}:${hh}:force_original_aspect_ratio=increase,crop=${W}:${hh},${pad},setsar=1[sb];${order}vstack[comp]`;
          } else {
            const ww = Math.max(2, Math.round(W / 4) * 2);
            graphStr += `;${vOut}scale=${ww}:${H}:force_original_aspect_ratio=increase,crop=${ww}:${H},setsar=1[sa];[${oi}:v]scale=${ww}:${H}:force_original_aspect_ratio=increase,crop=${ww}:${H},${pad},setsar=1[sb];${order}hstack[comp]`;
          }
        }
        vOut = '[comp]';
      }

      if (fmt === 'gif') {
        // No audio (discard the concat track); drop fps/size and build a palette for a sharp, smaller GIF.
        const gifW = Math.min(W, 480);
        graphStr += `;[ca]anullsink;${vOut}fps=12,scale=${gifW}:-2:flags=lanczos,split[gpa][gpb];[gpb]palettegen=stats_mode=diff[pal];[gpa][pal]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle[gifo]`;
        args.push('-filter_complex', graphStr, '-map', '[gifo]', '-loop', '0', outName);
      } else {
        // When merging, "Sound from Video 2" silences Video 1's own audio.
        const caLbl = (pipOn && mergeAudio === 'v2') ? '[cav1m]' : '[ca]';
        if (caLbl !== '[ca]') graphStr += ';[ca]volume=0[cav1m]';
        let aOut = caLbl;
        // Mix voiceover / music tracks over the video's own audio.
        if (overlayAudios.length) {
          const proc = [];
          const voiceLbls = [caLbl];   // clip audio + voiceovers — kept loud
          const musicLbls = [];          // music tracks — ducked under the voice
          overlayAudios.forEach((au, j) => {
            const inIdx = inputs.length + j;
            const lbl = `oa${j}`;
            const vol = Math.max(0, au.volume != null ? au.volume : 1).toFixed(2);
            const delayMs = Math.max(0, Math.round((au.start || 0) * 1000));
            let chain = `[${inIdx}:a]aresample=44100,aformat=channel_layouts=stereo`;
            if (delayMs > 0) chain += `,adelay=${delayMs}|${delayMs}`;
            chain += `,volume=${vol}[${lbl}]`;
            proc.push(chain);
            (au.kind === 'music' ? musicLbls : voiceLbls).push(`[${lbl}]`);
          });
          if (duckMusic && musicLbls.length) {
            // Build a voice bus, split it (one copy to mix, one to drive the sidechain),
            // then compress the music whenever the voice is above the threshold.
            let vbus = voiceLbls[0];
            if (voiceLbls.length > 1) { proc.push(`${voiceLbls.join('')}amix=inputs=${voiceLbls.length}:duration=first:normalize=0[vbus]`); vbus = '[vbus]'; }
            proc.push(`${vbus}asplit=2[vmix][vsc]`);
            let mbus = musicLbls[0];
            if (musicLbls.length > 1) { proc.push(`${musicLbls.join('')}amix=inputs=${musicLbls.length}:normalize=0[mbus]`); mbus = '[mbus]'; }
            proc.push(`${mbus}[vsc]sidechaincompress=threshold=0.05:ratio=8:attack=15:release=320[duck]`);
            proc.push(`[vmix][duck]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mixa]`);
          } else {
            const all = [caLbl, ...overlayAudios.map((_, j) => `[oa${j}]`)];
            proc.push(`${all.join('')}amix=inputs=${all.length}:duration=first:dropout_transition=0:normalize=0[mixa]`);
          }
          graphStr += ';' + proc.join(';');
          aOut = '[mixa]';
        }
        // Mix in the second video's own sound, unless "Sound from Video 1" is chosen.
        if (pipOn && t2File && mergeAudio !== 'v1' && t2HasAudio) {
          graphStr += `;[${oi}:a]aresample=44100,aformat=channel_layouts=stereo,volume=1[povla];${aOut}[povla]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout2]`;
          aOut = '[aout2]';
        }
        args.push('-filter_complex', graphStr, '-map', vOut, '-map', aOut, ...vcodec, ...acodec, outName);
      }
      console.log('[VideoStudio] filtergraph:', graphStr);
      console.log('[VideoStudio] ffmpeg args:', args.join(' '));
      ffLogs = [];
      if (fmt !== 'gif') { exportPhase = pipOn ? 'Merging the two videos' : 'Rendering'; }
      else { exportPhase = 'Rendering GIF'; }
      ffExpectedDur = Math.max(0.1, totalOut);   // accurate progress for the main pass
      updateProgress(0);
      await ff.exec(args);
      ffExpectedDur = 0;
      const data = await ff.readFile(outName);
      if (!data || !data.length) throw new Error('no output produced');
      updateProgress(1);
      const mimeByFmt = { webm: 'video/webm', gif: 'image/gif', mp4: 'video/mp4' };
      const blob = new Blob([data.buffer], { type: mimeByFmt[fmt] || 'video/mp4' });
      if (exportHeartbeat) { clearInterval(exportHeartbeat); exportHeartbeat = null; }
      const took = fmtTime((performance.now() - exportStart) / 1000);
      await deliverOutput(blob, `riyo-video.${fmt}`, `Done! Saved to your downloads. (${took})`);
    } catch (err) {
      console.error('[VideoStudio] export failed:', err);
      console.error('[VideoStudio] ffmpeg log tail:\n' + ffLogs.slice(-30).join('\n'));
      if (exportHeartbeat) { clearInterval(exportHeartbeat); exportHeartbeat = null; }
      const ffErr = ffLogs.filter((l) => /error|invalid|no such|unable|failed|not found|signature/i.test(l)).slice(-1)[0];
      status('Export failed: ' + (ffErr || (err && err.message) || 'unknown error'));
    }
    if (exportHeartbeat) { clearInterval(exportHeartbeat); exportHeartbeat = null; }
    ffExpectedDur = 0;
    exportAction = 'download';
    exportBtn.disabled = false;
    exporting = false;
    setTimeout(() => { progressWrap.style.display = 'none'; }, 1500);
    setTimeout(updateBanner, 2600);
  });

  // Apply the default output frame (16:9), look and button states on load.
  applyFormatPreview();
  refreshFmtButtons();
  applyLook();
  refreshFxButtons();
  refreshOverlayButtons();
  refreshTrackSwitch();
  setRailMode('global');
});
