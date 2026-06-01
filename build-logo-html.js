const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

// Update Title & Meta
html = html.replace(/<title>File Forge.*?<\/title>/, '<title>Logo Maker - Riyo Studio</title>');
html = html.replace(/content="Format JSON.*?">/, 'content="Design premium, 100% private, pro-grade logos and brand assets entirely in your browser.">');

// Make "Logo Maker" active in navbar
html = html.replace(/<a href="forge\.html" class="nav-link active">File Forge<\/a>/, '<a href="forge.html" class="nav-link">File Forge</a>');
html = html.replace(/<a href="logo\.html" class="nav-link">Logo Maker<\/a>/, '<a href="logo.html" class="nav-link active">Logo Maker</a>');

// Replace the forge section with logo-maker section
const forgeRegex = /<section class="forge" id="forge" style="padding-top: 120px; padding-bottom: 80px;">[\s\S]*?<\/section>/;

const newSection = `
    <section class="logo-maker" style="padding-top: 120px; padding-bottom: 80px;">
      <div class="container fluid">
        <div class="forge-header" style="text-align: center; margin-bottom: 3rem;">
          <h1 class="hero-title" style="font-size: 3rem; margin-bottom: 1rem;">Logo Maker</h1>
          <p class="hero-sub" style="max-width: 600px; margin: 0 auto;">Design premium, pro-grade logos entirely in your browser. 100% private.</p>
        </div>

        <div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px; align-items: start;">
          <!-- Controls Panel -->
          <div class="tool-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px;">
            
            <div class="form-group">
              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Brand Name</label>
              <input type="text" id="logo-text-input" value="Riyo Studio" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: var(--text-main); font-family: inherit; font-size: 1rem;">
            </div>

            <div class="form-group">
              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Typography</label>
              <select id="logo-font-select" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; color: var(--text-main); font-family: inherit; font-size: 1rem; cursor: pointer;">
                <option value="Inter">Inter (Clean, Modern)</option>
                <option value="Outfit">Outfit (Tech, Geometric)</option>
                <option value="Space Grotesk">Space Grotesk (Cyber, Edgy)</option>
                <option value="Playfair Display">Playfair (Elegant, Serif)</option>
                <option value="Cinzel">Cinzel (Premium, Luxury)</option>
              </select>
            </div>

            <div class="form-group">
              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Icon Shape</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
                <button class="icon-btn active" data-icon="none" style="padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-dim); cursor: pointer;">None</button>
                <button class="icon-btn" data-icon="circle" style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; color: var(--text-dim); cursor: pointer;">●</button>
                <button class="icon-btn" data-icon="square" style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; color: var(--text-dim); cursor: pointer;">■</button>
                <button class="icon-btn" data-icon="triangle" style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; color: var(--text-dim); cursor: pointer;">▲</button>
              </div>
            </div>

            <div class="form-group">
              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Theme Preset</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button class="theme-btn active" data-theme="dark" style="padding: 10px; background: #111; border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer;">Minimal Dark</button>
                <button class="theme-btn" data-theme="light" style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 8px; color: #000; cursor: pointer;">Minimal Light</button>
                <button class="theme-btn" data-theme="cyber" style="padding: 10px; background: #0a0a0a; border: 1px solid #10B981; border-radius: 8px; color: #10B981; cursor: pointer;">Cyber Green</button>
                <button class="theme-btn" data-theme="premium" style="padding: 10px; background: linear-gradient(135deg, #2a2a35, #101018); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #fff; cursor: pointer;">Premium Glass</button>
              </div>
            </div>

            <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>

            <button id="logo-export-btn" class="nav-cta-btn" style="width: 100%; padding: 14px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #10B981; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s;">
              Download 4K PNG
            </button>
            <p style="text-align: center; font-size: 12px; color: var(--text-muted); margin-top: -12px;">100% Private - Rendered locally</p>
          </div>

          <!-- Live Preview Canvas -->
          <div class="canvas-container" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 16px; display: flex; align-items: center; justify-content: center; min-height: 500px; position: relative; overflow: hidden; padding: 40px;">
            <!-- Checkerboard background pattern for transparency visualization -->
            <div style="position: absolute; inset: 0; background-image: linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; z-index: 0;"></div>
            
            <!-- Actual Canvas Wrapper -->
            <div id="logo-render-wrapper" style="position: relative; z-index: 1; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border-radius: 12px; overflow: hidden;">
                <canvas id="logo-canvas" width="1600" height="800" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
            </div>
          </div>
        </div>

      </div>
    </section>
`;

html = html.replace(forgeRegex, newSection);

// Update specific scripts
html = html.replace(/<script src="forge\.js"><\/script>/, '<script src="logo.js"></script>');

fs.writeFileSync('logo.html', html, 'utf8');
