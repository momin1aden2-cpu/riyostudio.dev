const fs = require('fs');
let html = fs.readFileSync('logo.html', 'utf8');

// Inject Google fonts for the Logo Maker
if (!html.includes('fonts.googleapis.com')) {
    html = html.replace(/<link rel="stylesheet" href="style\.css\?v=25">/, '<link rel="stylesheet" href="style.css?v=25">\n  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Space+Grotesk:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">');
    fs.writeFileSync('logo.html', html, 'utf8');
}
