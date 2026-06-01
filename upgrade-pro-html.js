const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

// 1. Add Quick Alignment Buttons under the "Selected Element" delete button
const alignButtonsHtml = `
              <!-- Quick Alignments -->
              <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.5); padding: 4px; border-radius: 6px; border: 1px solid var(--border); margin-top: 8px;">
                <button id="align-center-h" title="Center Horizontally" style="flex: 1; padding: 4px; background: none; border: none; color: var(--text-main); cursor: pointer; font-size: 1.1rem;">↔️</button>
                <button id="align-center-v" title="Center Vertically" style="flex: 1; padding: 4px; background: none; border: none; color: var(--text-main); cursor: pointer; font-size: 1.1rem;">↕️</button>
                <div style="width: 1px; background: var(--border); margin: 0 4px;"></div>
                <button id="layer-up-btn" title="Bring Forward" style="flex: 1; padding: 4px; background: none; border: none; color: var(--text-main); cursor: pointer; font-size: 1.1rem;">⏫</button>
                <button id="layer-down-btn" title="Send Backward" style="flex: 1; padding: 4px; background: none; border: none; color: var(--text-main); cursor: pointer; font-size: 1.1rem;">⏬</button>
              </div>`;

html = html.replace(
  '<button id="delete-obj-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;" title="Delete Object">🗑️</button>\n              </div>',
  '<button id="delete-obj-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;" title="Delete Object">🗑️</button>\n              </div>' + alignButtonsHtml
);

// 2. Add Letter Spacing to Typography
const letterSpacingHtml = `
                <div style="margin-top: 12px;">
                  <label style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Letter Spacing <span id="spacing-val">0</span></label>
                  <input type="range" id="letter-spacing-slider" min="-200" max="800" value="0" style="width: 100%;">
                </div>`;
html = html.replace(
  '✂️ Split into Words</button>',
  '✂️ Split into Words</button>' + letterSpacingHtml
);

// 3. Replace the old "Color" form-group with the advanced form-groups (Fill, Opacity, Stroke, Shadow)
const oldColorGroup = `              <div class="form-group">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Color</label>
                <div style="display: flex; gap: 8px;">
                  <input type="color" id="obj-color-picker" value="#ffffff" style="height: 32px; width: 48px; cursor: pointer; background: none; border: none; padding: 0;">
                  <input type="text" id="obj-color-hex" value="#ffffff" style="flex: 1; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text-main); font-family: 'JetBrains Mono'; font-size: 0.9rem;">
                </div>
              </div>`;

const newColorGroups = `              <div class="form-group">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Fill Color</label>
                <div style="display: flex; gap: 8px;">
                  <input type="color" id="obj-color-picker" value="#ffffff" style="height: 32px; width: 48px; cursor: pointer; background: none; border: none; padding: 0;">
                  <input type="text" id="obj-color-hex" value="#ffffff" style="flex: 1; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: var(--text-main); font-family: 'JetBrains Mono'; font-size: 0.9rem;">
                </div>
              </div>
              
              <div class="form-group">
                <label style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Opacity <span id="opacity-val">100%</span></label>
                <input type="range" id="obj-opacity-slider" min="0" max="100" value="100" style="width: 100%;">
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Outline (Stroke)</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="color" id="obj-stroke-color" value="#000000" style="height: 32px; width: 48px; cursor: pointer; background: none; border: none; padding: 0;">
                  <input type="range" id="obj-stroke-width" min="0" max="20" value="0" style="flex: 1;">
                </div>
              </div>
              
              <div class="form-group">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Drop Shadow</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div><label style="font-size:0.7rem; color:var(--text-muted);">Blur</label><input type="range" id="shadow-blur" min="0" max="50" value="0" style="width:100%;"></div>
                    <div><label style="font-size:0.7rem; color:var(--text-muted);">Offset</label><input type="range" id="shadow-offset" min="-30" max="30" value="0" style="width:100%;"></div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="color" id="shadow-color" value="#000000" style="height: 32px; width: 48px; cursor: pointer; background: none; border: none; padding: 0;">
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Shadow Color</span>
                </div>
              </div>`;

html = html.replace(oldColorGroup, newColorGroups);

fs.writeFileSync('logo.html', html);
