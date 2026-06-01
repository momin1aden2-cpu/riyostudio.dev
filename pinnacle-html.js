const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

// 1. Save and Load Buttons
const workspaceTarget = `<button id="toggle-grid-btn"`;
const saveLoadInjection = `
                <button id="save-proj-btn" style="padding: 10px; background: rgba(59, 130, 246, 0.1); border: 1px dashed rgba(59, 130, 246, 0.5); border-radius: 8px; color: #3b82f6; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    💾 Save Project
                </button>
                <button id="load-proj-btn" style="padding: 10px; background: rgba(59, 130, 246, 0.1); border: 1px dashed rgba(59, 130, 246, 0.5); border-radius: 8px; color: #3b82f6; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    📂 Load Project
                </button>
`;
html = html.replace(workspaceTarget, saveLoadInjection + "\n                " + workspaceTarget);

// 2. Motion Branding and Magic Auto-Generator
const toolsTarget = `<div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;">`;
const magicInjection = `
            <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 8px;">
                <label style="display: block; font-size: 0.9rem; color: #a78bfa; margin-bottom: 8px; font-weight: bold;">🪄 AI Auto-Generator</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="magic-brand-input" placeholder="Enter Brand Name..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.5); background: rgba(0,0,0,0.5); color: #fff; font-size: 0.9rem;">
                    <button id="magic-generate-btn" style="padding: 10px 16px; background: #8b5cf6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;">Auto-Build</button>
                </div>
            </div>
`;
html = html.replace(toolsTarget, magicInjection + "\n            " + toolsTarget);

const paletteTarget = `<option value="sunset">Sunset (Coral, Peach, Violet)</option>
                </select>
            </div>`;
const motionInjection = `
            <div style="margin-top: -16px; margin-bottom: 8px;">
                <label style="display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 6px;">Motion Identity (Animation)</label>
                <select id="motion-selector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--border); border-radius: 6px; color: var(--text-main);">
                    <option value="none">-- Static (No Motion) --</option>
                    <option value="pulse">Pulse (Heartbeat)</option>
                    <option value="float">Float (Hover)</option>
                    <option value="spin">Spin (Continuous 360)</option>
                </select>
            </div>
`;
html = html.replace(paletteTarget, paletteTarget + "\n" + motionInjection);

fs.writeFileSync('logo.html', html);
