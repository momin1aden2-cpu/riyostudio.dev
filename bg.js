// bg.js - Premium Ambient Mesh & Mouse Glow
(function () {
  'use strict';

  const canvas = document.getElementById('quantum-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });

  let width, height;
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  // A subtle floating orb that drifts around
  let orb = { x: width / 2, y: height / 2, angle: 0 };

  // Cap this decorative backdrop at ~30fps and stop it when the tab is hidden,
  // so it never competes with the active tool for the main thread.
  let rafId = null;
  let lastFrame = 0;
  const FRAME_MS = 1000 / 30;

  function animate(now) {
    rafId = requestAnimationFrame(animate);
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Orb drift
    orb.angle += 0.005;
    orb.x = (width / 2) + Math.cos(orb.angle) * (width * 0.2);
    orb.y = (height / 2) + Math.sin(orb.angle * 1.5) * (height * 0.2);

    // Base background color (deep cyber navy)
    ctx.fillStyle = '#060B14';
    ctx.fillRect(0, 0, width, height);

    // Draw mouse glow
    const mouseGradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 600);
    mouseGradient.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
    mouseGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = mouseGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw ambient floating orb glow
    const orbGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, 800);
    orbGradient.addColorStop(0, 'rgba(59, 130, 246, 0.05)'); // Soft blue glow
    orbGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = orbGradient;
    ctx.fillRect(0, 0, width, height);
  }

  function start() { if (rafId === null) { lastFrame = 0; rafId = requestAnimationFrame(animate); } }
  function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
})();
