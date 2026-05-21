// bg.js - Quantum Field Background
const canvas = document.getElementById('quantum-field');
const ctx = canvas.getContext('2d', { alpha: true });

let width, height;
let particles = [];
const mouse = { x: -1000, y: -1000, radius: 180 };
const particleCount = 120;
const connectionDistance = 140;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseout', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.baseRadius = Math.random() * 1.5 + 0.5;
    this.color = Math.random() > 0.5 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(27, 80, 200, 0.4)';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    // Mouse interaction - repel slightly
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (mouse.radius - distance) / mouse.radius;
      
      this.x -= forceDirectionX * force * 2;
      this.y -= forceDirectionY * force * 2;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function init() {
  particles = [];
  const count = window.innerWidth < 768 ? 60 : particleCount; // fewer on mobile
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Connect to other particles
    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < connectionDistance) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 - distance / connectionDistance * 0.15})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
    
    // Connect to mouse
    const mdx = particles[i].x - mouse.x;
    const mdy = particles[i].y - mouse.y;
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
    
    if (mDist < mouse.radius) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(27, 80, 200, ${0.3 - mDist / mouse.radius * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
  }
}

init();
animate();
