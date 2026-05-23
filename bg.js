// bg.js - Logic Grid Background
(function () {
  'use strict';

  const canvas = document.getElementById('quantum-field');
  if (!canvas) return; // Null check for safety
  const ctx = canvas.getContext('2d', { alpha: false });

  // Matrix Digital Rain properties
  const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'.split('');
  const fontSize = 16;
  let columns = 0;
  let drops = [];
  let dropSpeeds = [];

  // -- Phantom Code Layer --------------------------------------------------
// Code fragment pool: real-looking JS / CSS / HTML / terminal snippets
const CODE_FRAGMENTS = [
  // JavaScript
  `async function resolve(ctx) {\n  await auth.validate(ctx.token);\n  return db.query(ctx.id);\n}`,
  `const [data, setData] = useState(null);\nuseEffect(() => {\n  fetch('/api/status').then(r => r.json())\n  .then(setData);\n}, []);`,
  `export const middleware = async (req, res, next) => {\n  const token = req.headers['x-api-key'];\n  if (!token) return res.status(401).end();\n  next();\n};`,
  `class EventEmitter {\n  emit(event, ...args) {\n    (this._listeners[event] || [])\n      .forEach(fn => fn(...args));\n  }\n}`,
  `const debounce = (fn, ms) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n};`,
  `router.get('/health', (req, res) => {\n  res.json({ status: 'ok',\n    uptime: process.uptime() });\n});`,
  `const schema = z.object({\n  email: z.string().email(),\n  role:  z.enum(['admin','user']),\n  id:    z.string().uuid(),\n});`,
  `await Promise.allSettled([\n  syncUserData(uid),\n  rebuildIndex(uid),\n  logEvent('session.start'),\n]);`,
  `if (import.meta.env.PROD) {\n  Sentry.init({ dsn: SENTRY_DSN,\n    tracesSampleRate: 0.2 });\n}`,
  `const pipeline = compose(\n  withAuth,\n  withRateLimit(100),\n  withCache(300),\n  handler\n);`,

  // CSS
  `.card {\n  backdrop-filter: blur(12px);\n  background: rgba(6,11,20,0.7);\n  border: 1px solid rgba(96,165,250,0.15);\n  border-radius: 12px;\n}`,
  `@keyframes fadeUp {\n  from { opacity: 0;\n         transform: translateY(16px); }\n  to   { opacity: 1;\n         transform: translateY(0); }\n}`,
  `:root {\n  --accent:  #3B82F6;\n  --surface: rgba(6,11,20,0.8);\n  --border:  rgba(96,165,250,0.12);\n  --radius:  10px;\n}`,
  `.grid {\n  display: grid;\n  grid-template-columns:\n    repeat(auto-fill, minmax(280px, 1fr));\n  gap: 1.5rem;\n}`,
  `@media (prefers-reduced-motion: no-preference) {\n  .reveal {\n    animation: fadeUp 0.6s ease\n               both;\n  }\n}`,
  `.btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 32px\n    rgba(59,130,246,0.25);\n  transition: all 0.2s ease;\n}`,

  // HTML
  `<section aria-labelledby="hero-title"\n  data-scroll-section>\n  <h1 id="hero-title" class="display">\n    Ship faster.\n  </h1>\n</section>`,
  `<meta name="viewport"\n  content="width=device-width,\n  initial-scale=1.0">\n<meta name="theme-color"\n  content="#060B14">`,
  `<link rel="preload" as="font"\n  href="/fonts/Inter.woff2"\n  crossorigin="anonymous">`,

  // Terminal / build output
  `>  build complete    847ms\n   ✓ 14 modules bundled\n   ✓ tree-shaken  -38kb\n   ✓ gzip  62kb -> 18kb`,
  `$ git push origin main\n  Enumerating objects: 9, done.\n  Writing objects: 100%\n  Branch main -> HEAD`,
  `[INFO]  server listening :8080\n[AUDIT] rate-limit active\n[DB]    pool  size=10  idle=8\n[CACHE] redis connected  0ms`,
  `PASS  auth.test.ts    (1.2s)\nPASS  api.test.ts     (0.8s)\nPASS  schema.test.ts  (0.4s)\nTest Suites: 3 passed`,
  `Lighthouse\n  Performance   98\n  Accessibility 100\n  Best Practice 100\n  SEO           100`,
  `✓ SSL/TLS grade     A+\n✓ HSTS preloaded\n✓ CSP configured\n✓ Headers score   A+`,
];

const phantomFragments = [];
const MAX_PHANTOM = 6; // max simultaneously visible
let phantomSpawnTimer = 0;
const PHANTOM_SPAWN_INTERVAL = 40; // frames between spawns (faster)

class PhantomFragment {
  constructor() {
    this.reset();
  }

  reset() {
    // Pick a random snippet
    const raw = CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)];
    this.lines = raw.split('\n');

    // Random position — keep away from edges
    const margin = 60;
    this.x = margin + Math.random() * (width  - margin * 2 - 220);
    this.y = margin + Math.random() * (height - margin * 2 - this.lines.length * 16);

    // Lifecycle: fade-in -> hold -> fade-out
    this.fadeInDuration  = 30 + Math.random() * 30; // Faster fade in
    this.holdDuration    = 180 + Math.random() * 220;
    this.fadeOutDuration = 60 + Math.random() * 40;
    this.totalLife = this.fadeInDuration + this.holdDuration + this.fadeOutDuration;
    this.age = 0;

    // Visual properties
    this.fontSize   = 10 + Math.floor(Math.random() * 4); // 10–13px
    this.maxAlpha   = 0.35 + Math.random() * 0.25;       // 0.35–0.60 (much more visible)
    this.colorTint  = Math.random() > 0.35 ? 'azure' : 'mint'; // azure or mint
    this.alive = true;
  }

  getAlpha() {
    if (this.age < this.fadeInDuration) {
      return (this.age / this.fadeInDuration) * this.maxAlpha;
    }
    const holdEnd = this.fadeInDuration + this.holdDuration;
    if (this.age < holdEnd) {
      return this.maxAlpha;
    }
    const fadeProgress = (this.age - holdEnd) / this.fadeOutDuration;
    return (1 - fadeProgress) * this.maxAlpha;
  }

  update() {
    this.age++;
    if (this.age >= this.totalLife) this.alive = false;
  }

  draw(ctx) {
    const alpha = this.getAlpha();
    if (alpha <= 0) return;

    // Colour: Electric Azure or pale Mint to match palette
    const colour = this.colorTint === 'azure'
      ? `rgba(96, 165, 250, ${alpha})`
      : `rgba(52, 211, 153, ${alpha})`;

    ctx.save();
    ctx.font = `${this.fontSize}px 'Courier New', monospace`;
    ctx.fillStyle = colour;
    ctx.textBaseline = 'top';

    // Draw each line
    const lineHeight = this.fontSize * 1.65;
    for (let i = 0; i < this.lines.length; i++) {
      ctx.fillText(this.lines[i], this.x, this.y + i * lineHeight);
    }
    ctx.restore();
  }
}

function updatePhantoms() {
  // Tick existing fragments
  for (let i = phantomFragments.length - 1; i >= 0; i--) {
    phantomFragments[i].update();
    if (!phantomFragments[i].alive) {
      phantomFragments.splice(i, 1);
    }
  }

  // Spawn new fragments
  phantomSpawnTimer++;
  if (phantomSpawnTimer >= PHANTOM_SPAWN_INTERVAL &&
      phantomFragments.length < MAX_PHANTOM) {
    phantomSpawnTimer = 0;
    // Stagger spawning — only add one at a time
    if (Math.random() < 0.7) {
      phantomFragments.push(new PhantomFragment());
    }
  }
}

function drawPhantoms() {
  for (const frag of phantomFragments) {
    frag.draw(ctx);
  }
}
// -- End Phantom Code Layer ----------------------------------------------

let width, height;
const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
let lastWidth = 0;
let time = 0;
let mouseSpeed = 0;

const nodes = [];
const nodeCount = 150; 

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initNodes();
  
  // Recalculate Matrix columns
  columns = Math.floor(width / fontSize) + 1;
  drops = [];
  dropSpeeds = [];
  for (let x = 0; x < columns; x++) {
    drops[x] = Math.random() * -100; // Start off-screen
    dropSpeeds[x] = Math.random() * 0.5 + 0.5; // Random speed between 0.5 and 1.0
  }
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

let isCanvasPaused = false;
document.addEventListener('visibilitychange', () => {
  isCanvasPaused = document.hidden;
});

function animate() {
  requestAnimationFrame(animate);
  if (isCanvasPaused) return;

  // Render Digital Rain if Matrix Mode is active
  if (document.body.classList.contains('matrix-mode')) {
    ctx.fillStyle = 'rgba(6, 11, 20, 0.15)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px "JetBrains Mono", monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      
      const isHead = Math.random() > 0.95;
      
      ctx.shadowBlur = isHead ? 15 : 0;
      ctx.shadowColor = '#10B981';
      ctx.fillStyle = isHead ? '#FFF' : '#10B981';
      
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      ctx.shadowBlur = 0;

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
        dropSpeeds[i] = Math.random() * 0.5 + 0.5;
      }
      
      drops[i] += dropSpeeds[i];
    }
    return;
  }

  // Standard Logic Grid rendering
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

  // Phantom code fragments — drawn under the node/trace layer
  updatePhantoms();
  drawPhantoms();

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

})();
