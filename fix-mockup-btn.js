const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

const exportTarget = `<button id="logo-export-btn"`;
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
html = html.replace(exportTarget, workspaceTools + "\n            " + exportTarget);

fs.writeFileSync('logo.html', html);
