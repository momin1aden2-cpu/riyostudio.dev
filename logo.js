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
  
  const addBrandTextBtn = document.getElementById('add-brand-text-btn');
  const toggleGridBtn = document.getElementById('toggle-grid-btn');
  const previewMockupBtn = document.getElementById('preview-mockup-btn');
  
  const saveProjBtn = document.getElementById('save-proj-btn');
  const loadProjBtn = document.getElementById('load-proj-btn');
  const magicBrandInput = document.getElementById('magic-brand-input');
  const magicGenerateBtn = document.getElementById('magic-generate-btn');
  const motionSelector = document.getElementById('motion-selector');

  const mockupModal = document.getElementById('mockup-modal');
  const closeMockupBtn = document.getElementById('close-mockup-btn');
  const mockupImage = document.getElementById('mockup-image');
  const paletteSelector = document.getElementById('palette-selector');

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

  fabric.Object.prototype.set({
    transparentCorners: false, cornerColor: '#10B981', cornerStrokeColor: '#000000',
    borderColor: '#10B981', cornerSize: 16, padding: 10, cornerStyle: 'circle'
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
        shadowColor.value = activeObj.shadow.color || '#000000';
      } else {
        shadowBlur.value = 0;
        shadowOffset.value = 0;
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
                              obj.set({
                                  left: canvas.width / 2,
                                  top: canvas.height / 2,
                                  originX: 'center',
                                  originY: 'center',
                                  fill: '#ffffff',
                                  scaleX: 100 / (obj.width || 100),
                                  scaleY: 100 / (obj.height || 100)
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

  
  // --- Logo Science Features ---
  if (addBrandTextBtn) {
      addBrandTextBtn.addEventListener('click', () => {
          const brandText = new fabric.IText('RIYO', {
              left: canvas.width / 2, top: canvas.height / 2 - 20,
              fontFamily: 'Inter', fontWeight: 'bold', fontSize: 64, fill: '#ffffff',
              originX: 'center', originY: 'center', charSpacing: 0
          });
          const subText = new fabric.IText('STUDIO', {
              left: canvas.width / 2, top: canvas.height / 2 + 30,
              fontFamily: 'Space Grotesk', fontWeight: 'normal', fontSize: 24, fill: '#ffffff',
              originX: 'center', originY: 'center', charSpacing: 400
          });
          canvas.add(brandText, subText);
          canvas.renderAll();
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

  if (magicGenerateBtn) magicGenerateBtn.addEventListener('click', async () => {
      const brandName = magicBrandInput.value.trim() || 'BRAND';
      const objs = canvas.getObjects();
      objs.forEach(obj => { if (obj !== bgRect) canvas.remove(obj); });
      magicGenerateBtn.textContent = 'Wait...';
      
      try {
          const res = await fetch(`https://api.iconify.design/search?query=geometric&limit=15`);
          const data = await res.json();
          if (data && data.icons && data.icons.length > 0) {
              const iconName = data.icons[Math.floor(Math.random() * data.icons.length)];
              const [prefix, name] = iconName.split(':');
              const svgRes = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`);
              const svgText = await svgRes.text();
              
              fabric.loadSVGFromString(svgText, (objects, options) => {
                  const iconObj = fabric.util.groupSVGElements(objects, options);
                  iconObj.set({
                      left: 800, top: 340,
                      originX: 'center', originY: 'center', fill: '#8b5cf6',
                      scaleX: 100 / (iconObj.width || 100), scaleY: 100 / (iconObj.height || 100)
                  });
                  canvas.add(iconObj);
                  
                  const textObj = new fabric.IText(brandName.toUpperCase(), {
                      left: 800, top: 460,
                      fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: 54, fill: '#ffffff',
                      originX: 'center', originY: 'center', objectCaching: false
                  });
                  canvas.add(textObj);
                  
                  // Ensure canvas updates if fonts are still loading
                  document.fonts.ready.then(() => {
                      textObj.setCoords();
                      canvas.renderAll();
                  });
                  canvas.renderAll();
              });
          }
      } catch(e) { console.error(e); }
      magicGenerateBtn.textContent = 'Auto-Build';
  });

  let animationFrame;
  let animTime = 0;
  function animateCanvas() {
      if (!motionSelector) return;
      const type = motionSelector.value;
      animTime += 0.05;
      
      if (type !== 'none') {
          canvas.getObjects().forEach(obj => {
              if (obj === bgRect) return;
              if (!obj.origProps) {
                  obj.origProps = { scaleX: obj.scaleX, scaleY: obj.scaleY, top: obj.top, angle: obj.angle };
              }
              if (type === 'pulse') {
                  const scale = 1 + Math.sin(animTime) * 0.05;
                  obj.set('scaleX', obj.origProps.scaleX * scale);
                  obj.set('scaleY', obj.origProps.scaleY * scale);
              } else if (type === 'float') {
                  const offset = Math.sin(animTime) * 10;
                  obj.set('top', obj.origProps.top + offset);
              } else if (type === 'spin') {
                  obj.set('angle', obj.angle + 1);
              }
          });
          canvas.renderAll();
          animationFrame = requestAnimationFrame(animateCanvas);
      } else {
          canvas.getObjects().forEach(obj => {
              if (obj !== bgRect && obj.origProps) {
                  obj.set('scaleX', obj.origProps.scaleX);
                  obj.set('scaleY', obj.origProps.scaleY);
                  obj.set('top', obj.origProps.top);
                  obj.set('angle', obj.origProps.angle);
                  delete obj.origProps;
              }
          });
          canvas.renderAll();
      }
  }
  
  if (motionSelector) {
      motionSelector.addEventListener('change', () => {
          if (motionSelector.value !== 'none') {
              if (!animationFrame) animateCanvas();
          } else {
              if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null; }
              animateCanvas(); // run once to reset
          }
      });
  }


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
              if (obj === bgRect) return; // Skip background
              
              if (obj.type === 'i-text' || obj.type === 'text') {
                  obj.set('fill', colors[colorIndex % colors.length]);
                  colorIndex++;
              } else if (obj.type === 'group' || obj.type === 'path') {
                  if (obj.set) obj.set('fill', colors[colorIndex % colors.length]);
                  if (obj._objects) {
                      obj._objects.forEach(child => { 
                          if (child.set && child.fill) child.set('fill', colors[colorIndex % colors.length]); 
                      });
                  }
                  colorIndex++;
              }
          });
          canvas.renderAll();
      });
  }

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

  exportBtn.addEventListener('click', () => {
    canvas.discardActiveObject(); canvas.renderAll();
    
    const exportFormat = confirm("Press OK for SVG (Vector) Export, or Cancel for High-Res PNG");
    if (exportFormat) {
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.download = 'riyo-logo-vector.svg';
      link.href = url; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } else {
      const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 3 });
      const link = document.createElement('a'); link.download = 'riyo-logo-export.png';
      link.href = dataURL; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }

  });

  document.fonts.ready.then(() => { addText(); });
});
