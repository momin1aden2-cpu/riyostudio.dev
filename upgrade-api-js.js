const fs = require('fs');
let js = fs.readFileSync('logo.js', 'utf8');

// 1. Change display toggle from 'grid' to 'flex'
js = js.replace(
    "iconPanel.style.display = iconPanel.style.display === 'none' ? 'grid' : 'none';",
    "iconPanel.style.display = iconPanel.style.display === 'none' ? 'flex' : 'none';"
);

// 2. We remove the old static libIconBtns binding.
// The old block looks like:
/*
  libIconBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        ...
        canvas.add(shape); canvas.setActiveObject(shape); canvas.renderAll();
      });
      iconPanel.style.display = 'none';
    });
  });
*/
// It's safer to just inject the new API logic somewhere because libIconBtns won't match anything anyway, so it's a no-op.
// But to be clean, let's inject the API logic right before addTextBtn.addEventListener('click', addText);
const apiInjectionPoint = "addTextBtn.addEventListener('click', addText);";
const apiLogic = `
  const iconSearchInput = document.getElementById('icon-search-input');
  const iconSearchBtn = document.getElementById('icon-search-btn');
  const iconSearchResults = document.getElementById('icon-search-results');

  if (iconSearchBtn && iconSearchInput && iconSearchResults) {
      iconSearchBtn.addEventListener('click', async () => {
          const query = iconSearchInput.value.trim();
          if (!query) return;
          
          iconSearchResults.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #fff;">Searching...</div>';
          
          try {
              const res = await fetch(\`https://api.iconify.design/search?query=\${encodeURIComponent(query)}&limit=24\`);
              const data = await res.json();
              
              if (!data.icons || data.icons.length === 0) {
                  iconSearchResults.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #ef4444;">No icons found.</div>';
                  return;
              }
              
              iconSearchResults.innerHTML = '';
              
              data.icons.forEach(iconName => {
                  const btn = document.createElement('button');
                  btn.style.cssText = 'background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px; cursor: pointer; aspect-ratio: 1/1; display: flex; align-items: center; justify-content: center;';
                  
                  // Construct preview image URL
                  const [prefix, name] = iconName.split(':');
                  const img = document.createElement('img');
                  img.src = \`https://api.iconify.design/\${prefix}/\${name}.svg?color=white\`;
                  img.style.width = '100%';
                  img.style.height = '100%';
                  btn.appendChild(img);
                  
                  btn.addEventListener('click', async () => {
                      try {
                          const svgRes = await fetch(\`https://api.iconify.design/\${prefix}/\${name}.svg\`);
                          const svgText = await svgRes.text();
                          
                          fabric.loadSVGFromString(svgText, (objects, options) => {
                              const obj = fabric.util.groupSVGElements(objects, options);
                              obj.set({
                                  left: canvas.width / 2,
                                  top: canvas.height / 2,
                                  originX: 'center',
                                  originY: 'center',
                                  fill: '#ffffff',
                                  scaleX: 100 / (obj.width || 100),
                                  scaleY: 100 / (obj.height || 100)
                              });
                              canvas.add(obj);
                              canvas.setActiveObject(obj);
                              canvas.renderAll();
                              iconPanel.style.display = 'none';
                          });
                      } catch (err) {
                          console.error("Failed to load SVG", err);
                      }
                  });
                  iconSearchResults.appendChild(btn);
              });
              
          } catch (err) {
              console.error(err);
              iconSearchResults.innerHTML = '<div style="grid-column: span 4; text-align: center; color: #ef4444;">API Error</div>';
          }
      });
      
      // Trigger search on Enter key
      iconSearchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') iconSearchBtn.click();
      });
  }
`;

js = js.replace(apiInjectionPoint, apiLogic + "\n  " + apiInjectionPoint);

fs.writeFileSync('logo.js', js);
