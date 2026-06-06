/**
 * Riyo Studio - Mockup Studio V3 (Premium Object-Based Canvas Editor)
 * 100% Offline, Native HTML5 Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const canvas = document.getElementById('mockup-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const wrapper = document.getElementById('canvas-wrapper');
    const presetSelect = document.getElementById('preset-size-select');
    
    // Panels
    const propsCanvas = document.getElementById('canvas-props');
    const propsText = document.getElementById('text-props');
    const propsImage = document.getElementById('image-props');
    const noSelectionMsg = document.getElementById('no-selection-msg');
    
    // Inputs
    const textInput = document.getElementById('text-content-input');
    const colorInput = document.getElementById('text-color-input');
    const fontSelect = document.getElementById('text-font-select');
    const frameSelect = document.getElementById('frame-style-select');
    const imageUpload = document.getElementById('image-upload-input');
    
    // Premium Background Inputs
    const bgUploadBtn = document.getElementById('upload-bg-btn');
    const bgUploadInput = document.getElementById('bg-upload-input');
    const bgBlurInput = document.getElementById('bg-blur-input');
    
    // Premium Image Transforms
    const rotateInput = document.getElementById('img-rotate-input');
    const tiltYInput = document.getElementById('img-tilt-y-input');
    const shadowBlurInput = document.getElementById('img-shadow-blur-input');
    const shadowOpInput = document.getElementById('img-shadow-op-input');

    // --- Editor State ---
    let targetWidth = 1242;
    let targetHeight = 2688; // Default to App Store 6.5"
    
    let bgType = 'gradient';
    let bgColor1 = '#FF6B6B';
    let bgColor2 = '#4ECDC4';
    let bgImgObj = null;
    let bgBlur = 0;

    let layers = []; // { id, type: 'text'|'image', x, y, scale, ... }
    let selectedLayerId = null;

    // Interaction State
    let isDragging = false;
    let isScaling = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let originalLayerX = 0;
    let originalLayerY = 0;
    let originalScale = 1;
    let scaleCorner = null;

    // Device Frame Assets
    const notchImg = new Image();
    notchImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 30"><path d="M0 0C10 0 15 5 15 15C15 25 25 30 35 30H125C135 30 145 25 145 15C145 5 150 0 160 0H0Z" fill="%23000000"/></svg>';

    // --- Initialization ---
    function init() {
        updateCanvasSize();
        window.addEventListener('resize', scaleWrapperToFit);
        render();
    }

    function generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // --- Canvas Sizing ---
    function updateCanvasSize() {
        const [w, h] = presetSelect.value.split('x').map(Number);
        targetWidth = w;
        targetHeight = h;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        wrapper.style.width = `${targetWidth}px`;
        wrapper.style.height = `${targetHeight}px`;
        
        scaleWrapperToFit();
        render();
    }

    presetSelect.addEventListener('change', updateCanvasSize);

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
            fontSize: 120, // base size
            width: 0, // Calculated on render
            height: 120
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    function addImageLayer(imgObj) {
        // Calculate initial scale to fit reasonably
        const initialScale = Math.min(1, (targetHeight * 0.6) / imgObj.height);
        
        layers.push({
            id: generateId(),
            type: 'image',
            img: imgObj,
            frameStyle: 'iphone', // default
            x: targetWidth / 2,
            y: targetHeight / 2,
            scale: initialScale,
            width: imgObj.width,
            height: imgObj.height,
            rotation: 0,
            tiltY: 0,
            shadowBlur: 80,
            shadowOp: 50
        });
        selectedLayerId = layers[layers.length - 1].id;
        updatePropsPanel();
        render();
    }

    // Button Listeners
    document.getElementById('add-text-btn').addEventListener('click', addTextLayer);
    
    document.getElementById('add-device-btn').addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            addImageLayer(img);
            URL.revokeObjectURL(url);
        };
        img.src = url;
        e.target.value = ''; // Reset
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
    
    bgBlurInput.addEventListener('input', (e) => {
        bgBlur = parseInt(e.target.value);
        render();
    });

    // --- Rendering ---
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'none'; // reset filter
        
        // 1. Draw Background
        if (bgType === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, bgColor1);
            grad.addColorStop(1, bgColor2);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgType === 'solid') {
            ctx.fillStyle = bgColor1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgType === 'image' && bgImgObj) {
            // Fill mode: Cover
            const scale = Math.max(canvas.width / bgImgObj.width, canvas.height / bgImgObj.height);
            const w = bgImgObj.width * scale;
            const h = bgImgObj.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;
            
            ctx.save();
            if (bgBlur > 0) ctx.filter = `blur(${bgBlur}px)`;
            ctx.drawImage(bgImgObj, x, y, w, h);
            ctx.restore();
            ctx.filter = 'none'; // reset filter just in case
        } else if (bgType === 'transparent') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw Layers
        layers.forEach(layer => {
            ctx.save();
            ctx.translate(layer.x, layer.y);
            
            // 3D Tilt Transformations (Only for images)
            if (layer.type === 'image') {
                const r = (layer.rotation || 0) * Math.PI / 180;
                const ty = (layer.tiltY || 0) * Math.PI / 180;
                // Skew transform to simulate isometric projection
                ctx.transform(1, ty, 0, 1, 0, 0);
                ctx.rotate(r);
            }
            
            ctx.scale(layer.scale, layer.scale);

            if (layer.type === 'image') {
                drawImageLayer(layer);
            } else if (layer.type === 'text') {
                drawTextLayer(layer);
            }

            ctx.restore();
        });

        // 3. Draw UI Handles for Selected Layer
        if (selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) drawSelectionBox(layer);
        }
    }

    function drawImageLayer(layer) {
        const w = layer.width;
        const h = layer.height;
        ctx.translate(-w/2, -h/2);

        const sBlur = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
        const sOp = layer.shadowOp !== undefined ? layer.shadowOp : 50;
        const shadowColor = `rgba(0,0,0,${sOp/100})`;

        if (layer.frameStyle === 'iphone') {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = sBlur;
            ctx.shadowOffsetY = sBlur / 2;

            const rad = Math.min(w, h) * 0.1;
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, rad);
            ctx.closePath();
            
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.shadowColor = 'transparent';

            ctx.save();
            ctx.clip();
            ctx.drawImage(layer.img, 0, 0, w, h);
            ctx.restore();

            const notchW = w * 0.4;
            const notchH = notchW * 0.2;
            if (notchImg.complete) {
                ctx.drawImage(notchImg, (w - notchW)/2, 0, notchW, notchH);
            }
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = w * 0.02;
            ctx.stroke();

        } else if (layer.frameStyle === 'ipad') {
            const padW = w * 0.05; // Bezel thickness
            const rad = Math.min(w, h) * 0.05;
            
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = sBlur;
            ctx.shadowOffsetY = sBlur / 2;

            // Draw outer black bezel
            ctx.beginPath();
            ctx.roundRect(-padW, -padW, w + padW*2, h + padW*2, rad + padW);
            ctx.closePath();
            ctx.fillStyle = '#111';
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Draw Image
            ctx.drawImage(layer.img, 0, 0, w, h);

            // Draw inner stroke
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, w, h);

        } else if (layer.frameStyle === 'macbook') {
            const padW = w * 0.02;
            const topBar = h * 0.05;
            const bottomLip = h * 0.12;
            
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = sBlur;
            ctx.shadowOffsetY = sBlur / 2;
            
            // Draw Top Bezel (Black)
            ctx.beginPath();
            ctx.roundRect(-padW, -padW - topBar, w + padW*2, h + padW*2 + topBar + bottomLip, [16,16,0,0]);
            ctx.closePath();
            ctx.fillStyle = '#111';
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Draw Bottom Lip (Silver)
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.roundRect(-padW, h + padW, w + padW*2, bottomLip, [0,0,16,16]);
            ctx.fill();

            // Screen Image
            ctx.drawImage(layer.img, 0, 0, w, h);

        } else if (layer.frameStyle === 'browser') {
            const topBar = 60;
            const totalH = h + topBar;
            
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = sBlur;
            ctx.shadowOffsetY = sBlur / 2;
            
            ctx.beginPath();
            ctx.roundRect(0, 0, w, totalH, 16);
            ctx.closePath();
            ctx.fillStyle = '#2d2d2d';
            ctx.fill();
            ctx.shadowColor = 'transparent';

            // Mac buttons
            ctx.fillStyle = '#ff5f56';
            ctx.beginPath(); ctx.arc(24, topBar/2, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffbd2e';
            ctx.beginPath(); ctx.arc(52, topBar/2, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#27c93f';
            ctx.beginPath(); ctx.arc(80, topBar/2, 8, 0, Math.PI*2); ctx.fill();

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(0, topBar, w, h, [0,0,16,16]);
            ctx.clip();
            ctx.drawImage(layer.img, 0, topBar, w, h);
            ctx.restore();

            layer.renderHeight = totalH;

        } else {
            // No frame
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = sBlur;
            ctx.shadowOffsetY = sBlur / 2;
            ctx.drawImage(layer.img, 0, 0, w, h);
            ctx.shadowColor = 'transparent';
        }
    }

    function drawTextLayer(layer) {
        ctx.font = `800 ${layer.fontSize}px ${layer.fontFamily || 'Inter'}, sans-serif`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = layer.content.split('\n');
        const lineH = layer.fontSize * 1.2;
        layer.height = lines.length * lineH;
        
        let maxW = 0;
        lines.forEach((line, i) => {
            const m = ctx.measureText(line);
            if (m.width > maxW) maxW = m.width;
            
            const offY = (i - (lines.length-1)/2) * lineH;
            ctx.fillText(line, 0, offY);
        });
        
        layer.width = maxW;
    }

    function drawSelectionBox(layer) {
        ctx.save();
        ctx.translate(layer.x, layer.y);
        
        if (layer.type === 'image') {
            const r = (layer.rotation || 0) * Math.PI / 180;
            const ty = (layer.tiltY || 0) * Math.PI / 180;
            ctx.transform(1, ty, 0, 1, 0, 0);
            ctx.rotate(r);
        }
        
        let w = layer.width * layer.scale;
        let h = (layer.renderHeight || layer.height) * layer.scale;
        
        // Compensate for pad if ipad/macbook
        if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') {
            w += (layer.width * 0.1) * layer.scale;
            h += (layer.height * 0.1) * layer.scale;
        }
        
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 4 / getWrapperScale();
        ctx.setLineDash([10 / getWrapperScale(), 10 / getWrapperScale()]);
        ctx.strokeRect(-w/2, -h/2, w, h);

        ctx.fillStyle = '#00e5ff';
        ctx.setLineDash([]);
        const hs = 20 / getWrapperScale(); 
        
        ctx.fillRect(-w/2 - hs/2, -h/2 - hs/2, hs, hs); 
        ctx.fillRect(w/2 - hs/2, -h/2 - hs/2, hs, hs); 
        ctx.fillRect(-w/2 - hs/2, h/2 - hs/2, hs, hs); 
        ctx.fillRect(w/2 - hs/2, h/2 - hs/2, hs, hs); 
        
        ctx.restore();
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
        // Reverse translate
        let tx = px - cx;
        let ty = py - cy;

        // Reverse tiltY (skewY)
        // transform matrix was: 1, tiltY, 0, 1
        // inverse: 1, -tiltY, 0, 1
        let tiltY_rad = (tiltY || 0) * Math.PI / 180;
        let sx = tx;
        let sy = -tx * tiltY_rad + ty;

        // Reverse rotate
        let r = -(rotation || 0) * Math.PI / 180;
        let cosR = Math.cos(r);
        let sinR = Math.sin(r);
        let rx = sx * cosR - sy * sinR;
        let ry = sx * sinR + sy * cosR;

        // Reverse scale
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
            const hit = isPointInTransformedRect(
                x, y, layer.x, layer.y, 
                w, h, 
                layer.scale, layer.rotation, layer.tiltY
            );
            if (hit) return layer.id;
        }
        return null;
    }

    function checkHandleHit(x, y, layer) {
        let w = layer.width;
        let h = layer.renderHeight || layer.height;
        if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') {
            w += layer.width * 0.1;
            h += layer.height * 0.1;
        }

        const hit = isPointInTransformedRect(
            x, y, layer.x, layer.y, 
            w + 100, h + 100, 
            layer.scale, layer.rotation, layer.tiltY
        );
        if (hit) return 'handle'; 
        return null;
    }

    wrapper.addEventListener('mousedown', (e) => {
        const { x, y } = getMouseCoords(e);

        if (selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) {
                let w = layer.width;
                let h = layer.renderHeight || layer.height;
                if (layer.frameStyle === 'ipad' || layer.frameStyle === 'macbook') {
                    w += layer.width * 0.1;
                    h += layer.height * 0.1;
                }

                const innerHit = isPointInTransformedRect(
                    x, y, layer.x, layer.y, 
                    w, h, 
                    layer.scale, layer.rotation, layer.tiltY
                );
                const handleHit = checkHandleHit(x, y, layer);
                
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

    window.addEventListener('mouseup', () => {
        isDragging = false;
        isScaling = false;
    });

    // --- Properties Panel Sync ---
    function updatePropsPanel() {
        if (!selectedLayerId) {
            propsCanvas.style.display = 'block';
            propsText.style.display = 'none';
            propsImage.style.display = 'none';
            noSelectionMsg.style.display = 'block';
            bgBlurInput.value = bgBlur;
            return;
        }

        noSelectionMsg.style.display = 'none';
        propsCanvas.style.display = 'none';
        
        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer.type === 'text') {
            propsText.style.display = 'flex';
            propsImage.style.display = 'none';
            textInput.value = layer.content;
            colorInput.value = layer.color;
            fontSelect.value = layer.fontFamily || 'Inter';
        } else if (layer.type === 'image') {
            propsText.style.display = 'none';
            propsImage.style.display = 'flex';
            frameSelect.value = layer.frameStyle;
            rotateInput.value = layer.rotation || 0;
            tiltYInput.value = layer.tiltY || 0;
            shadowBlurInput.value = layer.shadowBlur !== undefined ? layer.shadowBlur : 80;
            shadowOpInput.value = layer.shadowOp !== undefined ? layer.shadowOp : 50;
        }
    }

    // Property Inputs Listeners
    textInput.addEventListener('input', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.content = e.target.value; render(); }
    });
    colorInput.addEventListener('input', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.color = e.target.value; render(); }
    });
    fontSelect.addEventListener('change', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.fontFamily = e.target.value; render(); }
    });
    frameSelect.addEventListener('change', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.frameStyle = e.target.value; render(); }
    });
    rotateInput.addEventListener('input', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.rotation = parseInt(e.target.value); render(); }
    });
    tiltYInput.addEventListener('input', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.tiltY = parseInt(e.target.value); render(); }
    });
    shadowBlurInput.addEventListener('input', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.shadowBlur = parseInt(e.target.value); render(); }
    });
    shadowOpInput.addEventListener('input', (e) => {
        const layer = layers.find(l => l?.id === selectedLayerId);
        if (layer) { layer.shadowOp = parseInt(e.target.value); render(); }
    });

    document.getElementById('delete-text-btn').addEventListener('click', deleteSelected);
    document.getElementById('delete-image-btn').addEventListener('click', deleteSelected);
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
            if (document.activeElement === textInput) return;
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

    document.getElementById('bring-forward-btn').addEventListener('click', () => {
        if (!selectedLayerId) return;
        const idx = layers.findIndex(l => l.id === selectedLayerId);
        if (idx < layers.length - 1) {
            const temp = layers[idx];
            layers[idx] = layers[idx + 1];
            layers[idx + 1] = temp;
            render();
        }
    });

    document.getElementById('send-backward-btn').addEventListener('click', () => {
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

    document.getElementById('export-png-btn').addEventListener('click', () => {
        const prevSelected = selectedLayerId;
        selectedLayerId = null;
        render();

        const dataURL = canvas.toDataURL('image/png', 1.0);
        
        selectedLayerId = prevSelected;
        render();

        const link = document.createElement('a');
        link.download = `mockup-studio-${targetWidth}x${targetHeight}.png`;
        link.href = dataURL;
        link.click();
    });

    init();
});
