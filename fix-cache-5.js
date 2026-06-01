const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // bump cache version
        content = content.replace(/style\.css\?v=\d+/g, 'style.css?v=23');
        fs.writeFileSync(file, content, 'utf8');
    }
});
