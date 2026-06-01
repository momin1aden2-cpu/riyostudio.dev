const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/style\.css\?v=16/g, 'style.css?v=17');
        fs.writeFileSync(file, content, 'utf8');
    }
});
