/* =========================================================
   Seabird Law — desktop.js (≥1024px ONLY)
   - Subtle hero parallax
   - Refined scroll spy (RAF)
   - Card tilt micro-interactions
   - Back-to-top helper
   ========================================================= */

(() => {
  const MQ = window.matchMedia('(min-width:1024px)');
  if (!MQ.matches) return;

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ------------------------------
     1) Subtle hero parallax
  ------------------------------ */
  const hero  = $('.hero');
  const bg    = $('.hero__bg');
  const media = $('.hero-media img');

  function parallax() {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const visible = Math.max(0, Math.min(1, 1 - (rect.top / rect.height)));
    if (bg)    bg.style.transform    = `translateY(${visible * 14}px)`;
    if (media) media.style.transform = `scale(${1 + visible * 0.02})`;
  }
  parallax();
  window.addEventListener('scroll', parallax, { passive: true });

  /* ------------------------------
     2) Refined scroll spy
  ------------------------------ */
  const ids   = ['practice','process','results','why','team','resources','faq','contact'];
  const links = $$('.nav__links .navlink');
  const linkByHash = (h) => links.find(a => a.getAttribute('href') === `#${h}`);

  let ticking = false;
  function onScrollSpy() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      let current = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.35 && rect.bottom > window.innerHeight * 0.35) {
          current = id; break;
        }
      }
      if (current) {
        links.forEach(a => a.classList.remove('active'));
        const L = linkByHash(current);
        if (L) L.classList.add('active');
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  onScrollSpy();

  /* ------------------------------
     3) Card micro-interactions
  ------------------------------ */
  const tiltCards = $$('.card, .why__item, .quote');
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  tiltCards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform, box-shadow';
    let raf = null;
    function handle(e) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = clamp((0.5 - y) * 6, -6, 6);
      const ry = clamp((x - 0.5) * 8, -8, 8);
      const dz = 6;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${dz}px)`;
        card.style.boxShadow = '0 18px 42px rgba(12,32,62,.16)';
      });
    }
    function reset() {
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0) translateZ(0)';
      card.style.boxShadow = '';
    }
    card.addEventListener('mousemove', handle);
    card.addEventListener('mouseleave', reset);
    card.addEventListener('blur', reset, true);
  });

  /* ------------------------------
     4) Back-to-top helper
  ------------------------------ */
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  Object.assign(btn.style, {
    position: 'fixed', right: '20px', bottom: '24px', zIndex: 80,
    padding: '12px 14px', borderRadius: '999px', border: '1px solid rgba(255,255,255,.2)',
    background: 'linear-gradient(135deg,#003f7f,#0a4f9b)', color:'#fff', fontWeight:'800',
    boxShadow:'0 10px 24px rgba(2,45,90,.28)', cursor:'pointer', opacity:'0', transform:'translateY(8px)',
    transition:'opacity .25s ease, transform .25s ease'
  });
  btn.textContent = '↑';
  document.body.appendChild(btn);

  function toggleToTop() {
    const show = window.scrollY > 600;
    btn.style.opacity   = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(8px)';
  }
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
