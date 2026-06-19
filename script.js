/* ================================================================
   RIYO STUDIO — Main Script
   Handles: Nav scroll, mobile menu, scroll animations, contact form
   ================================================================ */

(function () {
  'use strict';

  // Escape values before they go anywhere near innerHTML. Used for anything
  // derived from user input or file contents (filenames, typed commands,
  // error messages) so a crafted string can't inject markup.
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Register Service Worker for Offline PWA Support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('ServiceWorker registration failed: ', err);
      });
    });
  }

  // ── PWA Install Prompt ──────────────────────────────────────────
  let _deferredInstallPrompt = null;

  // Detect iOS Safari (no beforeinstallprompt support)
  const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;

  function showInstallBanner(mode) {
    // mode: 'android' = native prompt available, 'ios' = manual instructions
    if (isInStandaloneMode) return; // already installed
    if (localStorage.getItem('pwa-banner-dismissed')) return; // remember the dismissal across visits
    if (document.getElementById('pwa-install-banner')) return;
    if (window.innerWidth > 900) return; // desktop only needs web

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';

    if (mode === 'ios') {
      banner.innerHTML = `
        <img src="assets/icon.svg?v=2" class="pwa-icon" alt="Riyo Studio">
        <div class="pwa-text">
          <strong>Add to Home Screen</strong>
          <span>Tap <b style="color:#10B981">Share ↑</b> then "Add to Home Screen"</span>
        </div>
        <button id="pwa-dismiss-btn" aria-label="Dismiss">✕</button>
      `;
    } else {
      banner.innerHTML = `
        <img src="assets/icon.svg?v=2" class="pwa-icon" alt="Riyo Studio">
        <div class="pwa-text">
          <strong>Add Riyo Studio to Home Screen</strong>
          <span>Instant access · Works offline · No app store</span>
        </div>
        <button id="pwa-install-btn">Install</button>
        <button id="pwa-dismiss-btn" aria-label="Dismiss">✕</button>
      `;
    }

    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('visible'), 1500);

    const dismissBtn = document.getElementById('pwa-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        banner.classList.remove('visible');
        localStorage.setItem('pwa-banner-dismissed', '1');
        setTimeout(() => banner.remove(), 400);
      });
    }

    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn && _deferredInstallPrompt) {
      installBtn.addEventListener('click', () => {
        banner.classList.remove('visible');
        _deferredInstallPrompt.prompt();
        _deferredInstallPrompt.userChoice.then(() => {
          _deferredInstallPrompt = null;
        });
      });
    }
  }

  // Android / Chrome — intercept the native prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredInstallPrompt = e;
    window._pwaPrompt = e; // also store globally for early capture
    showInstallBanner('android');
  });

  // Fallback: event may have fired before this script loaded (captured early in <head>)
  document.addEventListener('DOMContentLoaded', () => {
    if (window._pwaPrompt && !_deferredInstallPrompt) {
      _deferredInstallPrompt = window._pwaPrompt;
      showInstallBanner('android');
    }
  });

  // iOS Safari — show manual instructions
  if (isIos && !isInStandaloneMode) {
    window.addEventListener('load', () => {
      setTimeout(() => showInstallBanner('ios'), 2000);
    });
  }
  // ───────────────────────────────────────────────────────────────

  // Global Error Tracker for Diagnostics
  window._sysErrors = [];
  window.addEventListener('error', (e) => { window._sysErrors.push(e.message || 'Unknown Error'); });
  window.addEventListener('unhandledrejection', (e) => { window._sysErrors.push(e.reason || 'Unhandled Promise'); });
  
  // Wrap fetch to catch 404s and 500s silently for diagnostics
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      if (!response.ok) {
        window._sysErrors.push(`HTTP ${response.status} on ${args[0]}`);
      }
      return response;
    } catch (err) {
      window._sysErrors.push(`Network Error on ${args[0]}`);
      throw err;
    }
  };

  // Console Greeting
  console.log(
    "%cRiyo Studio\n%c100% client-side tools — your files never leave your browser.",
    "font-family: 'Inter', sans-serif; font-size: 26px; font-weight: 800; color: #10B981;",
    "font-family: 'Inter', sans-serif; font-size: 13px; color: #A1A1AA;"
  );




  // Nav scroll state
  const nav = document.getElementById('main-nav');

  function updateNavScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  // Scroll-triggered reveal animations
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth',
        });
      }
    });
  });

  // Contact — copy email address to clipboard
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', function () {
      const email = copyEmailBtn.dataset.email || '';
      const done = function () {
        const original = copyEmailBtn.textContent;
        copyEmailBtn.textContent = 'Copied ✓';
        setTimeout(function () { copyEmailBtn.textContent = original; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {});
      }
    });
  }

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + id) {
              link.style.color = 'var(--text)';
            } else {
              link.style.color = '';
            }
          });
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '-68px 0px 0px 0px',
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // -- Logic extensions --
  // Spotlight tracking
  const cards = document.querySelectorAll('.premium-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Magnetic interactions
  const magneticButtons = document.querySelectorAll('.nav-cta-btn, .product-link');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const h = rect.width / 2;
      const v = rect.height / 2;
      
      // Calculate cursor distance from center of button
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - v;
      
      // Apply transform (reduce strength with multiplier)
      this.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0px, 0px)';
      // Add a slight transition when snapping back
      this.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      setTimeout(() => { this.style.transition = 'transform 0.2s, box-shadow 0.25s'; }, 300);
    });
  });

  // Command palette logic
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-input');
  const cmdOptions = document.querySelectorAll('.cmd-option');
  let selectedIndex = 0;

  if (cmdPalette) {
    // Open on Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCmdPalette();
      }
      
      if (cmdPalette.classList.contains('active')) {
        if (e.key === 'Escape') closeCmdPalette();
        if (e.key === 'ArrowDown') navigateCmd(1);
        if (e.key === 'ArrowUp') navigateCmd(-1);
        if (e.key === 'Enter') executeCmd();
      }
    });

    const mobileCmdBtn = document.getElementById('nav-mobile-cmd');
    if (mobileCmdBtn) {
      mobileCmdBtn.addEventListener('click', openCmdPalette);
    }

    const mobileCmdFab = document.getElementById('mobile-cmd-fab');
    if (mobileCmdFab) {
      mobileCmdFab.addEventListener('click', openCmdPalette);
    }



    function openCmdPalette() {
      cmdPalette.classList.add('active');
      cmdInput.value = '';
      if (window.innerWidth > 768) {
        cmdInput.focus();
      }
      filterOptions('');
      document.body.style.overflow = 'hidden';
      // Reset cursor so they can see where they are clicking if needed
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorRing) cursorRing.style.opacity = '0';
    }

    function closeCmdPalette() {
      cmdPalette.classList.remove('active');
      document.body.style.overflow = '';
      if (cursorDot) cursorDot.style.opacity = '1';
      if (cursorRing) cursorRing.style.opacity = '1';
    }

    // Close on overlay click
    cmdPalette.addEventListener('click', (e) => {
      if (e.target === cmdPalette) closeCmdPalette();
    });

    // Filter typing
    cmdInput.addEventListener('input', (e) => {
      filterOptions(e.target.value.toLowerCase());
    });

    function filterOptions(query) {
      let visibleCount = 0;
      cmdOptions.forEach((opt, index) => {
        const text = opt.innerText.toLowerCase();
        if (text.includes(query)) {
          opt.style.display = 'block';
          if (visibleCount === 0) {
            updateSelection(index);
          }
          visibleCount++;
        } else {
          opt.style.display = 'none';
        }
      });
    }

    function navigateCmd(direction) {
      let newIndex = selectedIndex + direction;
      const visibleOptions = Array.from(cmdOptions).filter(opt => opt.style.display !== 'none');
      
      if (visibleOptions.length === 0) return;
      
      const currentVisibleIndex = visibleOptions.indexOf(cmdOptions[selectedIndex]);
      let nextVisibleIndex = currentVisibleIndex + direction;
      
      if (nextVisibleIndex >= visibleOptions.length) nextVisibleIndex = 0;
      if (nextVisibleIndex < 0) nextVisibleIndex = visibleOptions.length - 1;
      
      const nextElement = visibleOptions[nextVisibleIndex];
      const actualIndex = Array.from(cmdOptions).indexOf(nextElement);
      updateSelection(actualIndex);
    }

    function updateSelection(index) {
      cmdOptions.forEach(opt => opt.classList.remove('selected'));
      if (cmdOptions[index]) {
        cmdOptions[index].classList.add('selected');
        selectedIndex = index;
      }
    }
    function executeCmd() {
      const selectedOpt = cmdOptions[selectedIndex];
      if (!selectedOpt || selectedOpt.style.display === 'none') return;
      
      const action = selectedOpt.getAttribute('data-action');
      const target = selectedOpt.getAttribute('data-target');
      
      closeCmdPalette();
      
      if (action === 'scroll') {
        const targetEl = document.querySelector(target);
        if (targetEl) {
          const navHeight = nav.offsetHeight;
          const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: targetPos, behavior: 'smooth' });
        }
      }
    }
    
    // Click on option
    cmdOptions.forEach((opt, index) => {
      opt.addEventListener('mouseenter', () => updateSelection(index));
      opt.addEventListener('click', executeCmd);
    });
  }

  // Scroll velocity calculation
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  
  // Cache cards to prevent massive DOM thrashing inside the scroll loop
  const scrollCards = document.querySelectorAll('.premium-card');
  
  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) return; // Disable on mobile to fix touch-inertia bugs

    // Calculate velocity
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    
    // Clamp velocity to prevent extreme skew
    const maxSkew = 5; // degrees
    let skewValue = scrollVelocity * 0.05;
    skewValue = Math.max(-maxSkew, Math.min(maxSkew, skewValue));
    
    // Apply skew to cached cards
    scrollCards.forEach(card => {
      // Preserve hover scale/transform by adding it to the skew
      if (!card.matches(':hover')) {
        card.style.transform = `skewY(${skewValue}deg)`;
      }
    });
  }, { passive: true });

  // Reset skew when scrolling stops
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const allCards = document.querySelectorAll('.premium-card');
      allCards.forEach(card => {
        if (!card.matches(':hover')) {
          card.style.transform = `skewY(0deg)`;
        }
      });
    }, 50);
  }, { passive: true });

  // Pinging Lights (Ethernet life effect)
  function initPingingLights() {
    const numLights = 25; // Increased number of pinging nodes
    // Network activity colors (Vibrant Red and Bright Blue)
    const colors = ['#FF3366', '#00AAFF', '#FF0033', '#3B82F6']; 
    
    const container = document.createElement('div');
    container.id = 'pinging-lights-container';
    document.body.appendChild(container);

    const updateMaxDimensions = () => {
      return {
        w: document.documentElement.scrollWidth || document.body.scrollWidth,
        h: document.documentElement.scrollHeight || document.body.scrollHeight
      };
    };

    for (let i = 0; i < numLights; i++) {
      const light = document.createElement('div');
      light.className = 'ping-light';
      container.appendChild(light);
      
      const updatePosition = () => {
        const dims = updateMaxDimensions();
        const x = Math.random() * (dims.w - 20);
        const y = Math.random() * (dims.h - 20);
        light.style.left = `${x}px`;
        light.style.top = `${y}px`;
        light.style.color = colors[Math.floor(Math.random() * colors.length)];
        light.style.backgroundColor = 'currentColor';
      };
      
      updatePosition();
      
      // Erratic Ethernet-like blink pattern
      const blink = () => {
        light.style.animation = 'none';
        void light.offsetWidth; // Force DOM reflow to restart animation
        
        // Fast packet transfer simulation
        const duration = 20 + Math.random() * 120;
        light.style.animation = `ping-flash ${duration}ms ease-out`;
        
        // Determine time until next blink
        // 30% chance for a 'burst' of packets (very short delay)
        const isBurst = Math.random() > 0.7;
        const nextBlink = isBurst ? (20 + Math.random() * 80) : (500 + Math.random() * 4000);
        
        setTimeout(blink, nextBlink);
      };
      
      // Move lights occasionally (every 15s to 45s)
      setInterval(updatePosition, 15000 + Math.random() * 30000);
      
      // Initial startup stagger
      setTimeout(blink, Math.random() * 3000);
    }
  }

  // Interactive Terminal
  function initInteractiveTerminal() {
    const overlay = document.getElementById('interactive-terminal');
    const openBtns = document.querySelectorAll('.terminal-trigger');
    const closeBtn = document.getElementById('terminal-close-btn');
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    if (!overlay || !closeBtn || !input || !output) return;

    function printLine(text, className = '') {
      const line = document.createElement('div');
      line.className = `terminal-line ${className}`;
      line.innerHTML = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(() => input.focus(), 100);
      });
    });

    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) {
          printLine(`<span style="color:var(--accent);">guest@riyostudio:~$</span> ${escapeHtml(cmd)}`);
          processCommand(cmd);
        }
        input.value = '';
      }
    });

    function processCommand(cmd) {
      const args = cmd.toLowerCase().split(' ');
      const main = args[0];

      switch(main) {
        case 'help':
          printLine('Available commands:');
          printLine('  help        - Show this message');
          printLine('  whoami      - Display current user context');
          printLine('  clear       - Clear terminal output');
          printLine('  github      - Run GitHub live telemetry fetch');
          printLine('  projects    - List active projects');
          printLine('  diagnostics - Run system health diagnostics');
          printLine('  cat         - Read file contents (e.g., cat index.html)');
          printLine('  ping        - Send ICMP ECHO_REQUEST to network hosts');
          printLine('  matrix      - Toggle the Matrix scramble effect');
          printLine('  exit        - Close the terminal');
          printLine('  sudo        - Attempt root access');
          break;
        case 'cat':
          if (args.length < 2) {
            printLine('Usage: cat [filename]');
            printLine('Available files: index.html, script.js, style.css');
          } else {
            const filename = args[1];
            if (['index.html', 'script.js', 'style.css'].includes(filename)) {
              printLine(`Reading ${filename}...`);
              fetch(filename)
                .then(res => {
                  if (!res.ok) throw new Error('File not found');
                  return res.text();
                })
                .then(text => {
                  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                  const pre = document.createElement('pre');
                  pre.style.cssText = "color: var(--text-dim); margin: 10px 0; max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.5); padding: 10px; border-left: 2px solid var(--accent); font-size: 0.85em; white-space: pre-wrap; word-wrap: break-word;";
                  pre.innerHTML = escaped;
                  document.getElementById('terminal-output').appendChild(pre);
                  document.getElementById('terminal-output').scrollTop = document.getElementById('terminal-output').scrollHeight;
                })
                .catch(err => {
                  printLine(`[ERROR] Could not read ${filename}: ${err.message}`, 'error');
                });
            } else {
              printLine(`cat: ${escapeHtml(filename)}: Permission denied or file not found`, 'error');
            }
          }
          break;
        case 'whoami':
          printLine('guest (unprivileged access)', 'warning');
          break;
        case 'clear':
          output.innerHTML = '';
          break;
        case 'github':
          printLine('GitHub telemetry is currently disabled.');
          printLine('You can view the source code for this site here: <a href="https://github.com/momin1aden2-cpu/riyostudio.dev" target="_blank" style="color:var(--accent);">riyostudio.dev</a>');
          break;
        case 'projects':
          printLine('ACTIVE DEPLOYMENTS:');
          printLine(' - ShiftCore: Roster management platform');
          printLine(' - ShiftCore: FIFO worker management app');
          break;
        case 'diagnostics':
          printLine('Initializing system diagnostics...');
          setTimeout(() => {
            overlay.classList.remove('active');
            if (window.runSystemDiagnostics) {
              window.runSystemDiagnostics();
            }
          }, 400);
          break;
        case 'exit':
          overlay.classList.remove('active');
          break;
        case 'ping':
          if (args.length < 2) {
            printLine('Usage: ping [hostname]');
          } else {
            const hostname = args[1];
            printLine(`Pinging ${hostname} with 32 bytes of data:`);
            
            fetch(`https://cloudflare-dns.com/dns-query?name=${hostname}&type=A`, {
              headers: { 'Accept': 'application/dns-json' }
            })
            .then(res => res.json())
            .then(data => {
              if (data.Status !== 0 || !data.Answer || data.Answer.length === 0) {
                // If it fails, fallback to a pseudo-random IP based on string length to simulate success
                throw new Error('Fallback to pseudo-IP');
              }
              startPingSequence(data.Answer[0].data);
            })
            .catch(err => {
              // Fallback for adblockers/firewalls blocking DoH endpoints
              const hash = Array.from(hostname).reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const fakeIp = `${(hash % 200) + 10}.${(hash * 2 % 200) + 10}.${(hash * 3 % 200) + 10}.${(hash * 4 % 200) + 10}`;
              startPingSequence(fakeIp);
            });
            
            function startPingSequence(ip) {
              let pings = 0;
              const maxPings = 4;
              let times = [];
              
              function doPing() {
                if (pings >= maxPings) {
                  printLine('');
                  printLine(`<br><span style="color:#10b981; font-weight:bold;">[ SECURE UPLINK SUMMARY ]</span>`);
                  printLine(`&nbsp;&nbsp;> Target Node: <span style="color:#f59e0b;">${ip}</span>`);
                  printLine(`&nbsp;&nbsp;> Payloads: Dispatched = ${maxPings} | Injected = ${maxPings} | Intercepted = 0 (0% packet loss)`);
                  const min = Math.min(...times);
                  const max = Math.max(...times);
                  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
                  printLine(`&nbsp;&nbsp;> Quantum Latency Analysis:`);
                  printLine(`&nbsp;&nbsp;&nbsp;&nbsp;Peak Efficiency: ${min}ms | Max Delay: ${max}ms | Average Flow: ${avg}ms`);
                  return;
                }
                const time = Math.floor(Math.random() * 30) + 14;
                times.push(time);
                const hackerPhrases = [
                  "Bypassing mainframe firewall...",
                  "Establishing quantum handshake...",
                  "Decrypting remote node...",
                  "Syncing with orbital satellite...",
                  "Injecting root payload...",
                  "Routing through secure proxy..."
                ];
                const phrase = hackerPhrases[Math.floor(Math.random() * hackerPhrases.length)];
                printLine(`<span style="color:#0ea5e9;">[+] ${phrase}</span><br>&nbsp;&nbsp;&nbsp;> Secure link to <span style="color:#f59e0b;">${ip}</span> | Time: ${time}ms | Payload: 32 bytes | TTL: 117`);
                pings++;
                setTimeout(doPing, 1000);
              }
              setTimeout(doPing, 500);
            }
          }
          break;
        case 'matrix':
          if (window.toggleMatrixMode) {
            const isMatrix = window.toggleMatrixMode();
            if (isMatrix) {
              printLine('Matrix mode engaged.', 'success');
              printLine('Warning: UI stability may be compromised.', 'warning');
            } else {
              printLine('Matrix mode disengaged. Normalizing UI...', 'success');
            }
          }
          break;
        case 'sudo':
          printLine('nice try. this incident will be reported.', 'error');
          break;
        default:
          printLine(`Command not found: ${main}. Type 'help' for a list of commands.`, 'error');
      }
    }
  }

  // The ambient "ethernet" lights are a homepage flourish — they create 25
  // animated nodes on timers, which is wasted work on the focused tool pages.
  const page = (location.pathname || '').split('/').pop().toLowerCase();
  const isHome = page === '' || page === 'index' || page === 'index.html';

  function initDecor() {
    if (isHome) initPingingLights();
    initInteractiveTerminal(); // no-ops on pages without the terminal element
  }

  if (document.readyState === 'complete') {
    initDecor();
  } else {
    window.addEventListener('load', initDecor);
  }

})();

// --- GLOBAL TOAST SYSTEM ---
window.showToast = function(message, type = 'error') {
  let container = document.getElementById('riyo-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'riyo-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'riyo-toast ' + type;
  toast.innerHTML = `<div class="riyo-toast-icon">${type === 'error' ? '⚠️' : '✅'}</div><div class="riyo-toast-msg"></div><button class="riyo-toast-close">&times;</button>`;
  toast.querySelector('.riyo-toast-msg').textContent = message;
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  
  const removeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  };
  
  toast.querySelector('.riyo-toast-close').onclick = removeToast;
  setTimeout(() => { if (toast.parentNode) removeToast(); }, 5000);
};

  // Newsletter form handling
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = form.querySelector('.newsletter-submit-btn');
      const success = form.querySelector('.newsletter-success');
      const inputWrap = form.querySelector('div[style*="display: flex;"]');

      const formData = new FormData(form);
      btn.textContent = 'SENDING...';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      }).then(res => {
        if (res.ok) {
          inputWrap.style.display = 'none';
          success.style.display = 'block';
        } else {
          throw new Error('Failed');
        }
      }).catch(err => {
        if (window.showToast) window.showToast('Submission failed. Please check your connection.', 'error');
        btn.textContent = 'SUBSCRIBE';
        btn.disabled = false;
      });
    });
  });

/* ================================================================
   SMART REVIEW PROMPT
   Counts real "uses" (a file/export download anywhere on the site)
   and, after a few, shows ONE gentle dismissible toast inviting a
   review. Never nags: snoozes when dismissed, and stops for good
   once a review has been submitted. All state lives in localStorage.
   ================================================================ */
(function () {
  'use strict';

  var USES_BEFORE_PROMPT = 3;
  var DAY = 86400000;
  var path = location.pathname.replace(/\/$/, '');
  if (path === '/reviews' || path === '/admin-reviews') return; // never prompt on these

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  if (get('riyoReviewDone') === '1') return;

  var lastCount = 0;
  // Count a use at most once per ~2s so a multi-file export (e.g. a panorama
  // that fires several downloads) still counts as a single use.
  function trackUse() {
    var now = Date.now();
    if (now - lastCount < 2000) return;
    lastCount = now;
    var n = (parseInt(get('riyoUseCount'), 10) || 0) + 1;
    set('riyoUseCount', String(n));
    maybeShow(n);
  }

  // Detect downloads site-wide without touching any tool: our tools trigger
  // saves via a temporary <a download> appended to the body and clicked.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[download]');
    if (a) trackUse();
  }, true);
  // Tools can also opt in for precision: window.dispatchEvent(new Event('riyo:used'))
  window.addEventListener('riyo:used', trackUse);

  var shown = false;
  function maybeShow(n) {
    if (shown) return;
    if (n < USES_BEFORE_PROMPT) return;
    var snooze = parseInt(get('riyoReviewSnoozeUntil'), 10) || 0;
    if (Date.now() < snooze) return;
    shown = true;
    set('riyoReviewSnoozeUntil', String(Date.now() + 7 * DAY)); // showing once buys 7 days of quiet
    render();
  }

  function snoozeFor(days) {
    set('riyoReviewSnoozeUntil', String(Date.now() + days * DAY));
    dismiss();
  }

  var el = null;
  function dismiss() {
    if (!el) return;
    el.style.transform = 'translateY(140%)';
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); el = null; }, 320);
  }

  function render() {
    el = document.createElement('div');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Leave a review');
    el.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:20px', 'transform:translateY(140%)',
      'z-index:99999', 'width:min(420px,calc(100vw - 32px))',
      'background:rgba(10,14,22,0.92)', 'backdrop-filter:blur(16px)', '-webkit-backdrop-filter:blur(16px)',
      'border:1px solid rgba(16,185,129,0.35)', 'border-radius:14px',
      'box-shadow:0 16px 50px rgba(0,0,0,0.6)', 'padding:16px 18px',
      'font-family:Inter,system-ui,sans-serif', 'color:#e8edf3',
      'transition:transform .32s cubic-bezier(.2,.8,.2,1)', 'margin-left:calc(min(420px,calc(100vw - 32px)) / -2)'
    ].join(';');
    el.innerHTML =
      '<button aria-label="Dismiss" id="riyo-rv-x" style="position:absolute;top:8px;right:10px;background:none;border:none;color:#7c8da0;font-size:18px;cursor:pointer;line-height:1;">&times;</button>' +
      '<div style="display:flex;align-items:flex-start;gap:12px;">' +
        '<div style="font-size:22px;line-height:1.2;">⭐</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:700;margin-bottom:2px;">Enjoying Riyo Studio?</div>' +
          '<div style="font-size:0.86rem;color:#9fb3c8;line-height:1.45;">If it saved you time, a quick review really helps. Takes 20 seconds — no sign-up.</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">' +
            '<button id="riyo-rv-go" style="background:#10B981;color:#04140d;font-weight:700;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:0.85rem;">Leave a review</button>' +
            '<button id="riyo-rv-later" style="background:transparent;color:#9fb3c8;border:1px solid rgba(255,255,255,0.18);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:0.85rem;">Maybe later</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.style.transform = 'translateY(0)'; });

    var tool = (path.split('/')[1] || '').trim();
    el.querySelector('#riyo-rv-go').addEventListener('click', function () {
      location.href = '/reviews?tool=' + encodeURIComponent(tool) + '#write';
    });
    el.querySelector('#riyo-rv-later').addEventListener('click', function () { snoozeFor(7); });
    el.querySelector('#riyo-rv-x').addEventListener('click', function () { snoozeFor(30); });
  }
})();

/* ================================================================
   REVIEW WIDGETS — renders the homepage social-proof strip and any
   per-tool mini-walls from a single /api/reviews fetch. Add a host
   element to a page and this fills (or removes) it:
     <section class="rv-sec" data-reviews-strip></section>
     <section class="rv-sec" data-reviews-tool="forge"></section>
   Sections with no reviews remove themselves, so nothing looks empty.
   ================================================================ */
(function () {
  'use strict';
  var strip = document.querySelector('[data-reviews-strip]');
  var toolHosts = Array.prototype.slice.call(document.querySelectorAll('[data-reviews-tool]'));
  var ratingEls = Array.prototype.slice.call(document.querySelectorAll('[data-reviews-rating]'));
  if (!strip && !toolHosts.length && !ratingEls.length) return;

  var TOOL_NAMES = { scanner: 'Mockup Studio', forge: 'File Forge', qr: 'QR Hub', invoice: 'Invoice Maker', logo: 'Logo Maker', video: 'Video Studio' };
  function toolName(s) { return TOOL_NAMES[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function starHTML(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>'; return s; }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; } }
  function hashOf(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function avatar(name) {
    var label = name ? esc(name.trim().charAt(0).toUpperCase()) : '★';
    var h = hashOf(name || 'anon'), h1 = h % 360, h2 = (h1 + 42) % 360;
    return '<div class="rv-av" style="background:linear-gradient(135deg,hsl(' + h1 + ',62%,46%),hsl(' + h2 + ',68%,38%))">' + label + '</div>';
  }
  function card(r, withChip) {
    var who = r.name ? esc(r.name) : 'Anonymous';
    var chip = (withChip && r.tool) ? '<span class="rv-chip">' + esc(toolName(r.tool)) + '</span>' : '';
    return '<article class="rv-card">' +
      '<div class="rv-quote">&#8221;</div>' +
      '<div class="rv-stars">' + starHTML(r.rating) + '</div>' +
      '<p class="rv-body">' + esc(r.body) + '</p>' +
      '<div class="rv-foot">' + avatar(r.name) +
        '<div class="rv-who"><span class="rv-name">' + who + '</span><span class="rv-date">' + esc(fmtDate(r.created_at)) + '</span></div>' +
        chip +
      '</div></article>';
  }

  function renderStrip(host, data, all) {
    if (!data.count || !all.length) { host.remove(); return; }
    var base = all.slice(0, 12);
    while (base.length < 8) base = base.concat(all); // fill so the marquee looks full
    var half = base.map(function (r) { return card(r, true); }).join('');
    host.innerHTML =
      '<div class="container">' +
        '<div class="rv-sec-head">' +
          '<h2>Loved by makers who ship</h2>' +
          '<div class="rv-sub"><span class="rv-stars">' + starHTML(Math.round(data.average)) + '</span> ' +
            '<strong style="color:#fff;">' + (data.average || 0).toFixed(1) + '</strong> · ' + data.count + ' reviews</div>' +
        '</div>' +
        '<div class="rv-strip"><div class="rv-track">' + half + half + '</div></div>' +
        '<div style="text-align:center;"><a class="rv-more" href="/reviews">Read all reviews →</a></div>' +
      '</div>';
  }

  function renderTool(host, all) {
    var tool = host.getAttribute('data-reviews-tool');
    var items = all.filter(function (r) { return (r.tool || '') === tool; });
    if (!items.length) { host.remove(); return; }
    var avg = Math.round((items.reduce(function (s, r) { return s + r.rating; }, 0) / items.length) * 10) / 10;
    var cards = items.slice(0, 6).map(function (r) { return card(r, false); }).join('');
    host.innerHTML =
      '<div class="container">' +
        '<div class="rv-sec-head">' +
          '<h2>What makers say about ' + esc(toolName(tool)) + '</h2>' +
          '<div class="rv-sub"><span class="rv-stars">' + starHTML(Math.round(avg)) + '</span> ' +
            '<strong style="color:#fff;">' + avg.toFixed(1) + '</strong> · ' + items.length + ' review' + (items.length === 1 ? '' : 's') + '</div>' +
        '</div>' +
        '<div class="rv-wall">' + cards + '</div>' +
        '<div style="text-align:center;"><a class="rv-more" href="/reviews?tool=' + encodeURIComponent(tool) + '">Read more →</a></div>' +
      '</div>';
  }

  fetch('/api/reviews', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var all = data.reviews || [];
      if (strip) renderStrip(strip, data, all);
      toolHosts.forEach(function (h) { renderTool(h, all); });
      if (data.count) ratingEls.forEach(function (el) { el.textContent = (data.average || 0).toFixed(1) + ' · Reviews'; });
    })
    .catch(function () { if (strip) strip.remove(); toolHosts.forEach(function (h) { h.remove(); }); });
})();

