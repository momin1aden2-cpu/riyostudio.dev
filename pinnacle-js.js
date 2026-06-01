const fs = require('fs');
let js = fs.readFileSync('logo.js', 'utf8');

const domTarget = "const mockupModal = document.getElementById('mockup-modal');";
const domInjection = `
  const saveProjBtn = document.getElementById('save-proj-btn');
  const loadProjBtn = document.getElementById('load-proj-btn');
  const magicBrandInput = document.getElementById('magic-brand-input');
  const magicGenerateBtn = document.getElementById('magic-generate-btn');
  const motionSelector = document.getElementById('motion-selector');
`;
js = js.replace(domTarget, domInjection + "\n  " + domTarget);


const logicTarget = "let showGrid = false;";
const logicInjection = `
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
          const res = await fetch(\`https://api.iconify.design/search?query=geometric&limit=15\`);
          const data = await res.json();
          if (data && data.icons && data.icons.length > 0) {
              const iconName = data.icons[Math.floor(Math.random() * data.icons.length)];
              const [prefix, name] = iconName.split(':');
              const svgRes = await fetch(\`https://api.iconify.design/\${prefix}/\${name}.svg\`);
              const svgText = await svgRes.text();
              
              fabric.loadSVGFromString(svgText, (objects, options) => {
                  const iconObj = fabric.util.groupSVGElements(objects, options);
                  iconObj.set({
                      left: canvas.width / 2, top: canvas.height / 2 - 60,
                      originX: 'center', originY: 'center', fill: '#8b5cf6',
                      scaleX: 100 / (iconObj.width || 100), scaleY: 100 / (iconObj.height || 100)
                  });
                  canvas.add(iconObj);
                  
                  const textObj = new fabric.IText(brandName.toUpperCase(), {
                      left: canvas.width / 2, top: canvas.height / 2 + 50,
                      fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: 54, fill: '#ffffff',
                      originX: 'center', originY: 'center', charSpacing: 100
                  });
                  canvas.add(textObj);
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

`;
js = js.replace(logicTarget, logicInjection + "\n  " + logicTarget);

fs.writeFileSync('logo.js', js);
