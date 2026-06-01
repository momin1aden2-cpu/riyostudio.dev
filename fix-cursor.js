const fs = require('fs');

// 1. Clean HTML files
const htmlFiles = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html'];
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/<!-- Custom Cursor -->[\s\n]*<div class="custom-cursor-dot" id="cursor-dot"><\/div>[\s\n]*<div class="custom-cursor-ring" id="cursor-ring"><\/div>/g, '');
        // bump cache version
        content = content.replace(/style\.css\?v=18/g, 'style.css?v=19');
        content = content.replace(/script\.js\?v=16/g, 'script.js?v=19');
        fs.writeFileSync(file, content, 'utf8');
    }
});

// 2. Clean style.css
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(/\/\* Cursor override \*\/[\s\S]*?body\s*\{\s*cursor:\s*none;\s*\/\* Hide default cursor \*\/\s*\}/g, '');
css = css.replace(/\/\* Ensure links also hide default cursor \*\/[\s\S]*?a,\s*button,\s*input,\s*textarea,\s*\.nav-brand\s*\{\s*cursor:\s*none\s*!important;\s*\}/g, '');
css = css.replace(/\.custom-cursor-dot\s*\{[\s\S]*?\}\s*\.custom-cursor-ring\s*\{[\s\S]*?\}\s*\/\* Hover state for cursor \*\/[\s\S]*?\.custom-cursor-dot\.hover\s*\{[\s\S]*?\}\s*\.custom-cursor-ring\.hover\s*\{[\s\S]*?\}/g, '');
fs.writeFileSync('style.css', css, 'utf8');
