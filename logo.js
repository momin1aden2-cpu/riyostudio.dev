document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('logo-canvas');
  if (!canvas) return; // Not on the logo page

  const ctx = canvas.getContext('2d');
  
  // UI Elements
  const textInput = document.getElementById('logo-text-input');
  const fontSelect = document.getElementById('logo-font-select');
  const iconBtns = document.querySelectorAll('.icon-btn');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const exportBtn = document.getElementById('logo-export-btn');

  // State
  let state = {
    text: 'Riyo Studio',
    font: 'Inter',
    icon: 'none',
    theme: 'dark'
  };

  // Themes Configuration
  const themes = {
    'dark': {
      bg: '#0a0a0a',
      text: '#ffffff',
      icon: '#10B981',
      shadow: 'rgba(0,0,0,0)',
      gradient: false
    },
    'light': {
      bg: '#ffffff',
      text: '#111111',
      icon: '#10B981',
      shadow: 'rgba(0,0,0,0.1)',
      gradient: false
    },
    'cyber': {
      bg: '#050505',
      text: '#10B981',
      icon: '#10B981',
      shadow: 'rgba(16,185,129,0.5)',
      gradient: false
    },
    'premium': {
      bg: '#1a1a24', // Base, will be overwritten by gradient
      text: '#ffffff',
      icon: '#ffffff',
      shadow: 'rgba(0,0,0,0.5)',
      gradient: true
    }
  };

  function drawLogo() {
    // High-res canvas setup (Internal resolution is 1600x800 for 4K-ish exports)
    const w = canvas.width;
    const h = canvas.height;
    
    const theme = themes[state.theme];

    // 1. Draw Background
    if (theme.gradient) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#2a2a35');
      grad.addColorStop(1, '#101018');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = theme.bg;
    }
    ctx.fillRect(0, 0, w, h);

    // 2. Setup Layout Math
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = w / 2;
    let centerY = h / 2;

    // Adjust Y if icon is present
    const hasIcon = state.icon !== 'none';
    const iconSize = 120;
    const gap = 40;

    let textY = centerY;
    let iconY = centerY;

    if (hasIcon) {
      iconY = centerY - 60;
      textY = centerY + 80;
    }

    // 3. Draw Icon (if any)
    if (hasIcon) {
      ctx.save();
      ctx.fillStyle = theme.icon;
      ctx.shadowColor = theme.shadow;
      ctx.shadowBlur = state.theme === 'cyber' ? 30 : 20;
      ctx.shadowOffsetY = state.theme === 'cyber' ? 0 : 10;
      
      ctx.beginPath();
      if (state.icon === 'circle') {
        ctx.arc(centerX, iconY, iconSize/2, 0, Math.PI * 2);
      } else if (state.icon === 'square') {
        ctx.roundRect(centerX - iconSize/2, iconY - iconSize/2, iconSize, iconSize, 16);
      } else if (state.icon === 'triangle') {
        ctx.moveTo(centerX, iconY - iconSize/2);
        ctx.lineTo(centerX + iconSize/2, iconY + iconSize/2);
        ctx.lineTo(centerX - iconSize/2, iconY + iconSize/2);
        ctx.closePath();
      }
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Text
    ctx.save();
    
    // Set font style based on choice
    let fontWeight = '600';
    if (state.font === 'Cinzel' || state.font === 'Playfair Display') {
      fontWeight = '800';
    } else if (state.font === 'Space Grotesk') {
      fontWeight = '700';
    }

    ctx.font = `${fontWeight} 120px "${state.font}", sans-serif`;
    
    // Add text shadow/glow
    ctx.shadowColor = theme.shadow;
    ctx.shadowBlur = state.theme === 'cyber' ? 40 : 15;
    ctx.shadowOffsetY = state.theme === 'cyber' ? 0 : 8;

    // Gradient text for premium theme
    if (state.theme === 'premium') {
      const txtGrad = ctx.createLinearGradient(centerX - 400, textY - 60, centerX + 400, textY + 60);
      txtGrad.addColorStop(0, '#ffffff');
      txtGrad.addColorStop(1, '#a0a0b0');
      ctx.fillStyle = txtGrad;
    } else {
      ctx.fillStyle = theme.text;
    }

    // Add slight letter spacing (Canvas API doesn't support native letter-spacing easily, so we rely on font defaults for V1)
    ctx.fillText(state.text || 'Your Brand', centerX, textY);
    ctx.restore();
  }

  // --- Event Listeners ---

  textInput.addEventListener('input', (e) => {
    state.text = e.target.value;
    drawLogo();
  });

  fontSelect.addEventListener('change', (e) => {
    state.font = e.target.value;
    drawLogo();
  });

  iconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iconBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.icon = btn.dataset.icon;
      drawLogo();
    });
  });

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.theme = btn.dataset.theme;
      drawLogo();
    });
  });

  exportBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${state.text.trim() || 'logo'}-highres.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Wait for fonts to load before initial draw to prevent flash of fallback font
  document.fonts.ready.then(() => {
    drawLogo();
  });

  // Initial draw
  drawLogo();

});
