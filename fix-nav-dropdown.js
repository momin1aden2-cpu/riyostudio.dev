const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html', 'privacy.html', 'terms.html', 'disclaimer.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        const regex = /<div class="nav-dropdown-wrapper">[\s\S]*?<\/div>[\s\n]*<\/div>/;
        const replacement = '<a href="index.html#about" class="nav-link">About Us</a>\n          <a href="index.html#contact" class="nav-cta-btn" style="padding: 8px 16px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #10B981; font-weight: 500; transition: all 0.2s; margin-left: 12px; text-decoration: none;">Get in Touch</a>\n        </div>';
        
        content = content.replace(regex, replacement);
        fs.writeFileSync(file, content, 'utf8');
    }
});
