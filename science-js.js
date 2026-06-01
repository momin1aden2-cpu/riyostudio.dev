const fs = require('fs');
let js = fs.readFileSync('logo.js', 'utf8');

// 1. Inject DOM variables at the top of DOM fetch block
const domTarget = "const addShapeBtn = document.getElementById('add-shape-btn');";
const domInjection = `
  const addBrandTextBtn = document.getElementById('add-brand-text-btn');
  const toggleGridBtn = document.getElementById('toggle-grid-btn');
  const previewMockupBtn = document.getElementById('preview-mockup-btn');
  const mockupModal = document.getElementById('mockup-modal');
  const closeMockupBtn = document.getElementById('close-mockup-btn');
  const mockupImage = document.getElementById('mockup-image');
  const paletteSelector = document.getElementById('palette-selector');
`;
js = js.replace(domTarget, domInjection + "\n  " + domTarget);


// 2. Inject Logic before addText listener
const logicTarget = "addTextBtn.addEventListener('click', addText);";
const logicInjection = `
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
`;
js = js.replace(logicTarget, logicInjection + "\n  " + logicTarget);

fs.writeFileSync('logo.js', js);
