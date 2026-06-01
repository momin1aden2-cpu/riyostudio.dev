document.addEventListener('DOMContentLoaded', () => {
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
      top: canvas.height / 2,
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
      radius: 80,
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
