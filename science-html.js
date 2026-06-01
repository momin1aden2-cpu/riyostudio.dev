const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

// 1. Add "Brand" and "Palette" tools in the tool panel
const toolTarget = `<button id="add-image-btn" class="nav-link" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9rem;">
                <span style="font-size: 1.1rem;">🖼️</span> Image
              </button>`;
const toolInjection = `
              <button id="add-brand-text-btn" class="nav-link" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.9rem;">
                <span style="font-size: 1.1rem;">💎</span> Brand
              </button>
            </div>
            
            <div style="margin-top: -16px; margin-bottom: 8px;">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Color Psychology Palette</label>
                <select id="palette-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; color: var(--text-main);">
                    <option value="none">-- Select Palette --</option>
                    <option value="luxury">Luxury (Gold, Black, White)</option>
                    <option value="tech">Tech (Cyan, Navy, White)</option>
                    <option value="eco">Eco (Leaf Green, Forest, Earth)</option>
                    <option value="sunset">Sunset (Coral, Peach, Violet)</option>
                </select>
`;

html = html.replace(toolTarget, toolTarget + "\n" + toolInjection);
html = html.replace('grid-template-columns: 1fr 1fr 1fr;', 'grid-template-columns: 1fr 1fr 1fr 1fr;');

// 2. Add "Toggle Grid" and "Mockup" to Workspace Controls
// Locate <div style="display: flex; gap: 8px;"> inside "Selected Element" properties, wait, we want it under Workspace or Theme.
// Let's find: `<button id="export-btn"`
const exportTarget = `<button id="export-btn" style="padding: 12px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Export Logo
              </button>`;
const workspaceTools = `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <button id="toggle-grid-btn" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    📐 Toggle Grid
                </button>
                <button id="preview-mockup-btn" style="padding: 10px; background: rgba(255,255,255,0.05); border: 1px dashed var(--border); border-radius: 8px; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    🕶️ 3D Mockup
                </button>
              </div>
`;
html = html.replace(exportTarget, workspaceTools + "\n" + exportTarget);

// 3. Add Mockup Modal at the end of the body
const bodyEndTarget = "</body>";
const mockupModal = `
    <!-- Mockup Modal -->
    <div id="mockup-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; flex-direction: column;">
        <button id="close-mockup-btn" style="position: absolute; top: 20px; right: 20px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-weight: bold; cursor: pointer; font-size: 20px;">×</button>
        <h2 style="color: white; margin-bottom: 20px;">Real-World Preview</h2>
        
        <!-- Business Card Mockup Scene -->
        <div style="perspective: 1000px; width: 600px; height: 400px; display: flex; justify-content: center; align-items: center;">
            <div style="width: 500px; height: 300px; background: #1a1a1a; border-radius: 12px; box-shadow: 20px 20px 60px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.1); transform: rotateY(-15deg) rotateX(10deg); display: flex; justify-content: center; align-items: center; position: relative; overflow: hidden;">
                <!-- Texture overlay -->
                <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%); pointer-events: none;"></div>
                <img id="mockup-image" src="" style="max-width: 60%; max-height: 60%; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));">
            </div>
        </div>
    </div>
`;
html = html.replace(bodyEndTarget, mockupModal + "\n" + bodyEndTarget);

fs.writeFileSync('logo.html', html);
