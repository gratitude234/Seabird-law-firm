/* =========================================================
   Seabird Law — mobile-nav.js (Premium)
   - Opens/closes the mobile menu
   - Focus trap + ESC + overlay click
   - Edge swipe (rightward) to close
   - Inert background while open
   - Adds tiny stagger class on open
   ========================================================= */
(() => {
  const header  = document.getElementById('siteHeader');
  const panel   = document.getElementById('mobileMenu');
  const openBtn = document.getElementById('openMenuBtn');
  const closeBtn= document.getElementById('closeMenuBtn');
  const overlay = document.getElementById('menuOverlay');
  const main    = document.getElementById('main');
  const footer  = document.querySelector('footer.site-footer');

  if (!header || !panel || !openBtn || !closeBtn || !overlay) return;

  // ARIA roles
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');

  const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  let first, last, prevActive = null;

  function setFocusables() {
    const nodes = panel.querySelectorAll(FOCUSABLE);
    first = nodes[0];
    last  = nodes[nodes.length - 1];
  }

  function setInert(isInert){
    // Inert background for premium “modal” feel (fallback if unsupported)
    [main, footer].forEach(el => {
      if (!el) return;
      if (isInert) {
        el.setAttribute('aria-hidden','true');
        el.style.pointerEvents = 'none';
      } else {
        el.removeAttribute('aria-hidden');
        el.style.pointerEvents = '';
      }
    });
  }

  function open() {
    prevActive = document.activeElement;

    header.classList.add('open');
    document.body.classList.add('no-scroll');
    panel.removeAttribute('aria-hidden');
    overlay.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');

    setInert(true);
    setFocusables();

    // Stagger-in hint: force reflow so CSS animation triggers
    panel.offsetHeight; // eslint-disable-line no-unused-expressions

    // Focus first focusable
    setTimeout(() => first && first.focus(), 10);

    // Close on link click inside panel
    panel.addEventListener('click', clickToClose);
    panel.addEventListener('keydown', onKeyDown);
    document.addEventListener('keydown', onGlobalEsc);
    overlay.addEventListener('click', close, { once: true });
  }

  function close() {
    header.classList.remove('open');
    document.body.classList.remove('no-scroll');
    panel.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');

    setInert(false);

    panel.removeEventListener('click', clickToClose);
    panel.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keydown', onGlobalEsc);

    // Return focus
    (prevActive || openBtn).focus();
  }

  function clickToClose(e){
    const a = e.target.closest('a');
    if (a) close();
  }

  function onGlobalEsc(e){ if (e.key === 'Escape') close(); }

  function onKeyDown(e){
    if (e.key !== 'Tab') return;
    setFocusables();
    if (!first || !last) return;

    // trap focus
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  // Edge swipe to close (drag right)
  let startX = null, startY = null, isDragging = false;
  const SWIPE_THRESHOLD = 60;    // px
  const ANGLE_TOLERANCE = 30;    // degrees

  panel.addEventListener('touchstart', (e) => {
    if (!header.classList.contains('open')) return;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY; isDragging = true;
  }, { passive: true });

  panel.addEventListener('touchmove', (e) => {
    if (!isDragging || startX == null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
    if (dx > SWIPE_THRESHOLD && angle < ANGLE_TOLERANCE) {
      isDragging = false; startX = startY = null;
      close();
    }
  }, { passive: true });

  panel.addEventListener('touchend', () => { startX = startY = null; isDragging = false; }, { passive: true });

  // Buttons
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
})();