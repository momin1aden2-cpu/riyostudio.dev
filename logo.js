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

  let currentTheme = 'dark';

  // Create a persistent background rectangle
  const bgRect = new fabric.Rect({
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
        type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
        colorStops: [ { offset: 0, color: '#1e1b4b' }, { offset: 1, color: '#312e81' } ]
      }));
    } else if (currentTheme === 'sunset') {
      bgRect.set('fill', new fabric.Gradient({
        type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
        colorStops: [ { offset: 0, color: '#f97316' }, { offset: 1, color: '#db2777' } ]
      }));
    } else if (currentTheme === 'holographic') {
      bgRect.set('fill', new fabric.Gradient({
        type: 'linear', gradientUnits: 'pixels', coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
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

  fabric.Object.prototype.set({
    transparentCorners: false, cornerColor: '#10B981', cornerStrokeColor: '#000000',
    borderColor: '#10B981', cornerSize: 16, padding: 10, cornerStyle: 'circle'
  });

  function addText() {
    const text = new fabric.IText('Your Brand', {
      left: canvas.width / 2, top: canvas.height / 2, fontFamily: 'Clash Display',
      fill: (currentTheme === 'light' || currentTheme === 'holographic') ? '#111111' : '#ffffff',
      fontSize: 120, fontWeight: '700', originX: 'center', originY: 'center',
      shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }

  addShapeBtn.addEventListener('click', () => {
    if (iconPanel) {
      iconPanel.style.display = iconPanel.style.display === 'none' ? 'grid' : 'none';
    }
  });

  libIconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const svgPath = btn.getAttribute('data-svg');
      if (!svgPath) return;
      const path = new fabric.Path(svgPath, {
        left: canvas.width / 2, top: canvas.height / 2,
        fill: (currentTheme === 'light' || currentTheme === 'holographic') ? '#111111' : '#ffffff',
        originX: 'center', originY: 'center', scaleX: 6, scaleY: 6,
        shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null
      });
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

  deleteBtn.addEventListener('click', deleteSelected);

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

  if (removeBgBtn) {
      removeBgBtn.addEventListener('click', async () => {
          const activeObj = canvas.getActiveObject();
          if (activeObj && activeObj.type === 'image') {
              if (typeof imglyRemoveBackground === 'undefined') {
                  alert('Background removal model is still loading. Please try again in a moment.'); return;
              }
              removeBgBtn.textContent = '⏳ Processing (AI)...'; removeBgBtn.disabled = true;
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
          }
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

  exportBtn.addEventListener('click', () => {
    canvas.discardActiveObject(); canvas.renderAll();
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a'); link.download = 'riyo-logo-export.png';
    link.href = dataURL; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  });

  document.fonts.ready.then(() => { addText(); });
});
