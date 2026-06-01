const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Add to navbar
const navRegex = /<a href="forge\.html" class="nav-link(.*?)">File Forge<\/a>/g;
content = content.replace(navRegex, '<a href="forge.html" class="nav-link$1">File Forge</a>\n          <a href="logo.html" class="nav-link">Logo Maker</a>');

// 2. Add to footer
const footerRegex = /<a href="forge\.html">File Forge<\/a>/g;
content = content.replace(footerRegex, '<a href="forge.html">File Forge</a>\n            <a href="logo.html">Logo Maker <span style="font-size: 10px; background: rgba(16,185,129,0.1); color: #10B981; padding: 2px 6px; border-radius: 4px; margin-left: 4px; border: 1px solid rgba(16,185,129,0.2);">NEW</span></a>');

fs.writeFileSync('index.html', content, 'utf8');
