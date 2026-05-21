// bg.js - Data Grid Canvas Background
const canvas = document.getElementById('quantum-field');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
// Mouse with easing
const mouse = { x: -1000, y: -1000, targetX: window.innerWidth/2, targetY: window.innerHeight/2 };
let time = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
});

window.addEventListener('mouseout', () => {
  mouse.targetX = -1000;
  mouse.targetY = -1000;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  time += 0.005; // Gentle data flow

  // Smooth mouse interpolation
  mouse.x += (mouse.targetX - mouse.x) * 0.08;
  mouse.y += (mouse.targetY - mouse.y) * 0.08;

  // Clear with a slight fade for very subtle motion trails
  ctx.fillStyle = 'rgba(10, 10, 12, 0.4)';
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'lighter';

  // Grid Configuration
  const gridSize = 50; 
  const cols = Math.ceil(width / gridSize) + 2;
  const rows = Math.ceil(height / gridSize) + 2;

  // We will store the projected points to draw lines efficiently
  const points = [];

  for (let y = 0; y < rows; y++) {
    points[y] = [];
    for (let x = 0; x < cols; x++) {
      // Base cartesian coordinates
      const baseX = (x - 1) * gridSize;
      const baseY = (y - 1) * gridSize;

      // Calculate wave offset
      const wave = Math.sin(x * 0.2 + time * 1.5) * Math.cos(y * 0.2 - time) * 12;
      
      // Mouse interaction
      const dx = mouse.x - baseX;
      const dy = mouse.y - baseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 280;
      
      let warpX = 0;
      let warpY = 0;

      if (dist < maxDist) {
        // Calculate repulsion force
        const force = Math.pow(1 - dist / maxDist, 2);
        warpX = (dx / dist) * force * -45;
        warpY = (dy / dist) * force * -45;
      }

      points[y][x] = {
        x: baseX + warpX,
        y: baseY + wave + warpY,
        active: dist < maxDist ? (1 - dist/maxDist) : 0
      };
    }
  }

  // Draw grid connections
  ctx.lineWidth = 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const p = points[y][x];

      // Base color
      let r = 50, g = 40, b = 100, a = 0.15;

      // Active state color
      if (p.active > 0) {
        r = Math.floor(50 + (0 - 50) * p.active);
        g = Math.floor(40 + (212 - 40) * p.active);
        b = Math.floor(100 + (255 - 100) * p.active);
        a = 0.15 + (p.active * 0.5);
      }

      // Draw horizontal line to the right
      if (x < cols - 1) {
        const right = points[y][x + 1];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(right.x, right.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.stroke();
      }

      // Draw vertical line downwards
      if (y < rows - 1) {
        const down = points[y + 1][x];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(down.x, down.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.stroke();
      }
      
      // Draw intersection node
      if (p.active > 0.15) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.active * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.active})`;
        ctx.fill();
      }
    }
  }

  ctx.globalCompositeOperation = 'source-over';
}

animate();
