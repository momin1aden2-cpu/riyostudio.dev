const fs = require('fs');

let html = fs.readFileSync('logo.html', 'utf8');

if (!html.includes('fabric.min.js')) {
    html = html.replace('<script src="logo.js" defer></script>', '<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>\n  <script src="logo.js" defer></script>');
}

const panelRegex = /<div class="tool-panel"[^>]*>[\s\S]*?(?=<!-- Live Preview Canvas -->)/;
const newPanel = `<div class="tool-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px;">
            
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

          `;
html = html.replace(panelRegex, newPanel);
fs.writeFileSync('logo.html', html, 'utf8');
