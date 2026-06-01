const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Make container fluid, avoid double fluid
        content = content.replace(/class="container"/g, 'class="container fluid"');
        
        // Bump css version
        content = content.replace(/style\.css\?v=17/g, 'style.css?v=18');
        content = content.replace(/style\.css\?v=16/g, 'style.css?v=18');
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
