const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html', 'disclaimer.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/style\.css\?v=\d+/g, 'style.css?v=25');
        fs.writeFileSync(file, content, 'utf8');
    }
});
