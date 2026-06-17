document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('logo-canvas');
  if (!canvasElement || typeof fabric === 'undefined') return;

  // Initialize Fabric Canvas
  const canvas = new fabric.Canvas('logo-canvas', {
    width: 1600,
    height: 800,
    preserveObjectStacking: true
  });

  // UI Elements
  const addTextBtn = document.getElementById('add-text-btn');
  
  function resizeCanvas() {
    // We are now using pure CSS aspect-ratio scaling in logo.html!
    // We only need to tell FabricJS to recalculate its mouse offsets when the window resizes.
    if (canvas) canvas.calcOffset();
  }
  
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100);
  setTimeout(resizeCanvas, 500);
  setTimeout(resizeCanvas, 1500);
  
  const toggleGridBtn = document.getElementById('toggle-grid-btn');
  const previewMockupBtn = document.getElementById('preview-mockup-btn');
  
  const saveProjBtn = document.getElementById('save-proj-btn');
  const loadProjBtn = document.getElementById('load-proj-btn');
  const magicBrandInput = document.getElementById('magic-brand-input');
  const magicKeywordInput = document.getElementById('magic-keyword-input');
  const magicGenerateBtn = document.getElementById('magic-generate-btn');

  const mockupModal = document.getElementById('mockup-modal');
  const closeMockupBtn = document.getElementById('close-mockup-btn');
  const mockupImage = document.getElementById('mockup-image');

  const addShapeBtn = document.getElementById('add-shape-btn');
  const addImageBtn = document.getElementById('add-image-btn');
  const imageUploadInput = document.getElementById('image-upload-input');
  const iconPanel = document.getElementById('icon-library-panel');
  const libIconBtns = document.querySelectorAll('.lib-icon-btn');
  
  const themeBtns = document.querySelectorAll('.theme-btn');
  const exportBtn = document.getElementById('logo-export-btn');

  const objPropsPanel = document.getElementById('object-properties');
  const fontPropGroup = document.getElementById('font-prop-group');
  const imagePropGroup = document.getElementById('image-prop-group');
  const fontSelect = document.getElementById('obj-font-select');
  const colorPicker = document.getElementById('obj-color-picker');
  const colorHex = document.getElementById('obj-color-hex');
  const deleteBtn = document.getElementById('delete-obj-btn');
  
  const splitWordsBtn = document.getElementById('split-words-btn');
  const removeBgBtn = document.getElementById('remove-bg-btn');
  const textCurveSlider = document.getElementById('text-curve-slider');
  const curveVal = document.getElementById('curve-val');

  const alignCenterH = document.getElementById('align-center-h');
  const alignCenterV = document.getElementById('align-center-v');
  const layerUpBtn = document.getElementById('layer-up-btn');
  const layerDownBtn = document.getElementById('layer-down-btn');

  const letterSpacingSlider = document.getElementById('letter-spacing-slider');
  const spacingVal = document.getElementById('spacing-val');
  const opacitySlider = document.getElementById('obj-opacity-slider');
  const opacityVal = document.getElementById('opacity-val');
  const strokeColor = document.getElementById('obj-stroke-color');
  const strokeWidth = document.getElementById('obj-stroke-width');

  const shadowBlur = document.getElementById('shadow-blur');
  const shadowOffset = document.getElementById('shadow-offset');
  const shadowColor = document.getElementById('shadow-color');

  const fontBoldBtn = document.getElementById('font-bold-btn');
  const fontItalicBtn = document.getElementById('font-italic-btn');
  const fontUnderlineBtn = document.getElementById('font-underline-btn');

  let currentTheme = 'dark';

  // Create a persistent background rectangle
  let bgRect = new fabric.Rect({
    left: 0, top: 0, width: canvas.width, height: canvas.height,
    selectable: false, evented: false, excludeFromExport: false,
    fill: '#0a0a0a'
  });
  canvas.add(bgRect);
  canvas.sendToBack(bgRect);

  function updateBackground() {
    bgRect.set('width', canvas.width);
    bgRect.set('height', canvas.height);
    
    if (currentTheme === 'dark') {
      bgRect.set('fill', '#0a0a0a');
    } else if (currentTheme === 'light') {
      bgRect.set('fill', '#ffffff');
    } else if (currentTheme === 'cyber') {
      bgRect.set('fill', '#050505');
    } else if (currentTheme === 'midnight') {
      bgRect.set('fill', new fabric.Gradient({
        type: 'linear', gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
        colorStops: [ { offset: 0, color: '#1e1b4b' }, { offset: 1, color: '#312e81' } ]
      }));
    } else if (currentTheme === 'sunset') {
      bgRect.set('fill', new fabric.Gradient({
        type: 'linear', gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
        colorStops: [ { offset: 0, color: '#f97316' }, { offset: 1, color: '#db2777' } ]
      }));
    } else if (currentTheme === 'holographic') {
      bgRect.set('fill', new fabric.Gradient({
        type: 'linear', gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
        colorStops: [ { offset: 0, color: '#e0e7ff' }, { offset: 1, color: '#f3e8ff' } ]
      }));
    } else if (currentTheme === 'grid') {
      bgRect.set('fill', '#111111');
    } else {
      bgRect.set('fill', 'transparent');
    }
    
    // Make sure background rect is strictly at the bottom
    canvas.sendToBack(bgRect);
    canvas.renderAll();
  }

  updateBackground();

  // --- Undo / Redo System ---
  let historyState = [];
  let historyIndex = -1;
  let isHistoryProcessing = false;

  function saveHistory() {
    if (isHistoryProcessing) return;
    const json = JSON.stringify(canvas.toJSON(['id', 'selectable', 'evented', 'shadow', 'name', 'origProps']));
    
    // If we're not at the end of history, truncate the future
    if (historyIndex < historyState.length - 1) {
      historyState = historyState.slice(0, historyIndex + 1);
    }
    
    historyState.push(json);
    // Keep max 30 states
    if (historyState.length > 30) historyState.shift();
    else historyIndex++;
  }

  function undo() {
    if (historyIndex <= 0) return;
    isHistoryProcessing = true;
    historyIndex--;
    canvas.loadFromJSON(historyState[historyIndex], () => {
      bgRect = canvas.getObjects()[0]; // Re-attach reference
      canvas.renderAll();
      isHistoryProcessing = false;
    });
  }

  function redo() {
    if (historyIndex >= historyState.length - 1) return;
    isHistoryProcessing = true;
    historyIndex++;
    canvas.loadFromJSON(historyState[historyIndex], () => {
      bgRect = canvas.getObjects()[0]; // Re-attach reference
      canvas.renderAll();
      isHistoryProcessing = false;
    });
  }

  // Hook into fabric events
  canvas.on('object:modified', saveHistory);
  canvas.on('object:added', (e) => {
    if (e.target !== bgRect && !isHistoryProcessing) {
      // Small timeout to allow object to fully initialize
      setTimeout(saveHistory, 50);
    }
  });
  canvas.on('object:removed', () => {
    if (!isHistoryProcessing) saveHistory();
  });

  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');

  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
  });
  // --- Center Snapping & Smart Guides ---
  const snapZone = 15;
  const guideLineColor = 'rgba(239, 68, 68, 0.8)';
  const guideLineWidth = 2;
  let vGuide = null;
  let hGuide = null;

  canvas.on('object:moving', (e) => {
    const obj = e.target;
    if (!obj) return;

    // Objects in fabric have originX and originY as center for our app
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    let snapped = false;

    // Check horizontal center
    if (Math.abs(obj.left - canvasWidth / 2) < snapZone) {
      obj.set({ left: canvasWidth / 2 }).setCoords();
      if (!vGuide) {
        vGuide = new fabric.Line([canvasWidth / 2, 0, canvasWidth / 2, canvasHeight], {
          stroke: guideLineColor, strokeWidth: guideLineWidth,
          selectable: false, evented: false, strokeDashArray: [5, 5]
        });
        canvas.add(vGuide);
      }
      snapped = true;
    } else {
      if (vGuide) { canvas.remove(vGuide); vGuide = null; }
    }

    // Check vertical center
    if (Math.abs(obj.top - canvasHeight / 2) < snapZone) {
      obj.set({ top: canvasHeight / 2 }).setCoords();
      if (!hGuide) {
        hGuide = new fabric.Line([0, canvasHeight / 2, canvasWidth, canvasHeight / 2], {
          stroke: guideLineColor, strokeWidth: guideLineWidth,
          selectable: false, evented: false, strokeDashArray: [5, 5]
        });
        canvas.add(hGuide);
      }
      snapped = true;
    } else {
      if (hGuide) { canvas.remove(hGuide); hGuide = null; }
    }
  });

  canvas.on('mouse:up', () => {
    if (vGuide) { canvas.remove(vGuide); vGuide = null; }
    if (hGuide) { canvas.remove(hGuide); hGuide = null; }
    canvas.renderAll();
  });
  // --------------------------

  // --- Smart Layout Engine ---
  const layoutLeftBtn = document.getElementById('layout-left-btn');
  const layoutStackBtn = document.getElementById('layout-stack-btn');
  const layoutBadgeBtn = document.getElementById('layout-badge-btn');

  function getLayoutObjects() {
    let objs = canvas.getActiveObjects();
    if (objs.length === 0) {
      objs = canvas.getObjects().filter(o => o !== bgRect);
    }
    return objs;
  }

  if (layoutLeftBtn) {
    layoutLeftBtn.addEventListener('click', () => {
      const objs = getLayoutObjects();
      if (objs.length < 2) { toast('Smart Layouts arrange an icon with your text — add both first.', 'error'); return; }
      
      let icon = objs.find(o => o.type === 'path' || o.type === 'group' || o.type === 'image');
      let texts = objs.filter(o => o.type === 'i-text' || o.type === 'text');
      
      if (!icon && texts.length >= 2) { icon = texts[0]; texts = texts.slice(1); }
      if (!icon || texts.length === 0) { toast('Need an icon and at least one text for this layout.', 'error'); return; }

      const mainText = texts[0];
      const spacing = 40;
      
      const iconW = icon.getScaledWidth();
      const textW = mainText.getScaledWidth();
      const totalW = iconW + spacing + textW;
      
      const startX = (canvas.width - totalW) / 2;
      const centerY = canvas.height / 2;
      
      icon.set({ originX: 'left', originY: 'center', left: startX, top: centerY });
      mainText.set({ originX: 'left', originY: 'center', left: startX + iconW + spacing, top: centerY });
      
      if (texts.length > 1) {
        const subText = texts[1];
        subText.set({ originX: 'left', originY: 'top', left: startX + iconW + spacing, top: centerY + (mainText.getScaledHeight()/2) });
      }
      
      objs.forEach(o => o.setCoords());
      canvas.discardActiveObject();
      canvas.renderAll();
      saveHistory();
    });
  }

  if (layoutStackBtn) {
    layoutStackBtn.addEventListener('click', () => {
      const objs = getLayoutObjects();
      if (objs.length < 2) { toast('Smart Layouts arrange an icon with your text — add both first.', 'error'); return; }
      
      let icon = objs.find(o => o.type === 'path' || o.type === 'group' || o.type === 'image');
      let texts = objs.filter(o => o.type === 'i-text' || o.type === 'text');
      if (!icon && texts.length >= 2) { icon = texts[0]; texts = texts.slice(1); }
      if (!icon || texts.length === 0) { toast('Need an icon and at least one text for this layout.', 'error'); return; }

      const mainText = texts[0];
      const spacing = 40;
      
      const iconH = icon.getScaledHeight();
      const textH = mainText.getScaledHeight();
      let totalH = iconH + spacing + textH;
      if (texts.length > 1) totalH += 10 + texts[1].getScaledHeight();
      
      const startY = (canvas.height - totalH) / 2;
      const centerX = canvas.width / 2;
      
      icon.set({ originX: 'center', originY: 'top', left: centerX, top: startY });
      mainText.set({ originX: 'center', originY: 'top', left: centerX, top: startY + iconH + spacing });
      
      if (texts.length > 1) {
        const subText = texts[1];
        subText.set({ originX: 'center', originY: 'top', left: centerX, top: startY + iconH + spacing + textH + 10 });
      }
      
      objs.forEach(o => o.setCoords());
      canvas.discardActiveObject();
      canvas.renderAll();
      saveHistory();
    });
  }

  if (layoutBadgeBtn) {
    layoutBadgeBtn.addEventListener('click', () => {
        layoutStackBtn.click(); // Stack them first
        const objs = getLayoutObjects();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        let maxDim = 0;
        objs.forEach(o => {
            const d = Math.max(o.getScaledWidth(), o.getScaledHeight());
            if (d > maxDim) maxDim = d;
        });
        
        const circle = new fabric.Circle({
            radius: (maxDim / 2) + 60,
            fill: 'transparent',
            stroke: '#ffffff',
            strokeWidth: 4,
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(circle);
        canvas.sendBackwards(circle);
        saveHistory();
    });
  }
  // --------------------------

  // --- Layers Panel ---
  const layersList = document.getElementById('layers-list');
  
  function updateLayersPanel() {
      if (!layersList) return;
      layersList.innerHTML = '';
      
      // Reverse to show top layer at the top of the list
      const objs = canvas.getObjects().filter(o => o !== bgRect).reverse();
      
      objs.forEach((obj, index) => {
          const div = document.createElement('div');
          div.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 6px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 4px;';
          
          let name = 'Object';
          if (obj.type === 'i-text' || obj.type === 'text') name = 'Text: ' + obj.text.substring(0, 8);
          else if (obj.type === 'path' || obj.type === 'group') name = 'Vector Icon';
          else if (obj.type === 'image') name = 'Image';
          else if (obj.type === 'circle') name = 'Badge Circle';
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = name;
          nameSpan.style.color = '#fff';
          nameSpan.style.fontSize = '0.85rem';
          nameSpan.style.flex = '1';
          nameSpan.style.cursor = 'pointer';
          
          nameSpan.addEventListener('click', () => {
              canvas.setActiveObject(obj);
              canvas.renderAll();
          });
          
          const btnGroup = document.createElement('div');
          btnGroup.style.display = 'flex';
          btnGroup.style.gap = '4px';
          
          const upBtn = document.createElement('button');
          upBtn.innerHTML = '↑';
          upBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; font-size: 12px;';
          upBtn.onclick = () => { canvas.bringForward(obj); updateLayersPanel(); saveHistory(); };
          
          const downBtn = document.createElement('button');
          downBtn.innerHTML = '↓';
          downBtn.style.cssText = 'background: rgba(255,255,255,0.1); border: none; border-radius: 4px; color: #fff; cursor: pointer; padding: 2px 6px; font-size: 12px;';
          downBtn.onclick = () => { 
              if (canvas.getObjects().indexOf(obj) > 1) { 
                  canvas.sendBackwards(obj); updateLayersPanel(); saveHistory(); 
              }
          };
          
          const delBtn = document.createElement('button');
          delBtn.innerHTML = '🗑️';
          delBtn.style.cssText = 'background: rgba(239,68,68,0.2); border: none; border-radius: 4px; color: #ef4444; cursor: pointer; padding: 2px 6px; font-size: 12px;';
          delBtn.onclick = () => { canvas.remove(obj); updateLayersPanel(); saveHistory(); };
          
          btnGroup.appendChild(upBtn);
          btnGroup.appendChild(downBtn);
          btnGroup.appendChild(delBtn);
          
          div.appendChild(nameSpan);
          div.appendChild(btnGroup);
          layersList.appendChild(div);
      });
  }
  
  canvas.on('object:added', updateLayersPanel);
  canvas.on('object:removed', updateLayersPanel);
  canvas.on('object:modified', updateLayersPanel);
  // --------------------------

  fabric.Object.prototype.set({
    transparentCorners: false, cornerColor: '#10B981', cornerStrokeColor: '#000000',
    borderColor: '#10B981', cornerSize: 22, touchCornerSize: 56, padding: 8,
    cornerStyle: 'circle', borderScaleFactor: 2
  });

  function addText() {
    const text = new fabric.IText('Your Brand', {
      left: 800, top: 400, fontFamily: 'Clash Display',
      fill: (currentTheme === 'light' || currentTheme === 'holographic') ? '#111111' : '#ffffff',
      fontSize: 120, fontWeight: '700', originX: 'center', originY: 'center',
      shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null,
      objectCaching: false
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    
    document.fonts.ready.then(() => {
        text.setCoords();
        canvas.renderAll();
    });
    canvas.renderAll();
  }

  addShapeBtn.addEventListener('click', () => {
    if (iconPanel) {
      iconPanel.style.display = iconPanel.style.display === 'none' ? 'flex' : 'none';
    }
  });

  libIconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const svgPath = btn.getAttribute('data-svg');
      if (!svgPath) return;
      const path = new fabric.Path(svgPath, {
        left: canvas.width / 2, top: canvas.height / 2,
        fill: (currentTheme === 'light' || currentTheme === 'holographic') ? '#111111' : '#ffffff',
        originX: 'center', originY: 'center',
        shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null
      });
      const ls = 340 / Math.max(path.width || 340, path.height || 340);
      path.set({ scaleX: ls, scaleY: ls });
      canvas.add(path);
      canvas.setActiveObject(path);
      canvas.renderAll();
      iconPanel.style.display = 'none';
    });
  });

  function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach(obj => canvas.remove(obj));
    }
  }

  // ── Editor power: duplicate / group / lock / nudge ───────────────
  const CLONE_PROPS = ['id', 'name', 'origProps', 'selectable', 'evented', 'locked'];

  function toast(msg, type) { if (window.showToast) window.showToast(msg, type || 'success'); }

  function duplicateSelected() {
    const active = canvas.getActiveObject();
    if (!active) { toast('Select something to duplicate first.', 'error'); return; }
    active.clone((cloned) => {
      canvas.discardActiveObject();
      cloned.set({ left: (active.left || 0) + 30, top: (active.top || 0) + 30, evented: true });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((o) => canvas.add(o));
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      saveHistory();
    }, CLONE_PROPS);
  }

  function groupSelected() {
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') {
      toast('Pick 2+ items first — drag a box around them or Shift-click each, then Group.', 'error');
      return;
    }
    active.toGroup();
    canvas.requestRenderAll();
    saveHistory();
    toast('Grouped — they now move & resize as one. Use Ungroup to split them.');
  }

  function ungroupSelected() {
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'group') {
      toast('Select a grouped item first, then Ungroup.', 'error');
      return;
    }
    active.toActiveSelection();
    canvas.requestRenderAll();
    saveHistory();
    toast('Ungrouped.');
  }

  function refreshLockBtn() {
    const lockBtn = document.getElementById('lock-btn');
    if (!lockBtn) return;
    const a = canvas.getActiveObject();
    lockBtn.textContent = (a && a.locked) ? '🔒 Unlock' : '🔓 Lock';
  }

  function toggleLockSelected() {
    const objs = canvas.getActiveObjects();
    if (!objs.length) { toast('Select an item first to lock or unlock it.', 'error'); return; }
    const locking = !objs[0].locked;
    objs.forEach((o) => {
      o.locked = locking;
      o.lockMovementX = locking; o.lockMovementY = locking;
      o.lockScalingX = locking; o.lockScalingY = locking;
      o.lockRotation = locking;
      o.hasControls = !locking;
      if (o.type === 'i-text' || o.type === 'text') o.editable = !locking;
    });
    canvas.requestRenderAll();
    refreshLockBtn();
    saveHistory();
    toast(locking ? 'Locked — it won’t move or resize. Tap Unlock to edit it again.' : 'Unlocked — you can edit it again.');
  }

  let nudgeSaveTimer = null;
  function nudge(dx, dy) {
    const active = canvas.getActiveObject();
    if (!active || active.locked) return;
    active.set({ left: active.left + dx, top: active.top + dy });
    active.setCoords();
    canvas.requestRenderAll();
    clearTimeout(nudgeSaveTimer);
    nudgeSaveTimer = setTimeout(saveHistory, 400);
  }

  const duplicateBtn = document.getElementById('duplicate-btn');
  const groupBtn = document.getElementById('group-btn');
  const ungroupBtn = document.getElementById('ungroup-btn');
  const lockBtn = document.getElementById('lock-btn');
  if (duplicateBtn) duplicateBtn.addEventListener('click', duplicateSelected);
  if (groupBtn) groupBtn.addEventListener('click', groupSelected);
  if (ungroupBtn) ungroupBtn.addEventListener('click', ungroupSelected);
  if (lockBtn) lockBtn.addEventListener('click', toggleLockSelected);
  canvas.on('selection:created', refreshLockBtn);
  canvas.on('selection:updated', refreshLockBtn);
  canvas.on('selection:cleared', refreshLockBtn);

  // Shortcuts: Ctrl/Cmd+D duplicate, Ctrl/Cmd+G group, +Shift ungroup, arrows nudge.
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const a = canvas.getActiveObject();
    if (a && a.isEditing) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); duplicateSelected(); return; }
    if (mod && (e.key === 'g' || e.key === 'G')) { e.preventDefault(); if (e.shiftKey) ungroupSelected(); else groupSelected(); return; }
    if (e.key.indexOf('Arrow') === 0) {
      if (!a) return;
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') nudge(-step, 0);
      else if (e.key === 'ArrowRight') nudge(step, 0);
      else if (e.key === 'ArrowUp') nudge(0, -step);
      else if (e.key === 'ArrowDown') nudge(0, step);
    }
  });

  // ── Canvas zoom & pan (wheel + buttons on desktop, pinch on touch) ──
  const zoomLevelEl = document.getElementById('zoom-level');
  function clampZoom(z) { return Math.min(5, Math.max(0.2, z)); }
  function showZoom() { if (zoomLevelEl) zoomLevelEl.textContent = Math.round(canvas.getZoom() * 100) + '%'; }
  function canvasPoint(clientX, clientY) {
    const rect = canvas.upperCanvasEl.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }
  function zoomAt(clientX, clientY, zoom) {
    canvas.zoomToPoint(canvasPoint(clientX, clientY), clampZoom(zoom));
    showZoom();
  }
  function resetView() {
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();
    showZoom();
  }
  const resetViewBtn = document.getElementById('reset-view-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  if (resetViewBtn) resetViewBtn.addEventListener('click', resetView);
  function centerZoom(factor) {
    const rect = canvas.upperCanvasEl.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, canvas.getZoom() * factor);
  }
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => centerZoom(1.2));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => centerZoom(1 / 1.2));

  canvas.on('mouse:wheel', (opt) => {
    const e = opt.e;
    zoomAt(e.clientX, e.clientY, canvas.getZoom() * Math.pow(0.999, e.deltaY));
    e.preventDefault(); e.stopPropagation();
  });
  // Alt+drag to pan on desktop without disturbing selection.
  let panning = false, panLast = null;
  canvas.on('mouse:down', (opt) => {
    if (opt.e && opt.e.altKey) { panning = true; canvas.selection = false; panLast = { x: opt.e.clientX, y: opt.e.clientY }; }
  });
  canvas.on('mouse:move', (opt) => {
    if (!panning || !panLast) return;
    const e = opt.e;
    canvas.relativePan({ x: e.clientX - panLast.x, y: e.clientY - panLast.y });
    panLast = { x: e.clientX, y: e.clientY };
  });
  canvas.on('mouse:up', () => { panning = false; panLast = null; canvas.selection = true; });

  // Pinch-zoom + two-finger pan on touch devices.
  (function () {
    const el = canvas.upperCanvasEl;
    let pinchDist = 0, pinchMid = null, twoFinger = false;
    const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const mid = (t) => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) { twoFinger = true; pinchDist = dist(e.touches); pinchMid = mid(e.touches); canvas.selection = false; canvas.discardActiveObject(); canvas.requestRenderAll(); }
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      if (!twoFinger || e.touches.length !== 2) return;
      e.preventDefault();
      const d = dist(e.touches), m = mid(e.touches);
      if (pinchDist) zoomAt(m.x, m.y, canvas.getZoom() * (d / pinchDist));
      if (pinchMid) canvas.relativePan({ x: m.x - pinchMid.x, y: m.y - pinchMid.y });
      pinchDist = d; pinchMid = m;
    }, { passive: false });
    const endTouch = (e) => { if (e.touches.length < 2) { twoFinger = false; pinchDist = 0; pinchMid = null; canvas.selection = true; } };
    el.addEventListener('touchend', endTouch);
    el.addEventListener('touchcancel', endTouch);
  })();

  function updatePropertyPanel() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
      objPropsPanel.style.display = 'none';
      return;
    }
    objPropsPanel.style.display = 'flex';
    const color = activeObj.fill || '#ffffff';
    colorPicker.value = typeof color === 'string' ? color : '#ffffff';
    colorHex.value = typeof color === 'string' ? color : '#ffffff';

    if (activeObj.type === 'i-text' || activeObj.type === 'text') {
      fontPropGroup.style.display = 'block';

      // Read text properties
      if (letterSpacingSlider) {
        letterSpacingSlider.value = activeObj.charSpacing || 0;
        spacingVal.textContent = activeObj.charSpacing || 0;
      }

      if (imagePropGroup) imagePropGroup.style.display = 'none';
      fontSelect.value = activeObj.fontFamily || 'Inter';
      if (textCurveSlider && curveVal) {
          if (!activeObj.path) { textCurveSlider.value = 0; curveVal.textContent = "0"; }
      }
    } else if (activeObj.type === 'image') {
      fontPropGroup.style.display = 'none';
      if (imagePropGroup) imagePropGroup.style.display = 'block';
    } else {
      fontPropGroup.style.display = 'none';
      if (imagePropGroup) imagePropGroup.style.display = 'none';
    }

    // Update global properties
    if (opacitySlider) {
      opacitySlider.value = (activeObj.opacity || 1) * 100;
      opacityVal.textContent = Math.round((activeObj.opacity || 1) * 100) + '%';
    }
    if (strokeColor && strokeWidth) {
      strokeColor.value = activeObj.stroke || '#000000';
      strokeWidth.value = activeObj.strokeWidth || 0;
    }
    if (shadowBlur && shadowOffset && shadowColor) {
      if (activeObj.shadow) {
        shadowBlur.value = activeObj.shadow.blur || 0;
        shadowOffset.value = activeObj.shadow.offsetX || 0;
        if (/^#[0-9a-f]{6}$/i.test(activeObj.shadow.color || '')) shadowColor.value = activeObj.shadow.color;
      } else {
        shadowBlur.value = 0;
        shadowOffset.value = 0;
        // Pre-load a visible default so dragging Blur immediately shows the effect.
        shadowColor.value = defaultShadowColor();
      }
    }

  }

  canvas.on('selection:created', updatePropertyPanel);
  canvas.on('selection:updated', updatePropertyPanel);
  canvas.on('selection:cleared', updatePropertyPanel);

  colorPicker.addEventListener('input', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type !== 'image') {
      activeObj.set('fill', e.target.value); colorHex.value = e.target.value; canvas.renderAll();
    }
  });

  colorHex.addEventListener('input', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type !== 'image' && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
      activeObj.set('fill', e.target.value); colorPicker.value = e.target.value; canvas.renderAll();
    }
  });

  fontSelect.addEventListener('change', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
      activeObj.set('fontFamily', e.target.value);
      if (e.target.value === 'Cinzel' || e.target.value === 'Playfair Display' || e.target.value === 'Bricolage Grotesque' || e.target.value === 'Syne') {
        activeObj.set('fontWeight', '800');
      } else if (e.target.value === 'Clash Display' || e.target.value === 'Syncopate') {
        activeObj.set('fontWeight', '700');
      } else {
        activeObj.set('fontWeight', '600');
      }
      canvas.renderAll();
    }
  });

  if (fontBoldBtn) {
    fontBoldBtn.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        const isBold = activeObj.fontWeight === 'bold' || activeObj.fontWeight >= 700;
        activeObj.set('fontWeight', isBold ? 'normal' : 'bold');
        canvas.renderAll();
      }
    });
  }

  if (fontItalicBtn) {
    fontItalicBtn.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        const isItalic = activeObj.fontStyle === 'italic';
        activeObj.set('fontStyle', isItalic ? 'normal' : 'italic');
        canvas.renderAll();
      }
    });
  }

  if (fontUnderlineBtn) {
    fontUnderlineBtn.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        activeObj.set('underline', !activeObj.underline);
        canvas.renderAll();
      }
    });
  }

  deleteBtn.addEventListener('click', deleteSelected);

  // --- Pro Features Event Listeners ---
  if (alignCenterH) {
    alignCenterH.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) { activeObj.centerH(); activeObj.setCoords(); canvas.renderAll(); }
    });
  }
  if (alignCenterV) {
    alignCenterV.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) { activeObj.centerV(); activeObj.setCoords(); canvas.renderAll(); }
    });
  }
  if (layerUpBtn) {
    layerUpBtn.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) { canvas.bringForward(activeObj); }
    });
  }
  if (layerDownBtn) {
    layerDownBtn.addEventListener('click', () => {
      const activeObj = canvas.getActiveObject();
      // Don't send below the bgRect
      if (activeObj && canvas.getObjects().indexOf(activeObj) > 1) { 
        canvas.sendBackwards(activeObj); 
      }
    });
  }

  if (letterSpacingSlider) {
    letterSpacingSlider.addEventListener('input', (e) => {
      const activeObj = canvas.getActiveObject();
      const val = parseInt(e.target.value);
      if (spacingVal) spacingVal.textContent = val;
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        activeObj.set('charSpacing', val);
        canvas.renderAll();
      }
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const activeObj = canvas.getActiveObject();
      const val = parseInt(e.target.value);
      if (opacityVal) opacityVal.textContent = val + '%';
      if (activeObj) {
        activeObj.set('opacity', val / 100);
        canvas.renderAll();
      }
    });
  }

  function updateStroke() {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      activeObj.set('stroke', strokeColor.value);
      activeObj.set('strokeWidth', parseInt(strokeWidth.value));
      canvas.renderAll();
    }
  }
  if (strokeColor) strokeColor.addEventListener('input', updateStroke);
  if (strokeWidth) strokeWidth.addEventListener('input', updateStroke);

  // A black shadow is invisible on a dark canvas, so default to a colour that
  // actually shows for the current background — light glow on dark themes, a
  // dark drop-shadow on light ones. The user can still pick any colour.
  function defaultShadowColor() {
    const darkThemes = ['dark', 'cyber', 'midnight', 'grid', 'transparent'];
    return darkThemes.indexOf(currentTheme) !== -1 ? '#ffffff' : '#000000';
  }

  function updateShadow() {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      const blur = parseInt(shadowBlur.value);
      const offset = parseInt(shadowOffset.value);
      if (blur === 0 && offset === 0) {
        activeObj.set('shadow', null);
      } else {
        activeObj.set('shadow', new fabric.Shadow({
          color: shadowColor.value,
          blur: blur,
          offsetX: offset,
          offsetY: offset
        }));
      }
      canvas.renderAll();
    }
  }
  if (shadowBlur) shadowBlur.addEventListener('input', updateShadow);
  if (shadowOffset) shadowOffset.addEventListener('input', updateShadow);
  if (shadowColor) shadowColor.addEventListener('input', updateShadow);

  // One-tap curated recolour of every text + icon
  const paletteSelector = document.getElementById('palette-selector');
  if (paletteSelector) {
      paletteSelector.addEventListener('change', (e) => {
          const theme = e.target.value;
          if (theme === 'none') return;
          let colors = [];
          if (theme === 'luxury') colors = ['#D4AF37', '#ffffff', '#aaaaaa'];
          if (theme === 'tech') colors = ['#06b6d4', '#e0f2fe', '#38bdf8'];
          if (theme === 'eco') colors = ['#10b981', '#a7f3d0', '#047857'];
          if (theme === 'sunset') colors = ['#f43f5e', '#fb923c', '#fde047'];
          let colorIndex = 0;
          canvas.getObjects().forEach(obj => {
              if (obj === bgRect) return;
              if (obj.type === 'i-text' || obj.type === 'text') {
                  obj.set('fill', colors[colorIndex % colors.length]); colorIndex++;
              } else if (obj.type === 'group' || obj.type === 'path') {
                  if (obj.set) obj.set('fill', colors[colorIndex % colors.length]);
                  if (obj._objects) {
                      obj._objects.forEach(child => { if (child.set && child.fill) child.set('fill', colors[colorIndex % colors.length]); });
                  }
                  colorIndex++;
              }
          });
          canvas.renderAll();
          if (typeof saveHistory === 'function') saveHistory();
      });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const activeObj = canvas.getActiveObject();
      if (activeObj && activeObj.isEditing) return;
      deleteSelected();
    }
  });

  addImageBtn.addEventListener('click', () => imageUploadInput.click());

  imageUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (f) => {
          fabric.Image.fromURL(f.target.result, (img) => {
              if (img.width > 800) img.scaleToWidth(800);
              img.set({
                  left: canvas.width / 2, top: canvas.height / 2, originX: 'center', originY: 'center',
                  shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null
              });
              canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
          });
      };
      reader.readAsDataURL(file);
      imageUploadInput.value = '';
  });

  // Load the on-device background-removal model only when it's first needed.
  let _imglyBgP = null;
  function ensureImglyBg() {
    if (typeof imglyRemoveBackground !== 'undefined') return Promise.resolve();
    if (_imglyBgP) return _imglyBgP;
    _imglyBgP = new Promise((resolve, reject) => {
      const sc = document.createElement('script');
      sc.src = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.3/dist/imgly-background-removal.browser.min.js';
      sc.onload = () => resolve();
      sc.onerror = () => { _imglyBgP = null; reject(new Error('imgly load failed')); };
      document.head.appendChild(sc);
    });
    return _imglyBgP;
  }

  if (removeBgBtn) {
      removeBgBtn.addEventListener('click', async () => {
          const activeObj = canvas.getActiveObject();
          if (activeObj && activeObj.type === 'image') {
              removeBgBtn.disabled = true;
              if (typeof imglyRemoveBackground === 'undefined') {
                  removeBgBtn.textContent = '⏳ Loading AI…';
                  try { await ensureImglyBg(); }
                  catch (e) { alert('Could not load the background remover. Check your connection.'); removeBgBtn.textContent = '✨ Remove Background (AI)'; removeBgBtn.disabled = false; return; }
              }
              removeBgBtn.textContent = '⏳ Processing (AI)...';
              try {
                  const blob = await fetch(activeObj.getSrc()).then(r => r.blob());
                  const imageBlob = await imglyRemoveBackground(blob);
                  const url = URL.createObjectURL(imageBlob);
                  fabric.Image.fromURL(url, (img) => {
                      img.set({
                          left: activeObj.left, top: activeObj.top, scaleX: activeObj.scaleX, scaleY: activeObj.scaleY,
                          angle: activeObj.angle, originX: activeObj.originX, originY: activeObj.originY, shadow: activeObj.shadow
                      });
                      canvas.remove(activeObj); canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
                  });
              } catch (err) {
                  console.error(err); alert('Failed to remove background.');
              }
              removeBgBtn.textContent = '✨ Remove Background (AI)'; removeBgBtn.disabled = false;
          }
      });
  }

  if (splitWordsBtn) {
      splitWordsBtn.addEventListener('click', () => {
          const activeObj = canvas.getActiveObject();
          if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
              const text = activeObj.text;
              const words = text.split(' ').filter(w => w.trim() !== '');
              if (words.length <= 1) return;
              const startY = canvas.height / 2 - ((words.length * activeObj.fontSize) / 2);
              canvas.remove(activeObj);
              words.forEach((word, index) => {
                  const textObj = new fabric.IText(word, {
                      left: canvas.width / 2, top: startY + (index * (activeObj.fontSize + 20)),
                      fontFamily: activeObj.fontFamily, fill: activeObj.fill, fontSize: activeObj.fontSize,
                      fontWeight: activeObj.fontWeight, originX: 'center', originY: 'center', shadow: activeObj.shadow
                  });
                  canvas.add(textObj);
              });
              canvas.renderAll();
          }
      });
  }

  if (textCurveSlider) {
      textCurveSlider.addEventListener('input', (e) => {
          const activeObj = canvas.getActiveObject();
          const val = parseInt(e.target.value);
          if (curveVal) curveVal.textContent = val;
          if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
              if (val === 0) {
                  activeObj.set('path', null);
              } else {
                  const w = activeObj.width; const curveFactor = val; const controlY = -curveFactor * 2;
                  const pathString = `M 0 0 Q ${w/2} ${controlY} ${w} 0`;
                  const path = new fabric.Path(pathString);
                  activeObj.set({ path: path });
              }
              canvas.renderAll();
              saveHistory();
          }
      });
  }

  const gradientTextBtn = document.getElementById('gradient-text-btn');
  if (gradientTextBtn) {
      gradientTextBtn.addEventListener('click', () => {
          const activeObj = canvas.getActiveObject();
          if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
              const gradient = new fabric.Gradient({
                  type: 'linear',
                  gradientUnits: 'pixels',
                  coords: { x1: 0, y1: 0, x2: activeObj.width, y2: 0 },
                  colorStops: [
                      { offset: 0, color: '#f97316' },
                      { offset: 1, color: '#db2777' }
                  ]
              });
              activeObj.set('fill', gradient);
              canvas.renderAll();
              saveHistory();
          }
      });
  }

  const iconSearchInput = document.getElementById('icon-search-input');
  const iconSearchBtn = document.getElementById('icon-search-btn');
  const iconSearchResults = document.getElementById('icon-search-results');

  if (iconSearchBtn && iconSearchInput && iconSearchResults) {
      iconSearchBtn.addEventListener('click', async () => {
          const query = iconSearchInput.value.trim();
          if (!query) return;
          
          iconSearchResults.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #fff;">Searching...</div>';
          
          try {
              const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=24`);
              const data = await res.json();
              
              if (!data.icons || data.icons.length === 0) {
                  iconSearchResults.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #ef4444;">No icons found.</div>';
                  return;
              }
              
              iconSearchResults.innerHTML = '';
              
              data.icons.forEach(iconName => {
                  const btn = document.createElement('button');
                  btn.style.cssText = 'background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;';
                  
                  // Construct preview image URL
                  const [prefix, name] = iconName.split(':');
                  const img = document.createElement('img');
                  img.src = `https://api.iconify.design/${prefix}/${name}.svg?color=white`;
                  img.style.width = '100%';
                  img.style.height = '100%';
                  btn.appendChild(img);
                  
                  btn.addEventListener('click', async () => {
                      try {
                          const svgRes = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`);
                          const svgText = await svgRes.text();
                          
                          fabric.loadSVGFromString(svgText, (objects, options) => {
                              const obj = fabric.util.groupSVGElements(objects, options);
                              const s = 340 / Math.max(obj.width || 340, obj.height || 340);
                              obj.set({
                                  left: canvas.width / 2,
                                  top: canvas.height / 2,
                                  originX: 'center',
                                  originY: 'center',
                                  fill: '#ffffff',
                                  scaleX: s,
                                  scaleY: s
                              });
                              canvas.add(obj);
                              canvas.setActiveObject(obj);
                              canvas.renderAll();
                              iconPanel.style.display = 'none';
                          });
                      } catch (err) {
                          console.error("Failed to load SVG", err);
                      }
                  });
                  iconSearchResults.appendChild(btn);
              });
              
          } catch (err) {
              console.error(err);
              iconSearchResults.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #ef4444;">API Error</div>';
          }
      });
      
      // Trigger search on Enter key
      iconSearchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') iconSearchBtn.click();
      });
  }

if (saveProjBtn) saveProjBtn.addEventListener('click', () => {
      const json = canvas.toJSON(['id', 'selectable', 'evented', 'shadow']);
      localStorage.setItem('riyo_logo_project', JSON.stringify(json));
      alert('Project saved to browser memory! 💾');
  });

  if (loadProjBtn) loadProjBtn.addEventListener('click', () => {
      const jsonStr = localStorage.getItem('riyo_logo_project');
      if (jsonStr) {
          canvas.loadFromJSON(jsonStr, () => {
              bgRect = canvas.getObjects()[0]; 
              canvas.renderAll();
          });
      } else {
          alert('No saved project found.');
      }
  });

  // ── Smart Auto-Generate ──────────────────────────────────────────
  // 100% client-side "smart assembly": keyword-relevant icon (Iconify) +
  // curated palette + curated font pairing + a layout. No AI API, no cost,
  // nothing but the icon keyword leaves the device.
  const GEN_PALETTES = [
    { bg: '#0B1220', icon: '#34D399', text: '#FFFFFF' }, // dark emerald
    { bg: '#FFFFFF', icon: '#111827', text: '#111827' }, // clean light
    { bg: '#1E293B', icon: '#38BDF8', text: '#F1F5F9' }, // slate blue
    { bg: '#FDF2F8', icon: '#DB2777', text: '#831843' }, // rose
    { bg: '#0F172A', icon: '#FBBF24', text: '#FDE68A' }, // navy gold
    { bg: '#ECFDF5', icon: '#059669', text: '#064E3B' }, // mint
    { bg: '#111111', icon: '#FFFFFF', text: '#FFFFFF' }, // mono dark
    { bg: '#F5F3FF', icon: '#7C3AED', text: '#4C1D95' }, // violet
    { bg: '#FFF7ED', icon: '#EA580C', text: '#7C2D12' }, // sunset
    { bg: '#042F2E', icon: '#2DD4BF', text: '#CCFBF1' }  // deep teal
  ];
  const GEN_FONTS = [
    { h: 'Clash Display', s: 'Inter' },
    { h: 'Space Grotesk', s: 'DM Sans' },
    { h: 'Syne', s: 'Inter' },
    { h: 'Playfair Display', s: 'DM Sans' },
    { h: 'Cinzel', s: 'Inter' },
    { h: 'Outfit', s: 'Inter' },
    { h: 'Bricolage Grotesque', s: 'DM Sans' }
  ];
  const pickRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Turn a business name into something worth searching an icon library for, so
  // "Carwash Business" finds car/wash icons instead of a random generic mark.
  // Drops common company filler words and keeps the descriptive terms.
  const BRAND_STOPWORDS = new Set(['business', 'businesses', 'company', 'co', 'corp', 'corporation', 'inc', 'incorporated', 'llc', 'ltd', 'limited', 'pty', 'plc', 'group', 'holdings', 'enterprise', 'enterprises', 'industries', 'industry', 'services', 'service', 'solutions', 'solution', 'systems', 'system', 'studio', 'studios', 'works', 'agency', 'global', 'international', 'national', 'the', 'and', 'of', 'for', 'your', 'our', 'official', 'app', 'online']);
  function brandKeyword(name) {
    const words = (name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !BRAND_STOPWORDS.has(w) && !/^\d+$/.test(w));
    return words.slice(0, 2).join(' ');
  }

  // Iconify matches icon NAMES, not sentences — "panel beating" / "butcher"
  // return nothing. So map what a business DOES (matched against its name +
  // description) to concrete terms we know surface strong, on-theme icons.
  // `match` phrases are tested with substring includes; `terms` are searched.
  const ICON_CATEGORIES = [
    { match: ['security', 'alarm', 'cctv', 'surveillance', ' alert', 'alert360', 'locksmith', 'access control', 'guarding', 'patrol'], terms: ['shield', 'lock', 'cctv', 'security-camera', 'alarm', 'fingerprint', 'key', 'padlock', 'eye-security'] },
    { match: ['panel beat', 'smash repair', 'auto body', 'bodywork', 'spray paint', 'mechanic', 'automotive', 'car repair', 'car service', 'tyre', 'tire shop', 'muffler', 'detailing'], terms: ['car', 'car-repair', 'car-wrench', 'wrench', 'spray', 'garage', 'tire', 'engine', 'steering-wheel'] },
    { match: ['car wash', 'carwash'], terms: ['car-wash', 'car', 'water', 'bubbles', 'spray', 'soap'] },
    { match: ['plumb', 'pipe', 'drain', 'leak', 'hot water', 'gasfit'], terms: ['pipe', 'pipe-wrench', 'tap', 'faucet', 'plumbing', 'valve', 'water-pump'] },
    { match: ['electric', 'electrician', 'wiring', 'switchboard', 'solar', 'lighting'], terms: ['bolt', 'flash', 'power-plug', 'light-bulb', 'solar-power', 'wiring', 'battery'] },
    { match: ['butcher', 'meat', 'abattoir', 'smallgoods', 'deli ', 'smokehouse'], terms: ['meat', 'knife', 'cleaver', 'sausage', 'steak', 'cow', 'pig'] },
    { match: ['bakery', 'baker', 'patisser', 'pastry', 'cake', 'donut'], terms: ['bread', 'cake', 'croissant', 'cupcake', 'cookie', 'wheat'] },
    { match: ['cafe', 'coffee', 'espresso', 'barista', 'roaster'], terms: ['coffee', 'coffee-maker', 'cup', 'mug', 'coffee-bean'] },
    { match: ['restaurant', 'diner', 'bistro', 'catering', 'takeaway', 'chef', 'kitchen', 'grill'], terms: ['restaurant', 'fork-knife', 'chef-hat', 'plate', 'pot'] },
    { match: ['software', 'tech', ' it ', 'i.t', 'app', 'web', 'digital', 'cyber', 'cloud', 'data', 'computer', 'network', 'developer', 'saas'], terms: ['code', 'cpu', 'cloud', 'server', 'database', 'laptop', 'chip', 'rocket', 'terminal'] },
    { match: ['clean', 'janitor', 'housekeep', 'laundry', 'carpet'], terms: ['broom', 'spray-bottle', 'bucket', 'soap', 'vacuum', 'mop'] },
    { match: ['construct', 'builder', 'building', 'carpent', 'renovat', 'concret', 'roofing', 'plaster', 'tiling', 'brick', 'scaffold'], terms: ['hammer', 'wrench', 'hard-hat', 'crane', 'brick', 'ruler', 'saw', 'trowel'] },
    { match: ['fitness', 'gym', 'personal train', 'workout', 'crossfit', 'pilates', 'yoga'], terms: ['dumbbell', 'barbell', 'weight-lifter', 'heart-pulse', 'run', 'yoga'] },
    { match: ['beauty', 'salon', 'hairdress', 'barber', 'nail', 'spa', 'makeup', 'cosmetic', 'lashes'], terms: ['scissors', 'comb', 'hair-dryer', 'lipstick', 'spa', 'razor'] },
    { match: ['law ', 'lawyer', 'legal', 'attorney', 'solicitor', 'barrister', 'notary', 'conveyanc'], terms: ['scale-balance', 'gavel', 'justice', 'bank', 'book'] },
    { match: ['account', 'bookkeep', ' tax', 'finance', 'audit', 'invoic', 'mortgage broker'], terms: ['calculator', 'chart-line', 'coins', 'receipt', 'bank', 'briefcase'] },
    { match: ['medical', 'clinic', 'dental', 'dentist', 'doctor', 'health', 'physio', 'pharmac', 'chiro', 'optometr', 'veterin', ' vet'], terms: ['stethoscope', 'heart-pulse', 'medical-bag', 'tooth', 'pill', 'medical-cross'] },
    { match: ['real estate', 'realty', 'property', 'letting', 'estate agent'], terms: ['home', 'house', 'key', 'building', 'home-search'] },
    { match: ['photograph', 'photo studio', 'videograph', 'film', 'media product'], terms: ['camera', 'aperture', 'film', 'video', 'focus'] },
    { match: ['transport', 'logistic', 'freight', 'courier', 'delivery', 'removal', 'haulage', 'trucking'], terms: ['truck', 'box', 'delivery', 'package', 'forklift'] },
    { match: ['landscap', 'garden', 'lawn', 'mowing', 'arborist', 'tree service', 'nursery'], terms: ['tree', 'leaf', 'flower', 'grass', 'watering-can', 'shovel'] },
    { match: ['pet ', 'dog ', 'grooming', 'kennel', 'cattery'], terms: ['dog', 'cat', 'paw', 'bone'] },
    { match: ['travel agen', 'tour ', 'holiday', 'tourism', 'adventure tour'], terms: ['compass', 'map', 'plane', 'globe', 'suitcase', 'mountain'] },
    { match: ['school', 'tutor', 'academy', 'training', 'coaching', 'education', 'learning'], terms: ['graduation-cap', 'book', 'pencil', 'lightbulb', 'brain'] },
    { match: [' music', 'band', ' dj ', 'audio', 'sound', 'recording'], terms: ['music-note', 'headphones', 'microphone', 'guitar', 'speaker'] },
    { match: ['pest', 'exterminat', 'termite'], terms: ['bug', 'spray-bottle', 'ant', 'spider'] },
    { match: ['painter', 'painting', 'decorat'], terms: ['paint-roller', 'paint-bucket', 'brush', 'palette'] },
    { match: ['florist', 'flower'], terms: ['flower', 'flower-tulip', 'rose', 'leaf'] },
    { match: ['jewel', 'diamond ring', 'goldsmith'], terms: ['diamond', 'ring', 'gem', 'crown'] }
  ];

  // Turn the brand name + description into the icon search terms to use.
  // Description wins over the name (the name may be unrelated, e.g. "Safari"
  // panel-beating). Falls back to plain keywords, then nothing (→ procedural).
  function resolveIconTerms(brandName, description) {
    const desc = ' ' + (description || '').toLowerCase() + ' ';
    const brand = ' ' + (brandName || '').toLowerCase() + ' ';
    const descHits = [], brandHits = [];
    ICON_CATEGORIES.forEach((cat) => {
      if (cat.match.some((m) => desc.indexOf(m) !== -1)) descHits.push(cat);
      else if (cat.match.some((m) => brand.indexOf(m) !== -1)) brandHits.push(cat);
    });
    const hits = descHits.length ? descHits : brandHits;
    if (hits.length) {
      const terms = [];
      hits.slice(0, 2).forEach((c) => terms.push(...c.terms));
      return [...new Set(terms)];
    }
    // No category — search the meaningful words the user actually wrote.
    const words = []
      .concat(brandKeyword(description).split(' '))
      .concat(brandKeyword(brandName).split(' '))
      .filter(Boolean);
    return [...new Set(words)];
  }

  // Build a pool of relevant icon ids ("prefix:name") from the resolved terms.
  // Pull a few icons from EACH term and interleave them, so the six concepts
  // get a spread of on-theme icons (shield, lock, cctv, camera…) rather than
  // six near-identical results from whichever term happened to come first.
  async function fetchIconPool(terms) {
    const lists = await Promise.all(terms.slice(0, 8).map(async (term) => {
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(term)}&limit=6`);
        const data = await res.json();
        return (data && data.icons ? data.icons : []).slice(0, 4);
      } catch (e) { return []; }
    }));
    const pool = [], seen = new Set();
    for (let round = 0; round < 4; round++) {
      for (const list of lists) {
        const ic = list[round];
        if (ic && !seen.has(ic)) { seen.add(ic); pool.push(ic); }
      }
    }
    return pool;
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  function loadSvgGroup(svg) {
    return new Promise((r) => fabric.loadSVGFromString(svg, (o, op) => r(fabric.util.groupSVGElements(o, op))));
  }

  // Procedural mark generator — builds a unique, editable vector mark from
  // geometry/initials. 100% client-side, no network, no AI, no cost.
  function buildMark(palette, fp, brandName, idx) {
    const c = palette.icon;
    const tint = new fabric.Color(c).setAlpha(0.45).toRgba();
    const cx = 100, cy = 100;
    const initials = ((brandName || 'R').replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase()) || 'R';

    const recipes = [
      () => [ // concentric rings
        new fabric.Circle({ radius: 34, left: cx, top: cy, originX: 'center', originY: 'center', fill: c }),
        new fabric.Circle({ radius: 60, left: cx, top: cy, originX: 'center', originY: 'center', fill: 'transparent', stroke: c, strokeWidth: 12 }),
        new fabric.Circle({ radius: 88, left: cx, top: cy, originX: 'center', originY: 'center', fill: 'transparent', stroke: tint, strokeWidth: 10 })
      ],
      () => [ // overlapping circles
        new fabric.Circle({ radius: 52, left: cx - 24, top: cy, originX: 'center', originY: 'center', fill: c }),
        new fabric.Circle({ radius: 52, left: cx + 24, top: cy, originX: 'center', originY: 'center', fill: tint })
      ],
      () => [ // stacked triangles
        new fabric.Triangle({ width: 150, height: 130, left: cx, top: cy - 8, originX: 'center', originY: 'center', fill: c }),
        new fabric.Triangle({ width: 150, height: 130, left: cx, top: cy + 8, originX: 'center', originY: 'center', fill: tint, angle: 180 })
      ],
      () => { // hexagon outline + core
        const outer = [], inner = [];
        for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); outer.push({ x: cx + 82 * Math.cos(a), y: cy + 82 * Math.sin(a) }); inner.push({ x: cx + 34 * Math.cos(a), y: cy + 34 * Math.sin(a) }); }
        return [ new fabric.Polygon(outer, { fill: 'transparent', stroke: c, strokeWidth: 12 }), new fabric.Polygon(inner, { fill: c }) ];
      },
      () => { // vertical bars
        const o = []; [70, 120, 90, 150, 100].forEach((h, i) => o.push(new fabric.Rect({ width: 18, height: h, rx: 9, ry: 9, left: 40 + i * 30, top: cy + 75, originX: 'center', originY: 'bottom', fill: i % 2 ? tint : c }))); return o;
      },
      () => { // starburst
        const pts = []; const spikes = 6, R = 88, r = 36;
        for (let i = 0; i < spikes * 2; i++) { const rad = i % 2 ? r : R; const a = Math.PI / spikes * i - Math.PI / 2; pts.push({ x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) }); }
        return [ new fabric.Polygon(pts, { fill: c }) ];
      },
      () => [ // monogram in a circle
        new fabric.Circle({ radius: 90, left: cx, top: cy, originX: 'center', originY: 'center', fill: c }),
        new fabric.IText(initials, { left: cx, top: cy, originX: 'center', originY: 'center', fontFamily: fp.h, fontWeight: 'bold', fontSize: 84, fill: palette.bg, objectCaching: false })
      ],
      () => [ // monogram in a rounded square
        new fabric.Rect({ width: 170, height: 170, rx: 36, ry: 36, left: cx, top: cy, originX: 'center', originY: 'center', fill: tint, stroke: c, strokeWidth: 8 }),
        new fabric.IText(initials.slice(0, 1), { left: cx, top: cy, originX: 'center', originY: 'center', fontFamily: fp.h, fontWeight: 'bold', fontSize: 110, fill: c, objectCaching: false })
      ]
    ];

    const recipe = recipes[(idx == null ? Math.floor(Math.random() * recipes.length) : idx) % recipes.length];
    return new fabric.Group(recipe(), { originX: 'center', originY: 'center' });
  }

  function placeMark(mark, topY) {
    const s = 320 / Math.max(mark.width || 320, mark.height || 320);
    mark.set({ originX: 'center', originY: 'center', left: canvas.width / 2, top: topY, scaleX: s, scaleY: s });
    canvas.add(mark);
  }

  // ── Concept Grid: 6 finished concepts to pick from ───────────────
  const conceptModal = document.getElementById('concept-modal');
  const conceptGrid = document.getElementById('concept-grid');
  const conceptClose = document.getElementById('concept-close');
  const conceptRegen = document.getElementById('concept-regen');

  function scaleTo(obj, target) {
    const s = target / Math.max(obj.width || target, obj.height || target);
    obj.set({ originX: 'center', originY: 'center', scaleX: s, scaleY: s });
  }
  function lighten(hex, amt) {
    const src = new fabric.Color(hex).getSource();
    const m = (v) => Math.round(v + (255 - v) * amt);
    return `rgb(${m(src[0])},${m(src[1])},${m(src[2])})`;
  }
  function applyGradient(group, c) {
    if (!group.getObjects) return;
    const c2 = lighten(c, 0.4);
    group.getObjects().forEach((o) => {
      if (o.type === 'i-text' || !o.fill || o.fill === 'transparent') return;
      o.set('fill', new fabric.Gradient({ type: 'linear', gradientUnits: 'percentage', coords: { x1: 0, y1: 0, x2: 1, y2: 1 }, colorStops: [{ offset: 0, color: c2 }, { offset: 1, color: c }] }));
    });
  }
  function arrangeStack(cv, icon, brand, sub) {
    const cx = cv.width / 2, cy = cv.height / 2;
    const gap = cv.width > 800 ? 40 : 14;
    const pad = cv.width > 800 ? 14 : 6;
    const iconH = icon ? icon.getScaledHeight() : 0;
    const bH = brand.getScaledHeight();
    const sH = sub ? sub.getScaledHeight() : 0;
    const totalH = iconH + (icon ? gap : 0) + bH + (sub ? pad + sH : 0);
    let y = cy - totalH / 2;
    if (icon) { icon.set({ originX: 'center', originY: 'top', left: cx, top: y }); y += iconH + gap; }
    brand.set({ originX: 'center', originY: 'top', left: cx, top: y }); y += bH + pad;
    if (sub) sub.set({ originX: 'center', originY: 'top', left: cx, top: y });
  }
  function arrangeLeft(cv, icon, brand, sub) {
    const cx = cv.width / 2, cy = cv.height / 2;
    const gap = cv.width > 800 ? 36 : 12;
    const iconW = icon ? icon.getScaledWidth() : 0;
    const bW = brand.getScaledWidth();
    const sx = cx - (iconW + (icon ? gap : 0) + bW) / 2;
    const tx = sx + iconW + (icon ? gap : 0);
    if (icon) icon.set({ originX: 'left', originY: 'center', left: sx, top: cy });
    if (sub) {
      brand.set({ originX: 'left', originY: 'bottom', left: tx, top: cy - 2 });
      sub.set({ originX: 'left', originY: 'top', left: tx, top: cy + 2 });
    } else {
      brand.set({ originX: 'left', originY: 'center', left: tx, top: cy });
    }
  }
  function makeConcept(brandName, iconId) {
    return {
      brandName,
      palette: pickRand(GEN_PALETTES),
      fp: pickRand(GEN_FONTS),
      layout: pickRand(['stack', 'left']),
      gradient: Math.random() < 0.5,
      recipeIndex: Math.floor(Math.random() * 8),
      iconId: iconId || null,
      iconSvg: null
    };
  }
  async function getConceptIcon(concept) {
    if (concept.iconSvg) return await loadSvgGroup(concept.iconSvg);
    // A relevant icon was assigned from the pool — fetch it in the palette colour.
    if (concept.iconId) {
      try {
        const [prefix, name] = concept.iconId.split(':');
        const svgRes = await fetch(`https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(concept.palette.icon)}`);
        if (svgRes.ok) {
          const txt = await svgRes.text();
          if (txt && txt.indexOf('<svg') !== -1) { concept.iconSvg = txt; return await loadSvgGroup(txt); }
        }
      } catch (e) { /* fall through to a generated mark */ }
    }
    const mark = buildMark(concept.palette, concept.fp, concept.brandName, concept.recipeIndex);
    if (concept.gradient) applyGradient(mark, concept.palette.icon);
    return mark;
  }
  async function renderConceptThumb(concept) {
    const el = document.createElement('canvas');
    el.width = 480; el.height = 240;
    const tc = new fabric.StaticCanvas(el, { width: 480, height: 240, enableRetinaScaling: false, renderOnAddRemove: false });
    tc.backgroundColor = concept.palette.bg;
    const icon = await getConceptIcon(concept);
    scaleTo(icon, 92);
    const brand = new fabric.IText(concept.brandName, { fontFamily: concept.fp.h, fontWeight: 'bold', fontSize: 30, fill: concept.palette.text, objectCaching: false });
    const sub = new fabric.IText('YOUR TAGLINE', { fontFamily: concept.fp.s, fontSize: 10, fill: concept.palette.text, opacity: 0.7, charSpacing: 300, objectCaching: false });
    tc.add(icon, brand, sub);
    await document.fonts.ready;
    if (brand.initDimensions) brand.initDimensions();
    if (sub.initDimensions) sub.initDimensions();
    if (concept.layout === 'left') arrangeLeft(tc, icon, brand, sub); else arrangeStack(tc, icon, brand, sub);
    tc.renderAll();
    const url = tc.toDataURL({ format: 'png', multiplier: 1 });
    tc.dispose();
    return url;
  }
  async function applyConcept(concept) {
    canvas.getObjects().forEach((o) => { if (o !== bgRect) canvas.remove(o); });
    bgRect.set('fill', concept.palette.bg);
    const icon = await getConceptIcon(concept);
    scaleTo(icon, 320);
    canvas.add(icon);
    const brand = new fabric.IText(concept.brandName, { fontFamily: concept.fp.h, fontWeight: 'bold', fontSize: 64, fill: concept.palette.text, objectCaching: false });
    const sub = new fabric.IText('YOUR TAGLINE HERE', { fontFamily: concept.fp.s, fontWeight: 'normal', fontSize: 20, fill: concept.palette.text, opacity: 0.75, charSpacing: 400, objectCaching: false });
    canvas.add(brand); canvas.add(sub);
    const place = () => {
      if (concept.layout === 'left') arrangeLeft(canvas, icon, brand, sub); else arrangeStack(canvas, icon, brand, sub);
      canvas.getObjects().forEach((o) => o.setCoords && o.setCoords());
      canvas.renderAll();
    };
    place();
    document.fonts.ready.then(() => { if (brand.initDimensions) brand.initDimensions(); if (sub.initDimensions) sub.initDimensions(); place(); });
    saveHistory();
    if (conceptModal) conceptModal.style.display = 'none';
  }
  async function openConceptGrid() {
    if (!conceptModal || !conceptGrid) return;
    const brandRaw = magicBrandInput.value.trim();
    const descRaw = magicKeywordInput ? magicKeywordInput.value.trim() : '';
    const brandName = (brandRaw || 'BRAND').toUpperCase();

    conceptGrid.innerHTML = '';
    conceptModal.style.display = 'flex';

    // Show the 6 cards immediately so it feels instant, then fill them in.
    const cards = Array.from({ length: 6 }, () => {
      const card = document.createElement('div');
      card.style.cssText = 'cursor:pointer;border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;background:#05080f;aspect-ratio:2/1;display:flex;align-items:center;justify-content:center;color:#3a4656;font-size:0.78rem;transition:border-color .15s,transform .15s;';
      card.textContent = 'rendering…';
      card.addEventListener('mouseenter', () => { card.style.borderColor = '#10B981'; card.style.transform = 'translateY(-2px)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor = 'rgba(255,255,255,0.1)'; card.style.transform = 'none'; });
      conceptGrid.appendChild(card);
      return card;
    });

    // Resolve a relevant icon pool from what the business is, then give each
    // concept a DIFFERENT icon so the six results are on-theme yet varied.
    let pool = [];
    try { pool = shuffle(await fetchIconPool(resolveIconTerms(brandRaw, descRaw))); } catch (e) { pool = []; }

    cards.forEach((card, i) => {
      const iconId = pool.length ? pool[i % pool.length] : null;
      const concept = makeConcept(brandName, iconId);
      card.onclick = () => applyConcept(concept);
      renderConceptThumb(concept).then((url) => {
        card.textContent = '';
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        card.appendChild(img);
      }).catch((err) => { console.error('Concept thumb failed:', err); card.style.fontSize = '0.6rem'; card.style.padding = '6px'; card.style.textAlign = 'center'; card.textContent = '⚠ ' + ((err && err.message) || 'render error'); });
    });
  }
  if (magicGenerateBtn) magicGenerateBtn.addEventListener('click', () => openConceptGrid());
  if (conceptClose) conceptClose.addEventListener('click', () => { conceptModal.style.display = 'none'; });
  if (conceptRegen) conceptRegen.addEventListener('click', () => openConceptGrid());
  if (conceptModal) conceptModal.addEventListener('click', (e) => { if (e.target === conceptModal) conceptModal.style.display = 'none'; });

  const magicMarkBtn = document.getElementById('magic-mark-btn');
  if (magicMarkBtn) magicMarkBtn.addEventListener('click', () => {
      const palette = pickRand(GEN_PALETTES);
      const fp = pickRand(GEN_FONTS);
      const mark = buildMark(palette, fp, (magicBrandInput.value.trim() || 'R').toUpperCase());
      if (Math.random() < 0.5) applyGradient(mark, palette.icon);
      placeMark(mark, canvas.height / 2);
      mark.set({ top: canvas.height / 2 });
      canvas.setActiveObject(mark);
      document.fonts.ready.then(() => { mark.setCoords(); canvas.renderAll(); });
      canvas.renderAll();
      saveHistory();
  });

let showGrid = false;
  if (toggleGridBtn) {
      toggleGridBtn.addEventListener('click', () => {
          showGrid = !showGrid;
          toggleGridBtn.style.background = showGrid ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)';
          toggleGridBtn.style.borderColor = showGrid ? '#10B981' : 'var(--border)';
          canvas.renderAll();
      });
  }

  canvas.on('after:render', () => {
      if (showGrid) {
          const ctx = canvas.getContext();
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1;
          const gridSize = 40;
          ctx.beginPath();
          for (let x = 0; x <= canvas.width; x += gridSize) {
              ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
          }
          for (let y = 0; y <= canvas.height; y += gridSize) {
              ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
          }
          // Draw center lines slightly thicker
          ctx.stroke();
          
          ctx.strokeStyle = 'rgba(16,185,129,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height);
          ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2);
          ctx.stroke();
          ctx.restore();
      }
  });

if (previewMockupBtn && mockupModal && closeMockupBtn) {
      previewMockupBtn.addEventListener('click', () => {
          canvas.discardActiveObject();
          
          // We must hide the bgRect so the mockup uses a transparent logo
          const oldFill = bgRect.fill;
          bgRect.set('fill', 'transparent');
          canvas.renderAll();
          
          const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
          mockupImage.src = dataURL;
          mockupModal.style.display = 'flex';
          
          // Restore bgRect
          bgRect.set('fill', oldFill);
          canvas.renderAll();
      });
      
      closeMockupBtn.addEventListener('click', () => {
          mockupModal.style.display = 'none';
      });
  }

  addTextBtn.addEventListener('click', addText);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      updateBackground();

      canvas.getObjects().forEach(obj => {
        if (currentTheme === 'cyber') {
          obj.set('shadow', new fabric.Shadow({ color: '#10B981', blur: 30 }));
        } else {
          obj.set('shadow', null);
        }
      });
      canvas.renderAll();
    });
  });

  const svgExportBtn = document.getElementById('logo-export-svg-btn');
  const pdfExportBtn = document.getElementById('logo-export-pdf-btn');

  function logoIsIOS() {
    return /iP(hone|ad|od)/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'application/octet-stream';
    const bin = atob(parts[1]); const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  // iOS Safari ignores the <a download> attribute for blob URLs (the file saves
  // with no name/extension and is unusable), so route saves through the native
  // share sheet there — Save to Files/Photos with the real name. Direct download
  // everywhere else. Returns false only if an iOS share was blocked (not aborted),
  // so a caller whose build was slow can offer a second tap.
  async function saveFile(blob, name, type) {
    if (logoIsIOS() && navigator.canShare) {
      const file = new File([blob], name, { type: type || blob.type || 'application/octet-stream' });
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return true; }
        catch (e) { return !!(e && e.name === 'AbortError'); }
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    return true;
  }

  exportBtn.addEventListener('click', async () => {
    canvas.discardActiveObject(); canvas.renderAll();
    const blob = dataURLToBlob(canvas.toDataURL({ format: 'png', quality: 1, multiplier: 3 }));
    await saveFile(blob, 'riyo-logo-export.png', 'image/png');
  });

  if (svgExportBtn) {
    svgExportBtn.addEventListener('click', async () => {
      canvas.discardActiveObject(); canvas.renderAll();
      const blob = new Blob([canvas.toSVG()], { type: 'image/svg+xml;charset=utf-8' });
      await saveFile(blob, 'riyo-logo-vector.svg', 'image/svg+xml');
    });
  }

  if (pdfExportBtn) {
    pdfExportBtn.addEventListener('click', async () => {
      if (typeof jspdf === 'undefined') {
        alert('PDF library is not loaded. Please use SVG or PNG export.');
        return;
      }
      canvas.discardActiveObject(); canvas.renderAll();
      const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 1, multiplier: 3 });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(dataURL, 'JPEG', 0, 0, canvas.width, canvas.height);
      await saveFile(pdf.output('blob'), 'riyo-logo-print.pdf', 'application/pdf');
    });
  }

  // ── Brand Kit & Export Pack ──────────────────────────────────────
  const brandkitBtn = document.getElementById('brandkit-btn');
  const brandkitModal = document.getElementById('brandkit-modal');
  const brandkitGrid = document.getElementById('brandkit-grid');
  const brandkitClose = document.getElementById('brandkit-close');
  const brandkitZip = document.getElementById('brandkit-zip');
  const brandkitSize = document.getElementById('brandkit-size');
  const brandkitTransparent = document.getElementById('brandkit-transparent');

  const VARIATIONS = [
    { key: 'horizontal', label: 'Horizontal' },
    { key: 'stacked', label: 'Stacked' },
    { key: 'icon', label: 'Icon only' },
    { key: 'monogram', label: 'Monogram' },
    { key: 'black', label: 'Black' },
    { key: 'white', label: 'White / reversed' }
  ];
  const isSquare = (k) => k === 'icon' || k === 'monogram';

  function cloneObjs(objs) {
    return Promise.all(objs.map((o) => new Promise((res) => o.clone((c) => res(c)))));
  }
  function recolorObj(obj, color) {
    const apply = (o) => {
      if (o.fill && o.fill !== 'transparent' && typeof o.fill === 'string') o.set('fill', color);
      if (o.stroke && o.stroke !== 'transparent') o.set('stroke', color);
    };
    if (obj.getObjects) obj.getObjects().forEach(apply);
    apply(obj);
  }
  function firstFill(obj) {
    if (obj && obj.getObjects) { const f = obj.getObjects().find((o) => o.fill && o.fill !== 'transparent' && typeof o.fill === 'string'); return f ? f.fill : null; }
    return obj && typeof obj.fill === 'string' ? obj.fill : null;
  }
  function getSource() {
    const objs = canvas.getObjects().filter((o) => o !== bgRect);
    return {
      icon: objs.find((o) => o.type === 'group' || o.type === 'path' || o.type === 'image') || null,
      texts: objs.filter((o) => o.type === 'i-text' || o.type === 'text'),
      bg: bgRect.fill
    };
  }
  async function buildVariation(key, transparent) {
    const square = isSquare(key);
    const W = square ? 1024 : 1600, H = square ? 1024 : 800;
    const el = document.createElement('canvas'); el.width = W; el.height = H;
    const tc = new fabric.StaticCanvas(el, { width: W, height: H, enableRetinaScaling: false, renderOnAddRemove: false });
    const src = getSource();

    if (key === 'white') tc.backgroundColor = '#0B1220';
    else if (key === 'black') tc.backgroundColor = '#FFFFFF';
    else if (!transparent) tc.backgroundColor = src.bg;

    let icon = null, texts = [];
    if (key === 'monogram') {
      const initials = (src.texts[0] && src.texts[0].text) || 'R';
      const col = firstFill(src.icon) || '#10B981';
      icon = buildMark({ icon: col, bg: tc.backgroundColor || '#0B1220', text: tc.backgroundColor || '#0B1220' }, { h: (src.texts[0] && src.texts[0].fontFamily) || 'Clash Display' }, initials, 6);
    } else {
      if (src.icon) { const c = await cloneObjs([src.icon]); icon = c[0]; }
      if (key !== 'icon') texts = await cloneObjs(src.texts);
    }

    if (key === 'black') { if (icon) recolorObj(icon, '#000000'); texts.forEach((t) => recolorObj(t, '#000000')); }
    if (key === 'white') { if (icon) recolorObj(icon, '#FFFFFF'); texts.forEach((t) => recolorObj(t, '#FFFFFF')); }

    if (icon) tc.add(icon);
    texts.forEach((t) => tc.add(t));
    await document.fonts.ready;
    texts.forEach((t) => { if (t.initDimensions) t.initDimensions(); });

    if (icon) scaleTo(icon, square ? Math.min(W, H) * 0.6 : H * 0.34);

    if (square) {
      if (icon) icon.set({ originX: 'center', originY: 'center', left: W / 2, top: H / 2 });
    } else if (key === 'horizontal') {
      arrangeLeft(tc, icon, texts[0], texts[1]);
    } else {
      arrangeStack(tc, icon, texts[0], texts[1]);
    }
    tc.renderAll();
    return tc;
  }
  async function downloadVariation(key, fmt) {
    const transparent = brandkitTransparent && brandkitTransparent.checked;
    const tc = await buildVariation(key, transparent);
    let blob, name;
    if (fmt === 'svg') {
      blob = new Blob([tc.toSVG()], { type: 'image/svg+xml;charset=utf-8' });
      name = `riyo-logo-${key}.svg`;
    } else {
      let mult = 2, suffix = '';
      if (isSquare(key)) { const px = parseInt((brandkitSize && brandkitSize.value) || '512', 10) || 512; mult = px / 1024; suffix = `-${px}`; }
      blob = dataURLToBlob(tc.toDataURL({ format: 'png', multiplier: mult }));
      name = `riyo-logo-${key}${suffix}.png`;
    }
    tc.dispose();
    await saveFile(blob, name, fmt === 'svg' ? 'image/svg+xml' : 'image/png');
  }
  function miniBtnStyle() { return 'padding:5px 10px;background:rgba(16,185,129,0.12);color:#10B981;border:1px solid rgba(16,185,129,0.4);border-radius:6px;font-size:0.72rem;font-weight:600;cursor:pointer;'; }
  function openBrandKit() {
    if (!brandkitModal || !brandkitGrid) return;
    const src = getSource();
    if (!src.icon && src.texts.length === 0) { alert('Add a logo to the canvas first — try Auto-Build.'); return; }
    brandkitModal.style.display = 'flex';
    brandkitGrid.innerHTML = '';
    const transparent = brandkitTransparent && brandkitTransparent.checked;
    VARIATIONS.forEach((v) => {
      const card = document.createElement('div');
      card.style.cssText = 'border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;background:#05080f;display:flex;flex-direction:column;';
      const thumb = document.createElement('div');
      thumb.style.cssText = `aspect-ratio:${isSquare(v.key) ? '1/1' : '2/1'};display:flex;align-items:center;justify-content:center;background:#05080f;color:#3a4656;font-size:0.72rem;`;
      thumb.textContent = 'rendering…';
      const bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:6px;padding:8px;align-items:center;justify-content:space-between;';
      const lbl = document.createElement('span'); lbl.textContent = v.label; lbl.style.cssText = 'font-size:0.78rem;color:#cdd6e2;';
      const btns = document.createElement('div'); btns.style.cssText = 'display:flex;gap:6px;';
      const pngBtn = document.createElement('button'); pngBtn.textContent = 'PNG'; pngBtn.style.cssText = miniBtnStyle();
      const svgBtn = document.createElement('button'); svgBtn.textContent = 'SVG'; svgBtn.style.cssText = miniBtnStyle();
      pngBtn.addEventListener('click', () => downloadVariation(v.key, 'png'));
      svgBtn.addEventListener('click', () => downloadVariation(v.key, 'svg'));
      btns.appendChild(pngBtn); btns.appendChild(svgBtn);
      bar.appendChild(lbl); bar.appendChild(btns);
      card.appendChild(thumb); card.appendChild(bar);
      brandkitGrid.appendChild(card);
      buildVariation(v.key, transparent).then((tc) => {
        const url = tc.toDataURL({ format: 'png', multiplier: isSquare(v.key) ? 360 / 1024 : 480 / 1600 });
        tc.dispose();
        thumb.textContent = '';
        const img = document.createElement('img'); img.src = url;
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
        thumb.appendChild(img);
      }).catch((err) => { console.error('Variation failed:', err); thumb.style.fontSize = '0.6rem'; thumb.style.padding = '6px'; thumb.style.textAlign = 'center'; thumb.textContent = '⚠ ' + ((err && err.message) || 'error'); });
    });
  }
  let pendingKitZip = null;
  const ZIP_LABEL = '⬇ Download All (ZIP) — logo set + favicon + app icons';
  function resetKitZip() { pendingKitZip = null; if (brandkitZip) brandkitZip.textContent = ZIP_LABEL; }
  async function downloadBrandKitZip() {
    // iOS step 2: a built zip is waiting — share it on THIS fresh tap, while the
    // gesture's activation is live (a share right after the slow build is blocked).
    if (pendingKitZip) {
      const blob = pendingKitZip; pendingKitZip = null;
      if (brandkitZip) brandkitZip.textContent = ZIP_LABEL;
      await saveFile(blob, 'riyo-brand-kit.zip', 'application/zip');
      return;
    }
    if (typeof JSZip === 'undefined') { alert('ZIP library is not loaded — download files individually instead.'); return; }
    const transparent = brandkitTransparent && brandkitTransparent.checked;
    if (brandkitZip) brandkitZip.textContent = 'Packaging…';
    try {
      const zip = new JSZip();
      for (const v of VARIATIONS) {
        const tc = await buildVariation(v.key, transparent);
        const mult = isSquare(v.key) ? 1 : 2;
        zip.file(`png/${v.key}.png`, tc.toDataURL({ format: 'png', multiplier: mult }).split(',')[1], { base64: true });
        zip.file(`svg/${v.key}.svg`, tc.toSVG());
        tc.dispose();
      }
      for (const px of [16, 32, 48, 180, 512, 1024]) {
        const tc = await buildVariation('icon', true);
        zip.file(`app-icons/icon-${px}.png`, tc.toDataURL({ format: 'png', multiplier: px / 1024 }).split(',')[1], { base64: true });
        tc.dispose();
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      // iOS: the build consumed the tap's activation, so a direct share would be
      // blocked — stash the zip and prompt one more tap to hand it to the share sheet.
      if (logoIsIOS() && navigator.canShare) {
        pendingKitZip = blob;
        if (brandkitZip) brandkitZip.textContent = '💾 Tap again to save the ZIP';
        return;
      }
      await saveFile(blob, 'riyo-brand-kit.zip', 'application/zip');
    } catch (err) {
      console.error('ZIP failed:', err);
      alert('Could not build the ZIP. Try downloading files individually.');
    }
    if (brandkitZip) brandkitZip.textContent = ZIP_LABEL;
  }
  if (brandkitBtn) brandkitBtn.addEventListener('click', openBrandKit);
  if (brandkitClose) brandkitClose.addEventListener('click', () => { brandkitModal.style.display = 'none'; resetKitZip(); });
  if (brandkitModal) brandkitModal.addEventListener('click', (e) => { if (e.target === brandkitModal) { brandkitModal.style.display = 'none'; resetKitZip(); } });
  if (brandkitZip) brandkitZip.addEventListener('click', downloadBrandKitZip);

  document.fonts.ready.then(() => { addText(); });
});
