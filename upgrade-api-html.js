const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

const oldIconPanelStart = '<div id="icon-library-panel"';
const oldIconPanelEnd = '<!-- Aperture -->\n                <button class="lib-icon-btn" data-svg="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M14.31 8l5.74 9.94 M9.69 8h11.48 M7.38 12l5.74-9.94 M9.69 16L3.95 6.06 M14.31 16H2.83 M16.62 12l-5.74 9.94" style="background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer;">\n                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="14.31" y1="8" x2="20.05" y2="17.94"/><line x1="9.69" y1="8" x2="21.17" y2="8"/><line x1="7.38" y1="12" x2="13.12" y2="2.06"/><line x1="9.69" y1="16" x2="3.95" y2="6.06"/><line x1="14.31" y1="16" x2="2.83" y2="16"/><line x1="16.62" y1="12" x2="10.88" y2="21.94"/></svg>\n                </button>\n            </div>';

// We just replace the entire div#icon-library-panel segment using regex
const regex = /<div id="icon-library-panel"[\s\S]*?<\/div>/;

const newIconPanel = `
            <div id="icon-library-panel" style="display: none; flex-direction: column; gap: 12px; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="icon-search-input" placeholder="Search icons (e.g. rocket, wolf)..." style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid var(--border); background: rgba(0,0,0,0.5); color: #fff; font-size: 0.85rem;">
                    <button id="icon-search-btn" style="padding: 8px 12px; background: #10B981; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">🔎</button>
                </div>
                <div id="icon-search-results" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
                    <!-- Default state message -->
                    <div style="grid-column: span 4; text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px 0;">
                        Type a keyword and click search to fetch vectors from Iconify API.
                    </div>
                </div>
            </div>`;

html = html.replace(regex, newIconPanel.trim());
fs.writeFileSync('logo.html', html);
