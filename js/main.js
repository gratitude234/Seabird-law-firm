/* =========================================================
   Seabird Law — main.js (simplified for improved UX)

   This script powers progressive enhancements on the Seabird
   Law Firm website. It preserves much of the original
   functionality from the upstream project, including the
   sticky header behaviour, smooth scrolling with header
   offset, scroll‑spy to highlight the active section, reveal
   animations on scroll, and a placeholder contact form
   submission.  Additionally, this version introduces logic
   to temporarily hide the sticky action bar when the user
   focuses into the contact form fields.  Hiding the
   action bar avoids obscuring form fields on small screens
   and improves accessibility.

   Note: The mobile navigation is now handled by
   `mobile-nav.js`; the menu toggle and focus trap code from
   the original main.js has been removed.
   ========================================================= */

(() => {
  /*
    Utility helpers for selecting and event binding.  The
    functions `$` and `$$` mirror those in the original script
    to streamline querying elements, while `on` is a small
    helper for adding event listeners only when elements
    actually exist.
  */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /*
    1) Sticky header: apply the `is-scrolled` class when the
    user has scrolled down at least a few pixels.  This
    visually elevates the header with a shadow.  The class is
    removed once the user returns near the top of the page.
  */
  const header = $('#siteHeader');
  function elevate() {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  elevate();
  window.addEventListener('scroll', elevate, { passive: true });

  /*
    2) Smooth scroll with sticky header offset.  Anchor links
    should scroll to the correct position accounting for the
    fixed header height.  Without this offset the target
    section would be hidden underneath the header.
  */
  function getHeaderOffset() {
    const el = $('.site-header');
    return el ? el.getBoundingClientRect().height : 0;
  }
  function smoothScrollTo(target) {
    const el = (typeof target === 'string')
      ? document.getElementById(target.replace(/^#/, ''))
      : target;
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

  /*
    3) Scroll spy: observe major sections and update the
    navigation to indicate which section is currently in view.
    This mapping should reflect the section IDs present in
    index.html.  If sections are added or removed, update
    `sectionIds` accordingly.
  */
  const sectionIds = [
    'practice', 'process', 'results', 'why',
    'team', 'resources', 'faq', 'contact'
  ];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = $$('.nav__links .navlink');
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

  /*
    4) Reveal-on-scroll animations: elements with `.fade-in`
    or `.slide-up` classes will gently reveal once they
    intersect the viewport.  The observer unobserves each
    element after revealing to avoid repeated triggers.
  */
  const revealIO = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  $$('.fade-in, .slide-up').forEach(el => revealIO.observe(el));

  /*
    5) Contact form placeholder: this simply waits to
    simulate network latency, updates the status message and
    resets the form.  Replace the `setTimeout` with a real
    fetch when a backend endpoint is available.
  */
  const form = $('#contactForm');
  const status = $('#formStatus');
  on(form, 'submit', async (e) => {
    e.preventDefault();
    if (!form) return;
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    if (status) status.textContent = 'Sending…';
    try {
      await new Promise(r => setTimeout(r, 800));
      if (status) status.textContent = `Thanks, ${payload.name || 'there'}. We’ll reply within 24 hours.`;
      form.reset();
    } catch (err) {
      if (status) status.textContent = 'Something went wrong. Please try again or WhatsApp us.';
      console.error(err);
    }
  });

  /*
    6) Fix anchor offset on refresh: if the page loads with
    a hash in the URL, scroll to the correct offset once
    everything has rendered.  Without the delay the header
    might misalign the target section.
  */
  window.addEventListener('load', () => {
    if (location.hash && document.getElementById(location.hash.slice(1))) {
      setTimeout(() => smoothScrollTo(location.hash), 50);
    }
  });

  /*
    7) Hide the sticky action bar when the user focuses a
    contact form field.  The action bar can obstruct the
    fields on small screens, so we add a helper class
    `.is-hidden` on focus and remove it when focus leaves
    the contact section.
  */
  const actionbar = document.querySelector('.actionbar');
  const contactSection = document.getElementById('contact');
  if (contactSection && actionbar) {
    // Hide on focus in any input/textarea/select within the contact section
    contactSection.addEventListener('focusin', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        actionbar.classList.add('is-hidden');
      }
    });
    // Show again when focus leaves the contact section entirely
    contactSection.addEventListener('focusout', () => {
      // Defer to allow focus to move to another element
      setTimeout(() => {
        if (!contactSection.contains(document.activeElement)) {
          actionbar.classList.remove('is-hidden');
        }
      }, 50);
    });
  }
})();