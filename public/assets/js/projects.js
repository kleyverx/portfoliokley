/**
 * Projects — Módulo dinámico de proyectos + scroll horizontal GSAP
 */

function initProjectsModule() {
  const grid = document.querySelector('#projects-grid') || document.querySelector('#proyectos .mx-auto.grid');
  if (!grid) return;

  initProjectDescToggles(grid);
  setTimeout(() => {
    if (window.gsap && window.ScrollTrigger) {
      initProjectsHorizontalScroll();
    }
  }, 100);
}

// ============================================================================
// SCROLL HORIZONTAL CON GSAP
// ============================================================================
function initProjectsHorizontalScroll() {
  const pinSection   = document.querySelector('#proyectos');
  const pinContainer = document.querySelector('#projects-pin-container');
  const track        = document.querySelector('.projects-horizontal-track');

  if (!pinSection || !pinContainer || !track) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Kill any existing triggers on this container
  ScrollTrigger.getAll().forEach(t => {
    if (t.vars.trigger === pinContainer) t.kill();
  });

  // Hardware acceleration
  track.style.willChange = 'transform';

  function getScrollAmount() {
    return -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.05);
  }

  // ── Activado para TODAS las resoluciones ───────────────────────────────
  const tween = gsap.to(track, {
    x: getScrollAmount,
    ease: 'none',
    force3D: true,
  });

  ScrollTrigger.create({
    animation: tween,
    trigger: pinContainer,
    pin: true,
    pinSpacing: true,
    start: 'center center',
    end: () => '+=' + track.scrollWidth,
    scrub: 1,              // force smooth scrubbing
    invalidateOnRefresh: true,
  });

  // Refresh layout settling
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 800);
}

// ============================================================================
// TOGGLE DE DESCRIPCIONES
// ============================================================================
function initProjectDescToggles(grid) {
  try {
    const cards = grid.querySelectorAll('.project-card');
    cards.forEach(card => {
      const body = card.querySelector('.p-6');
      const desc = body ? body.querySelector('p.text-muted-foreground') : null;
      if (!desc || card.querySelector('.desc-toggle')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'desc-toggle inline-flex items-center gap-1 !text-white hover:!text-secondary transition-all duration-300 text-sm font-bold mb-4';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="toggle-label" data-key="verMas">Ver más</span>\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="chevron text-secondary" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      desc.insertAdjacentElement('afterend', btn);

      btn.addEventListener('click', () => {
        const expanded = desc.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const label = btn.querySelector('.toggle-label');
        if (label) label.textContent = expanded ? 'Ver menos' : 'Ver más';
        
        // Refrescar ScrollTrigger para ajustar alturas al expandir la tarjeta
        setTimeout(() => {
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }, 300);
      });
    });
  } catch (e) {
    console.warn('initProjectDescToggles error:', e);
  }
}
