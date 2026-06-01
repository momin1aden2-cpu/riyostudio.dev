const fs = require('fs');

// 1. Defer scripts
const htmlFiles = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html'];
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Add defer to script tags that don't have it
        content = content.replace(/<script(?![^>]*defer)([^>]*)src="([^"]+)"([^>]*)><\/script>/g, '<script="" defer></script>');
        fs.writeFileSync(file, content, 'utf8');
    }
});

// 2. Modify _headers
let headers = fs.readFileSync('_headers', 'utf8');
if (!headers.includes('Cache-Control')) {
    headers += \n/*\n  Cache-Control: public, max-age=31536000, immutable\n;
    fs.writeFileSync('_headers', headers, 'utf8');
}

// 3. Clean up sw.js empty fetch handler
let sw = fs.readFileSync('sw.js', 'utf8');
sw = sw.replace(/\/\/ Pass all requests directly to the network, doing nothing\.[\s\S]*self\.addEventListener\('fetch', \(e\) => \{[\s\S]*?\/\/ Bypassing cache completely to restore normal website functionality[\s\S]*?\}\);/g, '');
fs.writeFileSync('sw.js', sw, 'utf8');
