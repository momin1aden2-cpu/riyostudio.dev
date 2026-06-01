const fs = require('fs');
let script = fs.readFileSync('script.js', 'utf8');

// Remove dropdown logic from script.js
const regex = /\/\/ Navigation Dropdown[\s\S]*?\}?\s*\}\);\s*\}\);/g;
script = script.replace(regex, '');

fs.writeFileSync('script.js', script, 'utf8');
