/**
 * Riyo Studio - Mockup Studio V2 (Object-Based Canvas Editor)
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
    const frameSelect = document.getElementById('frame-style-select');
    const imageUpload = document.getElementById('image-upload-input');

    // --- Editor State ---
    let targetWidth = 1242;
    let targetHeight = 2688; // Default to App Store 6.5"
    let currentBg = 'linear-gradient(135deg, #FF6B6B, #4ECDC4)'; // Fallback JS parse
    let bgType = 'gradient';
    let bgColor1 = '#FF6B6B';
    let bgColor2 = '#4ECDC4';

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
    let scaleCorner = null; // 'tl', 'tr', 'bl', 'br'

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
        layers.push({
            id: generateId(),
            type: 'image',
            img: imgObj,
            frameStyle: 'iphone', // default
            x: targetWidth / 2,
            y: targetHeight / 2,
            scale: 1,
            width: imgObj.width,
            height: imgObj.height
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

    // --- Rendering ---
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
        } else if (bgType === 'transparent') {
            // Draw checkerboard for dev, but transparent for export
            // Actually, keep it transparent to allow true PNG export
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Draw Layers
        layers.forEach(layer => {
            ctx.save();
            ctx.translate(layer.x, layer.y);
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
        // Center the drawing point
        ctx.translate(-w/2, -h/2);

        // Apply Frame
        if (layer.frameStyle === 'iphone') {
            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 80;
            ctx.shadowOffsetY = 40;

            // Clip for rounded corners
            const rad = Math.min(w, h) * 0.1;
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, rad);
            ctx.closePath();
            
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.shadowColor = 'transparent'; // reset shadow

            ctx.save();
            ctx.clip();
            ctx.drawImage(layer.img, 0, 0, w, h);
            ctx.restore();

            // Draw Notch
            const notchW = w * 0.4;
            const notchH = notchW * 0.2;
            if (notchImg.complete) {
                ctx.drawImage(notchImg, (w - notchW)/2, 0, notchW, notchH);
            }
            
            // Draw Bezel
            ctx.strokeStyle = '#000';
            ctx.lineWidth = w * 0.02;
            ctx.stroke();

        } else if (layer.frameStyle === 'browser') {
            const topBar = 60;
            const totalH = h + topBar;
            
            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 60;
            ctx.shadowOffsetY = 30;
            
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

            // Image
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(0, topBar, w, h, [0,0,16,16]);
            ctx.clip();
            ctx.drawImage(layer.img, 0, topBar, w, h);
            ctx.restore();

            // Override layer height to include toolbar for hit detection
            layer.renderHeight = totalH;

        } else {
            // No frame
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 40;
            ctx.shadowOffsetY = 20;
            ctx.drawImage(layer.img, 0, 0, w, h);
            ctx.shadowColor = 'transparent';
        }
    }

    function drawTextLayer(layer) {
        ctx.font = `800 ${layer.fontSize}px Inter, sans-serif`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Split by newlines
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
        
        const w = layer.width * layer.scale;
        const h = (layer.renderHeight || layer.height) * layer.scale;
        
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 4 / getWrapperScale();
        ctx.setLineDash([10 / getWrapperScale(), 10 / getWrapperScale()]);
        ctx.strokeRect(-w/2, -h/2, w, h);

        // Handles
        ctx.fillStyle = '#00e5ff';
        ctx.setLineDash([]);
        const hs = 20 / getWrapperScale(); // handle size
        
        ctx.fillRect(-w/2 - hs/2, -h/2 - hs/2, hs, hs); // tl
        ctx.fillRect(w/2 - hs/2, -h/2 - hs/2, hs, hs); // tr
        ctx.fillRect(-w/2 - hs/2, h/2 - hs/2, hs, hs); // bl
        ctx.fillRect(w/2 - hs/2, h/2 - hs/2, hs, hs); // br
        
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

    function checkHit(x, y) {
        // Reverse order to pick top-most layer
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            const w = layer.width * layer.scale;
            const h = (layer.renderHeight || layer.height) * layer.scale;
            
            const left = layer.x - w/2;
            const right = layer.x + w/2;
            const top = layer.y - h/2;
            const bottom = layer.y + h/2;

            if (x >= left && x <= right && y >= top && y <= bottom) {
                return layer.id;
            }
        }
        return null;
    }

    function checkHandleHit(x, y, layer) {
        const w = layer.width * layer.scale;
        const h = (layer.renderHeight || layer.height) * layer.scale;
        const hs = 30 / getWrapperScale(); // Hit tolerance

        const left = layer.x - w/2;
        const right = layer.x + w/2;
        const top = layer.y - h/2;
        const bottom = layer.y + h/2;

        if (Math.abs(x - left) < hs && Math.abs(y - top) < hs) return 'tl';
        if (Math.abs(x - right) < hs && Math.abs(y - top) < hs) return 'tr';
        if (Math.abs(x - left) < hs && Math.abs(y - bottom) < hs) return 'bl';
        if (Math.abs(x - right) < hs && Math.abs(y - bottom) < hs) return 'br';

        return null;
    }

    wrapper.addEventListener('mousedown', (e) => {
        const { x, y } = getMouseCoords(e);

        // 1. Check if clicking handle of selected layer
        if (selectedLayerId) {
            const layer = layers.find(l => l.id === selectedLayerId);
            if (layer) {
                const handle = checkHandleHit(x, y, layer);
                if (handle) {
                    isScaling = true;
                    scaleCorner = handle;
                    dragStartX = x;
                    dragStartY = y;
                    originalScale = layer.scale;
                    return;
                }
            }
        }

        // 2. Check if clicking any layer
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

        // 3. Clicked empty space
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
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            layer.x = originalLayerX + dx;
            layer.y = originalLayerY + dy;
            render();
        } else if (isScaling) {
            // Simple proportional scaling based on mouse distance from center
            const distStart = Math.hypot(dragStartX - layer.x, dragStartY - layer.y);
            const distCurrent = Math.hypot(x - layer.x, y - layer.y);
            const scaleFactor = distCurrent / distStart;
            
            // Prevent inverted or 0 scale
            layer.scale = Math.max(0.1, originalScale * scaleFactor);
            render();
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        isScaling = false;
        scaleCorner = null;
    });

    // --- Properties Panel Sync ---
    function updatePropsPanel() {
        if (!selectedLayerId) {
            propsCanvas.style.display = 'block';
            propsText.style.display = 'none';
            propsImage.style.display = 'none';
            noSelectionMsg.style.display = 'block';
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
        } else if (layer.type === 'image') {
            propsText.style.display = 'none';
            propsImage.style.display = 'flex';
            frameSelect.value = layer.frameStyle;
        }
    }

    // Property Inputs Listeners
    textInput.addEventListener('input', (e) => {
        if (!selectedLayerId) return;
        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer) layer.content = e.target.value;
        render();
    });

    colorInput.addEventListener('input', (e) => {
        if (!selectedLayerId) return;
        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer) layer.color = e.target.value;
        render();
    });

    frameSelect.addEventListener('change', (e) => {
        if (!selectedLayerId) return;
        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer) layer.frameStyle = e.target.value;
        render();
    });

    // Delete Handlers
    document.getElementById('delete-text-btn').addEventListener('click', deleteSelected);
    document.getElementById('delete-image-btn').addEventListener('click', deleteSelected);
    
    // Keyboard delete
    window.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
            // Prevent if editing text
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

    // Z-Index Adjustments
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

    // Background Controls
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

    // Export PNG
    document.getElementById('export-png-btn').addEventListener('click', () => {
        // Temporarily deselect to hide handles
        const prevSelected = selectedLayerId;
        selectedLayerId = null;
        render();

        const dataURL = canvas.toDataURL('image/png', 1.0);
        
        // Restore selection
        selectedLayerId = prevSelected;
        render();

        const link = document.createElement('a');
        link.download = `mockup-studio-${targetWidth}x${targetHeight}.png`;
        link.href = dataURL;
        link.click();
    });

    init();
});
