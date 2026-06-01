const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Remove max-width from hero-tools-grid
indexHtml = indexHtml.replace(/max-width:\s*800px;/g, 'max-width: 100%;');

// Bump cache to force refresh
indexHtml = indexHtml.replace(/style\.css\?v=21/g, 'style.css?v=22');

fs.writeFileSync('index.html', indexHtml, 'utf8');
