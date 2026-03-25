/**
 * Projects — Módulo dinámico de proyectos + scroll horizontal GSAP
 */

function initProjectsModule() {
  const grid = document.querySelector('#projects-grid') || document.querySelector('#proyectos .mx-auto.grid');
  if (!grid) return;

  // Si ya hay elementos (renderizados por Astro), no limpiamos ni volvemos a renderizar
  if (grid.children.length > 0) {
    console.log('🚀 Projects already rendered by Astro, skipping client-side load.');
    initProjectDescToggles(grid);
    setTimeout(() => {
      if (window.gsap && window.ScrollTrigger) {
        initProjectsHorizontalScroll();
      }
    }, 100);
    return;
  }

  grid.innerHTML = '';
  loadAndRenderProjects(grid);
}

async function loadAndRenderProjects(grid) {
  const base = await fetchProjectsData();
  const projects = [...base];

  projects.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const limited = projects.slice(0, 10);

  renderProjects(limited, grid);
  initProjectDescToggles(grid);

  // Inicializar ScrollTrigger horizontal
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

  // ── Mobile: no pin, just normal vertical scroll ──────────────────────────
  // (no horizontal scroll on mobile — it's already stacked)

  // Refresh layout settling
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 800);
}

// ============================================================================
// FETCH Y RENDER
// ============================================================================
async function fetchProjectsData() {
  try {
    const fetchPath = ((window.BASE_URL || '') + '/assets/data/projects.json').replace(/\/+/g, '/');
    const res = await fetch(fetchPath, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    if (!text || !text.trim()) return [];
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('⚠️ No se pudieron cargar projects.json:', err);
    return [];
  }
}

function renderProjects(projects, grid) {
  grid.innerHTML = '';
  const _escapeHtml = window.escapeHtml || ((s) => String(s));

  for (const p of projects) {
    const card = document.createElement('div');
    card.className = 'project-card w-[85vw] md:w-[60vw] lg:w-[450px] shrink-0 glass-panel glass-panel-hover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300';

    const fallbackImg = ((window.BASE_URL || '') + '/assets/images/public/perfil.jpeg').replace(/\/+/g, '/');
    const imgSrc = p.image || fallbackImg;

    card.innerHTML = `
      <div class="aspect-video">
        <img src="${imgSrc}" alt="Imagen del proyecto" class="object-cover w-full h-full" onerror="this.src='/assets/images/public/perfil.jpeg';this.onerror=null;">
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2 text-foreground">${_escapeHtml(p.title || 'Proyecto')}</h3>
        <p class="text-muted-foreground mb-4">${_escapeHtml(p.description || '')}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${(Array.isArray(p.technologies) ? p.technologies : []).map(t => `<span class="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">${_escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="flex gap-3 pt-4 border-t border-white/10">
          ${p.codeUrl ? `<a href="${p.codeUrl}" target="_blank" class="inline-flex items-center gap-2 text-white! hover:text-secondary! transition-all duration-300 text-sm font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-secondary shrink-0">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
            <span data-key="codigo" class="lang-text">Código</span>
          </a>` : ''}
          ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" class="inline-flex items-center gap-2 text-white! hover:text-secondary! transition-all duration-300 text-sm font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-secondary shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span data-key="verMas" class="lang-text">Ver más</span>
          </a>` : ''}
        </div>
      </div>
    `;

    grid.appendChild(card);
  }

  // Activar animaciones de reveal
  if (typeof initScrollEffects === 'function') initScrollEffects();
  if (typeof initScrollAnimations === 'function') initScrollAnimations();
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
