const fs = require('fs');

let html = fs.readFileSync('logo.html', 'utf8');

// The main grid container
const gridStart = '<div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px; align-items: start;">';
const newGridStart = '<div style="display: grid; grid-template-columns: 320px 1fr 340px; gap: 24px; align-items: start; max-width: 1800px; margin: 0 auto; width: 100%;">';

// We need to extract the parts that belong on the right side.
// Specifically:
// 1. <div id="object-properties" ...> to its closing div (it has several nested divs, so regex is tricky. We'll use string indexOf and matching tags or just replace exact strings)

// Since we know the exact structure, let's extract by exact blocks.

const objPropsRegex = /(<div id="object-properties"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/;
const objPropsMatch = html.match(objPropsRegex);
let objPropsHTML = "";
if (objPropsMatch) {
    objPropsHTML = objPropsMatch[1];
    html = html.replace(objPropsHTML, ""); // Remove from left panel
}

// Next is the Workspace Controls (Save/Load/Grid/Mockup) which is a div with display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;
const workspaceRegex = /(<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">[\s\S]*?<\/div>)/;
const workspaceMatch = html.match(workspaceRegex);
let workspaceHTML = "";
if (workspaceMatch) {
    workspaceHTML = workspaceMatch[1];
    html = html.replace(workspaceHTML, "");
}

// Next is Export button and private text
const exportRegex = /(<button id="logo-export-btn"[\s\S]*?100% Private - Rendered locally<\/p>)/;
const exportMatch = html.match(exportRegex);
let exportHTML = "";
if (exportMatch) {
    exportHTML = exportMatch[1];
    html = html.replace(exportHTML, "");
}

// Now we need to insert the canvas container AND the new right panel.
// Currently it is:
// Left Panel
// </div>
// <!-- Live Preview Canvas -->
// <div class="canvas-container"...>...</div>
// </div>

// We will find the canvas container
const canvasRegex = /(<!-- Live Preview Canvas -->[\s\S]*?<\/div>\s*<\/div>)/;
const canvasMatch = html.match(canvasRegex);
let canvasHTML = "";
if (canvasMatch) {
    canvasHTML = canvasMatch[1];
    html = html.replace(canvasHTML, "");
}

// Now we construct the new grid inside
html = html.replace(gridStart, newGridStart);

const rightPanelHTML = `
          <!-- Properties Panel (Right) -->
          <div class="properties-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 100px;">
            
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 8px;">
                <label style="display: block; font-size: 0.9rem; color: #10B981; margin-bottom: 12px; font-weight: bold;">⚙️ Workspace Controls</label>
                \${workspaceHTML}
            </div>

            \${objPropsHTML}

            <div style="flex-grow: 1;"></div> <!-- Spacer -->

            <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
                \${exportHTML}
            </div>
          </div>
`;

// Insert canvas and right panel back in, where canvas HTML ends with </div></div>, we just need to replace it correctly.
// The left panel ends with </div>.
// We will look for:
const leftPanelEndRegex = /<\/div>\s*<\/div>\s*<\/section>/;

// Wait, html is now:
// <div class="tool-panel"> ... </div> (left panel)
// </div> (end of grid)
// </section>

// Let's replace the end of grid with Canvas + Right Panel + end of grid
const targetEnd = "</div>\n    </section>";
html = html.replace(targetEnd, "\n" + canvasHTML.trim() + "\n" + rightPanelHTML + "\n        </div>\n    </section>");

fs.writeFileSync('logo.html', html);
console.log("HTML Restructured!");
