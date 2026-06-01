const fs = require('fs');
let html = fs.readFileSync('logo.html.bak', 'utf8');

const oldGrid = '<div style="display: grid; grid-template-columns: 350px 1fr; gap: 24px; align-items: start;">';
const newGrid = '<div style="display: grid; grid-template-columns: 320px 1fr 340px; gap: 24px; align-items: start; max-width: 1800px; margin: 0 auto; width: 100%;">';
html = html.replace(oldGrid, newGrid);

// 1. Extract object properties
const objStart = html.indexOf('<div id="object-properties"');
const objEndStr = '<div class="form-group">\n              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Background Theme</label>';
let objPropsHTML = "";
let objEnd = html.indexOf(objEndStr);
if (objEnd !== -1) {
    objPropsHTML = html.substring(objStart, objEnd);
} else {
    const objEndStr2 = '<div class="form-group">\r\n              <label style="display: block; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">Background Theme</label>';
    objEnd = html.indexOf(objEndStr2);
    objPropsHTML = html.substring(objStart, objEnd);
}
html = html.replace(objPropsHTML, '');

// 2. Extract Workspace Controls
const workStart = html.indexOf('<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">');
const workEnd = html.indexOf('<button id="logo-export-btn"');
const workspaceHTML = html.substring(workStart, workEnd);
html = html.replace(workspaceHTML, '');

// 3. Extract Export
const expStart = html.indexOf('<button id="logo-export-btn"');
const expEndStr = '100% Private - Rendered locally</p>';
const expEnd = html.indexOf(expEndStr) + expEndStr.length;
const exportHTML = html.substring(expStart, expEnd);
html = html.replace(exportHTML, '');

// remove spacer
html = html.replace('<div style="height: 1px; background: var(--border); margin: 8px 0;"></div>\n', '');
html = html.replace('<div style="height: 1px; background: var(--border); margin: 8px 0;"></div>\r\n', '');

const match = html.match(/(<\/canvas>\s*<\/div>\s*<\/div>)/);
if (match) {
    const splitIndex = match.index + match[0].length;
    
    // NO ESCAPING DOLLAR SIGNS HERE!
    const rightPanelHTML = `
          <!-- Properties Panel (Right) -->
          <div class="properties-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 100px;">
            
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 8px;">
                <label style="display: block; font-size: 0.9rem; color: #10B981; margin-bottom: 12px; font-weight: bold;">⚙️ Workspace Controls</label>
                ${workspaceHTML}
            </div>

            ${objPropsHTML}

            <div style="flex-grow: 1;"></div>

            <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
                ${exportHTML}
            </div>
          </div>
`;
    
    html = html.substring(0, splitIndex) + "\n" + rightPanelHTML + html.substring(splitIndex);
    fs.writeFileSync('logo.html', html);
    console.log("FINAL FIX SUCCESSFUL!");
} else {
    console.log("CANVAS MATCH FAILED");
}
