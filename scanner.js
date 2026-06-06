/**
 * Riyo Studio - Mockup Studio (Replaces AI Scanner)
 * 100% Offline Canvas Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('mockup-dropzone');
    const fileInput = document.getElementById('mockup-file-input');
    const canvasContainer = document.getElementById('mockup-canvas-container');
    const canvas = document.getElementById('mockup-canvas');
    const ctx = canvas.getContext('2d');
    const exportBtn = document.getElementById('export-btn');
    const resetBtn = document.getElementById('reset-img-btn');
    
    // Controls
    const frameBtns = document.querySelectorAll('.frame-btn');
    const bgBtns = document.querySelectorAll('.bg-btn');
    const paddingSlider = document.getElementById('padding-slider');
    const paddingVal = document.getElementById('padding-val');
    const shadowSlider = document.getElementById('shadow-slider');
    const shadowVal = document.getElementById('shadow-val');
  
    let currentImage = null;
    let config = {
      frame: 'browser',
      bgType: 'gradient-1',
      padding: 64,
      shadow: 40
    };
  
    const gradients = {
      'gradient-1': ['#FF6B6B', '#4ECDC4'],
      'gradient-2': ['#A8FF78', '#78FFD6'],
      'gradient-3': ['#4facfe', '#00f2fe'],
      'gradient-4': ['#fa709a', '#fee140'],
      'gradient-5': ['#30cfd0', '#330867'],
      'gradient-6': ['#09203f', '#537895']
    };
  
    // ==========================================
    // Event Listeners
    // ==========================================
  
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadImage(e.dataTransfer.files[0]);
      }
    });
  
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadImage(e.target.files[0]);
      }
    });
  
    resetBtn.addEventListener('click', () => {
      currentImage = null;
      canvasContainer.style.display = 'none';
      dropzone.style.display = 'flex';
      exportBtn.style.opacity = '0.5';
      exportBtn.style.pointerEvents = 'none';
      fileInput.value = '';
    });
  
    // Controls Listeners
    frameBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        frameBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.frame = btn.dataset.frame;
        renderCanvas();
      });
    });
  
    bgBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bgBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.bgType = btn.dataset.bg;
        renderCanvas();
      });
    });
  
    paddingSlider.addEventListener('input', (e) => {
      config.padding = parseInt(e.target.value);
      paddingVal.innerText = `${config.padding}px`;
      renderCanvas();
    });
  
    shadowSlider.addEventListener('input', (e) => {
      config.shadow = parseInt(e.target.value);
      shadowVal.innerText = `${config.shadow}%`;
      renderCanvas();
    });
  
    exportBtn.addEventListener('click', () => {
      if (!currentImage) return;
      
      const link = document.createElement('a');
      link.download = `riyo-mockup-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  
    // ==========================================
    // Logic
    // ==========================================
  
    function loadImage(file) {
      if (!file.type.startsWith('image/')) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          currentImage = img;
          dropzone.style.display = 'none';
          canvasContainer.style.display = 'flex';
          exportBtn.style.opacity = '1';
          exportBtn.style.pointerEvents = 'auto';
          renderCanvas();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    function roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  
    function renderCanvas() {
      if (!currentImage) return;
  
      // Scale up settings for high-res output based on original image size
      // We assume the padding slider (0-120) corresponds to a baseline 1080p width
      const scaleFactor = Math.max(1, currentImage.width / 1000);
      const actualPadding = config.padding * scaleFactor;
      
      // Frame specifics
      let frameTop = 0;
      let borderRadius = 12 * scaleFactor;
  
      if (config.frame === 'browser') {
        frameTop = 40 * scaleFactor;
        borderRadius = 12 * scaleFactor;
      } else if (config.frame === 'mobile') {
        frameTop = 60 * scaleFactor; // extra space for notch
        borderRadius = 36 * scaleFactor;
      }
  
      const contentWidth = currentImage.width;
      const contentHeight = currentImage.height;
      const totalWidth = contentWidth + (actualPadding * 2);
      const totalHeight = contentHeight + frameTop + (actualPadding * 2);
  
      canvas.width = totalWidth;
      canvas.height = totalHeight;
  
      ctx.clearRect(0, 0, totalWidth, totalHeight);
  
      // 1. Draw Background
      if (config.bgType === 'transparent') {
        // Leave transparent
      } else if (config.bgType === 'solid') {
        ctx.fillStyle = '#060B14';
        ctx.fillRect(0, 0, totalWidth, totalHeight);
      } else if (gradients[config.bgType]) {
        const colors = gradients[config.bgType];
        const grad = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, colors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, totalWidth, totalHeight);
      }
  
      // 2. Draw Shadow
      const shadowBlur = (config.shadow / 100) * 100 * scaleFactor;
      const shadowY = (config.shadow / 100) * 40 * scaleFactor;
      
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${(config.shadow / 100) * 0.6})`;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowY;
      ctx.shadowOffsetX = 0;
  
      // Draw the base rounded rectangle for the device
      ctx.fillStyle = '#1e1e1e'; // fallback frame color
      roundRect(ctx, actualPadding, actualPadding, contentWidth, contentHeight + frameTop, borderRadius);
      ctx.fill();
      ctx.restore(); // remove shadow for subsequent drawing
  
      // 3. Draw Frame Chrome
      ctx.save();
      roundRect(ctx, actualPadding, actualPadding, contentWidth, contentHeight + frameTop, borderRadius);
      ctx.clip(); // Ensure everything stays inside rounded corners
  
      if (config.frame === 'browser') {
        // Browser Top Bar
        ctx.fillStyle = '#E5E5EA'; // Light Mac frame
        ctx.fillRect(actualPadding, actualPadding, contentWidth, frameTop);
        
        // Traffic Lights
        const dotRadius = 5 * scaleFactor;
        const dotY = actualPadding + (frameTop / 2);
        let dotX = actualPadding + (16 * scaleFactor);
        const dotGap = 8 * scaleFactor;
  
        // Red
        ctx.fillStyle = '#FF5F56';
        ctx.beginPath(); ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2); ctx.fill();
        dotX += (dotRadius * 2) + dotGap;
        // Yellow
        ctx.fillStyle = '#FFBD2E';
        ctx.beginPath(); ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2); ctx.fill();
        dotX += (dotRadius * 2) + dotGap;
        // Green
        ctx.fillStyle = '#27C93F';
        ctx.beginPath(); ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2); ctx.fill();
        
      } else if (config.frame === 'mobile') {
        // iPhone Frame (Dark border with notch)
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(actualPadding, actualPadding, contentWidth, contentHeight + frameTop);
        
        // Notch
        const notchWidth = contentWidth * 0.4;
        const notchHeight = 30 * scaleFactor;
        const notchX = actualPadding + (contentWidth / 2) - (notchWidth / 2);
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(notchX, actualPadding);
        ctx.lineTo(notchX + notchWidth, actualPadding);
        ctx.lineTo(notchX + notchWidth - (10*scaleFactor), actualPadding + notchHeight);
        ctx.lineTo(notchX + (10*scaleFactor), actualPadding + notchHeight);
        ctx.fill();
      }
  
      // 4. Draw the actual screenshot
      ctx.drawImage(
        currentImage, 
        actualPadding, 
        actualPadding + frameTop, 
        contentWidth, 
        contentHeight
      );
  
      ctx.restore(); // remove clipping
    }
  });
