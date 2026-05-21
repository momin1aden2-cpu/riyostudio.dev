// bg.js - Logic Grid Background
const canvas = document.getElementById('quantum-field');
const ctx = canvas.getContext('2d', { alpha: false });

let width, height;
const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
let lastWidth = 0;
let time = 0;
let mouseSpeed = 0;

const nodes = [];
const nodeCount = 150; 

function resize() {
  if (window.innerWidth === lastWidth && width !== undefined) return;
  lastWidth = window.innerWidth;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight + 100;
  initNodes();
}
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  // Calculate velocity
  if (mouse.targetX !== -1000) {
    const dist = Math.sqrt(Math.pow(e.clientX - mouse.targetX, 2) + Math.pow(e.clientY - mouse.targetY, 2));
    mouseSpeed = dist;
  }
  
  mouse.targetX = e.clientX;
  mouse.targetY = e.clientY;
  
  if (mouse.x === -1000) {
    mouse.x = mouse.targetX;
    mouse.y = mouse.targetY;
  }
});

window.addEventListener('mouseout', () => {
  mouse.targetX = -1000;
  mouse.targetY = -1000;
});

class LogicNode {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
    this.cluster = Math.floor(Math.random() * 5);
    this.flash = 0; // Intensity

    // Status Indicators
    this.hasLED = Math.random() < 0.12; // Assignment ratio
    this.ledOn = false;
    this.ledTimer = Math.random() * 100;
    // Colors
    this.ledColor = Math.random() > 0.5 ? 'rgba(52, 211, 153, 0.95)' : 'rgba(96, 165, 250, 0.95)';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Decay
    if (this.flash > 0) {
      this.flash -= 0.04;
    }
    
    // Background spikes
    if (Math.random() < 0.0005) {
      this.flash = 1.0;
    }

    // Toggle indicators
    if (this.hasLED) {
      this.ledTimer -= 1;
      if (this.ledTimer <= 0) {
        this.ledOn = !this.ledOn;
        // Timing
        this.ledTimer = this.ledOn ? (Math.random() * 40 + 5) : (Math.random() * 300 + 100);
      }
    }
  }
}

function initNodes() {
  nodes.length = 0;
  const count = window.innerWidth < 768 ? 60 : nodeCount;
  for (let i = 0; i < count; i++) {
    nodes.push(new LogicNode());
  }
}

resize();

function animate() {
  requestAnimationFrame(animate);
  time += 0.008;

  // Decay mouse speed
  mouseSpeed *= 0.9;

  // Velocity-based trigger
  if (mouseSpeed > 5 && Math.random() < 0.2) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    randomNode.flash = 1.2; // Spike
  }

  // Smooth mouse tracking
  if (mouse.targetX !== -1000) {
    mouse.x += (mouse.targetX - mouse.x) * 0.12;
    mouse.y += (mouse.targetY - mouse.y) * 0.12;
  } else {
    mouse.x = -1000;
  }

  // Background clear
  ctx.fillStyle = '#060B14';
  ctx.fillRect(0, 0, width, height);

  // Interaction shade
  if (mouse.x !== -1000) {
    const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 350);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.12)'); 
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Scanner effect
  const scanWidth = 350;
  const sweepCycle = (time * 600) % (width + scanWidth * 2); 
  const scanX = sweepCycle - scanWidth;

  for (let i = 0; i < nodes.length; i++) {
    nodes[i].update();
    const p1 = nodes[i];

    const dx = p1.x - mouse.x;
    const dy = p1.y - mouse.y;
    const distToMouse = Math.sqrt(dx * dx + dy * dy);
    const distToScan = Math.abs(p1.x - scanX);

    // Calculate aggregate intensity
    let glowMultiplier = p1.flash; 
    
    if (distToMouse < 250) {
      glowMultiplier += (1 - distToMouse / 250) * 0.7;
    }
    
    if (distToScan < scanWidth) {
      glowMultiplier += Math.pow(1 - distToScan / scanWidth, 2) * 0.8;
    }

    glowMultiplier = Math.min(glowMultiplier, 1);

    const r = Math.floor(90 + (96 - 90) * glowMultiplier);
    const g = Math.floor(100 + (165 - 100) * glowMultiplier);
    const b = Math.floor(120 + (250 - 120) * glowMultiplier);
    const nodeAlpha = 0.25 + (glowMultiplier * 0.75); 

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${nodeAlpha})`;
    ctx.fillRect(p1.x - 2, p1.y - 2, 4, 4);

    // Draw indicators
    if (p1.hasLED && p1.ledOn) {
      ctx.fillStyle = p1.ledColor;
      ctx.fillRect(p1.x - 1, p1.y - 1, 2, 2); // Core
      
      // Halo
      ctx.fillStyle = p1.ledColor.replace('0.95)', '0.2)');
      ctx.fillRect(p1.x - 2, p1.y - 2, 4, 4);
    }

    for (let j = i + 1; j < nodes.length; j++) {
      const p2 = nodes[j];
      const dist = Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y); 

      if (dist < 220) {
        if (p1.cluster === p2.cluster || dist < 80) {
          
          let p2Glow = p2.flash;
          const d2Mouse = Math.sqrt(Math.pow(p2.x - mouse.x, 2) + Math.pow(p2.y - mouse.y, 2));
          const d2Scan = Math.abs(p2.x - scanX);
          
          if (d2Mouse < 250) p2Glow += (1 - d2Mouse / 250) * 0.7;
          if (d2Scan < scanWidth) p2Glow += Math.pow(1 - d2Scan / scanWidth, 2) * 0.8;
          p2Glow = Math.min(p2Glow, 1);

          const maxGlow = Math.max(glowMultiplier, p2Glow);
          
          const lr = Math.floor(90 + (96 - 90) * maxGlow);
          const lg = Math.floor(100 + (165 - 100) * maxGlow);
          const lb = Math.floor(120 + (250 - 120) * maxGlow);
          
          const lineAlpha = 0.12 + (maxGlow * 0.68);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${lr}, ${lg}, ${lb}, ${lineAlpha})`;
          ctx.lineWidth = 1.5; 
          
          ctx.moveTo(p1.x, p1.y);
          if ((i + j) % 2 === 0) {
            ctx.lineTo(p2.x, p1.y);
          } else {
            ctx.lineTo(p1.x, p2.y);
          }
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }
}

animate();
