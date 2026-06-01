import os
import re

files = ["index.html", "forge.html", "scanner.html", "invoice.html", "qr.html", "privacy.html", "terms.html"]

with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

match = re.search(r'(<div class="nav-dropdown-wrapper">.*?</div>\s*</div>\s*</div>\s*</nav>)', index_html, re.DOTALL)
if match:
    nav_dropdown = match.group(1)
else:
    print("Could not find nav dropdown in index.html")
    exit(1)

for file in files:
    if os.path.exists(file):
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()
            
        if file in ["forge.html", "scanner.html", "invoice.html", "qr.html"]:
            content = re.sub(r'<div class="nav-dropdown-wrapper">.*?</div>\s*</div>\s*</div>\s*</nav>', nav_dropdown, content, flags=re.DOTALL)
            
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=15', content)
        content = re.sub(r'bg\.js\?v=\d+', 'bg.js?v=15', content)
        content = re.sub(r'script\.js\?v=\d+', 'script.js?v=15', content)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
print("Done")
