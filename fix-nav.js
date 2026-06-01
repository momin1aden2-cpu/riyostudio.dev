const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// 1. nav-inner
css = css.replace(/\.nav-inner\s*\{[\s\S]*?padding:\s*0\s*24px;/g, (match) => {
    return match.replace('max-width: 1140px;', 'max-width: 100%;').replace('padding: 0 24px;', 'padding: 0 4vw;');
});

// 2. nav-brand-name
css = css.replace(/\.nav-brand-name\s*\{[\s\S]*?font-size:\s*17px;/g, (match) => {
    return match.replace('font-size: 17px;', 'font-size: 20px;');
});

// 3. nav-link
css = css.replace(/\.nav-link\s*\{[\s\S]*?font-size:\s*13\.5px;/g, (match) => {
    return match.replace('font-size: 13.5px;', 'font-size: 15px;');
});

// 4. nav-brand-icon-svg (Add this if not present to override inline style)
if (!css.includes('.nav-brand-icon-svg')) {
    css += `\n.nav-brand-icon-svg { width: 32px !important; height: 32px !important; }\n`;
}

// 5. nav-dropdown a
css = css.replace(/\.nav-dropdown a\s*\{[\s\S]*?font-size:\s*0\.95rem;/g, (match) => {
    return match.replace('font-size: 0.95rem;', 'font-size: 1rem;');
});

fs.writeFileSync('style.css', css, 'utf8');
