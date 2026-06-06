const fs = require('fs');
let html = fs.readFileSync('scanner.html', 'utf8');

// 1. Canvas Props Injection
const canvasPropsOld = `<div id="canvas-props" style="display: block;">
            <label class="cyber-label">Canvas Background</label>`;

const canvasPropsNew = `<div id="canvas-props" style="display: block;">
            <label class="cyber-label">Canvas Background</label>
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <button id="upload-bg-btn" class="cyber-button" style="flex: 1; padding: 6px; font-size: 0.8rem;">Upload Image</button>
              <input type="file" id="bg-upload-input" accept="image/*" style="display: none;">
            </div>
            
            <div style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
               <label class="cyber-label" style="margin: 0;">Bg Blur</label>
               <input type="range" id="bg-blur-input" min="0" max="100" value="0" style="width: 120px;">
            </div>`;
html = html.replace(canvasPropsOld, canvasPropsNew);

// 2. Text Props Injection
const textPropsOld = `<div id="text-props" style="display: none; flex-direction: column; gap: 16px;">
            <label class="cyber-label">Edit Text</label>`;

const textPropsNew = `<div id="text-props" style="display: none; flex-direction: column; gap: 16px;">
            <label class="cyber-label">Edit Text</label>
            <select id="text-font-select" style="width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px; border-radius: 6px; outline: none; margin-bottom: -8px;">
              <option value="Inter">Inter (Clean)</option>
              <option value="JetBrains Mono">JetBrains Mono (Tech)</option>
              <option value="Times New Roman">Times New Roman (Serif)</option>
              <option value="Arial">Arial (Standard)</option>
            </select>`;
html = html.replace(textPropsOld, textPropsNew);

// 3. Image Props Injection
const frameSelectOld = `<option value="none">No Frame (Raw Image)</option>
              <option value="browser">Mac Browser Window</option>
              <option value="iphone">iPhone Notch Frame</option>
            </select>`;

const frameSelectNew = `<option value="none">No Frame (Raw Image)</option>
              <option value="browser">Mac Browser Window</option>
              <option value="iphone">iPhone Notch Frame</option>
              <option value="ipad">iPad Pro (Tablet)</option>
              <option value="macbook">MacBook Pro</option>
            </select>
            
            <div style="margin-top: 8px;">
              <label class="cyber-label">Rotation & Tilt</label>
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                 <span style="color: var(--text-dim); font-size: 0.8rem; width: 40px;">Rotate</span>
                 <input type="range" id="img-rotate-input" min="-180" max="180" value="0" style="flex: 1;">
              </div>
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                 <span style="color: var(--text-dim); font-size: 0.8rem; width: 40px;">Tilt Y</span>
                 <input type="range" id="img-tilt-y-input" min="-45" max="45" value="0" style="flex: 1;">
              </div>
            </div>
            
            <div style="margin-top: 8px;">
              <label class="cyber-label">Drop Shadow</label>
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                 <span style="color: var(--text-dim); font-size: 0.8rem; width: 40px;">Blur</span>
                 <input type="range" id="img-shadow-blur-input" min="0" max="200" value="80" style="flex: 1;">
              </div>
              <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px;">
                 <span style="color: var(--text-dim); font-size: 0.8rem; width: 40px;">Opacity</span>
                 <input type="range" id="img-shadow-op-input" min="0" max="100" value="50" style="flex: 1;">
              </div>
            </div>`;
html = html.replace(frameSelectOld, frameSelectNew);

fs.writeFileSync('scanner.html', html, 'utf8');
console.log("HTML successfully updated.");
