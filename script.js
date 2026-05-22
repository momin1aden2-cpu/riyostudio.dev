/* ================================================================
   RIYO STUDIO — Main Script
   Handles: Nav scroll, mobile menu, scroll animations, contact form
   ================================================================ */

(function () {
  'use strict';

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
          
          // Trigger decode if element has the attribute
          if (entry.target.hasAttribute('data-decode-scroll')) {
            // Add a small delay so the text has time to fade in before we scramble it
            setTimeout(() => {
              decodeText(entry.target);
            }, 150);
          }
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
      submitBtn.textContent = 'Sending…';
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
          submitBtn.textContent = 'Send Message';
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

  // Text decode
  const decodeElements = document.querySelectorAll('[data-decode]');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  function decodeText(element) {
    const originalText = element.getAttribute('data-decode') || element.getAttribute('data-decode-scroll');
    if (!originalText) return;
    let iterations = 0;
    const maxIterations = 15;
    
    const interval = setInterval(() => {
      element.innerText = originalText.split('').map((letter, index) => {
        if (index < iterations) {
          return originalText[index];
        }
        if (letter === ' ') return ' ';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      if (iterations >= originalText.length) {
        clearInterval(interval);
        // Ensure nested tags like <span class="accent"> aren't destroyed
        // If the original had HTML, we'll restore it directly
        if (element.innerHTML !== element.textContent) {
          // This allows innerHTML restoration if needed, but our setup uses raw text in data-decode
        }
      }
      iterations += 1;
    }, 30);
  }

  // Trigger decode on load
  setTimeout(() => {
    decodeElements.forEach(el => decodeText(el));
    
    // Specifically handle the accent tag on the second span
    const h1 = document.getElementById('hero-title');
    if (h1) {
      setTimeout(() => {
        h1.innerHTML = `<span data-decode="I build software that">I build software that</span><br><span data-decode="solves real problems.">solves <span class="accent">real problems.</span></span><span class="cursor">_</span>`;
      }, 1000); // Restore full HTML after decode finishes
    }
  }, 150);



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
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
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

    function openCmdPalette() {
      cmdPalette.classList.add('active');
      cmdInput.value = '';
      cmdInput.focus();
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
      } else if (action === 'diagnostics') {
        // System diagnostic routine
        const h1 = document.getElementById('hero-title');
        if (h1) h1.innerHTML = `<span style="color:var(--shiftcore)">> SYS_CHECK OK. SECURITY A+.</span><span class="cursor">_</span>`;
        setTimeout(() => location.reload(), 2000);
      } else if (action === 'matrix') {
        document.body.style.filter = 'hue-rotate(90deg) contrast(1.2)';
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
  
  window.addEventListener('scroll', () => {
    // Calculate velocity
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    
    // Clamp velocity to prevent extreme skew
    const maxSkew = 5; // degrees
    let skewValue = scrollVelocity * 0.05;
    skewValue = Math.max(-maxSkew, Math.min(maxSkew, skewValue));
    
    // Apply skew to cards
    const allCards = document.querySelectorAll('.product-card, .about-card');
    allCards.forEach(card => {
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

})();
