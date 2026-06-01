const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');
html = html.replace('script src="bg.js?v=16"', 'script src="bg.js?v=17"');
html = html.replace('script src="script.js?v=20"', 'script src="script.js?v=21"');
html = html.replace('script src="logo.js?v=11"', 'script src="logo.js?v=14"');
fs.writeFileSync('logo.html', html);
