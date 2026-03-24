/**
 * Services Module - Premium Edition
 * CSS sticky + GSAP for high-end content transitions.
 */

(function () {
  function init() {
    const spacer    = document.getElementById('services-scroll-spacer');
    const container = document.getElementById('servicios');
    const items     = document.querySelectorAll('.service-item[data-service]');
    const mainImg   = document.getElementById('service-main-img');
    const title     = document.getElementById('service-title');
    const dynDesc   = document.getElementById('service-dynamic-desc');
    const dynStat   = document.getElementById('service-dynamic-stat');
    const dots      = document.querySelectorAll('.service-dot[data-dot]');

    if (!spacer || !items.length || !mainImg) return;

    const services = Array.from(items).map(el => ({
      key : el.getAttribute('data-service'),
      img : el.getAttribute('data-img'),
      stat: el.getAttribute('data-stat'),
    }));

    const N = services.length;
    let current = -1;
    let tl = null;

    function getTranslation(key) {
      const lang  = localStorage.getItem('language') || 'es';
      const trans = (window.translations && window.translations[lang]) || {};
      return trans[key] || key;
    }

    function activate(idx) {
      if (idx === current) return;
      
      // Kill previous timeline to avoid overlapping
      if (tl) tl.kill();
      tl = gsap.timeline();
      
      current = idx;
      const d = services[idx];
      if (!d) return;

      // Update dots & items
      dots.forEach((dot, i) => dot.classList.toggle('active-dot', i === idx));
      items.forEach((item, i) => {
        item.classList.toggle('active-service', i === idx);
        if (i !== idx) gsap.to(item, { x: 0, duration: 0.3 });
      });

      // Targets to fade
      const targets = [title, dynDesc, dynStat].filter(Boolean);

      tl.to(targets, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          const lang = document.documentElement.lang || localStorage.getItem('language') || 'es';
          
          // Swap Content
          if (d.img) {
            mainImg.src = d.img.includes('?') ? d.img + '&auto=format&fit=crop&w=1200' : d.img;
          }
          
          if (title) title.setAttribute('data-key', d.key);
          if (dynDesc) dynDesc.setAttribute('data-key', d.key + 'Desc');
          if (dynStat && d.stat) dynStat.textContent = d.stat;

          if (window.translations && window.translations[lang]) {
            const t = window.translations[lang];
            if (title && t[d.key]) title.textContent = t[d.key];
            if (dynDesc && t[d.key + 'Desc']) {
              dynDesc.textContent = t[d.key + 'Desc'];
              // Forzar clases de truncado por si se pierden en el swap
              dynDesc.classList.add('line-clamp-4', 'lg:line-clamp-3', 'xl:line-clamp-none', 'overflow-hidden');
            }
          } else {
            if (title) title.textContent = getTranslation(d.key);
            if (dynDesc) {
              dynDesc.textContent = getTranslation(d.key + 'Desc');
              dynDesc.classList.add('line-clamp-4', 'lg:line-clamp-3', 'xl:line-clamp-none', 'overflow-hidden');
            }
          }

          // New entrance for text
          gsap.fromTo(targets, 
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "expo.out" }
          );

          // Image specific transition
          gsap.fromTo(mainImg,
            { opacity: 0, scale: 1.1, filter: "blur(10px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out" }
          );
        }
      });
    }

    // ── Magnetic & Hover Effects ──────────────────────────────────────────
    function initInteractions() {
      if (window.innerWidth < 1024) return;
      
      items.forEach(item => {
        item.addEventListener('mouseenter', () => {
          gsap.to(item, { x: 15, duration: 0.4, ease: "power2.out" });
        });
        item.addEventListener('mouseleave', () => {
          if (!item.classList.contains('active-service')) {
            gsap.to(item, { x: 0, duration: 0.4, ease: "power2.out" });
          }
        });
        // Click to jump to service
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-index'));
          const totalH  = spacer.offsetHeight - window.innerHeight;
          const targetY = spacer.offsetTop + (totalH * (idx / (N - 1)));
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        });
      });
    }

    // ── Scroll Engine ───────────────────────────────────────────────────────
    let viewH  = window.innerHeight;
    let totalH = spacer.offsetHeight;

    window.addEventListener('resize', () => {
      viewH  = window.innerHeight;
      totalH = spacer.offsetHeight;
    });

    function onScroll() {
      // Usar medidas cacheadas para evitar recálculos por la barra de navegación móvil (address bar glitch)
      const rect     = spacer.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const usefulH  = totalH - viewH;
      
      // Dividimos el trayecto útil
      const segment = usefulH / Math.max(1, N);
      const step    = Math.min(Math.floor(scrolled / segment), N - 1);
      
      if (step !== current && step >= 0) {
        activate(step);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    
    initInteractions();
    setTimeout(() => activate(0), 100);
  }

  // Lifecycle
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
