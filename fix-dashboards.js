const fs = require('fs');

// qr.html
let qrHtml = fs.readFileSync('qr.html', 'utf8');
qrHtml = qrHtml.replace(/\.qr-container\s*\{([^}]+)max-width:\s*1200px;/g, '.qr-container {-width: 100%;');
fs.writeFileSync('qr.html', qrHtml, 'utf8');

// invoice.html
let invHtml = fs.readFileSync('invoice.html', 'utf8');
invHtml = invHtml.replace(/\.invoice-container\s*\{([^}]+)max-width:\s*1400px;/g, '.invoice-container {-width: 100%;');
fs.writeFileSync('invoice.html', invHtml, 'utf8');

