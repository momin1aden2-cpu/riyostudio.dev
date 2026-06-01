const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');
html = html.replace('logo.js?v=12', 'logo.js?v=13');
fs.writeFileSync('logo.html', html);
