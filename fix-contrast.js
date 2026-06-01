const fs = require('fs');

// 1. Update style.css
let style = fs.readFileSync('style.css', 'utf8');
style = style.replace(/--text-dim: rgba\(255, 255, 255, 0\.70\);/g, '--text-dim: rgba(255, 255, 255, 0.85);');
style = style.replace(/--text-faint: rgba\(255, 255, 255, 0\.40\);/g, '--text-faint: rgba(255, 255, 255, 0.65);');
style = style.replace(/--text-muted: rgba\(255, 255, 255, 0\.25\);/g, '--text-muted: rgba(255, 255, 255, 0.50);');
fs.writeFileSync('style.css', style, 'utf8');

// 2. Update HTML files
const htmlFiles = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html', 'disclaimer.html'];
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Fix inline footers
        content = content.replace(/rgba\(255,255,255,0\.3\)/g, 'rgba(255,255,255,0.6)');
        // Bump cache
        content = content.replace(/style\.css\?v=\d+/g, 'style.css?v=24');
        fs.writeFileSync(file, content, 'utf8');
    }
});
