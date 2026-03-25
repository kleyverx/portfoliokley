/**
 * Core — Orquestador principal y utilidades compartidas
 * Carga traducciones, inicializa todos los módulos, manejo de errores global.
 */

// ============================================================================
// VARIABLES GLOBALES
// ============================================================================
let translations = null;

// ============================================================================
// UTILIDADES COMPARTIDAS
// ============================================================================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  switch (type) {
    case 'error': console.error(prefix, message); break;
    case 'warn':  console.warn(prefix, message);  break;
    default:      console.log(prefix, message);
  }
}

// ============================================================================
// CARGA DE TRADUCCIONES
// ============================================================================
async function loadTranslations() {
  if (translations) return translations;
  try {
    const fetchPath = ((window.BASE_URL || '') + '/assets/data/translations.json').replace(/\/+/g, '/');
    const res = await fetch(fetchPath, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    if (!text || !text.trim()) throw new Error('Empty translations.json');
    translations = JSON.parse(text);
    window.translations = translations;
    console.log('✅ Traducciones cargadas correctamente');
    return translations;
  } catch (err) {
    console.error('❌ Error al cargar traducciones:', err);
    translations = null;
    return null;
  }
}

// ============================================================================
// ANIMACIONES DE SCROLL (IntersectionObserver)
// ============================================================================
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll(".animate-section").forEach((s) => observer.observe(s));
  document.querySelectorAll(".animate-element").forEach((e) => observer.observe(e));
}

// ============================================================================
// SCROLL EFFECTS (reveal de cards)
// ============================================================================
function initScrollEffects() {
  const projectCards = document.querySelectorAll('.project-card');
  if (!projectCards.length) return;

  projectCards.forEach((card, index) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            entry.target.classList.add('revealed');
          }, index * 100);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
    observer.observe(card);
  });
}

// ============================================================================
// GSAP (placeholder — las animaciones se manejan via IntersectionObserver)
// ============================================================================
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') {
    console.warn('⚠️ GSAP no está disponible');
    return;
  }
  console.log('✅ GSAP disponible');
}

// ============================================================================
// INTERACTIVE MOTION (opcional, deshabilitado por defecto)
// ============================================================================
const ENABLE_CUSTOM_CURSOR = false;
const ENABLE_INTERACTIVE_MOTION = false;

function initInteractiveMotion() {
  const hasGSAP = typeof gsap !== 'undefined';
  const elements = Array.from(document.querySelectorAll('.reactive, [data-reactive]'));
  if (!elements.length) return;

  const state = { x: 0, y: 0, rafId: null };

  const update = () => {
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (state.x - cx) / rect.width;
      const dy = (state.y - cy) / rect.height;
      const dist = Math.hypot(dx, dy);
      const rotateY = dx * 6;
      const rotateX = -dy * 6;
      const scale = 1 + Math.max(0, 0.06 - dist * 0.08);
      const bright = 1 + Math.max(0, 0.25 - dist * 0.5) * 0.25;
      const sat = 1 + Math.max(0, 0.25 - dist * 0.5) * 0.2;
      const transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
      const filter = `brightness(${bright}) saturate(${sat})`;
      if (hasGSAP) {
        gsap.to(el, { transform, duration: 0.2, ease: 'power3.out' });
        gsap.to(el, { filter, duration: 0.2, ease: 'power3.out' });
      } else {
        el.style.transform = transform;
        el.style.filter = filter;
      }
    });
    state.rafId = null;
  };

  window.addEventListener('pointermove', (e) => {
    state.x = e.clientX; state.y = e.clientY;
    if (!state.rafId) state.rafId = requestAnimationFrame(update);
  }, { passive: true });

  const resetAll = () => {
    elements.forEach((el) => {
      if (hasGSAP) {
        gsap.to(el, { transform: 'none', filter: 'none', duration: 0.3, ease: 'power3.out' });
      } else { el.style.transform = 'none'; el.style.filter = 'none'; }
    });
  };
  window.addEventListener('pointerleave', resetAll, { passive: true });
  window.addEventListener('blur', resetAll, { passive: true });
}

// ============================================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================================
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 Iniciando aplicación...');

  const loadedTranslations = await loadTranslations();
  if (!loadedTranslations) {
    console.error("❌ No se pudieron cargar las traducciones.");
    return;
  }
  translations = loadedTranslations;

  try {

    // 2. Scroll animations (IntersectionObserver, no depende de GSAP)
    initScrollAnimations();
    console.log('✅ Animaciones de scroll inicializadas');

    // 3. UI modules
    if (typeof initSkillBarsAnimation === 'function') {
      initSkillBarsAnimation();
      console.log('✅ Barras de habilidades inicializadas');
    }
    if (typeof initNavigation === 'function') {
      initNavigation();
      console.log('✅ Navegación inicializada');
    }
    if (typeof initLanguageSelector === 'function') {
      initLanguageSelector();
      console.log('✅ Selector de idioma inicializado');
    }
    if (typeof initContactForm === 'function') {
      initContactForm();
      console.log('✅ Formulario de contacto inicializado');
    }
    if (typeof initDownloadCV === 'function') {
      initDownloadCV();
      console.log('✅ Descarga CV inicializada');
    }

    // 4. GSAP scroll effects
    initGSAPAnimations();
    initScrollEffects();
    console.log('✅ Efectos de scroll inicializados');

    // 5. Módulos opcionales
    if (ENABLE_CUSTOM_CURSOR && typeof initCustomCursor === 'function') {
      try { initCustomCursor(); } catch (e) { console.warn('⚠️ Cursor:', e); }
    }
    if (ENABLE_INTERACTIVE_MOTION) {
      try { initInteractiveMotion(); } catch (e) { console.warn('⚠️ Motion:', e); }
    }

    // 6. Módulos de contenido dinámico
    if (typeof initProjectsModule === 'function') {
      try { initProjectsModule(); console.log('✅ Proyectos dinámicos inicializados'); }
      catch (e) { console.warn('⚠️ Proyectos:', e); }
    }
    if (typeof initVideosModule === 'function') {
      try { initVideosModule(); console.log('✅ Videos dinámicos inicializados'); }
      catch (e) { console.warn('⚠️ Videos:', e); }
    }

    console.log('🎉 Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
});

// ============================================================================
// MANEJO DE ERRORES GLOBALES
// ============================================================================
window.addEventListener('error', (event) => {
  console.error('❌ Error no capturado:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promesa rechazada no capturada:', event.reason);
});

// ============================================================================
// EXPORTACIONES GLOBALES
// ============================================================================
window.escapeHtml = escapeHtml;
window.initScrollAnimations = initScrollAnimations;
window.initScrollEffects = initScrollEffects;
