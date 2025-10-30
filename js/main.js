/* =========================================================
   Seabird Law — main.js (mobile-first, progressive)
   - Mobile menu (slide-in)
   - Accessible dropdown (Practice Areas)
   - Smooth scroll with sticky-header offset
   - Scroll spy (active nav)
   - Intersection Observer reveal animations
   - Contact form placeholder submit
   ========================================================= */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ------------------------------
     0) Feature flags
  ------------------------------ */
  const MQ_DESKTOP = window.matchMedia('(min-width:1024px)');

  /* ------------------------------
     1) Mobile menu toggle
  ------------------------------ */
  const header  = $('#siteHeader');
  const menuBtn = $('#menuBtn');
  const panel   = $('#mobilePanel');
  const overlay = $('#overlay');

  function openMenu() {
    header.classList.add('open');
    panel?.setAttribute('aria-hidden', 'false');
    menuBtn?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeMenu() {
    header.classList.remove('open');
    panel?.setAttribute('aria-hidden', 'true');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  function toggleMenu() {
    if (header.classList.contains('open')) closeMenu();
    else openMenu();
  }

  on(menuBtn, 'click', toggleMenu);
  on(overlay, 'click', closeMenu);
  on(panel, 'click', (e) => {
    if (e.target.tagName === 'A') closeMenu();
  });
  // Close on ESC
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  // If we resize to desktop, ensure menu is closed
  MQ_DESKTOP.addEventListener?.('change', (e) => { if (e.matches) closeMenu(); });

  /* ------------------------------
     2) Accessible dropdown (Practice Areas)
  ------------------------------ */
  const drop        = $('#dropPractice');
  const dropLink    = drop?.querySelector('.navlink');
  const dropPanel   = drop?.querySelector('.drop-panel');

  function openDrop() {
    drop.classList.add('open');
    dropLink?.setAttribute('aria-expanded', 'true');
  }
  function closeDrop() {
    drop.classList.remove('open');
    dropLink?.setAttribute('aria-expanded', 'false');
  }

  if (drop && dropLink && dropPanel) {
    // Desktop hover open, blur close
    on(drop, 'mouseenter', () => { if (MQ_DESKTOP.matches) openDrop(); });
    on(drop, 'mouseleave', () => { if (MQ_DESKTOP.matches) closeDrop(); });

    // Focus behaviour for keyboard users
    on(dropLink, 'focus', openDrop);
    on(dropPanel, 'focusout', (e) => {
      if (!drop.contains(e.relatedTarget)) closeDrop();
    });

    // On mobile widths, clicking the link toggles the panel (prevents navigation)
    on(dropLink, 'click', (e) => {
      if (!MQ_DESKTOP.matches) {
        e.preventDefault();
        drop.classList.toggle('open');
        dropLink.setAttribute('aria-expanded', drop.classList.contains('open') ? 'true' : 'false');
      }
    });
  }

  /* ------------------------------
     3) Smooth scroll with sticky header offset
  ------------------------------ */
  function getHeaderOffset() {
    // Approximate sticky header height on mobile; desktop.css can enlarge it a bit.
    const el = $('.site-header');
    return el ? el.getBoundingClientRect().height : 0;
  }

  function smoothScrollTo(target) {
    const el = (typeof target === 'string') ? document.getElementById(target.replace(/^#/, '')) : target;
    if (!el) return;
    const y = window.scrollY + el.getBoundingClientRect().top - (getHeaderOffset() + 12);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  // Intercept in-page anchor clicks
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
     4) Scroll spy (active nav)
  ------------------------------ */
  const sectionIds = ['practice','process','results','why','team','resources','faq','contact'];
  const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks   = $$('.nav__links .navlink');

  function linkByHash(hash) {
    return navLinks.find(a => a.getAttribute('href') === `#${hash}`);
  }

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
     5) Reveal-on-scroll animations
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
     6) Contact form (placeholder submit)
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
      // TODO: replace with real endpoint (Fetch to your API)
      await new Promise(r => setTimeout(r, 800));
      if (status) status.textContent = `Thanks, ${payload.name || 'there'}. We’ll reply within 24 hours.`;
      form.reset();
    } catch (err) {
      if (status) status.textContent = 'Something went wrong. Please try again or WhatsApp us.';
      console.error(err);
    }
  });

  /* ------------------------------
     7) Footer year (safety if not set elsewhere)
  ------------------------------ */
  const y = $('#y');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ------------------------------
     8) Handle load with hash (anchor offset on refresh)
  ------------------------------ */
  window.addEventListener('load', () => {
    if (location.hash && document.getElementById(location.hash.slice(1))) {
      // delay to ensure fonts/layout settle
      setTimeout(() => smoothScrollTo(location.hash), 50);
    }
  });

})();
