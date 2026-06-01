const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /(<a href="forge\.html" class="tool-card"[\s\S]*?<\/a>)/;
const replacement = `$1\n\n          <a href="logo.html" class="tool-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; text-decoration: none; display: flex; flex-direction: column; transition: all 0.3s ease;">\n            <div style="font-size: 2rem; margin-bottom: 12px;">✨</div>\n            <h3 style="color: var(--text-main); font-size: 1.2rem; margin-bottom: 8px;">Logo Maker <span style="font-size: 10px; background: rgba(16,185,129,0.1); color: #10B981; padding: 2px 6px; border-radius: 4px; margin-left: 4px; border: 1px solid rgba(16,185,129,0.2); vertical-align: middle;">NEW</span></h3>\n            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0; line-height: 1.5;">Design premium, 100% private, pro-grade logos and brand assets entirely in your browser.</p>\n          </a>`;

content = content.replace(regex, replacement);
fs.writeFileSync('index.html', content, 'utf8');
