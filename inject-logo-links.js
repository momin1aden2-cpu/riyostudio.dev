const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html', 'disclaimer.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1. Add to navbar (insert after File Forge)
        const navRegex = /<a href="forge\.html" class="nav-link(.*?)">File Forge<\/a>/g;
        content = content.replace(navRegex, '<a href="forge.html" class="nav-link">File Forge</a>\n          <a href="logo.html" class="nav-link">Logo Maker</a>');

        // 2. Add to footer (insert after File Forge)
        const footerRegex = /<a href="forge\.html">File Forge<\/a>/g;
        content = content.replace(footerRegex, '<a href="forge.html">File Forge</a>\n            <a href="logo.html">Logo Maker <span style="font-size: 10px; background: rgba(16,185,129,0.1); color: #10B981; padding: 2px 6px; border-radius: 4px; margin-left: 4px; border: 1px solid rgba(16,185,129,0.2);">NEW</span></a>');

        fs.writeFileSync(file, content, 'utf8');
    }
});
