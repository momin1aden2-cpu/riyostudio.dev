const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

// Increase panel widths
html = html.replace(
  'grid-template-columns: 320px 1fr 340px;', 
  'grid-template-columns: 360px 1fr 360px;'
);

// Increase panel padding
html = html.replace(
  '<div class="tool-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px;">',
  '<div class="tool-panel" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; gap: 28px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">'
);

html = html.replace(
  '<div class="properties-panel" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 100px;">',
  '<div class="properties-panel" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; display: flex; flex-direction: column; gap: 28px; position: sticky; top: 100px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">'
);

// Enhance AI Generator
html = html.replace(
  '<label style="display: block; font-size: 0.9rem; color: #a78bfa; margin-bottom: 8px; font-weight: bold;">🪄 AI Auto-Generator</label>',
  '<label style="display: block; font-size: 1.05rem; color: #a78bfa; margin-bottom: 12px; font-weight: bold;">🪄 AI Auto-Generator</label>'
);
html = html.replace(
  'padding: 10px; border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.5); background: rgba(0,0,0,0.5); color: #fff; font-size: 0.9rem;',
  'padding: 12px; border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.5); background: rgba(0,0,0,0.5); color: #fff; font-size: 1.0rem;'
);
html = html.replace(
  'padding: 10px 16px; background: #8b5cf6; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;',
  'padding: 12px 20px; background: #8b5cf6; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.0rem; white-space: nowrap;'
);

// Enhance Main Creation Buttons
html = html.replace(
  /font-size: 0.9rem;/g, 
  'font-size: 1.0rem;'
);
html = html.replace(
  /<span style="font-size: 1.1rem;">T<\/span>/g,
  '<span style="font-size: 1.3rem;">T</span>'
);
html = html.replace(
  /<span style="font-size: 1.1rem;">✨<\/span>/g,
  '<span style="font-size: 1.3rem;">✨</span>'
);
html = html.replace(
  /<span style="font-size: 1.1rem;">🖼️<\/span>/g,
  '<span style="font-size: 1.3rem;">🖼️</span>'
);

// Workspace Controls Header
html = html.replace(
  '<label style="display: block; font-size: 1.0rem; color: #10B981; margin-bottom: 12px; font-weight: bold;">⚙️ Workspace Controls</label>',
  '<label style="display: block; font-size: 1.05rem; color: #10B981; margin-bottom: 16px; font-weight: bold;">⚙️ Workspace Controls</label>'
);
html = html.replace( // Catch the original 0.9rem if not replaced by regex above
  '<label style="display: block; font-size: 0.9rem; color: #10B981; margin-bottom: 12px; font-weight: bold;">⚙️ Workspace Controls</label>',
  '<label style="display: block; font-size: 1.05rem; color: #10B981; margin-bottom: 16px; font-weight: bold;">⚙️ Workspace Controls</label>'
);

// Selected Element Header
html = html.replace(
  '<span style="font-size: 0.85rem; color: #10B981; font-family: \'JetBrains Mono\'; text-transform: uppercase;">Selected Element</span>',
  '<span style="font-size: 0.95rem; color: #10B981; font-family: \'JetBrains Mono\'; text-transform: uppercase; font-weight: bold;">Selected Element</span>'
);
html = html.replace(
  'font-size: 1.2rem;" title="Delete Object">🗑️</button>',
  'font-size: 1.4rem;" title="Delete Object">🗑️</button>'
);

// Typography dropdown
html = html.replace(
  'font-size: 1.0rem; cursor: pointer;">',
  'font-size: 1.1rem; cursor: pointer;">'
);

fs.writeFileSync('logo.html', html);
console.log('UI panels enhanced!');
