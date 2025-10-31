/* =========================================================
   Seabird Law — mobile-nav.js
   - Opens/closes the mobile menu
   - Focus trap + ESC + overlay click
   - Edge swipe (drag from left-to-right) to close
   ========================================================= */
(() => {
  const header = document.getElementById('siteHeader');
  const panel  = document.getElementById('mobileMenu');
  const openBtn  = document.getElementById('openMenuBtn');
  const closeBtn = document.getElementById('closeMenuBtn');
  const overlay  = document.getElementById('menuOverlay');
  if (!header || !panel || !openBtn || !closeBtn || !overlay) return;

  const FOCUSABLE = 'a,button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])';
  let first, last;

  function setFocusables() {
    const nodes = panel.querySelectorAll(FOCUSABLE);
    first = nodes[0];
    last  = nodes[nodes.length - 1];
  }

  function open() {
    header.classList.add('open');
    document.body.classList.add('no-scroll');
    panel.removeAttribute('aria-hidden');
    overlay.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    setFocusables();
    setTimeout(() => (first && first.focus()), 0);
  }

  function close() {
    header.classList.remove('open');
    document.body.classList.remove('no-scroll');
    panel.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    openBtn.focus();
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // ESC to close
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      // trap focus
      setFocusables();
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  // Edge swipe to close (simple)
  let startX = null;
  panel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    if (dx > 60) { // swipe right
      startX = null;
      close();
    }
  }, { passive: true });
})();
