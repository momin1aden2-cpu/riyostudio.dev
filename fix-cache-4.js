const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // bump cache version
        content = content.replace(/script\.js\?v=19/g, 'script.js?v=20');
        fs.writeFileSync(file, content, 'utf8');
    }
});
