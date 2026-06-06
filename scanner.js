/**
 * Riyo Studio - Mockup Studio V4 (Ultra Premium Canvas Editor)
 * Features: 3D Tilt, Glare, Floor Shadows, Android/Clay frames, JSZip Bulk Export Kit, Smart Stickers
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
    const noSelectionMsg = document.getElementById('no-selection-msg');
    
    // Inputs
    const textInput = document.getElementById('text-content-input');
    const colorInput = document.getElementById('text-color-input');
    const fontSelect = document.getElementById('text-font-select');
    const textRotateInput = document.getElementById('text-rotate-input');
    const frameSelect = document.getElementById('frame-style-select');
    const imageUpload = document.getElementById('image-upload-input');
    
    // Premium Background Inputs
    const bgUploadBtn = document.getElementById('upload-bg-btn');
    const bgUploadInput = document.getElementById('bg-upload-input');
    const bgBlurInput = document.getElementById('bg-blur-input');
    
    // Premium Image Transforms & Realism
    const rotateInput = document.getElementById('img-rotate-input');
    const tiltYInput = document.getElementById('img-tilt-y-input');
    const shadowBlurInput = document.getElementById('img-shadow-blur-input');
    const shadowOpInput = document.getElementById('img-shadow-op-input');
    const glareToggle = document.getElementById('img-glare-toggle');
    const floorShadowToggle = document.getElementById('img-floor-shadow-toggle');

    // Sticker Menu Dropdown Toggle
    const stickerMenuBtn = document.getElementById('add-sticker-menu-btn');
    const stickerDropdown = document.getElementById('sticker-dropdown');
    if (stickerMenuBtn && stickerDropdown) {
        stickerMenuBtn.addEventListener('click', () => {
            const isBlock = stickerDropdown.style.display === 'flex';
            stickerDropdown.style.display = isBlock ? 'none' : 'flex';
        });
        document.addEventListener('click', (e) => {
            if (!stickerMenuBtn.contains(e.target) && !stickerDropdown.contains(e.target)) {
                stickerDropdown.style.display = 'none';
            }
        });
    }

    // --- Editor State ---
    let baseWidth = 1242;
    let screenCount = 1;
    let targetWidth = 1242;
    let targetHeight = 2688;
    
    let bgType = 'gradient';
    let bgColor1 = '#FF6B6B';
    let bgColor2 = '#4ECDC4';
    let bgImgObj = null;
    let bgBlur = 0;

    let layers = []; // { id, type: 'text'|'image'|'sticker', x, y, scale, ... }
    let selectedLayerId = null;

    let isDragging = false;
    let isScaling = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let originalLayerX = 0;
    let originalLayerY = 0;
    let originalScale = 1;

    // Device Frame Assets
    const notchImg = new Image();
    notchImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 30"><path d="M0 0C10 0 15 5 15 15C15 25 25 30 35 30H125C135 30 145 25 145 15C145 5 150 0 160 0H0Z" fill="%23000000"/></svg>';
    
    const punchHoleImg = new Image();
    punchHoleImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23000000"/></svg>';

    // Smart Sticker Assets
    const stickers = {
        'apple': new Image(),
        'google': new Image(),
        'stars': new Image(),
        'cursor': new Image()
    };
    
    // Very simple SVG placeholders for demonstration
    stickers['apple'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><rect width="240" height="80" rx="16" fill="%23000"/><text x="120" y="45" font-family="Arial" font-weight="bold" font-size="24" fill="%23FFF" text-anchor="middle">Download on the</text><text x="120" y="70" font-family="Arial" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">App Store</text></svg>';
    stickers['google'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80" viewBox="0 0 240 80"><rect width="240" height="80" rx="16" fill="%23000"/><text x="120" y="45" font-family="Arial" font-weight="bold" font-size="24" fill="%23FFF" text-anchor="middle">GET IT ON</text><text x="120" y="70" font-family="Arial" font-weight="bold" font-size="28" fill="%23FFF" text-anchor="middle">Google Play</text></svg>';
    stickers['stars'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="50" viewBox="0 0 250 50"><text x="125" y="40" font-family="Arial" font-size="50" fill="%23FFD700" text-anchor="middle">★★★★★</text></svg>';
    stickers['cursor'].src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="70" viewBox="0 0 50 70"><path d="M0,0 L0,70 L15,55 L30,85 L45,75 L30,45 L50,45 Z" fill="%23FFF" stroke="%23000" stroke-width="4"/></svg>';

    // --- Initialization ---
    function init() {
        updateCanvasSize();
        window.addEventListener('resize', scaleWrapperToFit);
        render();
    }

    function generateId() { return Math.random().toString(36).substr(2, 9); }

    // --- Canvas Sizing ---
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
        const scale = Math.min(scaleW, scaleH);
        
        wrapper.style.transform = `scale(${scale})`;
    }

    // --- Layers API ---
    function addTextLayer() {
        layers.push({
            id: generateId(),
            type: 'text',
            content: 'HEADING TITLE',
            color: '#ffffff',
            fontFamily: 'Inter',
            x: targetWidth / 2,
            y: 300,
            scale: 1,
            rotation: 0,
            fontSize: 120, 
            width: 0, 
            height: 120
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function addImageLayer(imgObj, offset = 0) {
        const initialScale = Math.min(1, (targetHeight * 0.6) / imgObj.height);
        layers.push({
            id: generateId(),
            type: 'image',
            img: imgObj,
            frameStyle: 'iphone',
            x: (targetWidth / 2) + (offset * 80),
            y: (targetHeight / 2) + (offset * 80),
            scale: initialScale,
            width: imgObj.width,
            height: imgObj.height,
            rotation: 0,
            tiltY: 0,
            shadowBlur: 80,
            shadowOp: 50,
            hasGlare: false,
            hasFloorShadow: false
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function addStickerLayer(stickerId) {
        const imgObj = stickers[stickerId];
        layers.push({
            id: generateId(),
            type: 'sticker',
            stickerId: stickerId,
            img: imgObj,
            x: targetWidth / 2,
            y: targetHeight / 2,
            scale: 2.0, // Scale up tiny SVG badges
            width: imgObj.width || 240,
            height: imgObj.height || 80,
            rotation: 0,
            tiltY: 0,
            shadowBlur: 40,
            shadowOp: 30
        });
        selectedLayerId = layers[layers.length - 1].id;
        if(stickerDropdown) stickerDropdown.style.display = 'none';
        updatePropsPanel();
        render();
    }

    document.getElementById('add-text-btn').addEventListener('click', addTextLayer);
    document.getElementById('add-device-btn').addEventListener('click', () => imageUpload.click());

    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sId = e.target.dataset.sticker;
            if (sId) addStickerLayer(sId);
        });
    });

    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => { addImageLayer(img, index); URL.revokeObjectURL(url); };
            img.src = url;
        });
        e.target.value = ''; 
    });
    
    // Bg Upload
    bgUploadBtn.addEventListener('click', () => bgUploadInput.click());
    bgUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            bgType = 'image';
            bgImgObj = img;
            document.querySelectorAll('.bg-btn').forEach(b => b.classList.remove('active'));
            render();
            URL.revokeObjectURL(url);
        };
        img.src = url;
        e.target.value = '';
    });
    
    bgBlurInput.addEventListener('input', (e) => { bgBlur = parseInt(e.target.value); render(); });

    // --- Rendering Core ---
    function render() {
        renderSceneToContext(ctx, targetWidth, targetHeight, true);
    }

    function renderSceneToContext(tCtx, w, h, drawHandles = false, layoutScale = 1, offsetX = 0, offsetY = 0) {
        tCtx.clearRect(0, 0, w, h);
        tCtx.filter = 'none';
        
        // 1. Draw Background
        if (bgType === 'gradient') {
            const grad = tCtx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, bgColor1);
            grad.addColorStop(1, bgColor2);
            tCtx.fillStyle = grad;
            tCtx.fillRect(0, 0, w, h);
        } else if (bgType === 'solid') {
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
            
            if (layer.type === 'image' || layer.type === 'sticker') {
                // Floor Shadow (Draw BEFORE transform if we want it detached)
                if (layer.hasFloorShadow) {
                    tCtx.save();
                    const sBlur = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
                    const sOp = layer.shadowOp !== undefined ? layer.shadowOp : 50;
                    tCtx.shadowColor = `rgba(0,0,0,${sOp/100})`;
                    tCtx.shadowBlur = sBlur;
                    tCtx.shadowOffsetY = layer.height * layer.scale * 0.45;
                    tCtx.fillStyle = '#000';
                    tCtx.beginPath();
                    // Draw a squashed ellipse for the floor shadow
                    tCtx.ellipse(0, 0, (layer.width * layer.scale)/2, (layer.width * layer.scale)*0.1, 0, 0, Math.PI*2);
                    tCtx.fill();
                    tCtx.restore();
                }
            }

            // Apply Tilt & Rotation to ALL layers
            tCtx.transform(1, ty, 0, 1, 0, 0);
            tCtx.rotate(r);
            
            tCtx.scale(layer.scale, layer.scale);

            if (layer.type === 'image') {
                drawImageLayer(tCtx, layer);
            } else if (layer.type === 'text') {
                drawTextLayer(tCtx, layer);
            } else if (layer.type === 'sticker') {
                drawStickerLayer(tCtx, layer);
            }

            tCtx.restore();
        });

        // 4. Draw UI Handles
        if (drawHandles && selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) drawSelectionBox(tCtx, layer);
        }

        tCtx.restore();
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

        if (layer.img.complete) {
            tCtx.drawImage(layer.img, 0, 0, w, h);
        }
        tCtx.shadowColor = 'transparent';
    }

    function drawImageLayer(tCtx, layer) {
        const w = layer.width;
        const h = layer.height;
        tCtx.translate(-w/2, -h/2);

        const sBlur = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
        const sOp = layer.shadowOp !== undefined ? layer.shadowOp : 50;
        const shadowColor = layer.hasFloorShadow ? 'transparent' : `rgba(0,0,0,${sOp/100})`;

        tCtx.shadowColor = shadowColor;
        tCtx.shadowBlur = sBlur;
        tCtx.shadowOffsetY = sBlur / 2;

        if (layer.frameStyle === 'iphone' || layer.frameStyle === 'android' || layer.frameStyle === 'clay') {
            const rad = Math.min(w, h) * 0.1;
            
            tCtx.beginPath();
            tCtx.roundRect(0, 0, w, h, rad);
            tCtx.closePath();
            
            tCtx.fillStyle = layer.frameStyle === 'clay' ? '#f8f9fa' : '#000';
            tCtx.fill();
            tCtx.shadowColor = 'transparent';

            tCtx.save();
            if (layer.frameStyle === 'clay') {
                // Clay frames have massive bezels and crop the image
                const pad = w * 0.06;
                tCtx.beginPath();
                tCtx.roundRect(pad, pad, w - pad*2, h - pad*2, rad*0.8);
                tCtx.clip();
                tCtx.drawImage(layer.img, pad, pad, w - pad*2, h - pad*2);
            } else {
                tCtx.clip();
                tCtx.drawImage(layer.img, 0, 0, w, h);
            }
            tCtx.restore();

            // Notches & Cameras
            if (layer.frameStyle === 'iphone') {
                const notchW = w * 0.4;
                const notchH = notchW * 0.2;
                if (notchImg.complete) {
                    tCtx.drawImage(notchImg, (w - notchW)/2, 0, notchW, notchH);
                }
            } else if (layer.frameStyle === 'android') {
                const punchW = w * 0.05;
                if (punchHoleImg.complete) {
                    tCtx.drawImage(punchHoleImg, w/2 - punchW/2, h * 0.03, punchW, punchW);
                }
            }
            
            // Outer stroke for definition
            if (layer.frameStyle !== 'clay') {
                tCtx.strokeStyle = '#000';
                tCtx.lineWidth = w * 0.02;
                tCtx.stroke();
            } else {
                tCtx.strokeStyle = 'rgba(0,0,0,0.1)';
                tCtx.lineWidth = w * 0.01;
                tCtx.stroke();
            }

        } else if (layer.frameStyle === 'ipad') {
            const padW = w * 0.05; 
            const rad = Math.min(w, h) * 0.05;
            
            tCtx.beginPath();
            tCtx.roundRect(-padW, -padW, w + padW*2, h + padW*2, rad + padW);
            tCtx.closePath();
            tCtx.fillStyle = '#111';
            tCtx.fill();
            tCtx.shadowColor = 'transparent';

            tCtx.drawImage(layer.img, 0, 0, w, h);
            tCtx.strokeStyle = '#000';
            tCtx.lineWidth = 2;
            tCtx.strokeRect(0, 0, w, h);

        } else if (layer.frameStyle === 'macbook') {
            const padW = w * 0.02;
            const topBar = h * 0.05;
            const bottomLip = h * 0.12;
            
            // Top Bezel
            tCtx.beginPath();
            tCtx.roundRect(-padW, -padW - topBar, w + padW*2, h + padW*2 + topBar + bottomLip, [16,16,0,0]);
            tCtx.closePath();
            tCtx.fillStyle = '#111';
            tCtx.fill();
            tCtx.shadowColor = 'transparent';

            // Bottom Lip
            tCtx.fillStyle = '#9ca3af';
            tCtx.beginPath();
            tCtx.roundRect(-padW, h + padW, w + padW*2, bottomLip, [0,0,16,16]);
            tCtx.fill();

            tCtx.drawImage(layer.img, 0, 0, w, h);

        } else if (layer.frameStyle === 'browser') {
            const topBar = 60;
            const totalH = h + topBar;
            
            tCtx.beginPath();
            tCtx.roundRect(0, 0, w, totalH, 16);
            tCtx.closePath();
            tCtx.fillStyle = '#2d2d2d';
            tCtx.fill();
            tCtx.shadowColor = 'transparent';

            tCtx.fillStyle = '#ff5f56';
            tCtx.beginPath(); tCtx.arc(24, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = '#ffbd2e';
            tCtx.beginPath(); tCtx.arc(52, topBar/2, 8, 0, Math.PI*2); tCtx.fill();
            tCtx.fillStyle = '#27c93f';
            tCtx.beginPath(); tCtx.arc(80, topBar/2, 8, 0, Math.PI*2); tCtx.fill();

            tCtx.save();
            tCtx.beginPath();
            tCtx.roundRect(0, topBar, w, h, [0,0,16,16]);
            tCtx.clip();
            tCtx.drawImage(layer.img, 0, topBar, w, h);
            tCtx.restore();
            layer.renderHeight = totalH;

        } else {
            tCtx.drawImage(layer.img, 0, 0, w, h);
            tCtx.shadowColor = 'transparent';
        }

        // Apply Premium Glass Glare Overlay
        if (layer.hasGlare) {
            tCtx.save();
            let renderH = layer.renderHeight || h;
            
            // Re-clip to frame boundaries so glare doesn't bleed out
            if (layer.frameStyle === 'iphone' || layer.frameStyle === 'android' || layer.frameStyle === 'clay') {
                tCtx.beginPath(); tCtx.roundRect(0, 0, w, h, Math.min(w, h) * 0.1); tCtx.clip();
            } else if (layer.frameStyle === 'browser') {
                tCtx.beginPath(); tCtx.roundRect(0, 0, w, renderH, 16); tCtx.clip();
            } else if (layer.frameStyle === 'ipad') {
                tCtx.beginPath(); tCtx.roundRect(-w*0.05, -w*0.05, w*1.1, h + w*0.1, Math.min(w, h)*0.05 + w*0.05); tCtx.clip();
            } else if (layer.frameStyle === 'macbook') {
                tCtx.beginPath(); tCtx.roundRect(-w*0.02, -h*0.05, w*1.04, h*1.17, 16); tCtx.clip();
            }

            const grad = tCtx.createLinearGradient(0, 0, w, renderH);
            grad.addColorStop(0, 'rgba(255,255,255,0.4)');
            grad.addColorStop(0.3, 'rgba(255,255,255,0.05)');
            grad.addColorStop(0.301, 'rgba(255,255,255,0)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            
            tCtx.fillStyle = grad;
            tCtx.beginPath();
            tCtx.moveTo(0, 0);
            tCtx.lineTo(w, 0);
            tCtx.lineTo(0, renderH);
            tCtx.closePath();
            tCtx.fill();
            tCtx.restore();
        }
    }

    function drawTextLayer(tCtx, layer) {
        tCtx.font = `800 ${layer.fontSize}px "${layer.fontFamily || 'Inter'}", sans-serif`;
        tCtx.fillStyle = layer.color;
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        
        const lines = layer.content.split('\n');
        const lineH = layer.fontSize * 1.2;
        layer.height = lines.length * lineH;
        
        let maxW = 0;
        lines.forEach((line, i) => {
            const m = tCtx.measureText(line);
            if (m.width > maxW) maxW = m.width;
            const offY = (i - (lines.length-1)/2) * lineH;
            tCtx.fillText(line, 0, offY);
        });
        
        layer.width = maxW;
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
        
        if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') {
            w += (layer.width * 0.1) * layer.scale;
            h += (layer.height * 0.1) * layer.scale;
        }
        
        tCtx.strokeStyle = '#00e5ff';
        tCtx.lineWidth = 4 / getWrapperScale();
        tCtx.setLineDash([10 / getWrapperScale(), 10 / getWrapperScale()]);
        tCtx.strokeRect(-w/2, -h/2, w, h);

        tCtx.fillStyle = '#00e5ff';
        tCtx.setLineDash([]);
        const hs = 20 / getWrapperScale(); 
        
        tCtx.fillRect(-w/2 - hs/2, -h/2 - hs/2, hs, hs); 
        tCtx.fillRect(w/2 - hs/2, -h/2 - hs/2, hs, hs); 
        tCtx.fillRect(-w/2 - hs/2, h/2 - hs/2, hs, hs); 
        tCtx.fillRect(w/2 - hs/2, h/2 - hs/2, hs, hs); 
        
        tCtx.restore();
    }

    // --- Interaction Engine ---
    function getWrapperScale() {
        const matrix = window.getComputedStyle(wrapper).transform;
        if (matrix === 'none') return 1;
        return parseFloat(matrix.split(',')[0].replace('matrix(', ''));
    }

    function getMouseCoords(e) {
        const rect = wrapper.getBoundingClientRect();
        const scale = getWrapperScale();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        return { x, y };
    }

    function isPointInTransformedRect(px, py, cx, cy, w, h, scale, rotation, tiltY) {
        let tx = px - cx;
        let ty = py - cy;
        let tiltY_rad = (tiltY || 0) * Math.PI / 180;
        let sx = tx;
        let sy = -tx * tiltY_rad + ty;
        let r = -(rotation || 0) * Math.PI / 180;
        let cosR = Math.cos(r);
        let sinR = Math.sin(r);
        let rx = sx * cosR - sy * sinR;
        let ry = sx * sinR + sy * cosR;
        let lx = rx / scale;
        let ly = ry / scale;
        return (lx >= -w/2 && lx <= w/2 && ly >= -h/2 && ly <= h/2);
    }

    function checkHit(x, y) {
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            let w = layer.width;
            let h = layer.renderHeight || layer.height;
            if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') {
                w += layer.width * 0.1;
                h += layer.height * 0.1;
            }
            const hit = isPointInTransformedRect(x, y, layer.x, layer.y, w, h, layer.scale, layer.rotation, layer.tiltY);
            if (hit) return layer.id;
        }
        return null;
    }

    wrapper.addEventListener('mousedown', (e) => {
        const { x, y } = getMouseCoords(e);
        if (selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) {
                let w = layer.width;
                let h = layer.renderHeight || layer.height;
                if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') { w += layer.width * 0.1; h += layer.height * 0.1; }
                const innerHit = isPointInTransformedRect(x, y, layer.x, layer.y, w, h, layer.scale, layer.rotation, layer.tiltY);
                const handleHit = isPointInTransformedRect(x, y, layer.x, layer.y, w + 100, h + 100, layer.scale, layer.rotation, layer.tiltY);
                
                if (!innerHit && handleHit) {
                    isScaling = true;
                    dragStartX = x;
                    dragStartY = y;
                    originalScale = layer.scale;
                    return;
                }
            }
        }

        const hitId = checkHit(x, y);
        if (hitId) {
            selectedLayerId = hitId;
            isDragging = true;
            dragStartX = x;
            dragStartY = y;
            const layer = layers.find(l => l.id === hitId);
            originalLayerX = layer.x;
            originalLayerY = layer.y;
            updatePropsPanel();
            render();
            return;
        }

        selectedLayerId = null;
        updatePropsPanel();
        render();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging && !isScaling) return;
        const { x, y } = getMouseCoords(e);
        const layer = layers.find(l => l.id === selectedLayerId);
        if (!layer) return;

        if (isDragging) {
            layer.x = originalLayerX + (x - dragStartX);
            layer.y = originalLayerY + (y - dragStartY);
            render();
        } else if (isScaling) {
            const distStart = Math.hypot(dragStartX - layer.x, dragStartY - layer.y);
            const distCurrent = Math.hypot(x - layer.x, y - layer.y);
            const scaleFactor = distCurrent / distStart;
            layer.scale = Math.max(0.05, originalScale * scaleFactor);
            render();
        }
    });

    window.addEventListener('mouseup', () => { isDragging = false; isScaling = false; });

    // --- Properties Panel Sync ---
    function updatePropsPanel() {
        if (!selectedLayerId) {
            if(propsCanvas) propsCanvas.style.display = 'block';
            if(propsText) propsText.style.display = 'none';
            if(propsImage) propsImage.style.display = 'none';
            if(noSelectionMsg) noSelectionMsg.style.display = 'block';
            if(bgBlurInput) bgBlurInput.value = bgBlur;
            return;
        }

        if(noSelectionMsg) noSelectionMsg.style.display = 'none';
        if(propsCanvas) propsCanvas.style.display = 'none';
        
        const layer = layers.find(l => l.id === selectedLayerId);
        if (!layer) return;

        if (layer.type === 'text') {
            if(document.getElementById('text-props')) document.getElementById('text-props').style.display = 'flex';
            if(document.getElementById('image-props')) document.getElementById('image-props').style.display = 'none';
            if(document.getElementById('text-content-input')) document.getElementById('text-content-input').value = layer.content;
            if(document.getElementById('text-color-input')) document.getElementById('text-color-input').value = layer.color;
            if(document.getElementById('text-font-select')) document.getElementById('text-font-select').value = layer.fontFamily || 'Inter';
            if(textRotateInput) textRotateInput.value = layer.rotation || 0;
        } else if (layer.type === 'image' || layer.type === 'sticker') {
            if(document.getElementById('text-props')) document.getElementById('text-props').style.display = 'none';
            if(document.getElementById('image-props')) document.getElementById('image-props').style.display = 'flex';
            
            if(document.getElementById('img-rotate-input')) document.getElementById('img-rotate-input').value = layer.rotation || 0;
            if(document.getElementById('img-shadow-blur-input')) document.getElementById('img-shadow-blur-input').value = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
            if(document.getElementById('img-shadow-op-input')) document.getElementById('img-shadow-op-input').value = layer.shadowOp !== undefined ? layer.shadowOp : 50;
            
            if (layer.type === 'image') {
                if(document.getElementById('frame-style-container')) document.getElementById('frame-style-container').style.display = 'block';
                if(document.getElementById('glare-shadow-toggles')) document.getElementById('glare-shadow-toggles').style.display = 'flex';
                if(document.getElementById('frame-style-select')) document.getElementById('frame-style-select').value = layer.frameStyle;
                if(document.getElementById('img-tilt-y-input') && document.getElementById('img-tilt-y-input').parentElement) document.getElementById('img-tilt-y-input').parentElement.style.display = 'flex';
                if(document.getElementById('img-tilt-y-input')) document.getElementById('img-tilt-y-input').value = layer.tiltY || 0;
                if(document.getElementById('img-glare-toggle')) document.getElementById('img-glare-toggle').checked = layer.hasGlare || false;
                if(document.getElementById('img-floor-shadow-toggle')) document.getElementById('img-floor-shadow-toggle').checked = layer.hasFloorShadow || false;
            } else {
                if(document.getElementById('frame-style-container')) document.getElementById('frame-style-container').style.display = 'none';
                if(document.getElementById('glare-shadow-toggles')) document.getElementById('glare-shadow-toggles').style.display = 'none';
                if(document.getElementById('img-tilt-y-input') && document.getElementById('img-tilt-y-input').parentElement) document.getElementById('img-tilt-y-input').parentElement.style.display = 'none';
            }
        }
    }

    // Property Listeners
    if(textInput) textInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.content = e.target.value; render(); } });
    if(colorInput) colorInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.color = e.target.value; render(); } });
    if(fontSelect) fontSelect.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.fontFamily = e.target.value; render(); } });
    if(textRotateInput) textRotateInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.rotation = parseInt(e.target.value); render(); } });
    if(frameSelect) frameSelect.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.frameStyle = e.target.value; render(); } });
    if(rotateInput) rotateInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.rotation = parseInt(e.target.value); render(); } });
    if(tiltYInput) tiltYInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.tiltY = parseInt(e.target.value); render(); } });
    if(shadowBlurInput) shadowBlurInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.shadowBlur = parseInt(e.target.value); render(); } });
    if(shadowOpInput) shadowOpInput.addEventListener('input', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.shadowOp = parseInt(e.target.value); render(); } });
    if(glareToggle) glareToggle.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.hasGlare = e.target.checked; render(); } });
    if(floorShadowToggle) floorShadowToggle.addEventListener('change', (e) => { const l = layers.find(x => x?.id === selectedLayerId); if (l) { l.hasFloorShadow = e.target.checked; render(); } });

    const deleteTextBtn = document.getElementById('delete-text-btn');
    const deleteImageBtn = document.getElementById('delete-image-btn');
    if(deleteTextBtn) deleteTextBtn.addEventListener('click', deleteSelected);
    if(deleteImageBtn) deleteImageBtn.addEventListener('click', deleteSelected);

    window.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId && document.activeElement !== textInput) {
            deleteSelected();
        }
    });

    function deleteSelected() {
        if (!selectedLayerId) return;
        layers = layers.filter(l => l.id !== selectedLayerId);
        selectedLayerId = null;
        updatePropsPanel();
        render();
    }

    const bringForwardBtn = document.getElementById('bring-forward-btn');
    if(bringForwardBtn) bringForwardBtn.addEventListener('click', () => {
        if (!selectedLayerId) return;
        const idx = layers.findIndex(l => l.id === selectedLayerId);
        if (idx < layers.length - 1) {
            const temp = layers[idx];
            layers[idx] = layers[idx + 1];
            layers[idx + 1] = temp;
            render();
        }
    });

    const sendBackwardBtn = document.getElementById('send-backward-btn');
    if(sendBackwardBtn) sendBackwardBtn.addEventListener('click', () => {
        if (!selectedLayerId) return;
        const idx = layers.findIndex(l => l.id === selectedLayerId);
        if (idx > 0) {
            const temp = layers[idx];
            layers[idx] = layers[idx - 1];
            layers[idx - 1] = temp;
            render();
        }
    });

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
            if (bg === 'solid-dark') { bgType = 'solid'; bgColor1 = '#111'; }
            if (bg === 'solid-light') { bgType = 'solid'; bgColor1 = '#ffffff'; }
            if (bg === 'transparent') { bgType = 'transparent'; }
            render();
        });
    });

    // --- Bulk Export Kit ---
    function base64ToBlob(base64) {
        const parts = base64.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const uInt8Array = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
        return new Blob([uInt8Array], { type: contentType });
    }

    const exportZipBtn = document.getElementById('export-zip-btn');
    if (exportZipBtn) {
        exportZipBtn.addEventListener('click', async () => {
            if (!window.JSZip) {
                alert("JSZip library is still loading. Please try again in a second.");
                return;
            }
            
            exportZipBtn.innerText = "GENERATING...";
            const prevSelected = selectedLayerId;
            selectedLayerId = null; // Hide handles

            const zip = new JSZip();
            
            // Required App Store & Google Play Sizes
            const formats = [
                { name: "Apple_6.5_inch", w: 1284, h: 2778 },
                { name: "Apple_5.5_inch", w: 1242, h: 2208 },
                { name: "Google_Play", w: 1080, h: 1920 }
            ];

            // Render to a temporary offscreen canvas for each format
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');

            for (let fmt of formats) {
                tempCanvas.width = fmt.w;
                tempCanvas.height = fmt.h;
                
                const scale = Math.max(fmt.w / baseWidth, fmt.h / targetHeight);
                
                for (let i = 0; i < screenCount; i++) {
                    const actualBaseW = baseWidth * scale;
                    const actualH = targetHeight * scale;
                    
                    const offsetY = (fmt.h - actualH) / 2;
                    const offsetX = ((fmt.w - actualBaseW) / 2) - (actualBaseW * i);

                    renderSceneToContext(tempCtx, fmt.w, fmt.h, false, scale, offsetX, offsetY);
                    
                    const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
                    const blob = base64ToBlob(dataUrl);
                    
                    if (screenCount === 1) {
                        zip.file(`${fmt.name}.png`, blob);
                    } else {
                        zip.file(`Panoramic_${fmt.name}/Screen_${i + 1}.png`, blob);
                    }
                }
            }

            selectedLayerId = prevSelected;
            render(); // Restore main canvas

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.download = `AppStore_Kit.zip`;
            link.href = URL.createObjectURL(zipBlob);
            link.click();
            exportZipBtn.innerText = "EXPORT KIT (.ZIP)";
        });
    }

    const exportPngBtn = document.getElementById('export-png-btn');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', () => {
            const prevSelected = selectedLayerId;
            selectedLayerId = null;
            render();

            const dataURL = canvas.toDataURL('image/png', 1.0);
            
            selectedLayerId = prevSelected;
            render();

            const link = document.createElement('a');
            link.download = `mockup-${targetWidth}x${targetHeight}.png`;
            link.href = dataURL;
            link.click();
        });
    }

    init();
});
