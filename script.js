/* ================================================================
   RIYO STUDIO — Main Script
   Handles: Nav scroll, mobile menu, scroll animations, contact form
   ================================================================ */

(function () {
  'use strict';

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
    "%c RIYO STUDIO \n%c System Architecture Online. \n\n Looking under the hood? I respect that. \n Try pressing Ctrl+K and typing 'sudo'.",
    "font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 800; color: #10B981; text-shadow: 0 0 10px rgba(16,185,129,0.5);",
    "font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #A1A1AA;"
  );



  // Terminal Preloader
  const bootSequence = document.getElementById('boot-sequence');
  if (bootSequence) {
    const start = Date.now();
    document.fonts.ready.then(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 600 - elapsed); // Ensure at least 600ms boot sequence
      setTimeout(() => {
        bootSequence.classList.add('done');
        setTimeout(() => bootSequence.remove(), 500);
      }, remaining);
    });
  }

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

  // Mobile menu
  const mobileOpenBtn = document.getElementById('nav-mobile-open');
  const mobileCloseBtn = document.getElementById('nav-mobile-close');
  const mobileOverlay = document.getElementById('nav-mobile-overlay');

  function openMobile() {
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileOpenBtn.addEventListener('click', openMobile);
  mobileCloseBtn.addEventListener('click', closeMobile);

  // Close on overlay background click
  mobileOverlay.addEventListener('click', function (e) {
    if (e.target === mobileOverlay) closeMobile();
  });

  // Close on link click
  mobileOverlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobile);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileOverlay.classList.contains('open')) {
      closeMobile();
    }
  });

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
  const cards = document.querySelectorAll('.product-card, .about-card');
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

  // Custom cursor
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isHovering = false;

  if (cursorDot && cursorRing) {
    // Hide default cursor globally
    document.body.style.cursor = 'none';

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Instantly move the dot
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    // Smooth follow for the ring
    function renderCursor() {
      // Ease the ring towards the mouse
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover states for links and buttons
    const hoverElements = document.querySelectorAll('a, button, input, textarea');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover');
        cursorRing.classList.add('hover');
        isHovering = true;
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover');
        cursorRing.classList.remove('hover');
        isHovering = false;
      });
    });
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
    window.runSystemDiagnostics = function() {
        const diagContainer = document.createElement('div');
        diagContainer.id = 'diag-overlay';
        diagContainer.style.cssText = "height: 100dvh; width: 100vw; display: flex; flex-direction: column; background: #000; color: #10B981; font-family: 'JetBrains Mono', monospace; font-size: clamp(12px, 3vw, 18px); padding: clamp(20px, 5vw, 40px); z-index: 999999; position: fixed; top: 0; left: 0; overflow-y: auto; overflow-x: hidden; text-align: left; box-sizing: border-box; cursor: crosshair;";
        diagContainer.innerHTML = `
          <div id="diag-content"></div>
          <div id="diag-cursor" style="margin-top: 10px;">> <span class="cursor">_</span></div>
        `;
        document.body.appendChild(diagContainer);
        
        const content = document.getElementById('diag-content');
        
        const domNodes = document.querySelectorAll('*').length;
        let loadTimeStr = 'OPTIMIZED';
        if (window.performance && window.performance.timing) {
          const t = window.performance.timing;
          const loadMs = t.domContentLoadedEventEnd - t.navigationStart;
          if (loadMs > 0) loadTimeStr = loadMs + 'ms';
        }
        
        const isSecure = window.isSecureContext ? 'VERIFIED' : 'UNVERIFIED';
        const proto = location.protocol.toUpperCase().replace(':', '');
        
        const isBot = navigator.webdriver || /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
        const botStatus = isBot ? '<span style="color:#ef4444">[WARNING] BOT_ACTIVITY_DETECTED</span>' : 'NEGATIVE (HUMAN_VERIFIED)';
        
        const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';

        let hitCountStr = 'FETCHING...';
        fetch('https://api.counterapi.dev/v1/riyostudio/hits/up')
          .then(res => res.json())
          .then(data => {
            if (data && data.count) hitCountStr = data.count.toLocaleString();
            else hitCountStr = 'UNAVAILABLE';
            
            const updateUI = setInterval(() => {
              const el = document.getElementById('diag-hit-count');
              if (el) { el.innerText = hitCountStr; clearInterval(updateUI); }
            }, 50);
          })
          .catch(() => {
            hitCountStr = 'OFFLINE';
            const updateUI = setInterval(() => {
              const el = document.getElementById('diag-hit-count');
              if (el) { el.innerText = hitCountStr; clearInterval(updateUI); }
            }, 50);
          });

        let uptimeDataStr = 'FETCHING...';
        let pingStr = 'FETCHING...';
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
          uptimeDataStr = '[ LOCAL DEV / PROXY OFFLINE ]';
          pingStr = 'UNAVAILABLE';
          const updateUI = setInterval(() => {
            const el = document.getElementById('diag-uptime-val');
            const pel = document.getElementById('diag-ping-val');
            if (el && pel) { 
              el.innerText = uptimeDataStr; 
              pel.innerText = pingStr;
              clearInterval(updateUI); 
            }
          }, 50);
        } else {
          fetch('/api/uptime')
            .then(res => res.json())
            .then(data => {
              if (data.status) {
                const ratio = data.uptimeRatio !== "N/A" ? ` (${data.uptimeRatio}% 30-Day)` : '';
                uptimeDataStr = `${data.status}${ratio}`;
                pingStr = `${data.latestPing} (Avg: ${data.averagePing})`;
              } else if (data.error && data.error.includes("SERVER_UNCONFIGURED")) {
                uptimeDataStr = '[ AWAITING API KEY IN CLOUDFLARE ]';
                pingStr = '[ AWAITING API KEY IN CLOUDFLARE ]';
              } else {
                uptimeDataStr = '[ UPTIME FETCH FAILED ]';
                pingStr = 'UNAVAILABLE';
              }
              
              const updateUI = setInterval(() => {
                const el = document.getElementById('diag-uptime-val');
                const pel = document.getElementById('diag-ping-val');
                if (el && pel) { 
                  el.innerText = uptimeDataStr; 
                  pel.innerText = pingStr;
                  clearInterval(updateUI); 
                }
              }, 50);
            })
            .catch(() => {
              uptimeDataStr = '[ LOCAL DEV / PROXY OFFLINE ]';
              pingStr = 'UNAVAILABLE';
              const updateUI = setInterval(() => {
                const el = document.getElementById('diag-uptime-val');
                const pel = document.getElementById('diag-ping-val');
                if (el && pel) { 
                  el.innerText = uptimeDataStr; 
                  pel.innerText = pingStr;
                  clearInterval(updateUI); 
                }
              }, 50);
            });
        }

        const memStr = (window.performance && window.performance.memory) ? Math.round(window.performance.memory.usedJSHeapSize / 1048576) + ' MB' : 'SECURE_RESTRICTED';
        const connStr = navigator.connection ? navigator.connection.effectiveType.toUpperCase() : 'SECURE_TUNNEL';

        const isClickjacking = (window.self !== window.top);
        const frameStatus = isClickjacking ? '<span style="color:#ef4444">[CRITICAL] IFRAME HIJACK DETECTED</span>' : 'SECURE (TOP LEVEL)';

        const pageScripts = document.querySelectorAll('script');
        let rogueCount = 0;
        pageScripts.forEach(script => {
          if (script.src) {
            try {
              const url = new URL(script.src, window.location.origin);
              if (url.origin !== window.location.origin) {
                rogueCount++;
              }
            } catch (e) {}
          }
        });
        const xssStatus = rogueCount > 0 ? `<span style="color:#f59e0b">[WARNING] ${rogueCount} EXTERNAL SCRIPT(S) DETECTED</span>` : 'CLEAN (NO ROGUE SCRIPTS)';

        let devToolsStatus = 'INACTIVE';
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > 160 || heightDiff > 160) {
            devToolsStatus = '<span style="color:#f59e0b">[WARNING] DEVTOOLS INSPECTOR ACTIVE</span>';
        }

        const errorCount = window._sysErrors ? window._sysErrors.length : 0;
        let errorStatus = errorCount === 0 ? 'CLEAN (NO ERRORS DETECTED)' : `<span style="color:#ef4444">[CRITICAL] ${errorCount} SILENT ERROR(S) LOGGED</span>`;
        if (errorCount > 0) {
            const lastErr = window._sysErrors[errorCount - 1].toString();
            errorStatus += `<br><span style="color:#ef4444; margin-left: 20px;">> Last: ${lastErr.substring(0, 60)}...</span>`;
        }

        let deadAssets = 0;
        document.querySelectorAll('img').forEach(img => {
            if (!img.complete || img.naturalWidth === 0) deadAssets++;
        });
        const assetStatus = deadAssets > 0 ? `<span style="color:#f59e0b">[WARNING] ${deadAssets} BROKEN RESOURCE(S)</span>` : 'ALL SYSTEMS GREEN (ASSETS LOADED)';

        let storageSize = 0;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                storageSize += (localStorage.getItem(localStorage.key(i)) || '').length * 2;
            }
            for (let i = 0; i < sessionStorage.length; i++) {
                storageSize += (sessionStorage.getItem(sessionStorage.key(i)) || '').length * 2;
            }
        } catch(e) {}
        const storageKB = (storageSize / 1024).toFixed(2);
        const storageStatus = `${storageKB} KB IN USE (LOCAL/SESSION)`;

        const adTest = document.createElement('div');
        adTest.className = 'ad-banner ad-container ad-slot textads';
        adTest.style.display = 'block';
        adTest.style.position = 'absolute';
        adTest.style.top = '-9999px';
        document.body.appendChild(adTest);
        
        const isBlocked = adTest.offsetHeight === 0 || window.getComputedStyle(adTest).display === 'none';
        const adBlockerStatus = isBlocked ? '<span style="color:#f59e0b">[WARNING] AD-BLOCKER / SHIELD ACTIVE</span>' : 'CLEAN (NO INTERFERENCE)';
        document.body.removeChild(adTest);

        let ttfbStr = 'UNAVAILABLE';
        let dnsStr = 'UNAVAILABLE';
        if (window.performance && window.performance.getEntriesByType) {
            const navEntries = window.performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                const ttfb = Math.round(nav.responseStart - nav.startTime);
                const dns = Math.round(nav.domainLookupEnd - nav.domainLookupStart);
                ttfbStr = ttfb > 600 ? `<span style="color:#ef4444">${ttfb}ms (SLOW)</span>` : `${ttfb}ms`;
                dnsStr = `${dns}ms`;
            }
        }

        let issuesCount = 0;
        if (isClickjacking) issuesCount++;
        if (rogueCount > 0) issuesCount++;
        if (widthDiff > 160 || heightDiff > 160) issuesCount++;
        if (errorCount > 0) issuesCount++;
        if (deadAssets > 0) issuesCount++;
        if (isBlocked) issuesCount++;
        
        let healthGrade = 'A+';
        let healthColor = '#10B981';
        let healthStatus = 'OPTIMAL';
        if (issuesCount === 1) { healthGrade = 'A-'; healthStatus = 'NOMINAL'; }
        else if (issuesCount === 2) { healthGrade = 'B+'; healthColor = '#f59e0b'; healthStatus = 'MINOR ANOMALIES'; }
        else if (issuesCount === 3) { healthGrade = 'B'; healthColor = '#f59e0b'; healthStatus = 'WARNINGS DETECTED'; }
        else if (issuesCount === 4) { healthGrade = 'C'; healthColor = '#f97316'; healthStatus = 'SYSTEM DEGRADED'; }
        else if (issuesCount >= 5) { healthGrade = 'F'; healthColor = '#ef4444'; healthStatus = 'CRITICAL FAILURES'; }
        
        const finalGradeStr = `<span style="color:${healthColor}">${healthGrade}</span>`;

        const lines = [
          `INITIATING LIVE SYSTEM DIAGNOSTIC...`,
          `> Target: riyostudio.dev`,
          `> Analyzing local execution environment...`,
          `> User Agent: ${navigator.userAgent}`,
          `> Screen Resolution: ${window.screen.width}x${window.screen.height}`,
          ` `,
          `[ INTRUSION & SECURITY AUDIT ]`,
          `> IFrame Hijack Shield: ${frameStatus}`,
          `> XSS/Rogue Script Audit: ${xssStatus}`,
          `> DevTools Probe Sensor: ${devToolsStatus}`,
          ` `,
          `[ CRITICAL HEALTH & ERRORS ]`,
          `> Silent Error Hook: ${errorStatus}`,
          `> Dead Asset Scan: ${assetStatus}`,
          ` `,
          `[ ENVIRONMENT & PERFORMANCE DEEP-DIVE ]`,
          `> Time-to-First-Byte (TTFB): ${ttfbStr}`,
          `> DNS Resolution Time: ${dnsStr}`,
          `> Client Storage Utilization: ${storageStatus}`,
          `> Extension/Shield Interference: ${adBlockerStatus}`,
          ` `,
          `[ SERVER HEALTH (riyostudio.dev) ]`,
          `> Last Deployment Build: ${document.lastModified}`,
          `> Server Status: <span id="diag-uptime-val">${uptimeDataStr}</span>`,
          `> Server Latency (Ping): <span id="diag-ping-val">${pingStr}</span>`,
          `> Active Connection: ${connStr}`,
          `> Memory Heap Usage: ${memStr}`,
          ` `,
          `[PERFORMANCE METRICS]`,
          `> DOM Nodes Rendered: ${domNodes}`,
          `> Scripts Active: ${document.scripts.length}`,
          `> DOM Build Time: ${loadTimeStr}`,
          `> Framerate Target: 60 FPS`,
          ` `,
          `[SECURITY AUDIT]`,
          `> Protocol: ${proto}`,
          `> Secure Context: ${isSecure}`,
          `> Bot/Scraper Signature: ${botStatus}`,
          ` `,
          `[GLOBAL TRAFFIC]`,
          `> TOTAL SYSTEM QUERIES: <span id="diag-hit-count">${hitCountStr}</span>`,
          ` `,
          `> CALCULATING FINAL GRADE...`,
          `> SYS_CHECK COMPLETE. STATUS: ${healthStatus}`,
          `> TOTAL DETECTED FLAGS: ${issuesCount}`,
          `> OVERALL HEALTH RATING: ${finalGradeStr}`,
          ` `,
          `DIAGNOSTIC FINISHED.`
        ];

        let lineIdx = 0;
        const interval = setInterval(() => {
          if (lineIdx < lines.length) {
            const div = document.createElement('div');
            div.innerHTML = lines[lineIdx];
            div.style.marginBottom = "4px";
            content.appendChild(div);
            
            const overlay = document.getElementById('diag-overlay');
            overlay.scrollTop = overlay.scrollHeight;
            
            lineIdx++;
          } else {
            clearInterval(interval);
            
            const cursorEl = document.getElementById('diag-cursor');
            if (cursorEl) cursorEl.style.display = 'none';
            
            const exitBtn = document.createElement('div');
            exitBtn.innerHTML = '<br><span style="color:#ef4444; cursor:pointer; font-weight:bold;" id="diag-exit-btn">[ CLICK OR PRESS ENTER TO CLOSE DIAGNOSTICS ]</span>';
            content.appendChild(exitBtn);
            
            const overlay = document.getElementById('diag-overlay');
            overlay.scrollTop = overlay.scrollHeight;
            
            const closeDiag = () => {
              if (document.getElementById('diag-overlay')) {
                overlay.remove();
              }
              document.removeEventListener('keydown', keyHandler);
            };

            const keyHandler = (e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                closeDiag();
              }
            };
            
            document.getElementById('diag-exit-btn').addEventListener('click', closeDiag);
            document.addEventListener('keydown', keyHandler);
          }
        }, 200);
    };


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
      } else if (action === 'sudo') {
        document.body.innerHTML = `
          <div style="height: 100vh; width: 100vw; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000; color: #ef4444; font-family: 'JetBrains Mono', monospace; font-size: clamp(24px, 5vw, 48px); font-weight: bold; text-align: center; padding: 20px; z-index: 999999; position: fixed; top: 0; left: 0;">
            <div>> PERMISSION DENIED.</div>
            <div style="font-size: 0.5em; color: #52525B; margin-top: 10px;">This incident will be reported. <span class="cursor">_</span></div>
          </div>
        `;
        setTimeout(() => location.reload(), 3000);
      } else if (action === 'diagnostics') {
        if (window.runSystemDiagnostics) {
          window.runSystemDiagnostics();
        }
      } else if (action === 'matrix') {
        const isMatrix = document.body.classList.toggle('matrix-mode');
        
        // Matrix scramble effect
        if (isMatrix) {
          // Disable text scrambling on mobile to prevent layout thrashing
          if (window.innerWidth <= 768) return;

          const scrambleTargets = document.querySelectorAll('h2, p, .cyber-label, .btn-text, .product-card h3');
          const mChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
          
          window.matrixObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && document.body.classList.contains('matrix-mode')) {
                const el = entry.target;
                
                if (el.children.length > 0 && !el.classList.contains('cyber-label')) return;
                if (el.dataset.matrixScrambling === "true") return;
                
                el.dataset.matrixScrambling = "true";
                
                if (!el.dataset.matrixOriginal) {
                  el.dataset.matrixOriginal = el.innerText;
                }
                const originalText = el.dataset.matrixOriginal;
                if (!originalText || originalText.trim() === '') return;
                
                let iterations = 0;
                const maxIterations = originalText.length;
                
                const interval = setInterval(() => {
                  el.innerText = originalText.split('').map((char, index) => {
                    if (index < iterations) return originalText[index];
                    if (char === ' ' || char === '\n') return char;
                    return mChars[Math.floor(Math.random() * mChars.length)];
                  }).join('');
                  
                  if (iterations >= maxIterations) {
                    clearInterval(interval);
                    el.dataset.matrixScrambling = "false";
                  }
                  iterations += 1;
                }, 15);
              }
            });
          }, { threshold: 0.1 });

          scrambleTargets.forEach(el => window.matrixObserver.observe(el));
        } else {
          // Disable Matrix Mode safely
          if (window.matrixObserver) {
            window.matrixObserver.disconnect();
            document.querySelectorAll('[data-matrix-original]').forEach(el => {
              el.innerText = el.dataset.matrixOriginal;
              delete el.dataset.matrixScrambling;
            });
          }
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
  const scrollCards = document.querySelectorAll('.product-card, .about-card');
  
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
      const allCards = document.querySelectorAll('.product-card, .about-card');
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

  // Live GitHub Telemetry
  async function initGitHubTelemetry() {
    const ghUser = 'momin1aden2-cpu';
    const reposEl = document.getElementById('gh-repos');
    const followersEl = document.getElementById('gh-followers');
    const latestPushEl = document.getElementById('gh-latest-push');

    try {
      const userRes = await fetch(`https://api.github.com/users/${ghUser}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (reposEl) reposEl.textContent = userData.public_repos;
        if (followersEl) followersEl.textContent = userData.followers;
      } else {
        if (reposEl) reposEl.textContent = 'ERR';
        if (followersEl) followersEl.textContent = 'ERR';
      }

      const eventsRes = await fetch(`https://api.github.com/users/${ghUser}/events/public`);
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        const pushEvent = events.find(e => e.type === 'PushEvent');
        if (pushEvent && pushEvent.payload) {
          let msg = 'Code update';
          if (pushEvent.payload.commits && pushEvent.payload.commits.length > 0) {
            msg = pushEvent.payload.commits[0].message;
          } else if (pushEvent.payload.ref) {
            msg = `Updated branch ${pushEvent.payload.ref.split('/').pop()}`;
          }
          let repo = pushEvent.repo.name;
          if (repo.includes('/')) repo = repo.split('/')[1];
          if (latestPushEl) latestPushEl.textContent = `Pushed to ${repo}: "${msg.substring(0, 30)}${msg.length > 30 ? '...' : ''}"`;
        } else {
          if (latestPushEl) latestPushEl.textContent = 'No recent pushes found.';
        }
      } else {
        if (latestPushEl) latestPushEl.textContent = 'ERR: API LIMIT';
      }
    } catch (err) {
      if (reposEl) reposEl.textContent = 'ERR';
      if (followersEl) followersEl.textContent = 'ERR';
      if (latestPushEl) latestPushEl.textContent = 'Connection Error: ' + err.message;
    }
  }

  // Interactive Terminal
  function initInteractiveTerminal() {
    const overlay = document.getElementById('interactive-terminal');
    const openBtn = document.getElementById('open-terminal-btn');
    const closeBtn = document.getElementById('terminal-close-btn');
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');

    if (!overlay || !openBtn || !closeBtn || !input || !output) return;

    function printLine(text, className = '') {
      const line = document.createElement('div');
      line.className = `terminal-line ${className}`;
      line.innerHTML = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    openBtn.addEventListener('click', () => {
      overlay.classList.add('active');
      setTimeout(() => input.focus(), 100);
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
          printLine('  exit        - Close the terminal');
          printLine('  sudo        - Attempt root access');
          break;
        case 'whoami':
          printLine('guest (unprivileged access)', 'warning');
          break;
        case 'clear':
          output.innerHTML = '';
          break;
        case 'github':
          printLine('Fetching GitHub telemetry...');
          initGitHubTelemetry().then(() => {
            const repos = document.getElementById('gh-repos').textContent;
            const push = document.getElementById('gh-latest-push').textContent;
            if (repos === 'ERR' || repos === 'N/A' || repos === '--') {
              printLine(`[ERROR] Fetch Failed: ${push}`, 'error');
            } else {
              printLine(`[SUCCESS] Repos: ${repos}`, 'success');
              printLine(`[SUCCESS] Latest Activity: ${push}`, 'success');
            }
          });
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
    initGitHubTelemetry();
    initInteractiveTerminal();
  } else {
    window.addEventListener('load', () => {
      initPingingLights();
      initGitHubTelemetry();
      initInteractiveTerminal();
    });
  }

})();
