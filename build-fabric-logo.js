const fs = require('fs');

// 1. Rewrite logo.html
let html = fs.readFileSync('logo.html', 'utf8');

// Inject Fabric.js
if (!html.includes('fabric.min.js')) {
    html = html.replace('<script src="logo.js" defer></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>\n  <script src="logo.js" defer></script>');
}

// Replace tool-panel content
const panelRegex = /<div class="tool-panel"[\s\S]*?<!-- Live Preview Canvas -->/;
const newPanel = <div class="tool-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px;">
            
            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button id="add-text-btn" class="nav-link" style="padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 1.2rem;">T</span> Add Text
              </button>
              <button id="add-shape-btn" class="nav-link" style="padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 1.2rem;">✨</span> Add Icon
              </button>
            </div>

            <!-- Dynamic Properties Panel (Hidden by default, shows when object is selected) -->
            <div id="object-properties" style="display: none; padding: 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; flex-direction: column; gap: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; color: #10B981; font-family: 'JetBrains Mono'; text-transform: uppercase;">Selected Element</span>
                <button id="delete-obj-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;" title="Delete Object">🗑️</button>
              </div>

              <div id="font-prop-group" class="form-group" style="display: none;">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Typography</label>
                <select id="obj-font-select" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text-main); font-family: inherit; font-size: 0.9rem; cursor: pointer;">
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Playfair Display">Playfair</option>
                  <option value="Cinzel">Cinzel</option>
                </select>
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Color</label>
                <div style="display: flex; gap: 8px;">
                  <input type="color" id="obj-color-picker" value="#ffffff" style="height: 32px; width: 48px; cursor: pointer; background: none; border: none; padding: 0;">
                  <input type="text" id="obj-color-hex" value="#ffffff" style="flex: 1; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text-main); font-family: 'JetBrains Mono'; font-size: 0.9rem;">
                </div>
              </div>
            </div>

            <div class="form-group">
              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Background Theme</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button class="theme-btn active" data-theme="dark" style="padding: 10px; background: #111; border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer;">Minimal Dark</button>
                <button class="theme-btn" data-theme="light" style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 8px; color: #000; cursor: pointer;">Minimal Light</button>
                <button class="theme-btn" data-theme="cyber" style="padding: 10px; background: #0a0a0a; border: 1px solid #10B981; border-radius: 8px; color: #10B981; cursor: pointer;">Cyber Green</button>
                <button class="theme-btn" data-theme="transparent" style="padding: 10px; background: transparent; border: 1px dashed var(--text-muted); border-radius: 8px; color: var(--text-muted); cursor: pointer;">Transparent</button>
              </div>
            </div>

            <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>

            <button id="logo-export-btn" class="nav-cta-btn" style="width: 100%; padding: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #10B981; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s;">
              Download 4K PNG
            </button>
            <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-top: -12px;">100% Private - Rendered locally</p>
          </div>

          <!-- Live Preview Canvas -->;
html = html.replace(panelRegex, newPanel);
fs.writeFileSync('logo.html', html, 'utf8');

// 2. Rewrite logo.js
const logoJsCode = \document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('logo-canvas');
  if (!canvasElement || typeof fabric === 'undefined') return;

  // Initialize Fabric Canvas (Internal 1600x800 for 4K-ish exports, CSS handles display scaling)
  const canvas = new fabric.Canvas('logo-canvas', {
    width: 1600,
    height: 800,
    preserveObjectStacking: true
  });

  // UI Elements
  const addTextBtn = document.getElementById('add-text-btn');
  const addShapeBtn = document.getElementById('add-shape-btn');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const exportBtn = document.getElementById('logo-export-btn');

  const objPropsPanel = document.getElementById('object-properties');
  const fontPropGroup = document.getElementById('font-prop-group');
  const fontSelect = document.getElementById('obj-font-select');
  const colorPicker = document.getElementById('obj-color-picker');
  const colorHex = document.getElementById('obj-color-hex');
  const deleteBtn = document.getElementById('delete-obj-btn');

  // Canvas State Defaults
  let currentTheme = 'dark';
  const themes = {
    'dark': '#0a0a0a',
    'light': '#ffffff',
    'cyber': '#050505',
    'transparent': null
  };

  function updateBackground() {
    const bg = themes[currentTheme];
    if (bg) {
      canvas.setBackgroundColor(bg, canvas.renderAll.bind(canvas));
    } else {
      canvas.setBackgroundColor('', canvas.renderAll.bind(canvas));
    }
  }

  // Initial Background
  updateBackground();

  // Control Handle Customization (Cyber aesthetic)
  fabric.Object.prototype.set({
    transparentCorners: false,
    cornerColor: '#10B981',
    cornerStrokeColor: '#000000',
    borderColor: '#10B981',
    cornerSize: 16,
    padding: 10,
    cornerStyle: 'circle'
  });

  // --- Core Functions ---

  function addText() {
    const text = new fabric.IText('Your Brand', {
      left: canvas.width / 2,
      top: canvas.width / 4,
      fontFamily: 'Inter',
      fill: currentTheme === 'light' ? '#111111' : '#ffffff',
      fontSize: 120,
      fontWeight: '600',
      originX: 'center',
      originY: 'center',
      shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  }

  function addShape() {
    const shape = new fabric.Circle({
      left: canvas.width / 2,
      top: 200,
      radius: 60,
      fill: '#10B981',
      originX: 'center',
      originY: 'center',
      shadow: currentTheme === 'cyber' ? new fabric.Shadow({ color: '#10B981', blur: 30 }) : null
    });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  }

  function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach(function(object) {
        canvas.remove(object);
      });
    }
  }

  // --- Property Panel Sync ---

  function updatePropertyPanel() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
      objPropsPanel.style.display = 'none';
      return;
    }

    objPropsPanel.style.display = 'flex';
    
    // Color sync
    const color = activeObj.fill || '#ffffff';
    colorPicker.value = color;
    colorHex.value = color;

    // Font sync (only for text)
    if (activeObj.type === 'i-text' || activeObj.type === 'text') {
      fontPropGroup.style.display = 'block';
      fontSelect.value = activeObj.fontFamily || 'Inter';
    } else {
      fontPropGroup.style.display = 'none';
    }
  }

  canvas.on('selection:created', updatePropertyPanel);
  canvas.on('selection:updated', updatePropertyPanel);
  canvas.on('selection:cleared', updatePropertyPanel);

  // --- Input Listeners ---

  colorPicker.addEventListener('input', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      activeObj.set('fill', e.target.value);
      colorHex.value = e.target.value;
      canvas.renderAll();
    }
  });

  colorHex.addEventListener('input', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
      activeObj.set('fill', e.target.value);
      colorPicker.value = e.target.value;
      canvas.renderAll();
    }
  });

  fontSelect.addEventListener('change', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
      activeObj.set('fontFamily', e.target.value);
      
      // Auto-set weight for specific fonts
      if (e.target.value === 'Cinzel' || e.target.value === 'Playfair Display') {
        activeObj.set('fontWeight', '800');
      } else {
        activeObj.set('fontWeight', '600');
      }
      
      canvas.renderAll();
    }
  });

  deleteBtn.addEventListener('click', deleteSelected);

  // Keyboard Delete
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Don't delete if editing text inside the object or input fields
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      const activeObj = canvas.getActiveObject();
      if (activeObj && activeObj.isEditing) return;
      
      deleteSelected();
    }
  });

  // --- UI Buttons Listeners ---

  addTextBtn.addEventListener('click', addText);
  addShapeBtn.addEventListener('click', addShape);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTheme = btn.dataset.theme;
      updateBackground();

      // Cyber glow effect toggle
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
    canvas.discardActiveObject(); // Deselect to remove control handles
    canvas.renderAll();
    
    // Fabric.js toDataURL supports higher multiplier
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2 // Output 3200x1600 for ultra crisp 4K logos
    });
    
    const link = document.createElement('a');
    link.download = 'riyo-logo-export.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Add initial elements
  document.fonts.ready.then(() => {
    addText();
  });

});
\;
fs.writeFileSync('logo.js', logoJsCode, 'utf8');
