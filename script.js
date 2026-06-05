/* ================================================================
   RIYO STUDIO — Main Script
   Handles: Nav scroll, mobile menu, scroll animations, contact form
   ================================================================ */

(function () {
  'use strict';

  // Register Service Worker for Offline PWA Support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }).catch(err => {
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
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;
    if (document.getElementById('pwa-install-banner')) return;
    if (window.innerWidth > 900) return; // desktop only needs web

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';

    if (mode === 'ios') {
      banner.innerHTML = `
        <img src="assets/icon.png" class="pwa-icon" alt="Riyo Studio">
        <div class="pwa-text">
          <strong>Add to Home Screen</strong>
          <span>Tap <b style="color:#10B981">Share ↑</b> then "Add to Home Screen"</span>
        </div>
        <button id="pwa-dismiss-btn" aria-label="Dismiss">✕</button>
      `;
    } else {
      banner.innerHTML = `
        <img src="assets/icon.png" class="pwa-icon" alt="Riyo Studio">
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
        sessionStorage.setItem('pwa-banner-dismissed', '1');
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
    "%c RIYO STUDIO \n%c System Architecture Online. \n\n Welcome.",
    "font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 800; color: #10B981; text-shadow: 0 0 10px rgba(16,185,129,0.5);",
    "font-family: 'Inter', sans-serif; font-size: 14px; color: #A1A1AA;"
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

  // Context Dropdown Menu
  const navMenuBtn = document.getElementById('nav-menu-open');
  const navDropdown = document.getElementById('nav-dropdown');

  if (navMenuBtn && navDropdown) {
    navMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navDropdown.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target) && !navMenuBtn.contains(e.target)) {
        navDropdown.classList.remove('open');
      }
    });

    // Close when a link is clicked
    const menuLinks = navDropdown.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        navDropdown.classList.remove('open');
      });
    });
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

  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  const successMsg = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = new FormData(contactForm);
      submitBtn.textContent = '[ SENDING... ]';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (response.ok) {
            contactForm.reset();
            contactForm.style.display = 'none';
            successMsg.classList.add('show');
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          // Fallback: open mailto
          const name = formData.get('name') || '';
          const email = formData.get('email') || '';
          const message = formData.get('message') || '';
          const subject = encodeURIComponent('Contact from ' + name);
          const body = encodeURIComponent(
            'From: ' + name + ' (' + email + ')\n\n' + message
          );
          window.location.href =
            'mailto:info@riyostudio.dev?subject=' + subject + '&body=' + body;
        })
        .finally(function () {
          submitBtn.textContent = '[ SEND MESSAGE ]';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        });
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
  const cards = document.querySelectorAll('.product-card, .about-card, .premium-card');
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

  // Mobile Bottom Nav "More" Drawer Logic
  const moreBtn = document.getElementById('mobile-more-btn');
  const moreOverlay = document.getElementById('mobile-more-overlay');
  const moreDrawer = document.querySelector('.mobile-more-drawer');

  if (moreBtn && moreOverlay) {
    moreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      moreOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    });

    moreOverlay.addEventListener('click', function(e) {
      // Close if clicking outside the drawer
      if (e.target === moreOverlay) {
        moreOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Optional: Add swipe down to close
    let touchStartY = 0;
    if (moreDrawer) {
      moreDrawer.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
      }, {passive: true});
      moreDrawer.addEventListener('touchend', e => {
        const touchEndY = e.changedTouches[0].screenY;
        if (touchEndY - touchStartY > 50) { // Swipe down threshold
          moreOverlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      }, {passive: true});
    }
  }


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
  const scrollCards = document.querySelectorAll('.product-card, .about-card, .premium-card');
  
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
      const allCards = document.querySelectorAll('.product-card, .about-card, .premium-card');
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
          printLine(`<span style="color:var(--accent);">guest@riyostudio:~$</span> ${cmd}`);
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
              printLine(`cat: ${filename}: Permission denied or file not found`, 'error');
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
          printLine(' - RenterIQ: Live app for Australian renters');
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

  // Initialize once fully loaded to ensure dimensions are correct
  if (document.readyState === 'complete') {
    initPingingLights();
    initInteractiveTerminal();
  } else {
    window.addEventListener('load', () => {
      initPingingLights();
      initInteractiveTerminal();
    });
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
  toast.innerHTML = `<div class="riyo-toast-icon">${type === 'error' ? '⚠️' : '✅'}</div><div class="riyo-toast-msg">${message}</div><button class="riyo-toast-close">&times;</button>`;
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
// Real FPS Counter
const fpsEl = document.getElementById('fps-counter');
if (fpsEl) {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function updateFPS(now) {
        frameCount++;
        if (now - lastTime >= 1000) {
            fpsEl.textContent = frameCount + ' FPS';
            frameCount = 0;
            lastTime = now;
        }
        requestAnimationFrame(updateFPS);
    }
    requestAnimationFrame(updateFPS);
}

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

