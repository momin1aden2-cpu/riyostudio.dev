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
    setupDropdown('add-sticker-menu-btn', 'sticker-dropdown');
    setupDropdown('add-shape-menu-btn', 'shape-dropdown');
    setupDropdown('add-template-menu-btn', 'template-dropdown');

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
    let grainEnabled = false;
    let grainVal = 35;

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
            screens: screensSelect.value
        };
        try { localStorage.setItem('riyo_mockup_prefs', JSON.stringify(prefs)); } catch (e) { /* quota — ignore */ }
    }
    // render() runs on every frame (and during auto-rotate/drag), so coalesce saves.
    let _saveTimer = null;
    function saveSoon() { clearTimeout(_saveTimer); _saveTimer = setTimeout(savePrefs, 400); }

    // --- Initialization ---
    function init() {
        loadPrefs();
        syncBgControls();
        updateCanvasSize();
        window.addEventListener('resize', scaleWrapperToFit);
        // Open on a finished template so the canvas is never blank.
        if (layers.length === 0) loadTemplate('apple-minimal');
        else render();
    }

    function generateId() { return Math.random().toString(36).substr(2, 9); }

    // --- Canvas Sizing ---
    let canvasInitialized = false;
    function updateCanvasSize() {
        const [w, h] = presetSelect.value.split('x').map(Number);
        baseWidth = w;
        screenCount = parseInt(screensSelect.value);
        targetWidth = baseWidth * screenCount;
        targetHeight = h;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        wrapper.style.width = `${targetWidth}px`;
        wrapper.style.height = `${targetHeight}px`;

        if (canvasInitialized) {
            // Removed aggressive auto-centering so users can manually position things
            updatePropsPanel();
        }
        canvasInitialized = true;
        
        scaleWrapperToFit();
        render();
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
        const scale = Math.max(0.02, Math.min(scaleW, scaleH));

        wrapper.style.transform = `scale(${scale})`;
    }

    // --- Layers API ---
    function addTextLayer() {
        layers.push({
            id: generateId(), type: 'text', content: 'HEADING TITLE',
            color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center',
            shadowColor: '#000000', shadowBlur: 0,
            x: targetWidth / 2, y: 300, scale: 1, rotation: 0, fontSize: 120, width: 0, height: 120
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function addImageLayer(imgObj, offset = 0) {
        const w = imgObj.videoWidth || imgObj.width || 800;
        const h = imgObj.videoHeight || imgObj.height || 800;
        const initialScale = Math.min(1.5, (targetHeight * 0.85) / h);
        layers.push({
            id: generateId(), type: 'image', img: imgObj, frameStyle: 'iphone',
            x: (targetWidth / 2) + (offset * 80), y: (targetHeight / 2) + (offset * 80),
            scale: initialScale, width: w, height: h,
            rotation: 0, tiltY: 0, shadowBlur: 80, shadowOp: 50, hasGlare: false, hasFloorShadow: false
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
            rotation: 0, tiltY: 0, shadowBlur: 40, shadowOp: 30
        });
        selectedLayerId = layers[layers.length - 1].id;
        document.getElementById('sticker-dropdown').style.display = 'none';
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
        document.getElementById('shape-dropdown').style.display = 'none';
        updatePropsPanel();
        render();
    }

    function loadTemplate(type) {
        layers = [];
        selectedLayerId = null;

        const phApp = new Image(); phApp.onload = render; phApp.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="2340"><rect width="1080" height="2340" fill="%23222"/><text x="540" y="1170" font-family="Arial" font-size="50" fill="%23555" text-anchor="middle">App Screen</text></svg>';
        const phMac = new Image(); phMac.onload = render; phMac.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="%23222"/><text x="600" y="400" font-family="Arial" font-size="40" fill="%23555" text-anchor="middle">MacBook Screen</text></svg>';

        // ==========================================
        // APPLE APP STORE — Premium Set (1242x2688)
        // ==========================================
        if (type === 'apple-minimal') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#f5f5f7';
            const tOpt = { type: 'text', color: '#1d1d1f', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 78, width: 1050, height: 240, y: 360 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.92, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 90, shadowOp: 18, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1620 };
            const t = ['Everything in one place.', 'Beautifully simple.', 'Designed for focus.', 'Private by default.', 'Get started free.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-gradient') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#6a11cb'; bgColor2 = '#2575fc';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 20, scale: 1, rotation: 0, fontSize: 90, width: 1050, height: 280, y: 380 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.9, width: 1080, height: 2340, rotation: 0, tiltY: 12, shadowBlur: 140, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1650 };
            const t = ['Power in your pocket.', 'Faster than ever.', 'Made to move.', 'Insights that matter.', 'Start today.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-darkpro') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0b0f17'; bgColor2 = '#020409';
            const tOpt = { type: 'text', color: '#34d399', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: '#34d399', shadowBlur: 30, scale: 1, rotation: 0, fontSize: 80, width: 1050, height: 240, y: 360 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.9, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 160, shadowOp: 70, shadowColor: '#34d399', hasGlare: true, hasFloorShadow: false, y: 1640 };
            const t = ['Precision, engineered.', 'Real-time control.', 'Bank-grade security.', 'Built to scale.', 'Upgrade to Pro.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-panorama') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#111827'; bgColor2 = '#0b1220';
            layers.push({ id: generateId(), type: 'text', content: 'GO FURTHER', color: 'rgba(255,255,255,0.06)', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 520, width: 9000, height: 700, x: targetWidth/2, y: 1344 });
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 54, width: 1000, height: 160, y: 320 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.82, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 120, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1750 };
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
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt, tiltY: tilts[i] });
        }
        else if (type === 'apple-spotlight') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1f2937'; bgColor2 = '#000000';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '300', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 62, width: 1050, height: 200, y: 2350 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.95, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 180, shadowOp: 70, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1450 };
            const t = ['Introducing.', 'Crafted to perfection.', 'Every detail counts.', 'Simply powerful.', 'Experience it.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-sport') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f12711'; bgColor2 = '#f5af19';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, scale: 1, rotation: -6, fontSize: 92, width: 1100, height: 300, y: 380 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.88, width: 1080, height: 2340, rotation: -8, tiltY: 10, shadowBlur: 130, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1680 };
            const t = ['GO HARDER.', 'TRACK EVERY REP.', 'BEAT YOUR BEST.', 'TRAIN SMARTER.', 'WIN THE DAY.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-business') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1e3c72'; bgColor2 = '#2a5298';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 68, width: 1050, height: 240, y: 350 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.9, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 100, shadowOp: 40, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1640 };
            const t = ['Run your business better.', 'Insights in real time.', 'Collaborate seamlessly.', 'Secure and compliant.', 'Scale with confidence.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'apple-reviews') {
            presetSelect.value = '1242x2688'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#fafafa';
            const tOpt = { type: 'text', color: '#111827', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 56, width: 1050, height: 240, y: 520 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.82, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 90, shadowOp: 20, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1720 };
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
            const dOpt = { type: 'image', img: phApp, frameStyle: 'iphone', scale: 0.95, width: 1080, height: 2340, rotation: -6, tiltY: 24, shadowBlur: 150, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1680 };
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
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 90, shadowOp: 20, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1350 };
            const t = ['Simple. Powerful.', 'All your tools.', 'Work anywhere.', 'Stay in sync.', 'Free to start.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-cinematic') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f2027'; bgColor2 = '#203a43';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 58, width: 950, height: 240, y: 250 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 120, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1380 };
            const t = ['Cinematic by\ndefault', 'Capture every\nmoment', 'Edit like\na pro', 'Share\ninstantly', 'Go further'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-material') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#d7e3ff'; bgColor2 = '#e8def8';
            const tOpt = { type: 'text', color: '#1b1b1f', fontFamily: 'Inter', fontWeight: '700', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 60, width: 950, height: 220, y: 300 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'clay', scale: 0.72, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 80, shadowOp: 18, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true, y: 1380 };
            const t = ['Made for you.', 'Personal & private.', 'Smooth & fast.', 'Beautifully native.', 'Get it on Play.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-benefit') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#11998e'; bgColor2 = '#38ef7d';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 12, scale: 1, rotation: 0, fontSize: 64, width: 950, height: 240, y: 300 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 0, tiltY: 8, shadowBlur: 120, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1380 };
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
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt, tiltY: tilts[i] });
        }
        else if (type === 'gplay-neon') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#3a1c71'; bgColor2 = '#d76d77';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'JetBrains Mono', fontWeight: '800', textAlign: 'center', shadowColor: '#000000', shadowBlur: 15, scale: 1, rotation: 0, fontSize: 68, width: 950, height: 200, y: 250 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.72, width: 1080, height: 2340, rotation: 8, tiltY: 12, shadowBlur: 150, shadowOp: 80, shadowColor: '#d76d77', hasGlare: true, hasFloorShadow: false, y: 1380 };
            const t = ['LEVEL UP', 'NO LIMITS', 'PLAY FREE', 'JOIN GUILDS', 'WIN BIG'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-spotlight') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1e293b'; bgColor2 = '#020617';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '300', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 54, width: 950, height: 180, y: 1720 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.75, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 180, shadowOp: 70, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1150 };
            const t = ['Introducing.', 'Refined.', 'Powerful.', 'Effortless.', 'Yours.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-sport') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f12711'; bgColor2 = '#f5af19';
            const tOpt = { type: 'text', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.3)', shadowBlur: 15, scale: 1, rotation: -6, fontSize: 70, width: 980, height: 260, y: 280 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.7, width: 1080, height: 2340, rotation: -8, tiltY: 10, shadowBlur: 130, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1400 };
            const t = ['GO HARDER.', 'TRACK IT ALL.', 'BEAT YOUR BEST.', 'TRAIN SMART.', 'WIN TODAY.'];
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), content: t[i], x: baseWidth*(i+0.5), ...tOpt });
            for (let i = 0; i < 5; i++) layers.push({ id: generateId(), x: baseWidth*(i+0.5), ...dOpt });
        }
        else if (type === 'gplay-reviews') {
            presetSelect.value = '1080x1920'; screensSelect.value = '5'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#fafafa';
            const tOpt = { type: 'text', color: '#202124', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, scale: 1, rotation: 0, fontSize: 50, width: 950, height: 200, y: 420 };
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.64, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 90, shadowOp: 20, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false, y: 1450 };
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
            const dOpt = { type: 'image', img: phApp, frameStyle: 'android', scale: 0.74, width: 1080, height: 2340, rotation: -6, tiltY: 22, shadowBlur: 150, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true, y: 1420 };
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
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'clay', x: baseWidth/2, y: 880, scale: 0.44, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 120, shadowOp: 50, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true });
        }
        else if (type === 'sq-feature') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#6a11cb'; bgColor2 = '#2575fc';
            layers.push({ id: generateId(), type: 'text', content: 'One tap. Done.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 15, x: baseWidth/2, y: 250, scale: 1, rotation: 0, fontSize: 80, width: 950, height: 180 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 720, scale: 0.5, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 130, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-quote') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f2027'; bgColor2 = '#203a43';
            layers.push({ id: generateId(), type: 'shape', shapeType: 'circle', color: '#f5af19', x: 250, y: 540, width: 600, height: 600, scale: 1, rotation: 0, shadowBlur: 200, shadowColor: '#f12711', opacity: 30 });
            layers.push({ id: generateId(), type: 'text', content: '"This app completely\nchanged how I work."', color: '#ffffff', fontFamily: 'Inter', fontWeight: '600', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 110, y: 380, scale: 1, rotation: 0, fontSize: 48, width: 560, height: 300 });
            layers.push({ id: generateId(), type: 'text', content: '★★★★★', color: '#f5af19', fontFamily: 'Inter', fontWeight: '900', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 110, y: 640, scale: 1, rotation: 0, fontSize: 60, width: 400, height: 100 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 820, y: 600, scale: 0.45, width: 1080, height: 2340, rotation: 0, tiltY: 15, shadowBlur: 100, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-compare') {
            presetSelect.value = '1080x1080'; screensSelect.value = '2'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#ffffff'; bgColor2 = '#111111';
            layers.push({ id: generateId(), type: 'text', content: 'BEFORE', color: '#000000', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 200, scale: 1, rotation: 0, fontSize: 70, width: 500, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 660, scale: 0.42, width: 1080, height: 2340, rotation: 0, tiltY: -10, shadowBlur: 80, shadowOp: 30, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'text', content: 'AFTER', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth*1.5, y: 200, scale: 1, rotation: 0, fontSize: 70, width: 500, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth*1.5, y: 660, scale: 0.42, width: 1080, height: 2340, rotation: 0, tiltY: 10, shadowBlur: 80, shadowOp: 80, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
        }
        else if (type === 'sq-promo') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f12711'; bgColor2 = '#f5af19';
            layers.push({ id: generateId(), type: 'text', content: 'LAUNCH WEEK', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 15, x: baseWidth/2, y: 230, scale: 1, rotation: 0, fontSize: 92, width: 1000, height: 160 });
            layers.push({ id: generateId(), type: 'text', content: 'Limited-time offer inside.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 370, scale: 1, rotation: 0, fontSize: 42, width: 900, height: 100 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 760, scale: 0.48, width: 1080, height: 2340, rotation: 0, tiltY: -8, shadowBlur: 130, shadowOp: 55, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-minimal') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'color'; bgColor1 = '#f5f5f7';
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'clay', x: baseWidth/2, y: 470, scale: 0.5, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 90, shadowOp: 18, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'text', content: 'Designed for you.', color: '#1d1d1f', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 940, scale: 1, rotation: 0, fontSize: 46, width: 800, height: 100 });
        }
        else if (type === 'sq-gradient') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#ff9a9e'; bgColor2 = '#fecfef';
            layers.push({ id: generateId(), type: 'text', content: 'Made to delight.', color: '#4a154b', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 240, scale: 1, rotation: 0, fontSize: 76, width: 900, height: 160 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 720, scale: 0.48, width: 1080, height: 2340, rotation: -8, tiltY: 18, shadowBlur: 120, shadowOp: 40, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'sq-stat') {
            presetSelect.value = '1080x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#11998e'; bgColor2 = '#38ef7d';
            layers.push({ id: generateId(), type: 'text', content: '1M+', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.2)', shadowBlur: 15, x: baseWidth/2, y: 300, scale: 1, rotation: 0, fontSize: 260, width: 1000, height: 320 });
            layers.push({ id: generateId(), type: 'text', content: 'downloads and counting', color: '#ffffff', fontFamily: 'Inter', fontWeight: '600', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 560, scale: 1, rotation: 0, fontSize: 48, width: 900, height: 100 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'clay', x: baseWidth/2, y: 870, scale: 0.4, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 110, shadowOp: 45, shadowColor: '#000000', hasGlare: false, hasFloorShadow: true });
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
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: 1320, y: 550, scale: 0.72, width: 1200, height: 800, rotation: 0, tiltY: -15, shadowBlur: 120, shadowOp: 45, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-macbook') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f172a'; bgColor2 = '#1e1b4b';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: baseWidth/2, y: 580, scale: 0.92, width: 1200, height: 800, rotation: 0, tiltY: 0, shadowBlur: 150, shadowOp: 70, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-ecosystem') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#f8fafc'; bgColor2 = '#e2e8f0';
            layers.push({ id: generateId(), type: 'text', content: 'WORKS EVERYWHERE', color: '#0f172a', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 160, scale: 1, rotation: 0, fontSize: 70, width: 1200, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: baseWidth/2, y: 620, scale: 0.62, width: 1200, height: 800, rotation: 0, tiltY: 0, shadowBlur: 100, shadowOp: 40, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 430, y: 600, scale: 0.5, width: 1080, height: 2340, rotation: 0, tiltY: -15, shadowBlur: 80, shadowOp: 30, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 1490, y: 600, scale: 0.5, width: 1080, height: 2340, rotation: 0, tiltY: 15, shadowBlur: 80, shadowOp: 30, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-cascade') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#c31432'; bgColor2 = '#240b36';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: 620, y: 560, scale: 0.6, width: 1200, height: 800, rotation: 0, tiltY: 25, shadowBlur: 120, shadowOp: 70, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: 960, y: 560, scale: 0.6, width: 1200, height: 800, rotation: 0, tiltY: 25, shadowBlur: 120, shadowOp: 70, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: 1300, y: 560, scale: 0.6, width: 1200, height: 800, rotation: 0, tiltY: 25, shadowBlur: 120, shadowOp: 70, shadowColor: '#000000', hasGlare: false, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'text', content: 'POWERFUL WEB APPS', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 150, scale: 1, rotation: 0, fontSize: 80, width: 1400, height: 120 });
        }
        else if (type === 'ls-banner') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#6a11cb'; bgColor2 = '#2575fc';
            layers.push({ id: generateId(), type: 'text', content: 'The all-in-one platform.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'center', shadowColor: 'rgba(0,0,0,0.25)', shadowBlur: 20, x: baseWidth/2, y: 230, scale: 1, rotation: 0, fontSize: 92, width: 1600, height: 160 });
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: baseWidth/2, y: 760, scale: 0.72, width: 1200, height: 800, rotation: 0, tiltY: 0, shadowBlur: 130, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-darkglow') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#020617'; bgColor2 = '#0b1020';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'browser', x: baseWidth/2, y: 560, scale: 0.88, width: 1200, height: 800, rotation: 0, tiltY: 0, shadowBlur: 180, shadowOp: 80, shadowColor: '#34d399', hasGlare: true, hasFloorShadow: false });
        }
        else if (type === 'ls-trio') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#1e293b'; bgColor2 = '#020617';
            layers.push({ id: generateId(), type: 'text', content: 'YOUR APP, EVERYWHERE', color: '#ffffff', fontFamily: 'Inter', fontWeight: '800', textAlign: 'center', shadowColor: 'transparent', shadowBlur: 0, x: baseWidth/2, y: 150, scale: 1, rotation: 0, fontSize: 70, width: 1400, height: 120 });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 560, y: 640, scale: 0.5, width: 1080, height: 2340, rotation: 0, tiltY: 18, shadowBlur: 100, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: 1360, y: 640, scale: 0.5, width: 1080, height: 2340, rotation: 0, tiltY: -18, shadowBlur: 100, shadowOp: 50, shadowColor: '#000000', hasGlare: true, hasFloorShadow: false });
            layers.push({ id: generateId(), type: 'image', img: phApp, frameStyle: 'iphone', x: baseWidth/2, y: 600, scale: 0.6, width: 1080, height: 2340, rotation: 0, tiltY: 0, shadowBlur: 140, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
        }
        else if (type === 'ls-feature') {
            presetSelect.value = '1920x1080'; screensSelect.value = '1'; updateCanvasSize();
            bgType = 'gradient'; bgColor1 = '#0f172a'; bgColor2 = '#111827';
            layers.push({ id: generateId(), type: 'image', img: phMac, frameStyle: 'macbook', x: 600, y: 560, scale: 0.66, width: 1200, height: 800, rotation: 0, tiltY: 12, shadowBlur: 130, shadowOp: 60, shadowColor: '#000000', hasGlare: true, hasFloorShadow: true });
            layers.push({ id: generateId(), type: 'text', content: 'Built for teams.', color: '#ffffff', fontFamily: 'Inter', fontWeight: '900', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 1180, y: 300, scale: 1, rotation: 0, fontSize: 72, width: 680, height: 160 });
            layers.push({ id: generateId(), type: 'text', content: 'Real-time sync\nGranular permissions\nAudit logs & SSO', color: '#94a3b8', fontFamily: 'Inter', fontWeight: '500', textAlign: 'left', shadowColor: 'transparent', shadowBlur: 0, x: 1180, y: 560, scale: 1, rotation: 0, fontSize: 40, width: 680, height: 280 });
        }

        document.getElementById('template-dropdown').style.display = 'none';
        updatePropsPanel();
        syncBgControls();
        render();
    }

    document.getElementById('add-text-btn').addEventListener('click', addTextLayer);
    document.getElementById('add-device-btn').addEventListener('click', () => imageUpload.click());

    document.querySelectorAll('.sticker-btn').forEach(btn => btn.addEventListener('click', (e) => addStickerLayer(e.target.dataset.sticker)));
    document.querySelectorAll('.shape-btn').forEach(btn => btn.addEventListener('click', (e) => addShapeLayer(e.target.dataset.shape)));
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
        if (files.length === 0) return;

        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => { addImageLayer(img, index); URL.revokeObjectURL(url); };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                if (window.showToast) showToast("Couldn't load that image — if it's an iPhone HEIC, save/export it as JPG or PNG first.", 'error');
            };
            img.src = url;
        });
        e.target.value = '';
    });
    

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
                    // Smooth back and forth between -15 and 15
                    l.tiltY = Math.sin(autoRotateAngle) * 15;
                    l.tiltX = Math.cos(autoRotateAngle) * 5;
                    if (l.id === selectedLayerId) needsPanelUpdate = true;
                }
            });
            if (needsPanelUpdate) {
                const tyInput = document.getElementById('img-tilt-y-input');
                const txInput = document.getElementById('img-tilt-x-input');
                const selected = layers.find(l => l.id === selectedLayerId);
                if (tyInput && selected) tyInput.value = Math.round(selected.tiltY);
                if (txInput && selected) txInput.value = Math.round(selected.tiltX);
            }
        }

        if (isAnimating) {
            requestAnimationFrame(render);
        }
    }

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
        
        // 1. Draw Background
        if (bgType === 'gradient') {
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

            // Apply Tilt & Rotation to ALL layers
            tCtx.transform(1, ty, tx, 1, 0, 0);
            tCtx.rotate(r);
            tCtx.scale(layer.scale, layer.scale);

            if (layer.type === 'image') {
                drawImageLayer(tCtx, layer);
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

        // 4. Draw UI Handles
        if (drawHandles && selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) drawSelectionBox(tCtx, layer);
        }

        tCtx.restore();

        // 5. Film grain overlay over the whole composed scene (skip on transparent
        // backgrounds — overlay-composited noise bakes grey haze into the alpha).
        if (grainEnabled && grainVal > 0 && bgType !== 'transparent') {
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
        tCtx.drawImage(layer.img, sx, sy, sw, sh);
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

    function drawImageLayer(tCtx, layer) {
        const w = layer.width;
        const h = layer.height;
        tCtx.translate(-w/2, -h/2);

        const sBlur = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
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
            tCtx.drawImage(layer.img, pad, pad, w - pad*2, h - pad*2);
            tCtx.restore();
            tCtx.strokeStyle = 'rgba(0,0,0,0.1)'; tCtx.lineWidth = w * 0.01;
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, rad); tCtx.stroke();

        } else if (layer.frameStyle === 'ipad') {
            const padW = w * 0.05; const rad = Math.min(w, h) * 0.05;
            tCtx.beginPath(); tCtx.roundRect(-padW, -padW, w + padW*2, h + padW*2, rad + padW); tCtx.closePath();
            tCtx.fillStyle = layer.frameColor || '#111'; tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.drawImage(layer.img, 0, 0, w, h);
            tCtx.strokeStyle = 'rgba(0,0,0,0.4)'; tCtx.lineWidth = 2; tCtx.strokeRect(0, 0, w, h);

        } else if (layer.frameStyle === 'macbook') {
            const padW = w * 0.02; const topBar = h * 0.05; const bottomLip = h * 0.12;
            tCtx.beginPath(); tCtx.roundRect(-padW, -padW - topBar, w + padW*2, h + padW*2 + topBar + bottomLip, [16,16,0,0]); tCtx.closePath();
            tCtx.fillStyle = layer.frameColor || '#111'; tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.fillStyle = '#9ca3af'; tCtx.beginPath(); tCtx.roundRect(-padW, h + padW, w + padW*2, bottomLip, [0,0,16,16]); tCtx.fill();
            tCtx.drawImage(layer.img, 0, 0, w, h);

        } else if (layer.frameStyle === 'browser') {
            const topBar = 60; const totalH = h + topBar;
            tCtx.beginPath(); tCtx.roundRect(0, 0, w, totalH, 16); tCtx.closePath();
            tCtx.fillStyle = '#2d2d2d'; tCtx.fill(); tCtx.shadowColor = 'transparent';
            tCtx.fillStyle = '#ff5f56'; tCtx.beginPath(); tCtx.arc(24, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = '#ffbd2e'; tCtx.beginPath(); tCtx.arc(52, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = '#27c93f'; tCtx.beginPath(); tCtx.arc(80, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.save(); tCtx.beginPath(); tCtx.roundRect(0, topBar, w, h, [0,0,16,16]); tCtx.clip();
            tCtx.drawImage(layer.img, 0, topBar, w, h); tCtx.restore();
            layer.renderHeight = totalH;

        } else {
            tCtx.drawImage(layer.img, 0, 0, w, h);
            tCtx.shadowColor = 'transparent';
        }

        if (layer.hasGlare) {
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
        layer.height = lines.length * lineH;
        
        let maxW = 0;
        lines.forEach((line, i) => {
            const m = tCtx.measureText(line);
            if (m.width > maxW) maxW = m.width;
        });
        layer.width = maxW;

        lines.forEach((line, i) => {
            const offY = (i - (lines.length-1)/2) * lineH;
            let drawX = 0;
            if(tCtx.textAlign === 'left') drawX = -layer.width/2;
            if(tCtx.textAlign === 'right') drawX = layer.width/2;
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

    wrapper.addEventListener('pointerdown', (e) => {
        const { x, y } = getMouseCoords(e);
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
    });

    window.addEventListener('pointermove', (e) => {
        if (!isDragging && !isScaling) return;
        const { x, y } = getMouseCoords(e);
        const layer = layers.find(l => l.id === selectedLayerId);
        if (!layer) return;

        if (isDragging) {
            layer.x = originalLayerX + (x - dragStartX); layer.y = originalLayerY + (y - dragStartY); scheduleRender();
        } else if (isScaling) {
            const distStart = Math.hypot(dragStartX - layer.x, dragStartY - layer.y);
            if (distStart < 1) return; // grabbed at the layer centre → avoid /0 → NaN scale (wipes the layer)
            const distCurrent = Math.hypot(x - layer.x, y - layer.y);
            layer.scale = Math.max(0.05, originalScale * (distCurrent / distStart)); scheduleRender();
        }
    });

    window.addEventListener('pointerup', () => { isDragging = false; isScaling = false; });
    window.addEventListener('pointercancel', () => { isDragging = false; isScaling = false; });

    // --- Properties Panel Sync ---
    function updatePropsPanel() {
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
                if(tiltYInput) tiltYInput.value = layer.tiltY || 0;
                if(tiltXInput && tiltXInput.parentElement) tiltXInput.parentElement.style.display = 'flex';
                if(tiltXInput) tiltXInput.value = layer.tiltX || 0;
                if(glareToggle) glareToggle.checked = layer.hasGlare || false;
                if(floorShadowToggle) floorShadowToggle.checked = layer.hasFloorShadow || false;
                if(reflectionToggle) reflectionToggle.checked = layer.hasReflection || false;
            } else {
                if(document.getElementById('frame-style-container')) document.getElementById('frame-style-container').style.display = 'none';
                if(document.getElementById('glare-shadow-toggles')) document.getElementById('glare-shadow-toggles').style.display = 'none';
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

    bindLayerSync(shapeTypeSelect, 'shapeType');
    bindLayerSync(shapeColorInput, 'color');
    bindLayerSync(shapeRotateInput, 'rotation', true);
    bindLayerSync(shapeRadiusInput, 'radius', true);
    bindLayerSync(shapeWidthInput, 'width', true);
    bindLayerSync(shapeHeightInput, 'height', true);

    bindLayerSync(frameSelect, 'frameStyle');
    if (frameSelect && frameColorContainer) {
        frameSelect.addEventListener('input', (e) => {
            frameColorContainer.style.display = COLOURABLE_FRAMES.includes(e.target.value) ? 'block' : 'none';
            syncColourSwatches();
        });
    }
    bindLayerSync(frameColorInput, 'frameColor');
    if (frameColorInput) frameColorInput.addEventListener('input', syncColourSwatches);

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
    bindLayerSync(tiltYInput, 'tiltY', true);
    bindLayerSync(tiltXInput, 'tiltX', true);
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
            syncBgControls();
            render();
        });
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
                exportZipBtn.innerText = "EXPORT KIT (.ZIP)";
                return;
            }

            const zip = new JSZip();
            files.forEach(f => zip.file(f.zipPath, f.blob));
            const zipBlob = await zip.generateAsync({ type: "blob" });
            await saveBlob(zipBlob, `AppStore_Kit.zip`, 'application/zip');
            exportZipBtn.innerText = "EXPORT KIT (.ZIP)";
        });
    }

    const exportPngBtn = document.getElementById('export-png-btn');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', async () => {
            const prevSelected = selectedLayerId; selectedLayerId = null; render();

            const files = [];
            if (screenCount > 1) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = baseWidth;
                tempCanvas.height = targetHeight;
                const tempCtx = tempCanvas.getContext('2d');

                for (let i = 0; i < screenCount; i++) {
                    tempCtx.clearRect(0, 0, baseWidth, targetHeight);
                    tempCtx.drawImage(canvas, -i * baseWidth, 0);
                    files.push({ blob: base64ToBlob(tempCanvas.toDataURL('image/png', 1.0)), name: `mockup-screen-${i + 1}-${baseWidth}x${targetHeight}.png`, type: 'image/png' });
                }
            } else {
                files.push({ blob: base64ToBlob(canvas.toDataURL('image/png', 1.0)), name: `mockup-${targetWidth}x${targetHeight}.png`, type: 'image/png' });
            }

            selectedLayerId = prevSelected; render();
            await saveBlobs(files);
        });
    }


    init();
});
