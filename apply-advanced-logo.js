const fs = require('fs');

let html = fs.readFileSync('logo.html', 'utf8');

// Replace the Add buttons block
const buttonsOld = `<div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <button id="add-text-btn" class="nav-link" style="padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 1.2rem;">T</span> Add Text
              </button>
              <button id="add-shape-btn" class="nav-link" style="padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-size: 1.2rem;">✨</span> Add Icon
              </button>
            </div>`;

const buttonsNew = `<div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
              <button id="add-text-btn" class="nav-link" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9rem;">
                <span style="font-size: 1.1rem;">T</span> Text
              </button>
              <button id="add-shape-btn" class="nav-link" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9rem;">
                <span style="font-size: 1.1rem;">✨</span> Icon
              </button>
              <button id="add-image-btn" class="nav-link" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9rem;">
                <span style="font-size: 1.1rem;">🖼️</span> Image
              </button>
              <input type="file" id="image-upload-input" accept="image/*" style="display: none;">
            </div>`;

html = html.replace(buttonsOld, buttonsNew);

// Replace the font properties panel
const propsOld = `<div id="font-prop-group" class="form-group" style="display: none;">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Typography</label>
                <select id="obj-font-select" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text-main); font-family: inherit; font-size: 0.9rem; cursor: pointer;">
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Playfair Display">Playfair</option>
                  <option value="Cinzel">Cinzel</option>
                </select>
              </div>`;

const propsNew = `<div id="font-prop-group" class="form-group" style="display: none;">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Typography</label>
                <select id="obj-font-select" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text-main); font-family: inherit; font-size: 0.9rem; cursor: pointer; margin-bottom: 8px;">
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Playfair Display">Playfair</option>
                  <option value="Cinzel">Cinzel</option>
                </select>
                <button id="split-words-btn" style="width: 100%; padding: 8px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border); border-radius: 6px; color: var(--text-main); cursor: pointer; font-size: 0.85rem; margin-top: 4px;">✂️ Split into Words</button>
                <div style="margin-top: 12px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Curve Text <span id="curve-val">0</span></label>
                  <input type="range" id="text-curve-slider" min="-100" max="100" value="0" style="width: 100%;">
                </div>
              </div>
              <div id="image-prop-group" class="form-group" style="display: none;">
                <button id="remove-bg-btn" style="width: 100%; padding: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; color: #10B981; cursor: pointer; font-size: 0.85rem;">✨ Remove Background (AI)</button>
              </div>`;

html = html.replace(propsOld, propsNew);

// Update Cache Buster v=2 to v=3
html = html.replace('logo.js?v=2', 'logo.js?v=3');

fs.writeFileSync('logo.html', html, 'utf8');
