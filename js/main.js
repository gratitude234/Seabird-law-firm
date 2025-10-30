/* =========================================================
   Seabird Law — main.js (mobile-first, progressive)
   - Mobile menu (slide-in, focus-trap, overlay hidden attr)
   - Accessible dropdown (Practice Areas + caret)
   - Sticky header "is-scrolled" class
   - Smooth scroll + scroll spy
   - Intersection Observer reveals
   - Contact form placeholder submit
   ========================================================= */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const MQ_DESKTOP = window.matchMedia('(min-width:1024px)');

  /* ------------------------------
     1) Mobile menu toggle + focus trap
  ------------------------------ */
  const header     = $('#siteHeader');
  const menuBtn    = $('#menuBtn');
  const panel      = $('#mobilePanel');
  const overlay    = $('#overlay');
  const panelClose = $('#panelClose'); // optional

  let lastFocused = null;
  const focusablesSel = [
    'a[href]','button:not([disabled])','input:not([disabled])',
    'select:not([disabled])','textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function trapFocus(e){
    if (!panel) return;
    const nodes = panel.querySelectorAll(focusablesSel);
    if (!nodes.length || e.key !== 'Tab') return;
    const first = nodes[0];
    const last  = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function openMenu() {
    header.classList.add('open');
    panel?.setAttribute('aria-hidden', 'false');
    menuBtn?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    if (overlay) overlay.hidden = false;
    lastFocused = document.activeElement;
    const first = panel?.querySelector('a,button');
    first && first.focus();
    document.addEventListener('keydown', onEsc);
    panel?.addEventListener('keydown', trapFocus);
  }

  function closeMenu() {
    header.classList.remove('open');
    panel?.setAttribute('aria-hidden', 'true');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    if (overlay) overlay.hidden = true;
    document.removeEventListener('keydown', onEsc);
    panel?.removeEventListener('keydown', trapFocus);
    lastFocused && lastFocused.focus();
  }

  function toggleMenu() { header.classList.contains('open') ? closeMenu() : openMenu(); }
  function onEsc(e){ if (e.key === 'Escape') closeMenu(); }

  on(menuBtn, 'click', toggleMenu);
  on(overlay, 'click', closeMenu);
  on(panelClose, 'click', closeMenu);
  on(panel, 'click', (e) => { if (e.target.tagName === 'A') closeMenu(); });
  MQ_DESKTOP.addEventListener?.('change', (e) => { if (e.matches) closeMenu(); });

  /* ------------------------------
     2) Accessible dropdown (Practice Areas + caret)
  ------------------------------ */
  const drop      = $('#dropPractice');
  const trigger   = drop?.querySelector('.navlink.has-caret');
  const dropPanel = drop?.querySelector('.drop-panel');

  function openDrop(){
    drop.classList.add('open');
    trigger?.setAttribute('aria-expanded', 'true');
  }
  function closeDrop(){
    drop.classList.remove('open');
    trigger?.setAttribute('aria-expanded', 'false');
  }

  if (drop && trigger && dropPanel) {
    // Desktop hover open/close
    on(drop, 'mouseenter', () => { if (MQ_DESKTOP.matches) openDrop(); });
    on(drop, 'mouseleave', () => { if (MQ_DESKTOP.matches) closeDrop(); });

    // Keyboard support
    on(trigger, 'focus', openDrop);
    on(dropPanel, 'focusout', (e) => { if (!drop.contains(e.relatedTarget)) closeDrop(); });

    // Click toggles on desktop too (for touchpads)
    on(trigger, 'click', (e) => {
      e.preventDefault();
      drop.classList.contains('open') ? closeDrop() : openDrop();
    });

    // Click outside
    on(document, 'click', (e) => { if (!drop.contains(e.target)) closeDrop(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') closeDrop(); });
  }

  /* ------------------------------
     3) Sticky header "is-scrolled" class
  ------------------------------ */
  const elevate = () => {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  elevate();
  window.addEventListener('scroll', elevate, { passive: true });

  /* ------------------------------
     4) Smooth scroll with sticky header offset
  ------------------------------ */
  function getHeaderOffset() {
    const el = $('.site-header');
    return el ? el.getBoundingClientRect().height : 0;
  }
  function smoothScrollTo(target) {
    const el = (typeof target === 'string') ? document.getElementById(target.replace(/^#/, '')) : target;
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - (getHeaderOffset() + 12);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash.length > 1) {
      e.preventDefault();
      smoothScrollTo(hash);
      history.pushState(null, '', hash);
    }
  });

  /* ------------------------------
     5) Scroll spy (active nav)
  ------------------------------ */
  const sectionIds = ['practice','process','results','why','team','resources','faq','contact'];
  const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks   = $$('.nav__links .navlink');

  const linkByHash = (hash) => navLinks.find(a => a.getAttribute('href') === `#${hash}`);

  const spyIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = linkByHash(id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(sec => spyIO.observe(sec));

  /* ------------------------------
     6) Reveal-on-scroll animations
  ------------------------------ */
  const revealIO = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  $$('.fade-in, .slide-up').forEach(el => revealIO.observe(el));

  /* ------------------------------
     7) Contact form (placeholder submit)
  ------------------------------ */
  const form = $('#contactForm');
  const status = $('#formStatus');

  on(form, 'submit', async (e) => {
    e.preventDefault();
    if (!form) return;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    if (status) status.textContent = 'Sending…';
    try {
      await new Promise(r => setTimeout(r, 800)); // replace with real API call
      if (status) status.textContent = `Thanks, ${payload.name || 'there'}. We’ll reply within 24 hours.`;
      form.reset();
    } catch (err) {
      if (status) status.textContent = 'Something went wrong. Please try again or WhatsApp us.';
      console.error(err);
    }
  });

  /* ------------------------------
     8) Fix anchor offset on refresh
  ------------------------------ */
  window.addEventListener('load', () => {
    if (location.hash && document.getElementById(location.hash.slice(1))) {
      setTimeout(() => smoothScrollTo(location.hash), 50);
    }
  });
})();
