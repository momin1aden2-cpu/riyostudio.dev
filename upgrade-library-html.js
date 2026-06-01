const fs = require('fs');

let html = fs.readFileSync('logo.html', 'utf8');

// 1. Add Fonts to Head
const fontLinks = `<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Sans:opsz,wght@9..40,400..700&family=Syncopate:wght@400;700&family=Syne:wght@400..800&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>`;
html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>', fontLinks);


// 2. Add Icon Library Panel under the Add buttons
const addButtons = `<input type="file" id="image-upload-input" accept="image/*" style="display: none;">
            </div>`;
const iconLibraryPanel = `<input type="file" id="image-upload-input" accept="image/*" style="display: none;">
            </div>
            
            <div id="icon-library-panel" style="display: none; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <!-- Abstract Geometric -->
                <button class="lib-icon-btn" data-svg="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </button>
                <!-- Hexagon -->
                <button class="lib-icon-btn" data-svg="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </button>
                <!-- Shield -->
                <button class="lib-icon-btn" data-svg="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </button>
                <!-- Sparkle / Star -->
                <button class="lib-icon-btn" data-svg="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </button>
                <!-- Infinity -->
                <button class="lib-icon-btn" data-svg="M8 8a4 4 0 1 0 0 8 4 4 0 0 0 3.2-1.6l5.6-8.8A4 4 0 1 1 20 8a4 4 0 0 1-3.2 1.6L11.2 18.4A4 4 0 1 1 8 8z" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M8 8a4 4 0 1 0 0 8 4 4 0 0 0 3.2-1.6l5.6-8.8A4 4 0 1 1 20 8a4 4 0 0 1-3.2 1.6L11.2 18.4A4 4 0 1 1 8 8z"/></svg>
                </button>
                <!-- Lightning -->
                <button class="lib-icon-btn" data-svg="M13 2L3 14h9l-1 8 10-12h-9l1-8z" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </button>
                <!-- Command -->
                <button class="lib-icon-btn" data-svg="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>
                </button>
                <!-- Aperture -->
                <button class="lib-icon-btn" data-svg="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M14.31 8l5.74 9.94 M9.69 8h11.48 M7.38 12l5.74-9.94 M9.69 16L3.95 6.06 M14.31 16H2.83 M16.62 12l-5.74 9.94" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="14.31" y1="8" x2="20.05" y2="17.94"/><line x1="9.69" y1="8" x2="21.17" y2="8"/><line x1="7.38" y1="12" x2="13.12" y2="2.06"/><line x1="9.69" y1="16" x2="3.95" y2="6.06"/><line x1="14.31" y1="16" x2="2.83" y2="16"/><line x1="16.62" y1="12" x2="10.88" y2="21.94"/></svg>
                </button>
            </div>`;
html = html.replace(addButtons, iconLibraryPanel);


// 3. Add Fonts to Dropdown
const fontsOld = `<option value="Cinzel">Cinzel</option>
                </select>`;
const fontsNew = `<option value="Cinzel">Cinzel</option>
                  <option value="Clash Display">Clash Display</option>
                  <option value="Syne">Syne</option>
                  <option value="Syncopate">Syncopate</option>
                  <option value="Bricolage Grotesque">Bricolage</option>
                  <option value="DM Sans">DM Sans</option>
                </select>`;
html = html.replace(fontsOld, fontsNew);


// 4. Update Theme Buttons
const themesOld = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button class="theme-btn active" data-theme="dark" style="padding: 10px; background: #111; border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer;">Minimal Dark</button>
                <button class="theme-btn" data-theme="light" style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 8px; color: #000; cursor: pointer;">Minimal Light</button>
                <button class="theme-btn" data-theme="cyber" style="padding: 10px; background: #0a0a0a; border: 1px solid #10B981; border-radius: 8px; color: #10B981; cursor: pointer;">Cyber Green</button>
                <button class="theme-btn" data-theme="transparent" style="padding: 10px; background: transparent; border: 1px dashed var(--text-muted); border-radius: 8px; color: var(--text-muted); cursor: pointer;">Transparent</button>
              </div>`;

const themesNew = `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button class="theme-btn active" data-theme="dark" style="padding: 10px; background: #111; border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer; font-size: 0.8rem;">Dark</button>
                <button class="theme-btn" data-theme="light" style="padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 8px; color: #000; cursor: pointer; font-size: 0.8rem;">Light</button>
                <button class="theme-btn" data-theme="cyber" style="padding: 10px; background: #0a0a0a; border: 1px solid #10B981; border-radius: 8px; color: #10B981; cursor: pointer; font-size: 0.8rem;">Cyber</button>
                <button class="theme-btn" data-theme="midnight" style="padding: 10px; background: linear-gradient(135deg, #1e1b4b, #312e81); border: 1px solid #4338ca; border-radius: 8px; color: #fff; cursor: pointer; font-size: 0.8rem;">Midnight</button>
                <button class="theme-btn" data-theme="sunset" style="padding: 10px; background: linear-gradient(135deg, #f97316, #db2777); border: 1px solid #f43f5e; border-radius: 8px; color: #fff; cursor: pointer; font-size: 0.8rem;">Sunset</button>
                <button class="theme-btn" data-theme="holographic" style="padding: 10px; background: linear-gradient(135deg, #e0e7ff, #f3e8ff); border: 1px solid #c7d2fe; border-radius: 8px; color: #333; cursor: pointer; font-size: 0.8rem;">Holo</button>
                <button class="theme-btn" data-theme="grid" style="padding: 10px; background: #111; background-image: radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px); background-size: 10px 10px; border: 1px solid var(--border); border-radius: 8px; color: #fff; cursor: pointer; font-size: 0.8rem;">Grid</button>
                <button class="theme-btn" data-theme="transparent" style="padding: 10px; background: transparent; border: 1px dashed var(--text-muted); border-radius: 8px; color: var(--text-muted); cursor: pointer; font-size: 0.8rem;">Transparent</button>
              </div>`;
html = html.replace(themesOld, themesNew);

// Update Cache Buster to v=5
html = html.replace('logo.js?v=4', 'logo.js?v=5');

fs.writeFileSync('logo.html', html, 'utf8');
