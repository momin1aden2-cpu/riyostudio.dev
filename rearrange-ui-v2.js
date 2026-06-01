const fs = require('fs');

let html = fs.readFileSync('logo.html', 'utf8');

const gridStartStr = '<div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px; align-items: start;">';
const newGridStartStr = '<div style="display: grid; grid-template-columns: 320px 1fr 340px; gap: 24px; align-items: start; max-width: 1800px; margin: 0 auto; width: 100%;">';

html = html.replace(gridStartStr, newGridStartStr);

// Extract object properties
const objStart = html.indexOf('<div id="object-properties"');
// finding the end of object properties is hard because of nested divs.
// But we know the next thing is <div class="form-group">\n              <label ...>Background Theme
const nextThing = html.indexOf('<div class="form-group">\n              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Background Theme</label>');

let objPropsHTML = html.substring(objStart, nextThing);
html = html.replace(objPropsHTML, '');

// Extract workspace tools
const workStartStr = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">';
const workStart = html.indexOf(workStartStr);
// The end of workspace tools is the line before `<button id="logo-export-btn"`
const expStart = html.indexOf('<button id="logo-export-btn"');

let workspaceHTML = html.substring(workStart, expStart);
html = html.replace(workspaceHTML, '');

// Extract Export Button and the paragraph after it
const exportAreaEndStr = '100% Private - Rendered locally</p>';
const expEnd = html.indexOf(exportAreaEndStr) + exportAreaEndStr.length;

let exportHTML = html.substring(expStart, expEnd);
html = html.replace(exportHTML, '');

// Also remove the spacer `<div style="height: 1px; background: var(--border); margin: 8px 0;"></div>`
html = html.replace('<div style="height: 1px; background: var(--border); margin: 8px 0;"></div>', '');

// Now, where do we put the right panel?
// It needs to go exactly AFTER the canvas container.
// The canvas container ends before `</div>\n      </div>\n    </section>`
// Let's find: `</canvas>\n            </div>\n          </div>`
const canvasEndStr = '</canvas>\n            </div>\n          </div>';
const canvasEndIdx = html.indexOf(canvasEndStr);

if (canvasEndIdx !== -1) {
    const insertIdx = canvasEndIdx + canvasEndStr.length;
    
    const rightPanelHTML = `
          <!-- Properties Panel (Right) -->
          <div class="properties-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 100px;">
            
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 8px;">
                <label style="display: block; font-size: 0.9rem; color: #10B981; margin-bottom: 12px; font-weight: bold;">⚙️ Workspace Controls</label>
                \${workspaceHTML}
            </div>

            \${objPropsHTML}

            <div style="flex-grow: 1;"></div>

            <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
                \${exportHTML}
            </div>
          </div>
`;

    html = html.substring(0, insertIdx) + "\n" + rightPanelHTML + html.substring(insertIdx);
} else {
    console.error("COULD NOT FIND CANVAS END!");
}

fs.writeFileSync('logo.html', html);
console.log("Successfully restructured!");
