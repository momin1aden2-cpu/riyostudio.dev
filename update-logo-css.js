const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

css += `\n/* Logo Maker Specifics */
.icon-btn, .theme-btn {
  transition: all 0.2s ease;
}
.icon-btn:hover, .theme-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.icon-btn.active {
  background: rgba(16, 185, 129, 0.2) !important;
  border-color: #10B981 !important;
  color: #10B981 !important;
}
.theme-btn.active {
  border: 2px solid #10B981 !important;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
}
`;

fs.writeFileSync('style.css', css, 'utf8');
