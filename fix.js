const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html'];

let indexHtml = fs.readFileSync('index.html', 'utf8');
let match = indexHtml.match(/(<div class="nav-dropdown-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/nav>)/);

if (!match) {
    console.error("Could not find nav dropdown");
    process.exit(1);
}
let navDropdown = match[1];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (['forge.html', 'scanner.html', 'invoice.html', 'qr.html'].includes(file)) {
            content = content.replace(/<div class="nav-dropdown-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/nav>/, navDropdown);
        }
        
        content = content.replace(/style\.css\?v=\d+/g, 'style.css?v=16');
        content = content.replace(/bg\.js\?v=\d+/g, 'bg.js?v=16');
        content = content.replace(/script\.js\?v=\d+/g, 'script.js?v=16');
        
        fs.writeFileSync(file, content, 'utf8');
    }
});
