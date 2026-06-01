const fs = require('fs');
let js = fs.readFileSync('logo.js', 'utf8');

// 1. Inject DOM variables
const varsTarget = "const curveVal = document.getElementById('curve-val');";
const varsInjection = `
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
`;
js = js.replace(varsTarget, varsTarget + "\n" + varsInjection);

// 2. Inject property updaters in updatePropertyPanel()
const updatePropTarget = "fontPropGroup.style.display = 'block';";
const updatePropInjection = `
      // Read text properties
      if (letterSpacingSlider) {
        letterSpacingSlider.value = activeObj.charSpacing || 0;
        spacingVal.textContent = activeObj.charSpacing || 0;
      }
`;
js = js.replace(updatePropTarget, updatePropTarget + "\n" + updatePropInjection);

const updatePropGlobalTarget = "if (imagePropGroup) imagePropGroup.style.display = 'none';\n    }";
const updatePropGlobalInjection = `
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
`;
js = js.replace(updatePropGlobalTarget, updatePropGlobalTarget + "\n" + updatePropGlobalInjection);

// 3. Inject event listeners for the new controls
const eventListenersTarget = "deleteBtn.addEventListener('click', deleteSelected);";
const eventListenersInjection = `
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
`;
js = js.replace(eventListenersTarget, eventListenersTarget + "\n" + eventListenersInjection);

// 4. Update SVG Export
const exportTarget = `const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    const link = document.createElement('a'); link.download = 'riyo-logo-export.png';
    link.href = dataURL; document.body.appendChild(link); link.click(); document.body.removeChild(link);`;
const exportInjection = `
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
`;
js = js.replace(exportTarget, exportInjection);

fs.writeFileSync('logo.js', js);
