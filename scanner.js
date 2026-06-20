/**
 * Riyo Studio - Mockup Studio V4.1 (Advanced Styling & Shapes)
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const canvas = document.getElementById('mockup-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const wrapper = document.getElementById('canvas-wrapper');
    const presetSelect = document.getElementById('preset-size-select');
    const screensSelect = document.getElementById('screens-count-select');
    
    // Panels
    const propsCanvas = document.getElementById('canvas-props');
    const propsText = document.getElementById('text-props');
    const propsImage = document.getElementById('image-props');
    const propsShape = document.getElementById('shape-props');
    const noSelectionMsg = document.getElementById('no-selection-msg');
    
    // Inputs (Text)
    const textInput = document.getElementById('text-content-input');
    const fontSelect = document.getElementById('text-font-select');
    const weightSelect = document.getElementById('text-weight-select');
    const alignGroup = document.getElementById('text-align-group');
    const colorInput = document.getElementById('text-color-input');
    const pillToggle = document.getElementById('text-pill-toggle');
    const pillColorInput = document.getElementById('text-pill-color');
    const pillColorRow = document.getElementById('text-pill-color-row');
    const textRotateInput = document.getElementById('text-rotate-input');
    const textShadowColor = document.getElementById('text-shadow-color');
    const textShadowBlur = document.getElementById('text-shadow-blur');

    // Inputs (Shape)
    const shapeTypeSelect = document.getElementById('shape-type-select');
    const shapeColorInput = document.getElementById('shape-color-input');
    const shapeRadiusInput = document.getElementById('shape-radius-input');
    const shapeRotateInput = document.getElementById('shape-rotate-input');
    const shapeWidthInput = document.getElementById('shape-width-input');
    const shapeHeightInput = document.getElementById('shape-height-input');

    // Inputs (Image)
    const frameSelect = document.getElementById('frame-style-select');
    const frameColorInput = document.getElementById('frame-color-input');
    const frameColorContainer = document.getElementById('frame-color-container');
    const imageUpload = document.getElementById('image-upload-input');
    const addDeviceBtn = document.getElementById('add-device-btn');
    const viewResetBtn = document.getElementById('view-reset-btn');
    let replaceTargetId = null;

    // Premium Background Inputs
    const bgUploadBtn = document.getElementById('upload-bg-btn');
    const bgUploadInput = document.getElementById('bg-upload-input');
    const bgBlurInput = document.getElementById('bg-blur-input');
    const bgTypeSelect = document.getElementById('bg-type-select');
    const bgColor1Input = document.getElementById('bg-color-1');
    const bgColor2Input = document.getElementById('bg-color-2');
    const grainToggle = document.getElementById('grain-toggle');
    const grainAmount = document.getElementById('grain-amount');
    
    // Premium Image Transforms & Realism
    const rotateInput = document.getElementById('img-rotate-input');
    const tiltYInput = document.getElementById('img-tilt-y-input');
    const tiltXInput = document.getElementById('img-tilt-x-input');
    const shadowBlurInput = document.getElementById('img-shadow-blur-input');
    const shadowOpInput = document.getElementById('img-shadow-op-input');
    const shadowAngleInput = document.getElementById('img-shadow-angle-input');
    const shadowDistInput = document.getElementById('img-shadow-dist-input');
    const glareToggle = document.getElementById('img-glare-toggle');
    const floorShadowToggle = document.getElementById('img-floor-shadow-toggle');
    const reflectionToggle = document.getElementById('img-reflection-toggle');
    const cropControls = document.getElementById('crop-controls');
    const imgZoomInput = document.getElementById('img-zoom-input');
    const imgPosXInput = document.getElementById('img-pos-x-input');
    const imgPosYInput = document.getElementById('img-pos-y-input');

    // Dropdowns (Sticker & Shape)
    const setupDropdown = (btnId, menuId) => {
        const btn = document.getElementById(btnId);
        const menu = document.getElementById(menuId);
        if(btn && menu) {
            btn.addEventListener('click', () => {
                const isBlock = menu.style.display === 'flex';
                menu.style.display = isBlock ? 'none' : 'flex';
            });
            document.addEventListener('click', (e) => {
                if (!btn.contains(e.target) && !menu.contains(e.target)) menu.style.display = 'none';
            });
        }
    };
    setupDropdown('add-element-btn', 'add-dropdown');
    setupDropdown('add-template-menu-btn', 'template-dropdown');
    setupDropdown('project-menu-btn', 'project-dropdown');
    setupDropdown('export-menu-btn', 'export-dropdown');

    // --- Editor State ---
    let baseWidth = 1242;
    let screenCount = 1;
    let targetWidth = 1242;
    let targetHeight = 2688;
    
    // Live-preview animation (auto-rotate tilt)
    let isAnimating = false;
    let autoRotate = false;
    let autoRotateAngle = 0;
    
    let bgType = 'gradient';
    let bgColor1 = '#FF6B6B';
    let bgColor2 = '#4ECDC4';
    let bgImgObj = null;
    let bgBlur = 0;
    let bgPresetIdx = -1;   // index into BG_PRESETS when bgType === 'preset'
    let bgAngle = 135;      // linear-gradient angle (degrees)

    // Curated premium backgrounds — rich multi-colour gradients & mesh blends that
    // make a mockup look high-end with one tap.
    const BG_PRESETS = [
        { name: 'Indigo',    type: 'linear', angle: 135, colors: ['#6a11cb', '#2575fc'] },
        { name: 'Sunset',    type: 'linear', angle: 135, colors: ['#ff6a00', '#ee0979'] },
        { name: 'Coral',     type: 'linear', angle: 135, colors: ['#FF512F', '#DD2476'] },
        { name: 'Mint',      type: 'linear', angle: 135, colors: ['#43e97b', '#38f9d7'] },
        { name: 'Sky',       type: 'linear', angle: 135, colors: ['#56CCF2', '#2F80ED'] },
        { name: 'Berry',     type: 'linear', angle: 135, colors: ['#8E2DE2', '#4A00E0'] },
        { name: 'Gold',      type: 'linear', angle: 135, colors: ['#F2994A', '#F2C94C'] },
        { name: 'Royal',     type: 'linear', angle: 135, colors: ['#141E30', '#243B55'] },
        { name: 'Candy',     type: 'linear', angle: 135, colors: ['#fc466b', '#3f5efb'] },
        { name: 'Dusk',      type: 'linear', angle: 135, colors: ['#0F2027', '#203A43', '#2C5364'] },
        { name: 'Emerald',   type: 'mesh', colors: ['#022c22', '#10b981', '#34d399', '#064e3b'] },
        { name: 'Aurora',    type: 'mesh', colors: ['#1a1a2e', '#e94560', '#0f3460', '#533483'] },
        { name: 'Pastel',    type: 'mesh', colors: ['#fbc2eb', '#a6c1ee', '#f6d365', '#fda085'] },
        { name: 'Vivid',     type: 'mesh', colors: ['#21d4fd', '#b721ff', '#2af598', '#fdfbfb'] },
        { name: 'Dark Pro',  type: 'mesh', colors: ['#0b0b14', '#3a1c71', '#d76d77', '#1f2937'] },
        { name: 'Soft',      type: 'mesh', colors: ['#ee9ca7', '#ffdde1', '#a18cd1', '#fbc2eb'] },
        { name: 'Ocean',     type: 'mesh', colors: ['#0b486b', '#3b8686', '#79bd9a', '#a8dba8'] },
        { name: 'Mono',      type: 'mesh', colors: ['#e0eafc', '#cfdef3', '#ffffff', '#f5f7fa'] }
    ];
    const MESH_POS = [[0.15, 0.2], [0.85, 0.15], [0.8, 0.85], [0.2, 0.9], [0.5, 0.45], [0.1, 0.6], [0.9, 0.55]];
    function bgPresetCss(p) {
        if (p.type === 'mesh') {
            const layers = p.colors.map((c, i) => {
                const [x, y] = MESH_POS[i % MESH_POS.length];
                return `radial-gradient(circle at ${Math.round(x * 100)}% ${Math.round(y * 100)}%, ${c}, transparent 60%)`;
            });
            return layers.join(', ') + `, ${p.colors[0]}`;
        }
        return `linear-gradient(${p.angle || 135}deg, ${p.colors.join(', ')})`;
    }
    function drawPresetBg(tCtx, w, h, p, angle) {
        if (p.type === 'mesh') {
            tCtx.fillStyle = p.colors[0]; tCtx.fillRect(0, 0, w, h);
            const R = Math.max(w, h);
            p.colors.forEach((c, i) => {
                const [px, py] = MESH_POS[i % MESH_POS.length];
                const g = tCtx.createRadialGradient(w * px, h * py, 0, w * px, h * py, R * 0.55);
                g.addColorStop(0, hexA(c, 0.95)); g.addColorStop(1, hexA(c, 0));
                tCtx.fillStyle = g; tCtx.fillRect(0, 0, w, h);
            });
        } else {
            const rad = (angle != null ? angle : (p.angle || 135)) * Math.PI / 180;
            const cx = w / 2, cy = h / 2, dx = Math.cos(rad), dy = Math.sin(rad);
            const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
            const g = tCtx.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
            const n = p.colors.length;
            p.colors.forEach((c, i) => g.addColorStop(n > 1 ? i / (n - 1) : 0, c));
            tCtx.fillStyle = g; tCtx.fillRect(0, 0, w, h);
        }
    }
    let grainEnabled = false;
    let grainVal = 35;
    // When true the render path skips the background fill so the device + text
    // are exported on a transparent canvas (PNG/WebP only).
    let exportTransparent = false;

    // Static monochrome noise tile used for the film-grain overlay
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 140; noiseCanvas.height = 140;
    (function () {
        const nctx = noiseCanvas.getContext('2d');
        const idata = nctx.createImageData(140, 140);
        for (let i = 0; i < idata.data.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            idata.data[i] = v; idata.data[i + 1] = v; idata.data[i + 2] = v; idata.data[i + 3] = 255;
        }
        nctx.putImageData(idata, 0, 0);
    })();

    // Hex -> rgba() with alpha (for mesh blobs that fade to transparent)
    function hexA(hex, a) {
        const h = (hex || '#000000').replace('#', '');
        const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
        const r = parseInt(n.substr(0, 2), 16) || 0, g = parseInt(n.substr(2, 2), 16) || 0, b = parseInt(n.substr(4, 2), 16) || 0;
        return `rgba(${r},${g},${b},${a})`;
    }

    let layers = []; // { id, type: 'text'|'image'|'sticker'|'shape', x, y, scale, ... }
    let selectedLayerId = null;

    let isDragging = false;
    let isScaling = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let originalLayerX = 0;
    let originalLayerY = 0;
    let originalScale = 1;
    let activeGuides = []; // alignment guide lines shown while dragging

    // Mobile-only whole-canvas zoom/pan: the device frames stay put, we just
    // magnify the entire preview so fine edits are possible on a small screen.
    let fitScale = 1, viewZoom = 1, viewPanX = 0, viewPanY = 0;

    // Device Frame Assets
    const notchImg = new Image(); notchImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 30"><path d="M0 0C10 0 15 5 15 15C15 25 25 30 35 30H125C135 30 145 25 145 15C145 5 150 0 160 0H0Z" fill="%23000000"/></svg>';
    const punchHoleImg = new Image(); punchHoleImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23000000"/></svg>';

    // Smart Sticker Assets
    const stickers = {
        'apple': new Image(), 'google': new Image(), 'stars': new Image(), 'cursor': new Image(),
        'ph': new Image(), 'ribbon': new Image(), 'arrow': new Image(), 'starburst': new Image(),
        'ring': new Image(), 'badge1': new Image(), 'badge2': new Image(), 'badge3': new Image(), 'tap': new Image()
    };
    
    stickers['apple'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><rect width="240" height="80" rx="16" fill="%23000"/><text x="120" y="45" font-family="Arial" font-weight="bold" font-size="24" fill="%23FFF" text-anchor="middle">Download on the</text><text x="120" y="70" font-family="Arial" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">App Store</text></svg>';
    stickers['google'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><rect width="240" height="80" rx="16" fill="%23000"/><text x="120" y="45" font-family="Arial" font-weight="bold" font-size="24" fill="%23FFF" text-anchor="middle">GET IT ON</text><text x="120" y="70" font-family="Arial" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">Google Play</text></svg>';
    stickers['stars'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="50" viewBox="0 0 250 50"><text x="125" y="40" font-family="Arial" font-size="50" fill="%23FFD700" text-anchor="middle">★★★★★</text></svg>';
    stickers['cursor'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="70" viewBox="0 0 50 70"><path d="M0,0 L0,70 L15,55 L30,85 L45,75 L30,45 L50,45 Z" fill="%23FFF" stroke="%23000" stroke-width="4"/></svg>';
    stickers['ph'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="60" viewBox="0 0 280 60"><rect width="280" height="60" rx="8" fill="%23DA552F"/><circle cx="30" cy="30" r="15" fill="%23FFF"/><text x="30" y="37" font-family="Arial" font-weight="bold" font-size="20" fill="%23DA552F" text-anchor="middle">P</text><text x="150" y="36" font-family="Arial" font-weight="bold" font-size="22" fill="%23FFF" text-anchor="middle">FEATURED ON PRODUCT HUNT</text></svg>';
    stickers['ribbon'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60"><path d="M0,0 L200,0 L180,30 L200,60 L0,60 Z" fill="%23EAB308"/><text x="90" y="38" font-family="Arial" font-weight="bold" font-size="24" fill="%23FFF" text-anchor="middle">TOP RATED</text></svg>';
    stickers['arrow'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M20,80 Q50,20 80,40 M70,25 L85,42 L65,55" fill="none" stroke="%23EF4444" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    stickers['starburst'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M50,0 L60,40 L100,50 L60,60 L50,100 L40,60 L0,50 L40,40 Z" fill="%23FBBF24"/></svg>';
    stickers['ring'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><circle cx="110" cy="110" r="96" fill="none" stroke="%2310B981" stroke-width="12"/></svg>';
    stickers['badge1'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="%2310B981"/><text x="60" y="83" font-family="Arial" font-weight="bold" font-size="62" fill="%23FFF" text-anchor="middle">1</text></svg>';
    stickers['badge2'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="%2310B981"/><text x="60" y="83" font-family="Arial" font-weight="bold" font-size="62" fill="%23FFF" text-anchor="middle">2</text></svg>';
    stickers['badge3'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="%2310B981"/><text x="60" y="83" font-family="Arial" font-weight="bold" font-size="62" fill="%23FFF" text-anchor="middle">3</text></svg>';
    stickers['tap'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="36" fill="%2310B981"/><circle cx="90" cy="90" r="68" fill="none" stroke="%2310B981" stroke-width="8" opacity="0.5"/></svg>';

    // --- LocalStorage Auto-Save System ---
    function loadPrefs() {
        try {
            const prefs = JSON.parse(localStorage.getItem('riyo_mockup_prefs'));
            if (prefs) {
                if (prefs.frameStyle) frameSelect.value = prefs.frameStyle;
                // 'image' can't be restored (the uploaded image is gone) → would render blank; fall back to gradient.
                if (prefs.bgType) bgType = (prefs.bgType === 'image') ? 'gradient' : prefs.bgType;
                if (prefs.bgColor1) bgColor1 = prefs.bgColor1;
                if (prefs.bgColor2) bgColor2 = prefs.bgColor2;
                if (typeof prefs.grain === 'boolean') grainEnabled = prefs.grain;
                if (typeof prefs.grainVal === 'number') grainVal = prefs.grainVal;
                if (prefs.preset) presetSelect.value = prefs.preset;
                if (prefs.screens) screensSelect.value = prefs.screens;
                if (typeof prefs.bgPresetIdx === 'number') bgPresetIdx = prefs.bgPresetIdx;
                if (typeof prefs.bgAngle === 'number') bgAngle = prefs.bgAngle;
                if (bgType === 'preset' && !BG_PRESETS[bgPresetIdx]) bgType = 'gradient'; // stale index guard
            }
        } catch(e) { console.error('Failed to load Mockup prefs', e); }
    }

    function savePrefs() {
        const prefs = {
            frameStyle: frameSelect.value,
            bgType: bgType,
            bgColor1: bgColor1,
            bgColor2: bgColor2,
            grain: grainEnabled,
            grainVal: grainVal,
            preset: presetSelect.value,
            screens: screensSelect.value,
            bgPresetIdx: bgPresetIdx,
            bgAngle: bgAngle
        };
        try { localStorage.setItem('riyo_mockup_prefs', JSON.stringify(prefs)); } catch (e) { /* quota — ignore */ }
    }
    // render() runs on every frame (and during auto-rotate/drag), so coalesce saves.
    let _saveTimer = null;
    function saveSoon() { clearTimeout(_saveTimer); _saveTimer = setTimeout(savePrefs, 400); }

    // --- Initialization ---
    function init() {
        loadPrefs();
        if (isMobileViewport()) screensSelect.value = '1'; // mobile is locked to a single screen
        syncBgControls();
        updateCanvasSize();
        window.addEventListener('resize', scaleWrapperToFit);
        // Open on a finished template so the canvas is never blank.
        // Mobile starts on a clean single-screen hero (panoramas are desktop-only);
        // desktop keeps the rich 5-screen showcase default.
        if (layers.length === 0) loadTemplate(isMobileViewport() ? 'pro-light' : 'apple-minimal');
        else render();
    }

    function generateId() { return Math.random().toString(36).substr(2, 9); }

    // --- Canvas Sizing ---
    let canvasInitialized = false;
    // Panorama (multi-screen) only reads well on tall phone screenshots — a 5-wide
    // strip of iPads or square social posts just sprawls. Gate it to portrait phones.
    function isPanoramaFormat() {
        const [w, h] = presetSelect.value.split('x').map(Number);
        return (h / w) >= 1.6;
    }
    function isMobileViewport() {
        return !!(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
    }
    function syncPanoramaAvailability() {
        // Multi-screen panoramas are a desktop feature — on mobile lock to one screen
        // (the composer builds one at a time). Desktop still gates to tall phone formats.
        const mobile = isMobileViewport();
        const allow = isPanoramaFormat() && !mobile;
        Array.from(screensSelect.options).forEach(o => {
            if (o.value !== '1') { o.disabled = !allow; o.hidden = !allow; }
        });
        // Force back to 1 only on desktop non-tall formats; on mobile just disable the
        // options (don't yank a value a template may have set, to avoid breakage).
        if (!isPanoramaFormat() && !mobile && screensSelect.value !== '1') screensSelect.value = '1';
        screensSelect.style.opacity = allow ? '1' : '0.55';
        screensSelect.title = allow
            ? 'Lay your screenshots out as a continuous multi-screen panorama'
            : 'Panorama is for tall phone screenshots — single screen for this format';
    }

    function updateCanvasSize() {
        const [w, h] = presetSelect.value.split('x').map(Number);
        baseWidth = w;
        syncPanoramaAvailability();
        screenCount = parseInt(screensSelect.value);
        targetWidth = baseWidth * screenCount;
        targetHeight = h;
        
        // Suppress the size transition on the very first layout so the wrapper
        // snaps to its dimensions instead of animating from 0 (which registers as
        // cumulative layout shift on load). Preset changes after init still animate.
        const firstSize = !canvasInitialized;
        if (firstSize) wrapper.style.transition = 'none';

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        wrapper.style.width = `${targetWidth}px`;
        wrapper.style.height = `${targetHeight}px`;

        if (canvasInitialized) {
            // Removed aggressive auto-centering so users can manually position things
            updatePropsPanel();
        }
        canvasInitialized = true;

        viewZoom = 1; viewPanX = 0; viewPanY = 0; // a new canvas size starts at fit
        scaleWrapperToFit();
        render();

        if (firstSize) requestAnimationFrame(() => { wrapper.style.transition = ''; });
    }

    presetSelect.addEventListener('change', updateCanvasSize);
    if(screensSelect) screensSelect.addEventListener('change', updateCanvasSize);

    function scaleWrapperToFit() {
        const container = document.getElementById('canvas-container');
        const padding = 40;
        const availableW = container.clientWidth - padding;
        const availableH = container.clientHeight - padding;

        const scaleW = availableW / targetWidth;
        const scaleH = availableH / targetHeight;
        // Guard against a transient zero/negative container (mid-layout, narrow splits)
        // flipping or hiding the canvas.
        fitScale = Math.max(0.02, Math.min(scaleW, scaleH));
        clampViewPan();
        applyWrapperTransform();
        updateZoomUI();
    }

    // The wrapper holds the canvas at full resolution; this combines the fit-scale
    // with the mobile view zoom + pan into a single transform.
    function applyWrapperTransform() {
        const total = fitScale * viewZoom;
        wrapper.style.transform = `translate(${viewPanX}px, ${viewPanY}px) scale(${total})`;
    }

    // Stop a zoomed canvas being panned entirely out of the viewport.
    function clampViewPan() {
        if (viewZoom <= 1) { viewPanX = 0; viewPanY = 0; return; }
        const c = document.getElementById('canvas-container');
        const total = fitScale * viewZoom;
        const ovX = Math.max(0, (targetWidth * total - c.clientWidth) / 2 + 24);
        const ovY = Math.max(0, (targetHeight * total - c.clientHeight) / 2 + 24);
        viewPanX = Math.max(-ovX, Math.min(ovX, viewPanX));
        viewPanY = Math.max(-ovY, Math.min(ovY, viewPanY));
    }

    // Snap back to a 1:1 fit (Fit button, and whenever the canvas itself changes).
    function resetView() {
        viewZoom = 1; viewPanX = 0; viewPanY = 0;
        applyWrapperTransform();
        updateZoomUI();
    }

    // Show the Fit pill only on mobile while zoomed in, reflecting the current %.
    function updateZoomUI() {
        if (!viewResetBtn) return;
        const show = isMobileViewport() && viewZoom > 1.01;
        viewResetBtn.style.display = show ? 'flex' : 'none';
        if (show) viewResetBtn.textContent = 'Fit · ' + Math.round(viewZoom * 100) + '%';
    }

    // --- Layers API ---
    function addTextLayer() { addTextPreset('headline'); }

    // Is the current background light? (so headline text auto-contrasts)
    function bgIsLight() {
        let col = bgColor1;
        if (bgType === 'preset' && BG_PRESETS[bgPresetIdx]) col = BG_PRESETS[bgPresetIdx].colors[0];
        if (bgType === 'transparent') return true; // exported on white-ish surfaces
        return hexLuminance(col) > 0.58;
    }

    // Pre-styled marketing text, auto-contrasted and positioned for App Store shots.
    function addTextPreset(kind) {
        const light = bgIsLight();
        const ink = light ? '#0b0b0d' : '#ffffff';
        const muted = light ? 'rgba(11,11,13,0.72)' : 'rgba(255,255,255,0.82)';
        const base = {
            id: generateId(), type: 'text', fontFamily: 'Inter', textAlign: 'center',
            shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0,
            x: targetWidth / 2, width: Math.min(1100, baseWidth * 0.9)
        };
        let layer;
        if (kind === 'subtitle') {
            layer = Object.assign(base, { content: 'Your supporting subtitle goes here', color: muted, fontWeight: '500', fontSize: 54, height: 180, y: 470 });
        } else if (kind === 'label') {
            layer = Object.assign(base, { content: 'NEW', color: light ? '#0e9f6e' : '#34d399', fontWeight: '700', fontSize: 40, height: 90, y: 180 });
        } else if (kind === 'callout') {
            layer = Object.assign(base, { content: 'New feature', color: '#ffffff', fontWeight: '700', fontSize: 46, height: 110, y: targetHeight / 2, pill: true, pillColor: '#10B981' });
        } else if (kind === 'step') {
            layer = Object.assign(base, { content: '1  Tap to begin', color: '#ffffff', fontWeight: '700', fontSize: 44, height: 104, y: targetHeight / 2, pill: true, pillColor: '#111827' });
        } else {
            layer = Object.assign(base, { content: 'Your headline here', color: ink, fontWeight: '800', fontSize: 110, height: 280, y: 300 });
        }
        layers.push(layer);
        selectedLayerId = layer.id;
        updatePropsPanel();
        render();
    }

    // Canonical on-screen dimensions per device frame, so an added photo takes the
    // device's real proportions (and is cropped to fit) instead of the device
    // stretching to match the photo's shape. "none" keeps the photo's natural size.
    const DEVICE_SCREENS = {
        iphone: { w: 1080, h: 2340 }, android: { w: 1080, h: 2340 },
        pixel:  { w: 1080, h: 2340 }, galaxy:  { w: 1080, h: 2340 },
        clay:   { w: 1080, h: 2340 }, ipad:    { w: 1640, h: 2160 },
        macbook:{ w: 1200, h: 800 },  browser: { w: 1280, h: 800 }
    };
    function naturalDims(img) {
        return {
            w: (img && (img.naturalWidth || img.videoWidth || img.width)) || 1080,
            h: (img && (img.naturalHeight || img.videoHeight || img.height)) || 2340
        };
    }
    // Target screen size for a frame: the device's fixed ratio, or the photo's own
    // size when there is no device frame.
    function frameDims(frameStyle, img) { return DEVICE_SCREENS[frameStyle] || naturalDims(img); }

    // Draw an image to *cover* a screen rect (fill it, crop the overflow) with an
    // optional zoom and pan, so a screenshot of any aspect ratio sits cleanly inside
    // the frame without distortion. The caller clips to the screen first.
    function drawCover(tCtx, img, sx, sy, sw, sh, layer) {
        const n = naturalDims(img);
        const zoom = Math.max(1, (layer && layer.imgZoom) || 1);
        const cover = Math.max(sw / n.w, sh / n.h) * zoom;
        const dw = n.w * cover, dh = n.h * cover;
        const ox = (layer && layer.imgOffsetX) || 0; // -1..1 pan within the crop range
        const oy = (layer && layer.imgOffsetY) || 0;
        const dx = sx + (sw - dw) / 2 + ox * (dw - sw) / 2;
        const dy = sy + (sh - dh) / 2 + oy * (dh - sh) / 2;
        tCtx.drawImage(img, dx, dy, dw, dh);
    }

    function addImageLayer(imgObj, offset = 0) {
        const frameStyle = 'iphone';
        const dim = frameDims(frameStyle, imgObj);
        const initialScale = Math.min(1.5, (targetHeight * 0.85) / dim.h);
        layers.push({
            id: generateId(), type: 'image', img: imgObj, frameStyle,
            x: (targetWidth / 2) + (offset * 80), y: (targetHeight / 2) + (offset * 80),
            scale: initialScale, width: dim.w, height: dim.h,
            imgZoom: 1, imgOffsetX: 0, imgOffsetY: 0,
            rotation: 0, persY: 0, shadowBlur: 80, shadowOp: 50, hasGlare: false, hasFloorShadow: false
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function addStickerLayer(stickerId) {
        const imgObj = stickers[stickerId];
        layers.push({
            id: generateId(), type: 'sticker', stickerId: stickerId, img: imgObj,
            x: targetWidth / 2, y: targetHeight / 2, scale: 2.0,
            width: imgObj.width || 240, height: imgObj.height || 80,
            rotation: 0, persY: 0, shadowBlur: 40, shadowOp: 30
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function addShapeLayer(shapeType) {
        layers.push({
            id: generateId(), type: 'shape', shapeType: shapeType, color: '#38bdf8',
            x: targetWidth / 2, y: targetHeight / 2, scale: 1.0,
            width: baseWidth, height: baseWidth, rotation: 0, radius: 0
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function loadTemplate(type) {
        layers = [];
        selectedLayerId = null;

        const phApp = new Image(); phApp.onload = render; phApp.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340"><rect width="1080" height="2340" fill="%23222"/><text x="540" y="1170" font-family="Arial" font-size="50" fill="%23555" text-anchor="middle">App Screen</text></svg>';
        const phMac = new Image(); phMac.onload = render; phMac.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="%23222"/><text x="600" y="400" font-family="Arial" font-size="40" fill="%23555" text-anchor="middle">MacBook Screen</text></svg>';

        // ==========================================
        // PREMIUM HERO TEMPLATES — premium bg + coloured 3D device + headline
        // ==========================================
        // Reads the chosen Screens count and lays the look out across that many
        // panels — one framed device + headline + subtitle per screen, sharing one
        // continuous background. `copy` cycles if there are fewer lines than screens.
        const buildHero = (presetIdx, angle, frame, frameColor, persY, copy) => {
            let n = parseInt(screensSelect.value) || 1; n = Math.max(1, Math.min(5, n));
            if (isMobileViewport()) n = 1; // mobile builds one screen at a time
            presetSelect.value = '1290x2796'; screensSelect.value = String(n); updateCanvasSize();
            bgType = 'preset'; bgPresetIdx = presetIdx; bgAngle = angle;
            const light = hexLuminance(BG_PRESETS[presetIdx].colors[0]) > 0.58;
            const ink = light ? '#0b0b0d' : '#ffffff';
            const muted = light ? 'rgba(11,11,13,0.72)' : 'rgba(255,255,255,0.82)';
            for (let i = 0; i < n; i++) {
                const cx = baseWidth * (i + 0.5);
                const c = copy[i % copy.length];
                layers.push({ id: generateId(), type: 'text', content: c.h, color: ink, fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 104, width: 1140, height: 280, x: cx, y: 330 });
                layers.push({ id: generateId(), type: 'text', content: c.s, color: muted, fontFamily: 'Inter', fontWeight: '500', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 50, width: 1080, height: 160, x: cx, y: 520 });
                layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: frame, frameColor: frameColor, scale: 0.82, width: 1080, height: 2340, rotation: 0, persY: persY, persX: 0, shadowBlur: 130, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, x: cx, y: 1760 });
            }
        };
        const HERO_COPY = {
            'pro-light':   [{h:'Designed to impress',s:'Your tagline goes right here'},{h:'Beautifully simple',s:'Everything in its right place'},{h:'Built for clarity',s:'See more, do more, think less'},{h:'Effortless by design',s:'Powerful where it counts'},{h:'Start in seconds',s:'No setup, no clutter'}],
            'pro-indigo':  [{h:'Built for speed',s:"Everything you need, nothing you don't"},{h:'Move faster',s:'From idea to done in moments'},{h:'Stay in flow',s:'No friction, no waiting'},{h:'Work smarter',s:'Automations do the heavy lifting'},{h:'Ship with confidence',s:'Reliable, every single time'}],
            'pro-aurora':  [{h:'Meet the future',s:'Beautifully simple, seriously powerful'},{h:'Reimagined',s:'A fresh take on what you do daily'},{h:'Made to delight',s:'Every detail, considered'},{h:'Powerfully simple',s:'Depth without the complexity'},{h:'Yours to explore',s:'Endless possibilities, one tap away'}],
            'pro-emerald': [{h:'Private by design',s:'Your data never leaves your device'},{h:'Secure by default',s:'Encrypted, end to end'},{h:"You're in control",s:'No tracking, no surprises'},{h:'Built on trust',s:'Transparent and open'},{h:'Peace of mind',s:'Privacy you can actually verify'}],
            'pro-sunset':  [{h:'Go further',s:'The app that keeps up with you'},{h:'Chase the day',s:'Momentum from morning to night'},{h:'Always with you',s:'On every device you own'},{h:'Made to move',s:'Fast, fluid, fun'},{h:'Reach higher',s:'Your goals, within reach'}],
            'pro-dark':    [{h:'Pro tools, zero clutter',s:'Crafted for people who ship'},{h:'Power, refined',s:"Everything you need, nothing you don't"},{h:'Built for focus',s:'Distraction-free by design'},{h:'Serious about speed',s:'Engineered to fly'},{h:'Made for makers',s:'Works as hard as you do'}]
        };
        if (type === 'pro-light')        buildHero(17, 135, 'iphone', '#0b0b0d', 0,   HERO_COPY['pro-light']);
        else if (type === 'pro-indigo')  buildHero(0, 135,  'iphone', '#ece9e2', 14,  HERO_COPY['pro-indigo']);
        else if (type === 'pro-aurora')  buildHero(11, 135, 'iphone', '#0b0b0d', -16, HERO_COPY['pro-aurora']);
        else if (type === 'pro-emerald') buildHero(10, 135, 'iphone', '#0b0b0d', 0,   HERO_COPY['pro-emerald']);
        else if (type === 'pro-sunset')  buildHero(1, 135,  'iphone', '#0b0b0d', 12,  HERO_COPY['pro-sunset']);
        else if (type === 'pro-dark')    buildHero(14, 135, 'iphone', '#d6d7da', -10, HERO_COPY['pro-dark']);

        // ==========================================
        // MULTI-DEVICE SCENES — one app shown across a laptop / tablet / phone
        // on a premium landscape background. Each device is a separate layer, so
        // any of them can take its own screenshot via Replace Screenshot.
        // ==========================================
        const DEVICE_DIMS = {
            macbook: [1200, 800], browser: [1200, 800], ipad: [1500, 2000],
            iphone: [1080, 2340], pixel: [1080, 2340], galaxy: [1080, 2340], android: [1080, 2340]
        };
        const buildScene = (presetIdx, head, sub, devices) => {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'preset'; bgPresetIdx = presetIdx; bgAngle = 135;
            const light = hexLuminance(BG_PRESETS[presetIdx].colors[0]) > 0.58;
            const ink = light ? '#0b0b0d' : '#ffffff';
            const muted = light ? 'rgba(11,11,13,0.72)' : 'rgba(255,255,255,0.82)';
            if (head) layers.push({ id: generateId(), type: 'text', content: head, color: ink, fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 76, width: 1500, height: 150, x: baseWidth / 2, y: 118 });
            if (sub) layers.push({ id: generateId(), type: 'text', content: sub, color: muted, fontFamily: 'Inter', fontWeight: '500', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 38, width: 1300, height: 100, x: baseWidth / 2, y: 212 });
            devices.forEach(d => {
                const [w, h] = DEVICE_DIMS[d.frame] || [1080, 2340];
                const img = (d.frame === 'macbook' || d.frame === 'browser') ? phMac : phApp;
                layers.push({ id: generateId(), type: 'image', img, frameStyle: d.frame, x: d.x, y: d.y, scale: d.scale, width: w, height: h, rotation: 0, persY: d.persY || 0, persX: 0, shadowBlur: d.shadowBlur || 120, shadowOp: d.shadowOp || 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            });
        };
        if (type === 'scene-laptop-phone') buildScene(0, 'One app. Every device.', 'Pixel-perfect from desktop to pocket.', [
            { frame: 'macbook', x: 760, y: 640, scale: 0.92, persY: 8 },
            { frame: 'iphone', x: 1500, y: 670, scale: 0.31, persY: -10, shadowBlur: 90 }
        ]);
        else if (type === 'scene-ecosystem') buildScene(11, 'Works everywhere.', 'One seamless experience across all your screens.', [
            { frame: 'macbook', x: 960, y: 650, scale: 0.80, persY: 0 },
            { frame: 'ipad', x: 410, y: 690, scale: 0.33, persY: 16 },
            { frame: 'iphone', x: 1520, y: 700, scale: 0.29, persY: -16, shadowBlur: 90 }
        ]);
        else if (type === 'scene-tablet-phone') buildScene(10, 'Designed for every screen.', 'Beautiful on tablet and phone alike.', [
            { frame: 'ipad', x: 790, y: 675, scale: 0.37, persY: 8 },
            { frame: 'iphone', x: 1330, y: 690, scale: 0.30, persY: -12, shadowBlur: 90 }
        ]);
        else if (type === 'scene-desktop-phone') buildScene(14, 'From desktop to pocket.', 'Your product, ready on any device.', [
            { frame: 'browser', x: 800, y: 650, scale: 0.92, persY: 6 },
            { frame: 'iphone', x: 1500, y: 670, scale: 0.31, persY: -10, shadowBlur: 90 }
        ]);

        // ==========================================
        // APPLE APP STORE — Premium Set (1242x2688)
        // ==========================================
        else if (type === 'apple-minimal') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#f5f5f7';
            const tOpt = { type: 'text', color: '#1d1d1f', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 78, width: 1050, height: 240, y: 360 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.92, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 90, shadowOp: 18, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1620 };
            const t = ['Everything in one place.', 'Beautifully simple.', 'Designed for focus.', 'Private by default.', 'Get started free.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-gradient') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#6a11cb'; bgColor2 = '#2575fc';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 20, scale: 1, rotation: 0, fontSize: 90, width: 1050, height: 280, y: 380 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.9, width: 1080, height: 2340, rotation: 0, persY: 12, shadowBlur: 140, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1650 };
            const t = ['Power in your pocket.', 'Faster than ever.', 'Made to move.', 'Insights that matter.', 'Start today.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-darkpro') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0b0f17'; bgColor2 = '#020409';
            const tOpt = { type: 'text', color: '#34d399', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: '#34d399', shadowBlur: 30, scale: 1, rotation: 0, fontSize: 80, width: 1050, height: 240, y: 360 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.9, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 160, shadowOp: 70, shadowColor: '#34d399', hasGlare: true, hasFloorShadow: false, y: 1640 };
            const t = ['Precision, engineered.', 'Real-time control.', 'Bank-grade security.', 'Built to scale.', 'Upgrade to Pro.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-panorama') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#111827'; bgColor2 = '#0b1220';
            layers.push({ id: generateId(), type: 'text', content: 'GO FURTHER', color: 'rgba(255,255,255,0.06)', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 520, width: 9000, height: 700, x: targetWidth/2, y: 1344 });
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 54, width: 1000, height: 160, y: 320 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.82, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 120, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1750 };
            const t = ['Set your goals', 'Track progress', 'Stay consistent', 'Crush milestones', 'Go further'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-lean') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#ff9a9e'; bgColor2 = '#fecfef';
            const tOpt = { type: 'text', color: '#4a154b', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 74, width: 1050, height: 240, y: 400 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.85, width: 1080, height: 2340, rotation: 0, shadowBlur: 120, shadowOp: 35, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false, y: 1620 };
            const t = ['Share the moment.', 'Connect instantly.', 'Your story, yours.', 'Find your people.', 'Join the fun.'];
            const tilts = [15, -15, 15, -15, 15];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt, persY: tilts[i] });
        }
        else if (type === 'apple-spotlight') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1f2937'; bgColor2 = '#000000';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '300', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 62, width: 1050, height: 200, y: 2350 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.95, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 180, shadowOp: 70, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1450 };
            const t = ['Introducing.', 'Crafted to perfection.', 'Every detail counts.', 'Simply powerful.', 'Experience it.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-sport') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f12711'; bgColor2 = '#f5af19';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, scale: 1, rotation: -6, fontSize: 92, width: 1100, height: 300, y: 380 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.88, width: 1080, height: 2340, rotation: -8, persY: 10, shadowBlur: 130, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1680 };
            const t = ['GO HARDER.', 'TRACK EVERY REP.', 'BEAT YOUR BEST.', 'TRAIN SMARTER.', 'WIN THE DAY.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-business') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1e3c72'; bgColor2 = '#2a5298';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 68, width: 1050, height: 240, y: 350 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.9, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 100, shadowOp: 40, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1640 };
            const t = ['Run your business better.', 'Insights in real time.', 'Collaborate seamlessly.', 'Secure and compliant.', 'Scale with confidence.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-reviews') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#fafafa';
            const tOpt = { type: 'text', color: '#111827', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 56, width: 1050, height: 240, y: 520 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.82, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 90, shadowOp: 20, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1720 };
            const q = ['"Changed how I work."', '"A daily essential."', '"Worth every penny."', '"Simply the best."', '"Five stars, easily."'];
            for (let i = 0; i < 5; i++) {
                layers.push({ id: generateId(), type: 'sticker', stickerId: 'stars', img: stickers['stars'], x: baseWidth*(i+0.5), y: 280, scale: 1.4, width: 250, height: 50, rotation: 0 });
                layers.push({ id: generateId(), content: q[i], x: baseWidth*(i+0.5), ...tOpt });
                layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
            }
        }
        else if (type === 'apple-handheld') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#c9d6ff'; bgColor2 = '#e2e2e2';
            const tOpt = { type: 'text', color: '#1f2937', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 76, width: 1050, height: 240, y: 360 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.95, width: 1080, height: 2340, rotation: -6, persY: 24, shadowBlur: 150, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1680 };
            const t = ['Right at your fingertips.', 'Take it anywhere.', 'Tap. Done.', 'On the go.', 'Try it now.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }

        // ==========================================
        // GOOGLE PLAY — Premium Set (1080x1920)
        // ==========================================
        else if (type === 'gplay-clean') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#f1f3f4';
            const tOpt = { type: 'text', color: '#202124', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 64, width: 950, height: 220, y: 280 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 90, shadowOp: 20, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1350 };
            const t = ['Simple. Powerful.', 'All your tools.', 'Work anywhere.', 'Stay in sync.', 'Free to start.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-cinematic') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f2027'; bgColor2 = '#203a43';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 58, width: 950, height: 240, y: 250 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 120, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1380 };
            const t = ['Cinematic by\ndefault', 'Capture every\nmoment', 'Edit like\na pro', 'Share\ninstantly', 'Go further'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-material') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#d7e3ff'; bgColor2 = '#e8def8';
            const tOpt = { type: 'text', color: '#1b1b1f', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 60, width: 950, height: 220, y: 300 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'clay', scale: 0.72, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 80, shadowOp: 18, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true, y: 1380 };
            const t = ['Made for you.', 'Personal & private.', 'Smooth & fast.', 'Beautifully native.', 'Get it on Play.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-benefit') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#11998e'; bgColor2 = '#38ef7d';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 12, scale: 1, rotation: 0, fontSize: 64, width: 950, height: 240, y: 300 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 0, persY: 8, shadowBlur: 120, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1380 };
            const t = ['Save hours daily.', 'Automate the boring.', 'See it all at once.', 'Built for teams.', 'Try it free.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-cascade') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#fbc2eb'; bgColor2 = '#a6c1ee';
            const tOpt = { type: 'text', color: '#1e293b', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 60, width: 950, height: 220, y: 280 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'clay', scale: 0.66, width: 1080, height: 2340, rotation: 0, shadowBlur: 120, shadowOp: 30, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false, y: 1320 };
            const t = ['Beautiful design', 'Intuitive flow', 'Powerful tools', 'Seamless sync', 'Download today'];
            const tilts = [15, -15, 15, -15, 15];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt, persY: tilts[i] });
        }
        else if (type === 'gplay-neon') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#3a1c71'; bgColor2 = '#d76d77';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'JetBrains Mono', fontWeight: '800', textAlign: 'center', shadowColor: '#000000', shadowBlur: 15, scale: 1, rotation: 0, fontSize: 68, width: 950, height: 200, y: 250 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 8, persY: 12, shadowBlur: 150, shadowOp: 80, shadowColor: '#d76d77', hasGlare: true, hasFloorShadow: false, y: 1380 };
            const t = ['LEVEL UP', 'NO LIMITS', 'PLAY FREE', 'JOIN GUILDS', 'WIN BIG'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-spotlight') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1e293b'; bgColor2 = '#020617';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '300', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 54, width: 950, height: 180, y: 1720 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.75, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 180, shadowOp: 70, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1150 };
            const t = ['Introducing.', 'Refined.', 'Powerful.', 'Effortless.', 'Yours.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-sport') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f12711'; bgColor2 = '#f5af19';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, scale: 1, rotation: -6, fontSize: 70, width: 980, height: 260, y: 280 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.7, width: 1080, height: 2340, rotation: -8, persY: 10, shadowBlur: 130, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1400 };
            const t = ['GO HARDER.', 'TRACK IT ALL.', 'BEAT YOUR BEST.', 'TRAIN SMART.', 'WIN TODAY.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-reviews') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#fafafa';
            const tOpt = { type: 'text', color: '#202124', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 50, width: 950, height: 200, y: 420 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.64, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 90, shadowOp: 20, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1450 };
            const q = ['"Love this app!"', '"Use it every day."', '"Best in class."', '"Highly recommend."', '"Five stars."'];
            for (let i = 0; i < 5; i++) {
                layers.push({ id: generateId(), type: 'sticker', stickerId: 'stars', img: stickers['stars'], x: baseWidth*(i+0.5), y: 220, scale: 1.4, width: 250, height: 50, rotation: 0 });
                layers.push({ id: generateId(), content: q[i], x: baseWidth*(i+0.5), ...tOpt });
                layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
            }
        }
        else if (type === 'gplay-handheld') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#c9d6ff'; bgColor2 = '#e2e2e2';
            const tOpt = { type: 'text', color: '#1f2937', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 64, width: 950, height: 220, y: 300 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.74, width: 1080, height: 2340, rotation: -6, persY: 22, shadowBlur: 150, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1420 };
            const t = ['In your hand.', 'On the go.', 'Tap. Done.', 'Anywhere.', 'Try it now.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }

        // ==========================================
        // SQUARE POST — Premium Set (1080x1080)
        // ==========================================
        else if (type === 'sq-announce') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#0052ff';
            layers.push({ id: generateId(), type: 'text', content: 'NEW', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 300, scale: 1, rotation: 0, fontSize: 300, width: 1000, height: 380 });
            layers.push({ id: generateId(), type: 'text', content: 'Big feature, zero effort.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 560, scale: 1, rotation: 0, fontSize: 62, width: 900, height: 160 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'clay', x: baseWidth/2, y: 880, scale: 0.44, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 120, shadowOp: 50, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true });
        }
        else if (type === 'sq-feature') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#6a11cb'; bgColor2 = '#2575fc';
            layers.push({ id: generateId(), type: 'text', content: 'One tap. Done.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 15, x: baseWidth/2, y: 250, scale: 1, rotation: 0, fontSize: 80, width: 950, height: 180 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 720, scale: 0.5, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 130, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-quote') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f2027'; bgColor2 = '#203a43';
            layers.push({ id: generateId(), type: 'shape', shapeType: 'circle', color: '#f5af19', x: 250, y: 540, width: 600, height: 600, scale: 1, rotation: 0, shadowBlur: 200, shadowColor: '#f12711', opacity: 30 });
            layers.push({ id: generateId(), type: 'text', content: '"This app completely\nchanged how I work."', color: '#ffffff', fontFamily: 'Inter', fontWeight: '600', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 110, y: 380, scale: 1, rotation: 0, fontSize: 48, width: 560, height: 300 });
            layers.push({ id: generateId(), type: 'text', content: '★★★★★', color: '#f5af19', fontFamily: 'Inter', fontWeight: '900', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 110, y: 640, scale: 1, rotation: 0, fontSize: 60, width: 400, height: 100 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 820, y: 600, scale: 0.45, width: 1080, height: 2340, rotation: 0, persY: 15, shadowBlur: 100, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-compare') {
            presetSelect.value = '1080x1080'; screensSelect.value = '2'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#ffffff'; bgColor2 = '#111111';
            layers.push({ id: generateId(), type: 'text', content: 'BEFORE', color: '#000000', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 200, scale: 1, rotation: 0, fontSize: 70, width: 500, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 660, scale: 0.42, width: 1080, height: 2340, rotation: 0, persY: -10, shadowBlur: 80, shadowOp: 30, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'text', content: 'AFTER', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth*1.5, y: 200, scale: 1, rotation: 0, fontSize: 70, width: 500, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth*1.5, y: 660, scale: 0.42, width: 1080, height: 2340, rotation: 0, persY: 10, shadowBlur: 80, shadowOp: 80, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
        }
        else if (type === 'sq-promo') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f12711'; bgColor2 = '#f5af19';
            layers.push({ id: generateId(), type: 'text', content: 'LAUNCH WEEK', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 15, x: baseWidth/2, y: 230, scale: 1, rotation: 0, fontSize: 92, width: 1000, height: 160 });
            layers.push({ id: generateId(), type: 'text', content: 'Limited-time offer inside.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 370, scale: 1, rotation: 0, fontSize: 42, width: 900, height: 100 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 760, scale: 0.48, width: 1080, height: 2340, rotation: 0, persY: -8, shadowBlur: 130, shadowOp: 55, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-minimal') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#f5f5f7';
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'clay', x: baseWidth/2, y: 470, scale: 0.5, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 90, shadowOp: 18, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'text', content: 'Designed for you.', color: '#1d1d1f', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 940, scale: 1, rotation: 0, fontSize: 46, width: 800, height: 100 });
        }
        else if (type === 'sq-gradient') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#ff9a9e'; bgColor2 = '#fecfef';
            layers.push({ id: generateId(), type: 'text', content: 'Made to delight.', color: '#4a154b', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 240, scale: 1, rotation: 0, fontSize: 76, width: 900, height: 160 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 720, scale: 0.48, width: 1080, height: 2340, rotation: -8, persY: 18, shadowBlur: 120, shadowOp: 40, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-stat') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#11998e'; bgColor2 = '#38ef7d';
            layers.push({ id: generateId(), type: 'text', content: '1M+', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 15, x: baseWidth/2, y: 300, scale: 1, rotation: 0, fontSize: 260, width: 1000, height: 320 });
            layers.push({ id: generateId(), type: 'text', content: 'downloads and counting', color: '#ffffff', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 560, scale: 1, rotation: 0, fontSize: 48, width: 900, height: 100 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'clay', x: baseWidth/2, y: 870, scale: 0.4, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 110, shadowOp: 45, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true });
        }

        // ==========================================
        // LANDSCAPE — Premium Set (1920x1080)
        // ==========================================
        else if (type === 'ls-hero') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#ffffff'; bgColor2 = '#f1f5f9';
            layers.push({ id: generateId(), type: 'shape', shapeType: 'rectangle', color: '#0f172a', x: 480, y: 540, width: 960, height: 1080, scale: 1, rotation: 0, shadowBlur: 0, shadowColor: '#000000', opacity: 100 });
            layers.push({ id: generateId(), type: 'text', content: 'Transform your\nworkflow.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 200, y: 380, scale: 1, rotation: 0, fontSize: 78, width: 700, height: 300 });
            layers.push({ id: generateId(), type: 'text', content: 'The fastest way to build and ship.', color: '#94a3b8', fontFamily: 'Inter', fontWeight: '400', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 200, y: 660, scale: 1, rotation: 0, fontSize: 34, width: 600, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: 1320, y: 550, scale: 0.72, width: 1200, height: 800, rotation: 0, persY: -15, shadowBlur: 120, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-macbook') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f172a'; bgColor2 = '#1e1b4b';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: baseWidth/2, y: 580, scale: 0.92, width: 1200, height: 800, rotation: 0, persY: 0, shadowBlur: 150, shadowOp: 70, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-ecosystem') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f8fafc'; bgColor2 = '#e2e8f0';
            layers.push({ id: generateId(), type: 'text', content: 'WORKS EVERYWHERE', color: '#0f172a', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 160, scale: 1, rotation: 0, fontSize: 70, width: 1200, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: baseWidth/2, y: 620, scale: 0.62, width: 1200, height: 800, rotation: 0, persY: 0, shadowBlur: 100, shadowOp: 40, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 430, y: 600, scale: 0.5, width: 1080, height: 2340, rotation: 0, persY: -15, shadowBlur: 80, shadowOp: 30, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 1490, y: 600, scale: 0.5, width: 1080, height: 2340, rotation: 0, persY: 15, shadowBlur: 80, shadowOp: 30, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-cascade') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#c31432'; bgColor2 = '#240b36';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: 620, y: 560, scale: 0.6, width: 1200, height: 800, rotation: 0, persY: 25, shadowBlur: 120, shadowOp: 70, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: 960, y: 560, scale: 0.6, width: 1200, height: 800, rotation: 0, persY: 25, shadowBlur: 120, shadowOp: 70, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: 1300, y: 560, scale: 0.6, width: 1200, height: 800, rotation: 0, persY: 25, shadowBlur: 120, shadowOp: 70, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'text', content: 'POWERFUL WEB APPS', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 150, scale: 1, rotation: 0, fontSize: 80, width: 1400, height: 120 });
        }
        else if (type === 'ls-banner') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#6a11cb'; bgColor2 = '#2575fc';
            layers.push({ id: generateId(), type: 'text', content: 'The all-in-one platform.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 20, x: baseWidth/2, y: 230, scale: 1, rotation: 0, fontSize: 92, width: 1600, height: 160 });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: baseWidth/2, y: 760, scale: 0.72, width: 1200, height: 800, rotation: 0, persY: 0, shadowBlur: 130, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-darkglow') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#020617'; bgColor2 = '#0b1020';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: baseWidth/2, y: 560, scale: 0.88, width: 1200, height: 800, rotation: 0, persY: 0, shadowBlur: 180, shadowOp: 80, shadowColor: '#34d399', hasGlare: true, hasFloorShadow: false });
        }
        else if (type === 'ls-trio') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1e293b'; bgColor2 = '#020617';
            layers.push({ id: generateId(), type: 'text', content: 'YOUR APP, EVERYWHERE', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 150, scale: 1, rotation: 0, fontSize: 70, width: 1400, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 560, y: 640, scale: 0.5, width: 1080, height: 2340, rotation: 0, persY: 18, shadowBlur: 100, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 1360, y: 640, scale: 0.5, width: 1080, height: 2340, rotation: 0, persY: -18, shadowBlur: 100, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 600, scale: 0.6, width: 1080, height: 2340, rotation: 0, persY: 0, shadowBlur: 140, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-feature') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f172a'; bgColor2 = '#111827';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: 600, y: 560, scale: 0.66, width: 1200, height: 800, rotation: 0, persY: 12, shadowBlur: 130, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'text', content: 'Built for teams.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 1180, y: 300, scale: 1, rotation: 0, fontSize: 72, width: 680, height: 160 });
            layers.push({ id: generateId(), type: 'text', content: 'Real-time sync\nGranular permissions\nAudit logs & SSO', color: '#94a3b8', fontFamily: 'Inter', fontWeight: '500', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 1180, y: 560, scale: 1, rotation: 0, fontSize: 40, width: 680, height: 280 });
        }

        // Mobile is single-screen: collapse any multi-screen template to just its
        // first panel so phones never get a tiny 5-up canvas.
        if (isMobileViewport() && screenCount > 1) {
            layers = layers.filter(l => (l.x || 0) < baseWidth);
            screensSelect.value = '1';
            updateCanvasSize();
        }

        document.getElementById('template-dropdown').style.display = 'none';
        updatePropsPanel();
        syncBgControls();
        render();
    }

    const closeAddMenu = () => { const dd = document.getElementById('add-dropdown'); if (dd) dd.style.display = 'none'; };
    document.querySelectorAll('.text-preset-btn').forEach(btn => btn.addEventListener('click', (e) => {
        addTextPreset(e.target.dataset.text);
        closeAddMenu();
    }));
    if (viewResetBtn) viewResetBtn.addEventListener('click', resetView);
    addDeviceBtn.addEventListener('click', () => {
        // If a device is already selected, the chosen image fills (replaces) it;
        // otherwise it's added as a new device. The button relabels to match.
        const sel = layers.find(l => l.id === selectedLayerId && l.type === 'image');
        replaceTargetId = sel ? sel.id : null;
        imageUpload.click();
    });

    document.querySelectorAll('.sticker-btn').forEach(btn => btn.addEventListener('click', (e) => { addStickerLayer(e.target.dataset.sticker); closeAddMenu(); }));
    document.querySelectorAll('.shape-btn').forEach(btn => btn.addEventListener('click', (e) => { addShapeLayer(e.target.dataset.shape); closeAddMenu(); }));
    document.querySelectorAll('.template-btn').forEach(btn => btn.addEventListener('click', (e) => loadTemplate(e.target.dataset.template)));

    document.querySelectorAll('.template-category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const content = btn.nextElementSibling;
            const span = btn.querySelector('span');
            if (content.style.display === 'none') {
                content.style.display = 'flex';
                span.innerHTML = '▾';
            } else {
                content.style.display = 'none';
                span.innerHTML = '▸';
            }
        });
    });

    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
        const target = replaceTargetId ? layers.find(l => l.id === replaceTargetId && l.type === 'image') : null;
        replaceTargetId = null;
        if (files.length === 0) { e.target.value = ''; return; }

        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                if (index === 0 && target) {
                    target.img = img;
                    // Keep the device's shape; the new screenshot is cropped to fit it.
                    const dim = frameDims(target.frameStyle, img);
                    target.width = dim.w; target.height = dim.h;
                    target.imgZoom = 1; target.imgOffsetX = 0; target.imgOffsetY = 0;
                    selectedLayerId = target.id;
                    updatePropsPanel();
                    render();
                } else {
                    addImageLayer(img, index);
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                if (window.showToast) showToast("Couldn't load that image — if it's an iPhone HEIC, save/export it as JPG or PNG first.", 'error');
            };
            img.src = url;
        });
        e.target.value = '';
    });

    // --- Mobile One-Screen Composer: a fully form-driven builder so phones never
    // have to wrestle the tiny pinned canvas. It controls the background, device
    // (frame/colour/screenshot/angle/size) and text via taps, sliders and inputs,
    // auto-targeting each layer by id (no canvas selection needed). Rebuilt from
    // updatePropsPanel() on structural changes; sliders/text only re-render the
    // canvas (not the panel), so focus and drag aren't interrupted.
    const mqe = document.getElementById('mobile-quick-edit');
    const MQE_FRAME_NAMES = { iphone: 'iPhone', pixel: 'Pixel', galaxy: 'Galaxy', android: 'Android', ipad: 'iPad', macbook: 'MacBook', browser: 'Browser', clay: 'Clay', none: 'Image' };
    const MQE_FRAME_OPTS = [['iphone', 'iPhone'], ['pixel', 'Google Pixel'], ['galaxy', 'Samsung Galaxy'], ['android', 'Android'], ['ipad', 'iPad'], ['macbook', 'MacBook'], ['browser', 'Browser'], ['clay', 'Clay'], ['none', 'No frame']];
    const MQE_COLORS = ['#0b0b0d', '#3a3a3c', '#d6d7da', '#f5f5f7', '#e3c08d', '#4a6b8a', '#2e5b4f'];
    function mqeEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function mqeScreenIndex(l) {
        if (screenCount <= 1) return 0;
        return Math.max(0, Math.min(screenCount - 1, Math.floor((l.x || 0) / baseWidth)));
    }
    function renderMobileQuickEdit() {
        if (!mqe) return;
        let html = '<p class="mqe-title">✏️ Build your mockup</p><p class="mqe-hint">Everything is here — no need to touch the canvas. Multi-screen panoramas are a desktop feature.</p>';
        if (!layers.length) {
            mqe.innerHTML = html + '<div class="mqe-empty">Pick a template or “+ Screenshot” above to start.</div>';
            return;
        }

        // Background (global)
        html += '<div class="mqe-sec-label">Background</div><div class="mqe-bgrow">';
        BG_PRESETS.forEach((p, i) => {
            const on = (bgType === 'preset' && bgPresetIdx === i) ? ' on' : '';
            html += '<button class="mqe-bg' + on + '" data-bg="' + i + '" title="' + mqeEsc(p.name) + '" style="background:' + bgPresetCss(p) + '"></button>';
        });
        html += '</div>';

        const screens = Math.max(1, screenCount);
        for (let s = 0; s < screens; s++) {
            const inScreen = layers.filter((l) => mqeScreenIndex(l) === s);
            const texts = inScreen.filter((l) => l.type === 'text');
            const devices = inScreen.filter((l) => l.type === 'image');
            if (!texts.length && !devices.length) continue;
            if (screens > 1) html += '<div class="mqe-screen-label">Screen ' + (s + 1) + '</div>';

            if (texts.length) html += '<div class="mqe-sec-label">Text</div>';
            texts.forEach((l) => {
                html += '<input class="mqe-text" data-id="' + l.id + '" value="' + mqeEsc(l.content) + '" placeholder="Text…" aria-label="Layer text">';
            });

            devices.forEach((l) => {
                html += '<div class="mqe-sec-label">Device</div>';
                html += '<select class="mqe-frame" data-id="' + l.id + '" aria-label="Device frame">' +
                    MQE_FRAME_OPTS.map((o) => '<option value="' + o[0] + '"' + (o[0] === l.frameStyle ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>';
                if (COLOURABLE_FRAMES.includes(l.frameStyle)) {
                    html += '<div class="mqe-swrow">';
                    MQE_COLORS.forEach((c) => {
                        const on = (l.frameColor || '').toLowerCase() === c.toLowerCase() ? ' on' : '';
                        html += '<button class="mqe-sw' + on + '" data-id="' + l.id + '" data-color="' + c + '" style="background:' + c + '"></button>';
                    });
                    html += '</div>';
                }
                html += '<div class="mqe-device"><span class="mqe-dlabel">📱 ' + mqeEsc(MQE_FRAME_NAMES[l.frameStyle] || 'Screenshot') + '</span>' +
                    '<button class="mqe-replace" data-id="' + l.id + '">Replace</button>' +
                    '<button class="mqe-del" data-id="' + l.id + '" aria-label="Remove">✕</button></div>';
                html += '<div class="mqe-slider"><span>Angle</span><input type="range" class="mqe-tilt" data-id="' + l.id + '" min="-45" max="45" value="' + Math.round(l.persY || 0) + '" aria-label="Tilt angle"></div>';
                html += '<div class="mqe-slider"><span>Size</span><input type="range" class="mqe-size" data-id="' + l.id + '" min="30" max="140" value="' + Math.round((l.scale || 1) * 100) + '" aria-label="Size"></div>';
            });
        }
        html += '<button class="mqe-download" type="button">⬇ Download mockup</button>';
        mqe.innerHTML = html;
    }
    if (mqe) {
        const mqeLayer = (el) => layers.find((x) => x.id === el.dataset.id);
        mqe.addEventListener('input', (e) => {
            const t = e.target; if (!t.dataset || !t.dataset.id) return;
            const l = mqeLayer(t); if (!l) return;
            if (t.classList.contains('mqe-text')) l.content = t.value;
            else if (t.classList.contains('mqe-tilt')) l.persY = parseInt(t.value) || 0;
            else if (t.classList.contains('mqe-size')) l.scale = Math.max(0.05, (parseInt(t.value) || 100) / 100);
            else return;
            scheduleRender();
        });
        mqe.addEventListener('change', (e) => {
            const t = e.target;
            if (t.classList.contains('mqe-frame')) {
                const l = mqeLayer(t); if (l) { l.frameStyle = t.value; render(); renderMobileQuickEdit(); }
            }
        });
        mqe.addEventListener('click', (e) => {
            const bg = e.target.closest && e.target.closest('.mqe-bg');
            if (bg) { bgType = 'preset'; bgPresetIdx = parseInt(bg.dataset.bg); const p = BG_PRESETS[bgPresetIdx]; bgAngle = (p && p.angle != null) ? p.angle : 135; render(); renderMobileQuickEdit(); return; }
            const sw = e.target.closest && e.target.closest('.mqe-sw');
            if (sw) { const l = mqeLayer(sw); if (l) { l.frameColor = sw.dataset.color; render(); renderMobileQuickEdit(); } return; }
            const dl = e.target.closest && e.target.closest('.mqe-download');
            if (dl) { const pn = document.getElementById('export-png-btn'); if (pn) pn.click(); return; }
            const btn = e.target.closest && e.target.closest('button[data-id]');
            if (!btn) return;
            if (btn.classList.contains('mqe-replace')) { replaceTargetId = btn.dataset.id; imageUpload.click(); }
            else if (btn.classList.contains('mqe-del')) {
                const id = btn.dataset.id;
                layers = layers.filter((x) => x.id !== id);
                if (selectedLayerId === id) selectedLayerId = null;
                updatePropsPanel(); render();
            }
        });
    }

    const autoRotateToggle = document.getElementById('auto-rotate-toggle');
    const ambientGlowToggle = document.getElementById('ambient-glow-toggle');
    let ambientGlowEnabled = true;

    if (ambientGlowToggle) {
        ambientGlowToggle.addEventListener('change', (e) => {
            ambientGlowEnabled = e.target.checked;
            render();
        });
    }

    if (autoRotateToggle) {
        autoRotateToggle.addEventListener('change', (e) => {
            autoRotate = e.target.checked;
            if (autoRotate) {
                if (!isAnimating) { isAnimating = true; render(); }
            } else {
                isAnimating = false; // stop the animation loop — was running (and draining CPU) forever
                render();
            }
        });
    }

    // Bg Upload
    bgUploadBtn.addEventListener('click', () => bgUploadInput.click());
    bgUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            bgType = 'image'; bgImgObj = img;
            document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
            render(); URL.revokeObjectURL(url);
        };
        img.src = url; e.target.value = '';
    });
    
    bgBlurInput.addEventListener('input', (e) => { bgBlur = parseInt(e.target.value); scheduleRender(); });

    // --- Background Studio controls ---
    function syncBgControls() {
        const known = ['gradient', 'radial', 'mesh', 'solid'];
        if (bgTypeSelect) bgTypeSelect.value = (bgType === 'color') ? 'solid' : (known.includes(bgType) ? bgType : 'gradient');
        if (bgColor1Input && /^#[0-9a-fA-F]{6}$/.test(bgColor1)) bgColor1Input.value = bgColor1;
        if (bgColor2Input && /^#[0-9a-fA-F]{6}$/.test(bgColor2)) bgColor2Input.value = bgColor2;
        if (grainToggle) grainToggle.checked = grainEnabled;
        if (grainAmount) grainAmount.value = grainVal;
        const bgAngleInput = document.getElementById('bg-angle-input');
        if (bgAngleInput) bgAngleInput.value = bgAngle;
        document.querySelectorAll('#bg-preset-gallery .bg-btn').forEach(b =>
            b.classList.toggle('active', bgType === 'preset' && (+b.dataset.idx) === bgPresetIdx));
    }
    const ensureCustomBg = () => {
        if (!['gradient', 'radial', 'mesh', 'solid', 'color'].includes(bgType)) {
            bgType = 'gradient';
            if (bgTypeSelect) bgTypeSelect.value = 'gradient';
        }
        document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
    };
    if (bgTypeSelect) bgTypeSelect.addEventListener('change', () => { bgType = bgTypeSelect.value; render(); });
    if (bgColor1Input) bgColor1Input.addEventListener('input', () => { bgColor1 = bgColor1Input.value; ensureCustomBg(); scheduleRender(); });
    if (bgColor2Input) bgColor2Input.addEventListener('input', () => { bgColor2 = bgColor2Input.value; ensureCustomBg(); scheduleRender(); });
    if (grainToggle) grainToggle.addEventListener('change', () => { grainEnabled = grainToggle.checked; render(); });
    if (grainAmount) grainAmount.addEventListener('input', () => { grainVal = parseInt(grainAmount.value) || 0; scheduleRender(); });

    // --- Rendering Core ---
    let lastRenderTime = 0;
    function render() {
        if (isAnimating) {
            const now = performance.now();
            if (now - lastRenderTime < 33) {
                requestAnimationFrame(render);
                return;
            }
            lastRenderTime = now;
        }
        
        renderSceneToContext(ctx, targetWidth, targetHeight, true);
        
        if (autoRotate) {
            autoRotateAngle += 0.02;
            let needsPanelUpdate = false;
            layers.forEach(l => {
                if(l.type === 'image' && l.frameStyle !== 'none') {
                    // Smooth 3D wobble back and forth
                    l.persY = Math.sin(autoRotateAngle) * 18;
                    l.persX = Math.cos(autoRotateAngle) * 6;
                    if (l.id === selectedLayerId) needsPanelUpdate = true;
                }
            });
            if (needsPanelUpdate) {
                const tyInput = document.getElementById('img-tilt-y-input');
                const txInput = document.getElementById('img-tilt-x-input');
                const selected = layers.find(l => l.id === selectedLayerId);
                if (tyInput && selected) tyInput.value = Math.round(selected.persY);
                if (txInput && selected) txInput.value = Math.round(selected.persX);
            }
        }

        if (isAnimating) {
            requestAnimationFrame(render);
        }
    }

    // True while a pointer gesture is moving a layer — the live preview renders a
    // lighter "draft" frame (no shadow blur / glare / grain) so dragging stays
    // responsive; the full-quality frame is painted once the gesture ends.
    function isInteracting() { return isDragging || isScaling || isPinching; }

    // Coalesce rapid interactions (drag/scale fire ~120/s) into one render per frame
    let renderQueued = false;
    function scheduleRender() {
        if (renderQueued) return;
        renderQueued = true;
        requestAnimationFrame(() => { renderQueued = false; render(); });
    }

    function renderSceneToContext(tCtx, w, h, drawHandles = false, layoutScale = 1, offsetX = 0, offsetY = 0) {
        tCtx.clearRect(0, 0, w, h);
        tCtx.filter = 'none';
        
        // 1. Draw Background (skipped entirely for transparent export)
        if (exportTransparent) {
            // no fill — leave the canvas clear
        } else if (bgType === 'preset' && BG_PRESETS[bgPresetIdx]) {
            drawPresetBg(tCtx, w, h, BG_PRESETS[bgPresetIdx], bgAngle);
        } else if (bgType === 'gradient') {
            const grad = tCtx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, bgColor1);
            grad.addColorStop(1, bgColor2);
            if(bgColor1 === '#8A2387') { // Cyberpunk Hack 3 stops
                grad.addColorStop(0.5, '#E94057');
            }
            tCtx.fillStyle = grad;
            tCtx.fillRect(0, 0, w, h);
        } else if (bgType === 'radial') {
            const grad = tCtx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, Math.max(w, h) * 0.72);
            grad.addColorStop(0, bgColor1);
            grad.addColorStop(1, bgColor2);
            tCtx.fillStyle = grad;
            tCtx.fillRect(0, 0, w, h);
        } else if (bgType === 'mesh') {
            tCtx.fillStyle = bgColor2;
            tCtx.fillRect(0, 0, w, h);
            const R = Math.max(w, h);
            const blob = (cx, cy, rad, col) => {
                const g = tCtx.createRadialGradient(cx, cy, 0, cx, cy, rad);
                g.addColorStop(0, hexA(col, 0.9));
                g.addColorStop(1, hexA(col, 0));
                tCtx.fillStyle = g;
                tCtx.fillRect(0, 0, w, h);
            };
            blob(w * 0.18, h * 0.22, R * 0.6, bgColor1);
            blob(w * 0.85, h * 0.18, R * 0.5, bgColor2);
            blob(w * 0.72, h * 0.82, R * 0.6, bgColor1);
            blob(w * 0.25, h * 0.9, R * 0.45, bgColor2);
        } else if (bgType === 'solid' || bgType === 'color') {
            tCtx.fillStyle = bgColor1;
            tCtx.fillRect(0, 0, w, h);
        } else if (bgType === 'image' && bgImgObj) {
            const scale = Math.max(w / bgImgObj.width, h / bgImgObj.height);
            const imgW = bgImgObj.width * scale;
            const imgH = bgImgObj.height * scale;
            const x = (w - imgW) / 2;
            const y = (h - imgH) / 2;
            tCtx.save();
            if (bgBlur > 0) tCtx.filter = `blur(${bgBlur}px)`;
            tCtx.drawImage(bgImgObj, x, y, imgW, imgH);
            tCtx.restore();
            tCtx.filter = 'none';
        }

        // 1.5 Draw Ambient Video Glow
        if (ambientGlowEnabled) {
            const videoLayer = layers.find(l => l.img instanceof HTMLVideoElement);
            if (videoLayer) {
                tCtx.save();
                const scale = Math.max(w / videoLayer.width, h / videoLayer.height) * 1.2; // slight zoom
                const imgW = videoLayer.width * scale;
                const imgH = videoLayer.height * scale;
                const x = (w - imgW) / 2;
                const y = (h - imgH) / 2;
                
                tCtx.filter = 'blur(100px) brightness(0.8)';
                tCtx.globalAlpha = 0.6; // Blend with background
                tCtx.drawImage(videoLayer.img, x, y, imgW, imgH);
                tCtx.restore();
                tCtx.filter = 'none';
            }
        }

        // 2. Apply Master Export Scaling if needed
        tCtx.save();
        tCtx.translate(offsetX, offsetY);
        tCtx.scale(layoutScale, layoutScale);

        // Draw Seams (Grid lines for Panoramic Mode)
        if (screenCount > 1 && drawHandles) {
            tCtx.save();
            tCtx.strokeStyle = 'rgba(255,255,255,0.4)';
            tCtx.lineWidth = 4 / layoutScale;
            tCtx.setLineDash([15 / layoutScale, 15 / layoutScale]);
            for (let i = 1; i < screenCount; i++) {
                tCtx.beginPath();
                tCtx.moveTo(baseWidth * i, 0);
                tCtx.lineTo(baseWidth * i, targetHeight);
                tCtx.stroke();
            }
            tCtx.restore();
        }

        // 3. Draw Layers
        layers.forEach(layer => {
            tCtx.save();
            tCtx.translate(layer.x, layer.y);
            
            const r = (layer.rotation || 0) * Math.PI / 180;
            const ty = (layer.tiltY || 0) * Math.PI / 180;
            const tx = (layer.tiltX || 0) * Math.PI / 180;
            
            if (layer.type === 'image' || layer.type === 'sticker') {
                if (layer.hasFloorShadow) {
                    tCtx.save();
                    const sBlur = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
                    const sOp = layer.shadowOp !== undefined ? layer.shadowOp : 50;
                    tCtx.shadowColor = `rgba(0,0,0,${sOp/100})`;
                    tCtx.shadowBlur = sBlur;
                    tCtx.shadowOffsetY = layer.height * layer.scale * 0.45;
                    tCtx.fillStyle = '#000';
                    tCtx.beginPath();
                    tCtx.ellipse(0, 0, (layer.width * layer.scale)/2, (layer.width * layer.scale)*0.1, 0, 0, Math.PI*2);
                    tCtx.fill();
                    tCtx.restore();
                }
            }

            // 3D perspective replaces the flat skew when set (image layers only).
            const use3D = layer.type === 'image' && ((layer.persX || 0) !== 0 || (layer.persY || 0) !== 0);
            // Apply Tilt & Rotation to ALL layers (skip the flat skew when using 3D).
            if (!use3D) tCtx.transform(1, ty, tx, 1, 0, 0);
            tCtx.rotate(r);
            tCtx.scale(layer.scale, layer.scale);

            if (layer.type === 'image') {
                if (use3D) draw3DDevice(tCtx, layer);
                else drawImageLayer(tCtx, layer);
                if (layer.hasReflection) {
                    // Partial mirror hugging the device's bottom edge (stays on-canvas)
                    tCtx.save();
                    const reflectH = layer.height * 0.45;
                    tCtx.beginPath();
                    tCtx.rect(-layer.width / 2, layer.height / 2, layer.width, reflectH);
                    tCtx.clip();
                    tCtx.translate(0, layer.height);
                    tCtx.scale(1, -1);
                    tCtx.globalAlpha = 0.22;
                    drawImageLayer(tCtx, layer);
                    tCtx.restore();
                }
            }
            else if (layer.type === 'text') drawTextLayer(tCtx, layer);
            else if (layer.type === 'sticker') drawStickerLayer(tCtx, layer);
            else if (layer.type === 'shape') drawShapeLayer(tCtx, layer);

            tCtx.restore();
        });

        // 4. Alignment guides (preview only, while dragging)
        if (drawHandles && activeGuides.length) {
            tCtx.save();
            tCtx.strokeStyle = 'rgba(236,72,153,0.9)';
            tCtx.lineWidth = 2; tCtx.setLineDash([14, 9]);
            activeGuides.forEach(g => {
                tCtx.beginPath();
                if (g.type === 'v') { tCtx.moveTo(g.x, 0); tCtx.lineTo(g.x, targetHeight); }
                else { tCtx.moveTo(0, g.y); tCtx.lineTo(targetWidth, g.y); }
                tCtx.stroke();
            });
            tCtx.restore();
        }

        // 4b. Draw UI Handles
        if (drawHandles && selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) drawSelectionBox(tCtx, layer);
        }

        tCtx.restore();

        // 5. Film grain overlay over the whole composed scene (skip on transparent
        // backgrounds — overlay-composited noise bakes grey haze into the alpha,
        // and skip mid-drag where it's the costliest pass and barely visible).
        if (grainEnabled && grainVal > 0 && bgType !== 'transparent' && !exportTransparent && !isInteracting()) {
            tCtx.save();
            tCtx.globalCompositeOperation = 'overlay';
            tCtx.globalAlpha = (grainVal / 100) * 0.55;
            const pat = tCtx.createPattern(noiseCanvas, 'repeat');
            if (pat) { tCtx.fillStyle = pat; tCtx.fillRect(0, 0, w, h); }
            tCtx.restore();
        }

        saveSoon();
    }

    function drawShapeLayer(tCtx, layer) {
        const w = layer.width;
        const h = layer.height;
        tCtx.translate(-w/2, -h/2);
        
        if (layer.shapeType === 'glass') {
            const gr = layer.radius || 48;
            tCtx.fillStyle = 'rgba(255,255,255,0.12)';
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, gr); tCtx.fill();
            const hi = tCtx.createLinearGradient(0, 0, 0, h);
            hi.addColorStop(0, 'rgba(255,255,255,0.22)');
            hi.addColorStop(0.5, 'rgba(255,255,255,0)');
            tCtx.fillStyle = hi;
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, gr); tCtx.fill();
            tCtx.lineWidth = 2;
            tCtx.strokeStyle = 'rgba(255,255,255,0.4)';
            tCtx.beginPath(); tCtx.roundRect(1, 1, w - 2, h - 2, gr); tCtx.stroke();
            return;
        }

        tCtx.fillStyle = layer.color;
        tCtx.beginPath();
        if (layer.shapeType === 'rectangle') {
            const r = layer.radius || 0;
            tCtx.roundRect(0, 0, w, h, r);
        } else if (layer.shapeType === 'circle') {
            tCtx.ellipse(w/2, h/2, w/2, h/2, 0, 0, Math.PI*2);
        }
        tCtx.fill();
    }

    function drawStickerLayer(tCtx, layer) {
        const w = layer.width;
        const h = layer.height;
        tCtx.translate(-w/2, -h/2);

        const sBlur = layer.shadowBlur !== undefined ? layer.shadowBlur : 40;
        const sOp = layer.shadowOp !== undefined ? layer.shadowOp : 30;
        tCtx.shadowColor = `rgba(0,0,0,${sOp/100})`;
        tCtx.shadowBlur = sBlur;
        tCtx.shadowOffsetY = sBlur / 2;

        if (layer.img.complete) tCtx.drawImage(layer.img, 0, 0, w, h);
        tCtx.shadowColor = 'transparent';
    }

    // Data-driven phone device library. radius/bezel are fractions of the screen
    // width; cutout = the top sensor housing drawn on the screen like a real device.
    const PHONE_DEVICES = {
        iphone:  { radius: 0.135, bezel: 0.022, cutout: 'island' },     // iPhone 15/16 — Dynamic Island
        android: { radius: 0.11,  bezel: 0.022, cutout: 'punch' },      // generic Android
        pixel:   { radius: 0.105, bezel: 0.020, cutout: 'punch' },      // Google Pixel — centred punch-hole
        galaxy:  { radius: 0.085, bezel: 0.014, cutout: 'punch-sm' }    // Samsung Galaxy — slim bezel
    };
    const isPhoneFrame = (fs) => Object.prototype.hasOwnProperty.call(PHONE_DEVICES, fs);
    // Frames whose body colour can be changed.
    const COLOURABLE_FRAMES = ['iphone', 'android', 'pixel', 'galaxy', 'clay', 'ipad', 'macbook'];
    function hexLuminance(hex) {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
        if (!m) return 0;
        const n = parseInt(m[1], 16);
        return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    }

    // Realistic phone: body → inset screen → on-screen cutout → metallic rim.
    function drawPhoneFrame(tCtx, layer, w, h) {
        const dev = PHONE_DEVICES[layer.frameStyle] || PHONE_DEVICES.iphone;
        const bodyR = w * dev.radius;
        const bezel = Math.max(6, w * dev.bezel);
        tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, bodyR); tCtx.closePath();
        tCtx.fillStyle = layer.frameColor || '#0b0b0d';
        tCtx.fill();
        tCtx.shadowColor = 'transparent';

        const sx = bezel, sy = bezel, sw = w - bezel * 2, sh = h - bezel * 2;
        const sr = Math.max(0, bodyR - bezel);
        tCtx.save();
        tCtx.beginPath(); tCtx.roundRect(sx, sy, sw, sh, sr); tCtx.closePath(); tCtx.clip();
        drawCover(tCtx, layer.img, sx, sy, sw, sh, layer);
        // On-screen sensor housing
        tCtx.fillStyle = '#000';
        if (dev.cutout === 'island') {
            const iw = w * 0.30, ih = w * 0.085, iy = sy + w * 0.035;
            tCtx.beginPath(); tCtx.roundRect((w - iw) / 2, iy, iw, ih, ih / 2); tCtx.fill();
        } else if (dev.cutout === 'punch' || dev.cutout === 'punch-sm') {
            const pr = w * (dev.cutout === 'punch-sm' ? 0.018 : 0.024);
            const py = sy + w * (dev.cutout === 'punch-sm' ? 0.04 : 0.05);
            tCtx.beginPath(); tCtx.arc(w / 2, py, pr, 0, Math.PI * 2); tCtx.fill();
        }
        tCtx.restore();

        // Metallic edge — white sheen on dark bodies, a soft dark edge on light ones.
        const light = hexLuminance(layer.frameColor || '#0b0b0d') > 0.6;
        const rim = tCtx.createLinearGradient(0, 0, w, h);
        rim.addColorStop(0, light ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.28)');
        rim.addColorStop(0.5, light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)');
        rim.addColorStop(1, light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.20)');
        tCtx.strokeStyle = rim; tCtx.lineWidth = Math.max(2, w * 0.008);
        tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, bodyR); tCtx.stroke();
    }

    // Affine-map a source triangle of `img` onto a destination triangle (with a
    // hair of inflation to hide seams between adjacent triangles).
    function textureTriangle(tCtx, img, s, d) {
        const cx = (d[0].x + d[1].x + d[2].x) / 3, cy = (d[0].y + d[1].y + d[2].y) / 3;
        const D = d.map(p => { const dx = p.x - cx, dy = p.y - cy, l = Math.hypot(dx, dy) || 1; return { x: p.x + dx / l * 0.7, y: p.y + dy / l * 0.7 }; });
        tCtx.save();
        tCtx.beginPath(); tCtx.moveTo(D[0].x, D[0].y); tCtx.lineTo(D[1].x, D[1].y); tCtx.lineTo(D[2].x, D[2].y); tCtx.closePath(); tCtx.clip();
        const x0 = s[0].x, y0 = s[0].y, x1 = s[1].x, y1 = s[1].y, x2 = s[2].x, y2 = s[2].y;
        const u0 = d[0].x, v0 = d[0].y, u1 = d[1].x, v1 = d[1].y, u2 = d[2].x, v2 = d[2].y;
        const delta = x0 * (y1 - y2) - x1 * (y0 - y2) + x2 * (y0 - y1);
        if (delta) {
            const a = (u0 * (y1 - y2) - u1 * (y0 - y2) + u2 * (y0 - y1)) / delta;
            const b = (v0 * (y1 - y2) - v1 * (y0 - y2) + v2 * (y0 - y1)) / delta;
            const c = (x0 * (u1 - u2) - x1 * (u0 - u2) + x2 * (u0 - u1)) / delta;
            const dd = (x0 * (v1 - v2) - x1 * (v0 - v2) + x2 * (v0 - v1)) / delta;
            const e = (x0 * (y1 * u2 - y2 * u1) - x1 * (y0 * u2 - y2 * u0) + x2 * (y0 * u1 - y1 * u0)) / delta;
            const ff = (x0 * (y1 * v2 - y2 * v1) - x1 * (y0 * v2 - y2 * v0) + x2 * (y0 * v1 - y1 * v0)) / delta;
            tCtx.transform(a, b, c, dd, e, ff); tCtx.drawImage(img, 0, 0);
        }
        tCtx.restore();
    }

    // True 3D perspective: draw the flat device to an offscreen, then warp it onto
    // the scene through a 3D-rotated, perspective-projected grid (export-accurate).
    function draw3DDevice(tCtx, layer) {
        const w = layer.width, h = layer.height;
        const padX = w * 0.14, padY = h * 0.20;
        const ow = Math.ceil(w + padX * 2), oh = Math.ceil(h + padY * 2);
        const off = document.createElement('canvas'); off.width = ow; off.height = oh;
        const octx = off.getContext('2d');
        octx.translate(ow / 2, oh / 2);
        drawImageLayer(octx, Object.assign({}, layer, { shadowOp: 0 })); // device drawn flat, no baked shadow

        const rx = (layer.persX || 0) * Math.PI / 180, ry = (layer.persY || 0) * Math.PI / 180;
        const f = Math.max(ow, oh) * 1.9; // focal length — higher = gentler perspective
        const project = (u, v) => {
            const x = (u - 0.5) * ow, y = (v - 0.5) * oh;
            const x1 = x * Math.cos(ry);
            const z1 = -x * Math.sin(ry);
            const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
            const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
            const s = f / (f + z2);
            return { x: x1 * s, y: y1 * s };
        };
        const N = 10, g = [];
        for (let i = 0; i <= N; i++) { g[i] = []; for (let j = 0; j <= N; j++) g[i][j] = project(i / N, j / N); }
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
            const sx0 = i / N * ow, sy0 = j / N * oh, sx1 = (i + 1) / N * ow, sy1 = (j + 1) / N * oh;
            const a = g[i][j], b = g[i + 1][j], c = g[i + 1][j + 1], d = g[i][j + 1];
            textureTriangle(tCtx, off, [{ x: sx0, y: sy0 }, { x: sx1, y: sy0 }, { x: sx1, y: sy1 }], [a, b, c]);
            textureTriangle(tCtx, off, [{ x: sx0, y: sy0 }, { x: sx1, y: sy1 }, { x: sx0, y: sy1 }], [a, c, d]);
        }
    }

    function drawImageLayer(tCtx, layer) {
        const w = layer.width;
        const h = layer.height;
        tCtx.translate(-w/2, -h/2);

        // While the user is actively dragging/scaling, drop the soft drop-shadow —
        // a large blurred shadow at full export resolution is the single most
        // expensive op per frame. The full-quality shadow is restored on release.
        const draft = isInteracting();
        const sBlur = draft ? 0 : (layer.shadowBlur !== undefined ? layer.shadowBlur : 80);
        const sOp = layer.shadowOp !== undefined ? layer.shadowOp : 50;
        const sAngle = layer.shadowAngle !== undefined ? layer.shadowAngle : 90;
        const sDist = layer.shadowDistance !== undefined ? layer.shadowDistance : (sBlur / 2);
        const shadowColor = `rgba(0,0,0,${sOp/100})`;

        const sRad = sAngle * Math.PI / 180;

        tCtx.shadowColor = shadowColor;
        tCtx.shadowBlur = sBlur;
        tCtx.shadowOffsetX = Math.cos(sRad) * sDist;
        tCtx.shadowOffsetY = Math.sin(sRad) * sDist;

        if (isPhoneFrame(layer.frameStyle)) {
            drawPhoneFrame(tCtx, layer, w, h);

        } else if (layer.frameStyle === 'clay') {
            const rad = Math.min(w, h) * 0.1;
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, rad); tCtx.closePath();
            tCtx.fillStyle = layer.frameColor || '#f8f9fa';
            tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.save();
            const pad = w * 0.06;
            tCtx.beginPath(); tCtx.roundRect(pad, pad, w - pad*2, h - pad*2, rad*0.8); tCtx.clip();
            drawCover(tCtx, layer.img, pad, pad, w - pad*2, h - pad*2, layer);
            tCtx.restore();
            tCtx.strokeStyle = 'rgba(0,0,0,0.1)'; tCtx.lineWidth = w * 0.01;
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, rad); tCtx.stroke();

        } else if (layer.frameStyle === 'ipad') {
            const padW = w * 0.05; const rad = Math.min(w, h) * 0.05;
            tCtx.beginPath(); tCtx.roundRect(-padW, -padW, w + padW*2, h + padW*2, rad + padW); tCtx.closePath();
            tCtx.fillStyle = layer.frameColor || '#111'; tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.save(); tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, Math.min(w, h) * 0.04); tCtx.clip();
            drawCover(tCtx, layer.img, 0, 0, w, h, layer); tCtx.restore();
            tCtx.strokeStyle = 'rgba(0,0,0,0.4)'; tCtx.lineWidth = 2; tCtx.strokeRect(0, 0, w, h);

        } else if (layer.frameStyle === 'macbook') {
            const padW = w * 0.02; const topBar = h * 0.05; const bottomLip = h * 0.12;
            tCtx.beginPath(); tCtx.roundRect(-padW, -padW - topBar, w + padW*2, h + padW*2 + topBar + bottomLip, [16,16,0,0]); tCtx.closePath();
            tCtx.fillStyle = layer.frameColor || '#111'; tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.fillStyle = '#9ca3af'; tCtx.beginPath(); tCtx.roundRect(-padW, h + padW, w + padW*2, bottomLip, [0,0,16,16]); tCtx.fill();
            tCtx.save(); tCtx.beginPath(); tCtx.rect(0, 0, w, h); tCtx.clip();
            drawCover(tCtx, layer.img, 0, 0, w, h, layer); tCtx.restore();

        } else if (layer.frameStyle === 'browser') {
            const topBar = 60; const totalH = h + topBar;
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, totalH, 16); tCtx.closePath();
            tCtx.fillStyle = '#2d2d2d'; tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.fillStyle = '#ff5f56'; tCtx.beginPath(); tCtx.arc(24, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = '#ffbd2e'; tCtx.beginPath(); tCtx.arc(52, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = '#27c93f'; tCtx.beginPath(); tCtx.arc(80, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.save(); tCtx.beginPath(); tCtx.roundRect(0, topBar, w, h, [0,0,16,16]); tCtx.clip();
            drawCover(tCtx, layer.img, 0, topBar, w, h, layer); tCtx.restore();
            layer.renderHeight = totalH;

        } else {
            tCtx.drawImage(layer.img, 0, 0, w, h);
            tCtx.shadowColor = 'transparent';
        }

        if (layer.hasGlare && !draft) {
            tCtx.save();
            let renderH = layer.renderHeight || h;
            if (isPhoneFrame(layer.frameStyle) || layer.frameStyle === 'clay') { tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, Math.min(w, h) * 0.1); tCtx.clip(); }
            else if (layer.frameStyle === 'browser') { tCtx.beginPath(); tCtx.roundRect(0, 0, w, renderH, 16); tCtx.clip(); } 
            else if (layer.frameStyle === 'ipad') { tCtx.beginPath(); tCtx.roundRect(-w*0.05, -w*0.05, w*1.1, h + w*0.1, Math.min(w, h)*0.05 + w*0.05); tCtx.clip(); } 
            else if (layer.frameStyle === 'macbook') { tCtx.beginPath(); tCtx.roundRect(-w*0.02, -h*0.05, w*1.04, h*1.17, 16); tCtx.clip(); }

            const grad = tCtx.createLinearGradient(0, 0, w, renderH);
            grad.addColorStop(0, 'rgba(255,255,255,0.4)'); grad.addColorStop(0.3, 'rgba(255,255,255,0.05)'); grad.addColorStop(0.301, 'rgba(255,255,255,0)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
            tCtx.fillStyle = grad; tCtx.beginPath(); tCtx.moveTo(0, 0); tCtx.lineTo(w, 0); tCtx.lineTo(0, renderH); tCtx.closePath(); tCtx.fill();
            tCtx.restore();
        }
    }

    function drawTextLayer(tCtx, layer) {
        const weight = layer.fontWeight || '800';
        const font = layer.fontFamily || 'Inter';
        tCtx.font = `${weight} ${layer.fontSize}px "${font}", sans-serif`;
        tCtx.fillStyle = layer.color;
        
        tCtx.textAlign = layer.textAlign || 'center';
        tCtx.textBaseline = 'middle';
        
        if(layer.shadowBlur > 0) {
            tCtx.shadowColor = layer.shadowColor || '#000000';
            tCtx.shadowBlur = layer.shadowBlur;
        } else {
            tCtx.shadowColor = 'transparent';
            tCtx.shadowBlur = 0;
        }
        
        const lines = layer.content.split('\n');
        const lineH = layer.fontSize * 1.2;
        const textH = lines.length * lineH;

        let maxW = 0;
        lines.forEach((line, i) => {
            const m = tCtx.measureText(line);
            if (m.width > maxW) maxW = m.width;
        });

        // Callout pill: a rounded accent background behind the text so a label
        // reads as an annotation. Padding inflates the layer bounds so selection
        // and hit-testing hug the pill, while text stays centred on maxW.
        const padX = layer.pill ? layer.fontSize * 0.6 : 0;
        const padY = layer.pill ? layer.fontSize * 0.34 : 0;
        layer.width = maxW + padX * 2;
        layer.height = textH + padY * 2;

        if (layer.pill) {
            tCtx.save();
            tCtx.shadowColor = 'transparent'; tCtx.shadowBlur = 0;
            tCtx.fillStyle = layer.pillColor || '#10B981';
            const pw = layer.width, ph = layer.height;
            tCtx.beginPath();
            tCtx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
            tCtx.fill();
            tCtx.restore();
            tCtx.fillStyle = layer.color;
        }

        lines.forEach((line, i) => {
            const offY = (i - (lines.length-1)/2) * lineH;
            let drawX = 0;
            if(tCtx.textAlign === 'left') drawX = -maxW/2;
            if(tCtx.textAlign === 'right') drawX = maxW/2;
            tCtx.fillText(line, drawX, offY);
        });

        tCtx.shadowColor = 'transparent';
        tCtx.shadowBlur = 0;
    }

    function drawSelectionBox(tCtx, layer) {
        tCtx.save();
        tCtx.translate(layer.x, layer.y);
        
        const r = (layer.rotation || 0) * Math.PI / 180;
        const ty = (layer.tiltY || 0) * Math.PI / 180;
        tCtx.transform(1, ty, 0, 1, 0, 0);
        tCtx.rotate(r);
        
        let w = layer.width * layer.scale;
        let h = (layer.renderHeight || layer.height) * layer.scale;
        
        if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') { w += (layer.width * 0.1) * layer.scale; h += (layer.height * 0.1) * layer.scale; }
        
        tCtx.strokeStyle = '#00e5ff'; tCtx.lineWidth = 4 / getWrapperScale(); tCtx.setLineDash([10 / getWrapperScale(), 10 / getWrapperScale()]);
        tCtx.strokeRect(-w/2, -h/2, w, h);
        tCtx.fillStyle = '#00e5ff'; tCtx.setLineDash([]);
        const hs = 20 / getWrapperScale(); 
        
        tCtx.fillRect(-w/2 - hs/2, -h/2 - hs/2, hs, hs); tCtx.fillRect(w/2 - hs/2, -h/2 - hs/2, hs, hs); 
        tCtx.fillRect(-w/2 - hs/2, h/2 - hs/2, hs, hs); tCtx.fillRect(w/2 - hs/2, h/2 - hs/2, hs, hs); 
        tCtx.restore();
    }

    // --- Interaction Engine ---
    function getWrapperScale() {
        const matrix = window.getComputedStyle(wrapper).transform;
        if (matrix === 'none') return 1;
        return parseFloat(matrix.split(',')[0].replace('matrix(', ''));
    }

    function getMouseCoords(e) {
        const rect = wrapper.getBoundingClientRect(); const scale = getWrapperScale();
        return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
    }

    function isPointInTransformedRect(px, py, cx, cy, w, h, scale, rotation, tiltY) {
        let tx = px - cx; let ty = py - cy; let tiltY_rad = (tiltY || 0) * Math.PI / 180;
        let sx = tx; let sy = -tx * tiltY_rad + ty;
        let r = -(rotation || 0) * Math.PI / 180; let cosR = Math.cos(r); let sinR = Math.sin(r);
        let rx = sx * cosR - sy * sinR; let ry = sx * sinR + sy * cosR;
        let lx = rx / scale; let ly = ry / scale;
        return (lx >= -w/2 && lx <= w/2 && ly >= -h/2 && ly <= h/2);
    }

    function checkHit(x, y) {
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            let w = layer.width; let h = layer.renderHeight || layer.height;
            if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') { w += layer.width * 0.1; h += layer.height * 0.1; }
            if (isPointInTransformedRect(x, y, layer.x, layer.y, w, h, layer.scale, layer.rotation, layer.tiltY)) return layer.id;
        }
        return null;
    }

    // Drag on the canvas itself rather than scrolling it (mobile + desktop).
    wrapper.style.touchAction = 'none';

    // Multi-touch: two fingers = pinch-to-resize + reposition the selected layer,
    // so positioning/sizing text & devices is easy on a phone's small canvas.
    const pointers = new Map(); // pointerId -> {x,y} canvas coords
    let isPinching = false, pinchStartDist = 1, pinchStartScale = 1, pinchStartMidX = 0, pinchStartMidY = 0, pinchLayerX = 0, pinchLayerY = 0;
    // Two-finger whole-canvas zoom (mobile, when the fingers aren't on a layer).
    let isViewPinching = false, vpStartDist = 1, vpStartZoom = 1, vpAnchorX = 0, vpAnchorY = 0, vpContCx = 0, vpContCy = 0;
    // One-finger canvas pan while zoomed in (mobile).
    let isViewPanning = false, vpanStartX = 0, vpanStartY = 0, vpanPanX0 = 0, vpanPanY0 = 0;

    wrapper.addEventListener('pointerdown', (e) => {
        const { x, y } = getMouseCoords(e);
        pointers.set(e.pointerId, { x, y, cx: e.clientX, cy: e.clientY });

        // Second finger down → pinch the selected/tapped layer, OR (on mobile, with
        // nothing under the fingers) pinch-zoom the whole canvas.
        if (pointers.size === 2) {
            let layer = layers.find(l => l.id === selectedLayerId);
            if (!layer) { const hid = checkHit(x, y); if (hid) { selectedLayerId = hid; layer = layers.find(l => l.id === hid); updatePropsPanel(); } }
            if (layer) {
                const pts = [...pointers.values()];
                pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
                pinchStartScale = layer.scale || 1;
                pinchStartMidX = (pts[0].x + pts[1].x) / 2; pinchStartMidY = (pts[0].y + pts[1].y) / 2;
                pinchLayerX = layer.x; pinchLayerY = layer.y;
                isPinching = true; isViewPinching = false; isViewPanning = false; isDragging = false; isScaling = false; activeGuides = []; render();
            } else if (isMobileViewport()) {
                const pts = [...pointers.values()];
                vpStartDist = Math.hypot(pts[0].cx - pts[1].cx, pts[0].cy - pts[1].cy) || 1;
                vpStartZoom = viewZoom;
                const mcx = (pts[0].cx + pts[1].cx) / 2, mcy = (pts[0].cy + pts[1].cy) / 2;
                const crect = document.getElementById('canvas-container').getBoundingClientRect();
                vpContCx = crect.left + crect.width / 2; vpContCy = crect.top + crect.height / 2;
                // Content point under the pinch centre, so zoom stays anchored there.
                const total0 = fitScale * vpStartZoom;
                vpAnchorX = (mcx - (vpContCx + viewPanX)) / total0;
                vpAnchorY = (mcy - (vpContCy + viewPanY)) / total0;
                isViewPinching = true; isViewPanning = false; isPinching = false; isDragging = false; isScaling = false;
            }
            return;
        }

        if (selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) {
                let w = layer.width; let h = layer.renderHeight || layer.height;
                if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') { w += layer.width * 0.1; h += layer.height * 0.1; }
                const innerHit = isPointInTransformedRect(x, y, layer.x, layer.y, w, h, layer.scale, layer.rotation, layer.tiltY);
                const handleHit = isPointInTransformedRect(x, y, layer.x, layer.y, w + 100, h + 100, layer.scale, layer.rotation, layer.tiltY);
                if (!innerHit && handleHit) { isScaling = true; dragStartX = x; dragStartY = y; originalScale = layer.scale; return; }
            }
        }
        const hitId = checkHit(x, y);
        if (hitId) {
            selectedLayerId = hitId; isDragging = true; dragStartX = x; dragStartY = y;
            const layer = layers.find(l => l.id === hitId);
            originalLayerX = layer.x; originalLayerY = layer.y;
            updatePropsPanel(); render(); return;
        }
        selectedLayerId = null; updatePropsPanel(); render();
        // On mobile, dragging empty space while zoomed in pans the canvas view.
        if (isMobileViewport() && viewZoom > 1.01) {
            isViewPanning = true;
            vpanStartX = e.clientX; vpanStartY = e.clientY;
            vpanPanX0 = viewPanX; vpanPanY0 = viewPanY;
        }
    });

    window.addEventListener('pointermove', (e) => {
        if (pointers.has(e.pointerId)) { const m = getMouseCoords(e); pointers.set(e.pointerId, { x: m.x, y: m.y, cx: e.clientX, cy: e.clientY }); }

        if (isViewPanning) {
            viewPanX = vpanPanX0 + (e.clientX - vpanStartX);
            viewPanY = vpanPanY0 + (e.clientY - vpanStartY);
            clampViewPan(); applyWrapperTransform();
            return;
        }

        if (isViewPinching && pointers.size >= 2) {
            const pts = [...pointers.values()];
            const dist = Math.hypot(pts[0].cx - pts[1].cx, pts[0].cy - pts[1].cy) || 1;
            const mcx = (pts[0].cx + pts[1].cx) / 2, mcy = (pts[0].cy + pts[1].cy) / 2;
            viewZoom = Math.max(1, Math.min(5, vpStartZoom * (dist / vpStartDist)));
            const total1 = fitScale * viewZoom;
            viewPanX = mcx - vpContCx - vpAnchorX * total1;
            viewPanY = mcy - vpContCy - vpAnchorY * total1;
            clampViewPan(); applyWrapperTransform(); updateZoomUI();
            return;
        }

        if (isPinching && pointers.size >= 2) {
            const pl = layers.find(l => l.id === selectedLayerId);
            if (!pl) return;
            const pts = [...pointers.values()];
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
            const midX = (pts[0].x + pts[1].x) / 2, midY = (pts[0].y + pts[1].y) / 2;
            pl.scale = Math.max(0.05, pinchStartScale * (dist / pinchStartDist));
            pl.x = pinchLayerX + (midX - pinchStartMidX);
            pl.y = pinchLayerY + (midY - pinchStartMidY);
            clampLayerPos(pl);
            scheduleRender();
            return;
        }

        if (!isDragging && !isScaling) return;
        const { x, y } = getMouseCoords(e);
        const layer = layers.find(l => l.id === selectedLayerId);
        if (!layer) return;

        if (isDragging) {
            const snapped = applySnap(layer, originalLayerX + (x - dragStartX), originalLayerY + (y - dragStartY));
            layer.x = snapped.x; layer.y = snapped.y; clampLayerPos(layer); activeGuides = snapped.guides; scheduleRender();
        } else if (isScaling) {
            const distStart = Math.hypot(dragStartX - layer.x, dragStartY - layer.y);
            if (distStart < 1) return; // grabbed at the layer centre → avoid /0 → NaN scale (wipes the layer)
            const distCurrent = Math.hypot(x - layer.x, y - layer.y);
            layer.scale = Math.max(0.05, originalScale * (distCurrent / distStart)); scheduleRender();
        }
    });

    function endPointer(e) {
        if (e && pointers.has(e.pointerId)) pointers.delete(e.pointerId);
        if (pointers.size < 2) { isPinching = false; isViewPinching = false; }
        if (pointers.size === 0) {
            isDragging = false; isScaling = false; isViewPanning = false;
            activeGuides = [];
            render(); // gesture ended → repaint once at full quality (shadow/glare/grain)
            renderMobileQuickEdit(); // reflect any pinch-resize in the composer's size slider
            updateZoomUI();
        }
    }

    // Keep a layer's centre on the canvas so it can be pushed to an edge but never
    // dragged fully off and lost.
    function clampLayerPos(l) {
        if (!l) return;
        l.x = Math.max(0, Math.min(targetWidth, l.x));
        l.y = Math.max(0, Math.min(targetHeight, l.y));
    }
    window.addEventListener('pointerup', endPointer);
    window.addEventListener('pointercancel', endPointer);

    // Magnetic snapping: pulls a dragged layer's centre onto each screen column's
    // centre, the vertical mid-line, and any other layer's centre — with a live guide.
    function applySnap(layer, nx, ny) {
        const thr = 13 / (getWrapperScale() || 1); // ~13 on-screen px, in canvas units
        const guides = [];
        const vTargets = [];
        for (let i = 0; i < screenCount; i++) vTargets.push(baseWidth * (i + 0.5));
        const hTargets = [targetHeight / 2];
        layers.forEach(l => { if (l.id !== layer.id) { vTargets.push(l.x); hTargets.push(l.y); } });

        let bestV = null, bestVd = thr;
        vTargets.forEach(t => { const d = Math.abs(nx - t); if (d < bestVd) { bestVd = d; bestV = t; } });
        if (bestV !== null) { nx = bestV; guides.push({ type: 'v', x: bestV }); }

        let bestH = null, bestHd = thr;
        hTargets.forEach(t => { const d = Math.abs(ny - t); if (d < bestHd) { bestHd = d; bestH = t; } });
        if (bestH !== null) { ny = bestH; guides.push({ type: 'h', y: bestH }); }

        return { x: nx, y: ny, guides };
    }

    // One-tap tidy: per screen column, centre everything horizontally, stack the
    // text near the top and fit the device into the space below with even padding.
    function autoArrange(padFrac) {
        if (!layers.length) return;
        const pad = baseWidth * padFrac;
        const topPad = targetHeight * 0.10;
        for (let i = 0; i < screenCount; i++) {
            const x0 = baseWidth * i, x1 = baseWidth * (i + 1);
            const cx = baseWidth * (i + 0.5);
            const inCol = layers.filter(l => l.x >= x0 && l.x < x1);
            if (!inCol.length) continue;
            inCol.forEach(l => { l.x = cx; });

            const texts = inCol.filter(l => l.type === 'text').sort((a, b) => a.y - b.y);
            const devices = inCol.filter(l => l.type === 'image');

            let y = topPad;
            texts.forEach(tl => {
                const th = (tl.height || 120) * (tl.scale || 1);
                tl.y = y + th / 2;
                y += th + targetHeight * 0.012;
            });
            const textBottom = texts.length ? y : topPad;

            const availTop = textBottom + targetHeight * 0.02;
            const availBottom = targetHeight - pad;
            devices.forEach(d => {
                const dw = d.width || baseWidth, dh = d.height || baseWidth;
                const s = Math.max(0.05, Math.min((baseWidth - 2 * pad) / dw, (availBottom - availTop) / dh));
                d.scale = s;
                d.y = (availTop + availBottom) / 2;
            });
        }
        activeGuides = [];
        updatePropsPanel();
        render();
    }

    const arrangeBtn = document.getElementById('arrange-btn');
    const paddingInput = document.getElementById('layout-padding-input');
    const paddingVal = document.getElementById('layout-padding-val');
    const currentPadFrac = () => (paddingInput ? (parseInt(paddingInput.value, 10) || 0) : 8) / 100;
    if (arrangeBtn) arrangeBtn.addEventListener('click', () => autoArrange(currentPadFrac()));
    if (paddingInput) paddingInput.addEventListener('input', () => {
        if (paddingVal) paddingVal.textContent = paddingInput.value + '%';
        autoArrange(currentPadFrac());
    });

    // --- Save / Load Project (self-contained .json with embedded screenshots) ---
    function imgToDataURL(img) {
        try {
            const w = img.naturalWidth || img.videoWidth || img.width;
            const h = img.naturalHeight || img.videoHeight || img.height;
            if (!w || !h) return null;
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            return c.toDataURL('image/png');
        } catch (e) { return null; }
    }

    function serializeProject() {
        const proj = {
            app: 'riyo-mockup', version: 1,
            preset: presetSelect.value,
            screens: screensSelect.value,
            bg: { type: bgType, presetIdx: bgPresetIdx, angle: bgAngle, color1: bgColor1, color2: bgColor2, blur: bgBlur },
            grain: { enabled: grainEnabled, val: grainVal },
            layers: layers.map(l => {
                const o = {};
                for (const k in l) { if (k === 'img') continue; o[k] = l[k]; }
                if (l.type !== 'sticker' && l.img) o.imgData = imgToDataURL(l.img);
                return o;
            })
        };
        if (bgType === 'image' && bgImgObj) proj.bg.imageData = imgToDataURL(bgImgObj);
        return proj;
    }

    function loadProjectData(proj) {
        if (!proj || proj.app !== 'riyo-mockup') {
            if (window.showToast) showToast("That doesn't look like a Mockup Studio project file.", 'error');
            return;
        }
        presetSelect.value = proj.preset || '1290x2796';
        screensSelect.value = proj.screens || '1';
        updateCanvasSize();

        const bg = proj.bg || {};
        bgType = bg.type || 'preset';
        bgPresetIdx = (bg.presetIdx != null) ? bg.presetIdx : 0;
        bgAngle = (bg.angle != null) ? bg.angle : 135;
        if (bg.color1) bgColor1 = bg.color1;
        if (bg.color2) bgColor2 = bg.color2;
        bgBlur = (bg.blur != null) ? bg.blur : 0;
        if (proj.grain) { grainEnabled = !!proj.grain.enabled; grainVal = (proj.grain.val != null) ? proj.grain.val : grainVal; }

        bgImgObj = null;
        if (bgType === 'image' && bg.imageData) { const im = new Image(); im.onload = render; im.src = bg.imageData; bgImgObj = im; }

        layers = (proj.layers || []).map(o => {
            const l = Object.assign({}, o);
            delete l.imgData;
            if (!l.id) l.id = generateId();
            if (l.type === 'sticker') { l.img = stickers[l.stickerId] || null; }
            else if (o.imgData) { const im = new Image(); im.onload = render; im.src = o.imgData; l.img = im; }
            return l;
        });

        selectedLayerId = null;
        if (typeof syncBgControls === 'function') syncBgControls();
        updatePropsPanel();
        render();
        if (window.showToast) showToast('Project loaded.', 'success');
    }

    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) saveProjectBtn.addEventListener('click', () => {
        const json = JSON.stringify(serializeProject());
        saveBlob(new Blob([json], { type: 'application/json' }), 'mockup-project.json', 'application/json');
        const dd = document.getElementById('project-dropdown'); if (dd) dd.style.display = 'none';
    });
    const openProjectBtn = document.getElementById('open-project-btn');
    const projectInput = document.getElementById('project-upload-input');
    if (openProjectBtn && projectInput) openProjectBtn.addEventListener('click', () => projectInput.click());
    if (projectInput) projectInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { try { loadProjectData(JSON.parse(reader.result)); } catch (err) { if (window.showToast) showToast("Couldn't read that project file.", 'error'); } };
        reader.readAsText(file);
        e.target.value = '';
        const dd = document.getElementById('project-dropdown'); if (dd) dd.style.display = 'none';
    });

    // --- Properties Panel Sync ---
    function updatePropsPanel() {
        renderMobileQuickEdit();
        // The toolbar screenshot button fills the selected device, else adds a new one.
        const selForBtn = layers.find(l => l.id === selectedLayerId && l.type === 'image');
        if (addDeviceBtn) addDeviceBtn.textContent = selForBtn ? '🖼️ Replace Screenshot' : '+ Screenshot';
        if (!selectedLayerId) {
            if(propsCanvas) propsCanvas.style.display = 'block';
            if(propsText) propsText.style.display = 'none';
            if(propsImage) propsImage.style.display = 'none';
            if(propsShape) propsShape.style.display = 'none';
            if(noSelectionMsg) noSelectionMsg.style.display = 'block';
            if(bgBlurInput) bgBlurInput.value = bgBlur;
            return;
        }

        if(noSelectionMsg) noSelectionMsg.style.display = 'none';
        if(propsCanvas) propsCanvas.style.display = 'none';
        
        const layer = layers.find(l => l.id === selectedLayerId);
        if (!layer) return;

        if (layer.type === 'text') {
            if(propsText) propsText.style.display = 'flex';
            if(propsImage) propsImage.style.display = 'none';
            if(propsShape) propsShape.style.display = 'none';
            
            if(textInput) textInput.value = layer.content;
            if(colorInput) colorInput.value = layer.color;
            if(pillToggle) pillToggle.checked = !!layer.pill;
            if(pillColorInput) pillColorInput.value = layer.pillColor || '#10B981';
            if(pillColorRow) pillColorRow.style.display = layer.pill ? 'flex' : 'none';
            if(fontSelect) fontSelect.value = layer.fontFamily || 'Inter';
            if(weightSelect) weightSelect.value = layer.fontWeight || '800';
            if(textRotateInput) textRotateInput.value = layer.rotation || 0;
            if(textShadowBlur) textShadowBlur.value = layer.shadowBlur || 0;
            if(textShadowColor) textShadowColor.value = layer.shadowColor || '#000000';
            
            if(alignGroup) {
                Array.from(alignGroup.children).forEach(btn => {
                    if(btn.dataset.align === (layer.textAlign || 'center')) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            }
        } else if (layer.type === 'shape') {
            if(propsText) propsText.style.display = 'none';
            if(propsImage) propsImage.style.display = 'none';
            if(propsShape) propsShape.style.display = 'flex';
            
            if(shapeTypeSelect) shapeTypeSelect.value = layer.shapeType;
            if(shapeColorInput) shapeColorInput.value = layer.color;
            if(shapeRotateInput) shapeRotateInput.value = layer.rotation || 0;
            if(shapeRadiusInput) shapeRadiusInput.value = layer.radius || 0;
            if(shapeWidthInput) shapeWidthInput.value = layer.width || baseWidth;
            if(shapeHeightInput) shapeHeightInput.value = layer.height || baseWidth;
        } else if (layer.type === 'image' || layer.type === 'sticker') {
            if(propsText) propsText.style.display = 'none';
            if(propsShape) propsShape.style.display = 'none';
            if(propsImage) propsImage.style.display = 'flex';
            
            if(rotateInput) rotateInput.value = layer.rotation || 0;
            if(shadowBlurInput) shadowBlurInput.value = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
            if(shadowOpInput) shadowOpInput.value = layer.shadowOp !== undefined ? layer.shadowOp : 50;
            if(shadowAngleInput) shadowAngleInput.value = layer.shadowAngle !== undefined ? layer.shadowAngle : 90;
            if(shadowDistInput) shadowDistInput.value = layer.shadowDistance !== undefined ? layer.shadowDistance : (layer.shadowBlur !== undefined ? layer.shadowBlur/2 : 40);
            
            if (layer.type === 'image') {
                if(document.getElementById('frame-style-container')) document.getElementById('frame-style-container').style.display = 'block';
                if(document.getElementById('glare-shadow-toggles')) document.getElementById('glare-shadow-toggles').style.display = 'flex';
                if(frameSelect) {
                    frameSelect.value = layer.frameStyle;
                    if(frameColorContainer) frameColorContainer.style.display = COLOURABLE_FRAMES.includes(layer.frameStyle) ? 'block' : 'none';
                }
                // Default the picker to the device's natural body colour when unset.
                const defColour = layer.frameStyle === 'clay' ? '#f8f9fa' : '#0b0b0d';
                if(frameColorInput) frameColorInput.value = layer.frameColor || defColour;
                if(typeof syncColourSwatches === 'function') syncColourSwatches();
                if(tiltYInput && tiltYInput.parentElement) tiltYInput.parentElement.style.display = 'flex';
                if(tiltYInput) tiltYInput.value = layer.persY || 0;
                if(tiltXInput && tiltXInput.parentElement) tiltXInput.parentElement.style.display = 'flex';
                if(tiltXInput) tiltXInput.value = layer.persX || 0;
                if(glareToggle) glareToggle.checked = layer.hasGlare || false;
                if(floorShadowToggle) floorShadowToggle.checked = layer.hasFloorShadow || false;
                if(reflectionToggle) reflectionToggle.checked = layer.hasReflection || false;
                // Crop controls only apply when the photo is masked into a device frame.
                const cropable = !!DEVICE_SCREENS[layer.frameStyle];
                if(cropControls) cropControls.style.display = cropable ? 'block' : 'none';
                if(cropable) {
                    if(imgZoomInput) imgZoomInput.value = layer.imgZoom || 1;
                    if(imgPosXInput) imgPosXInput.value = Math.round((layer.imgOffsetX || 0) * 100);
                    if(imgPosYInput) imgPosYInput.value = Math.round((layer.imgOffsetY || 0) * 100);
                }
            } else {
                if(document.getElementById('frame-style-container')) document.getElementById('frame-style-container').style.display = 'none';
                if(document.getElementById('glare-shadow-toggles')) document.getElementById('glare-shadow-toggles').style.display = 'none';
                if(cropControls) cropControls.style.display = 'none';
                if(tiltYInput && tiltYInput.parentElement) tiltYInput.parentElement.style.display = 'none';
                if(tiltXInput && tiltXInput.parentElement) tiltXInput.parentElement.style.display = 'none';
            }
        }
    }

    // Property Listeners Helper
    const bindLayerSync = (element, propName, isInt = false) => {
        if(!element) return;
        element.addEventListener('input', (e) => {
            const l = layers.find(x => x?.id === selectedLayerId);
            if (l) { l[propName] = isInt ? parseInt(e.target.value) || 0 : e.target.value; scheduleRender(); }
        });
    };

    bindLayerSync(textInput, 'content');
    bindLayerSync(colorInput, 'color');
    bindLayerSync(fontSelect, 'fontFamily');
    bindLayerSync(weightSelect, 'fontWeight');
    bindLayerSync(textRotateInput, 'rotation', true);
    bindLayerSync(textShadowBlur, 'shadowBlur', true);
    bindLayerSync(textShadowColor, 'shadowColor');
    bindLayerSync(pillColorInput, 'pillColor');
    if (pillToggle) pillToggle.addEventListener('change', () => {
        const l = layers.find(x => x?.id === selectedLayerId);
        if (l) { l.pill = pillToggle.checked; if (pillColorRow) pillColorRow.style.display = pillToggle.checked ? 'flex' : 'none'; scheduleRender(); }
    });

    bindLayerSync(shapeTypeSelect, 'shapeType');
    bindLayerSync(shapeColorInput, 'color');
    bindLayerSync(shapeRotateInput, 'rotation', true);
    bindLayerSync(shapeRadiusInput, 'radius', true);
    bindLayerSync(shapeWidthInput, 'width', true);
    bindLayerSync(shapeHeightInput, 'height', true);

    if (frameSelect) {
        frameSelect.addEventListener('input', (e) => {
            const l = layers.find(x => x?.id === selectedLayerId);
            if (!l) return;
            const newFrame = e.target.value;
            // Re-fit the layer to the new device's fixed proportions (or the photo's
            // own ratio for "none"), keeping its on-canvas height roughly stable, and
            // reset the crop so the screenshot re-centres in the new frame.
            const visualH = (l.height || 1) * (l.scale || 1);
            const dim = frameDims(newFrame, l.img);
            l.frameStyle = newFrame;
            l.width = dim.w; l.height = dim.h;
            l.scale = visualH / dim.h;
            l.imgOffsetX = 0; l.imgOffsetY = 0; l.imgZoom = 1;
            if (frameColorContainer) frameColorContainer.style.display = COLOURABLE_FRAMES.includes(newFrame) ? 'block' : 'none';
            syncColourSwatches();
            updatePropsPanel();
            scheduleRender();
        });
    }
    bindLayerSync(frameColorInput, 'frameColor');
    if (frameColorInput) frameColorInput.addEventListener('input', syncColourSwatches);

    // Crop controls — zoom and pan the screenshot inside its device frame.
    if (imgZoomInput) imgZoomInput.addEventListener('input', (e) => {
        const l = layers.find(x => x?.id === selectedLayerId);
        if (l) { l.imgZoom = Math.max(1, parseFloat(e.target.value) || 1); scheduleRender(); }
    });
    if (imgPosXInput) imgPosXInput.addEventListener('input', (e) => {
        const l = layers.find(x => x?.id === selectedLayerId);
        if (l) { l.imgOffsetX = (parseInt(e.target.value) || 0) / 100; scheduleRender(); }
    });
    if (imgPosYInput) imgPosYInput.addEventListener('input', (e) => {
        const l = layers.find(x => x?.id === selectedLayerId);
        if (l) { l.imgOffsetY = (parseInt(e.target.value) || 0) / 100; scheduleRender(); }
    });

    // Device-colour preset swatches → set the selected layer's frame colour.
    function syncColourSwatches() {
        const l = layers.find(x => x?.id === selectedLayerId);
        const cur = (l && l.frameColor || frameColorInput.value || '').toLowerCase();
        document.querySelectorAll('#frame-color-swatches .frame-swatch').forEach((b) => {
            b.classList.toggle('active', (b.dataset.color || '').toLowerCase() === cur);
        });
    }
    document.querySelectorAll('#frame-color-swatches .frame-swatch').forEach((btn) => {
        btn.addEventListener('click', () => {
            const c = btn.dataset.color;
            const l = layers.find(x => x?.id === selectedLayerId);
            if (l) { l.frameColor = c; }
            if (frameColorInput) frameColorInput.value = c;
            syncColourSwatches();
            scheduleRender();
        });
    });
    bindLayerSync(rotateInput, 'rotation', true);
    // The single Tilt control now drives the true 3D perspective.
    bindLayerSync(tiltYInput, 'persY', true);
    bindLayerSync(tiltXInput, 'persX', true);
    bindLayerSync(shadowBlurInput, 'shadowBlur', true);
    bindLayerSync(shadowOpInput, 'shadowOp', true);
    bindLayerSync(shadowAngleInput, 'shadowAngle', true);
    bindLayerSync(shadowDistInput, 'shadowDistance', true);
    
    if(alignGroup) alignGroup.addEventListener('click', (e) => {
        if(e.target.tagName !== 'BUTTON') return;
        const l = layers.find(x => x?.id === selectedLayerId);
        if (l) { l.textAlign = e.target.dataset.align; updatePropsPanel(); render(); }
    });

    if(glareToggle) glareToggle.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.hasGlare = e.target.checked; render(); } });
    if(floorShadowToggle) floorShadowToggle.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.hasFloorShadow = e.target.checked; render(); } });
    if(reflectionToggle) reflectionToggle.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.hasReflection = e.target.checked; render(); } });

    // Layer Ordering & Deletion
    const deleteLayer = () => { 
        if(selectedLayerId) { 
            layers = layers.filter(l => l.id !== selectedLayerId);
            selectedLayerId = null;
            if (!autoRotate) isAnimating = false;

            updatePropsPanel();
            render();
        } 
    };
    const bringForward = () => { if(selectedLayerId) { const i = layers.findIndex(l => l.id === selectedLayerId); if(i < layers.length - 1){ const t = layers[i]; layers[i] = layers[i+1]; layers[i+1] = t; render(); } } };
    const sendBackward = () => { if(selectedLayerId) { const i = layers.findIndex(l => l.id === selectedLayerId); if(i > 0){ const t = layers[i]; layers[i] = layers[i-1]; layers[i-1] = t; render(); } } };

    ['delete-text-btn','delete-image-btn','delete-shape-btn'].forEach(id => { const b = document.getElementById(id); if(b) b.addEventListener('click', deleteLayer); });
    ['text-bring-forward-btn','bring-forward-btn','shape-bring-forward-btn'].forEach(id => { const b = document.getElementById(id); if(b) b.addEventListener('click', bringForward); });
    ['text-send-backward-btn','send-backward-btn','shape-send-backward-btn'].forEach(id => { const b = document.getElementById(id); if(b) b.addEventListener('click', sendBackward); });

    window.addEventListener('keydown', (e) => { if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId && document.activeElement !== textInput) deleteLayer(); });

    // Background Panel
    document.querySelectorAll('.bg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const bg = e.target.dataset.bg;
            bgType = 'gradient';
            if (bg === 'gradient-1') { bgColor1 = '#FF6B6B'; bgColor2 = '#4ECDC4'; }
            if (bg === 'gradient-2') { bgColor1 = '#A8FF78'; bgColor2 = '#78FFD6'; }
            if (bg === 'gradient-3') { bgColor1 = '#667EEA'; bgColor2 = '#764BA2'; }
            if (bg === 'gradient-4') { bgColor1 = '#FF9A9E'; bgColor2 = '#FECFEF'; }
            if (bg === 'gradient-5') { bgColor1 = '#fceabb'; bgColor2 = '#f8b500'; } // Sunset
            if (bg === 'gradient-6') { bgColor1 = '#8A2387'; bgColor2 = '#F27121'; } // Cyberpunk
            if (bg === 'gradient-7') { bgColor1 = '#093028'; bgColor2 = '#237A57'; } // Forest
            if (bg === 'gradient-8') { bgColor1 = '#2C3E50'; bgColor2 = '#000000'; } // Dark
            if (bg === 'solid-dark') { bgType = 'solid'; bgColor1 = '#111'; }
            if (bg === 'solid-light') { bgType = 'solid'; bgColor1 = '#ffffff'; }
            if (bg === 'transparent') { bgType = 'transparent'; }
            bgPresetIdx = -1; // leaving the premium gallery
            syncBgControls();
            render();
        });
    });

    // Premium background gallery — one-tap high-end gradients & mesh blends.
    const bgGallery = document.getElementById('bg-preset-gallery');
    const bgAngleInput = document.getElementById('bg-angle-input');
    if (bgGallery) {
        BG_PRESETS.forEach((p, idx) => {
            const sw = document.createElement('div');
            sw.className = 'bg-btn';
            sw.dataset.idx = idx;
            sw.title = p.name;
            sw.style.cssText = `aspect-ratio:1; border-radius:50%; cursor:pointer; border:2px solid transparent; background:${bgPresetCss(p)};`;
            sw.addEventListener('click', () => {
                bgType = 'preset'; bgPresetIdx = idx; bgAngle = (p.angle != null ? p.angle : 135);
                document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
                sw.classList.add('active');
                if (bgAngleInput) bgAngleInput.value = bgAngle;
                render();
            });
            bgGallery.appendChild(sw);
        });
    }
    if (bgAngleInput) bgAngleInput.addEventListener('input', (e) => {
        bgAngle = parseInt(e.target.value) || 0;
        if (bgType === 'preset') scheduleRender();
    });

    // --- Bulk Export Kit ---
    function base64ToBlob(base64) {
        const parts = base64.split(';base64,');
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
        return new Blob([uInt8Array], { type: parts[0].split(':')[1] });
    }

    function isIOS() {
        return /iP(hone|ad|od)/.test(navigator.userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    // iOS Safari ignores the <a download> attribute for blob URLs — the file
    // saves to Files with no name or extension (so a .zip can't be opened).
    // Hand those off to the native share sheet instead, which keeps the real
    // filename; everywhere else the direct download is faster and quieter.
    async function saveBlobs(files) {
        if (isIOS() && navigator.canShare) {
            try {
                const fileObjs = files.map(f => new File([f.blob], f.name, { type: f.type || f.blob.type || 'application/octet-stream' }));
                if (navigator.canShare({ files: fileObjs })) {
                    await navigator.share({ files: fileObjs });
                    return;
                }
            } catch (e) {
                if (e && e.name === 'AbortError') return;
            }
        }
        files.forEach(f => {
            const url = URL.createObjectURL(f.blob);
            const a = document.createElement('a');
            a.href = url; a.download = f.name; a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        });
    }

    function saveBlob(blob, name, type) {
        return saveBlobs([{ blob, name, type }]);
    }

    const exportZipBtn = document.getElementById('export-zip-btn');
    if (exportZipBtn) {
        exportZipBtn.addEventListener('click', async () => {
            const iosShare = isIOS() && navigator.canShare;
            if (!iosShare && !window.JSZip) return alert("JSZip library is still loading. Please try again in a second.");

            exportZipBtn.innerText = "GENERATING...";
            const prevSelected = selectedLayerId;
            selectedLayerId = null;

            // Pick the export set from the CURRENT canvas — a tall phone canvas gets
            // the full App Store phone kit; anything else (square/landscape/tablet/
            // social) exports at its own size so it isn't cropped into portrait.
            const [pw, ph] = presetSelect.value.split('x').map(Number);
            const formats = (ph / pw > 1.9)
                ? [
                    { name: "iPhone_6.9_inch", w: 1290, h: 2796 },
                    { name: "iPhone_6.7_inch", w: 1284, h: 2778 },
                    { name: "iPhone_6.5_inch", w: 1242, h: 2688 },
                    { name: "iPhone_5.5_inch", w: 1242, h: 2208 }
                  ]
                : [{ name: "Mockup", w: pw, h: ph }];

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            // Render every format/screen up front and SYNCHRONOUSLY. iOS only lets
            // navigator.share() run while the tap's user activation is still live,
            // and any await (like zip.generateAsync) before it voids that — so we
            // build the blobs first and keep the share call gesture-bound.
            const files = [];
            for (let fmt of formats) {
                tempCanvas.width = fmt.w; tempCanvas.height = fmt.h;
                const scale = Math.max(fmt.w / baseWidth, fmt.h / targetHeight);

                for (let i = 0; i < screenCount; i++) {
                    const actualBaseW = baseWidth * scale;
                    const actualH = targetHeight * scale;
                    const offsetY = (fmt.h - actualH) / 2;
                    const offsetX = ((fmt.w - actualBaseW) / 2) - (actualBaseW * i);

                    renderSceneToContext(tempCtx, fmt.w, fmt.h, false, scale, offsetX, offsetY);
                    const blob = base64ToBlob(tempCanvas.toDataURL('image/png', 1.0));
                    const flat = screenCount === 1 ? `${fmt.name}.png` : `${fmt.name}_Screen_${i + 1}.png`;
                    const zipPath = screenCount === 1 ? `${fmt.name}.png` : `Panoramic_${fmt.name}/Screen_${i + 1}.png`;
                    files.push({ blob, name: flat, zipPath, type: 'image/png' });
                }
            }

            selectedLayerId = prevSelected; render();

            // iOS can't usefully open a .zip on-device, and zipping needs an async
            // build that would kill the share gesture — so push the PNGs straight
            // to the share sheet (Save to Photos / Files). Desktop & Android get the zip.
            const fileObjs = files.map(f => new File([f.blob], f.name, { type: f.type }));
            if (iosShare && navigator.canShare({ files: fileObjs })) {
                try {
                    await navigator.share({ files: fileObjs, title: 'App Store Kit' });
                } catch (e) {
                    if (!(e && e.name === 'AbortError')) showToast("Couldn't open the share sheet, mate — try Export PNG instead.", "error");
                }
                exportZipBtn.innerText = "⬇ App Store Kit (.zip)";
                return;
            }

            const zip = new JSZip();
            files.forEach(f => zip.file(f.zipPath, f.blob));
            const zipBlob = await zip.generateAsync({ type: "blob" });
            await saveBlob(zipBlob, `AppStore_Kit.zip`, 'application/zip');
            exportZipBtn.innerText = "⬇ App Store Kit (.zip)";
        });
    }

    const formatSelect = document.getElementById('export-format-select');
    const scaleSelect = document.getElementById('export-scale-select');
    const transparentToggle = document.getElementById('export-transparent-toggle');
    const transparentLabel = document.getElementById('export-transparent-label');
    const copyBtn = document.getElementById('export-copy-btn');

    // JPEG has no alpha channel — disable the transparent option when it's picked.
    function syncTransparentAvailability() {
        const jpg = formatSelect && formatSelect.value === 'jpg';
        if (transparentToggle) transparentToggle.disabled = jpg;
        if (transparentLabel) { transparentLabel.style.opacity = jpg ? '0.4' : '1'; transparentLabel.style.pointerEvents = jpg ? 'none' : 'auto'; }
    }
    if (formatSelect) formatSelect.addEventListener('change', syncTransparentAvailability);
    syncTransparentAvailability();

    // Render the current scene to image blob(s) at the chosen format / resolution.
    // forcePng lets the clipboard path demand PNG (the only format browsers reliably
    // accept) while still honouring the scale + transparency choices.
    function buildExportFiles(forcePng = false) {
        const fmt = forcePng ? 'png' : (formatSelect ? formatSelect.value : 'png');
        const mime = fmt === 'jpg' ? 'image/jpeg' : fmt === 'webp' ? 'image/webp' : 'image/png';
        const ext = fmt === 'jpg' ? 'jpg' : fmt;
        const quality = fmt === 'png' ? 1.0 : 0.95;
        const scale = scaleSelect ? (parseInt(scaleSelect.value, 10) || 1) : 1;
        const wantTransparent = transparentToggle && transparentToggle.checked && fmt !== 'jpg';

        const fullW = Math.round(targetWidth * scale);
        const fullH = Math.round(targetHeight * scale);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = fullW; tempCanvas.height = fullH;
        const tempCtx = tempCanvas.getContext('2d');

        exportTransparent = wantTransparent;
        renderSceneToContext(tempCtx, fullW, fullH, false, scale, 0, 0);
        exportTransparent = false;

        const files = [];
        if (screenCount > 1) {
            const sliceW = Math.round(baseWidth * scale);
            const slice = document.createElement('canvas');
            slice.width = sliceW; slice.height = fullH;
            const sctx = slice.getContext('2d');
            for (let i = 0; i < screenCount; i++) {
                sctx.clearRect(0, 0, sliceW, fullH);
                sctx.drawImage(tempCanvas, -i * sliceW, 0);
                files.push({ blob: base64ToBlob(slice.toDataURL(mime, quality)), name: `mockup-screen-${i + 1}-${sliceW}x${fullH}.${ext}`, type: mime });
            }
        } else {
            files.push({ blob: base64ToBlob(tempCanvas.toDataURL(mime, quality)), name: `mockup-${fullW}x${fullH}.${ext}`, type: mime });
        }
        return files;
    }

    const exportPngBtn = document.getElementById('export-png-btn');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', async () => {
            const files = buildExportFiles();
            await saveBlobs(files);
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
                return showToast("This browser can't copy images — use ⬇ Image instead.", 'error');
            }
            const original = copyBtn.innerText;
            try {
                const [file] = buildExportFiles(true);
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': file.blob })]);
                copyBtn.innerText = '✓ Copied';
                if (window.showToast) showToast(screenCount > 1 ? 'Copied screen 1 — use ⬇ Image for the full set.' : 'Mockup copied to clipboard.', 'success');
            } catch (e) {
                if (window.showToast) showToast("Couldn't copy to clipboard — use ⬇ Image instead.", 'error');
            } finally {
                setTimeout(() => { copyBtn.innerText = original; }, 1600);
            }
        });
    }


    init();
});
