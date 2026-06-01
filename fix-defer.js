const fs = require('fs');
const files = ['index.html', 'forge.html', 'scanner.html', 'invoice.html', 'qr.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Add defer if not present, except for coi-serviceworker which might need synchronous execution
        content = content.replace(/<script(?![^>]*defer)([^>]*)src="([^"]+)"([^>]*)><\/script>/g, (match, p1, p2, p3) => {
            if (p2.includes('coi-serviceworker.js')) return match;
            return `<script${p1}src="${p2}" defer${p3}></script>`;
        });
        fs.writeFileSync(file, content, 'utf8');
    }
});
