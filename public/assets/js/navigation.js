/**
 * Navigation — Menú móvil, enlaces de navegación, scroll a sección
 */

function initNavigation() {
  initMobileMenu();
  initNavigationLinks();
  initSpecialButtons();
}

function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  if (!mobileMenuButton || !mobileNav) return;

  mobileMenuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('flex');
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });
}

function openMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  mobileNav.classList.remove('hidden');
  mobileNav.classList.add('flex');
  mobileMenuButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
}

function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (!mobileNav || !mobileMenuButton) return;
  mobileNav.classList.remove('flex');
  mobileNav.classList.add('hidden');
  mobileMenuButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <line x1="4" x2="20" y1="12" y2="12"></line>
      <line x1="4" x2="20" y1="6" y2="6"></line>
      <line x1="4" x2="20" y1="18" y2="18"></line>
    </svg>
  `;
}

function initNavigationLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      if (sectionId) scrollToSection(sectionId);
    });
  });
}

function initSpecialButtons() {
  const projectsBtn = document.querySelector('.projects-btn');
  if (projectsBtn) projectsBtn.addEventListener('click', () => scrollToSection('proyectos'));

  const contactBtn = document.querySelector('.contact-btn');
  if (contactBtn) contactBtn.addEventListener('click', () => scrollToSection('contacto'));
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  closeMobileMenu();

  // Ojo: aquí NO se usa `behavior: 'smooth'` a propósito. GSAP ScrollTrigger ancla
  // secciones (pin) en esta página y cancela el scroll suave nativo: tanto
  // `scrollIntoView` como `window.scrollTo` con `smooth` se quedan en no-op y la
  // página no se mueve. El tween por requestAnimationFrame de abajo sí funciona.
  // La cabecera es `sticky top-0`, así que se descuenta su alto para no dejar el
  // título de la sección tapado.
  const header = document.querySelector('header');
  const offset = header ? header.getBoundingClientRect().height : 0;
  const destino = Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset);

  smoothScrollTo(destino);

  if (sectionId === 'habilidades' && typeof animateSkillBarsNow === 'function') {
    setTimeout(() => animateSkillBarsNow(), 150);
  }
}

let scrollAnimId = null;

function smoothScrollTo(destino, duracion = 700) {
  if (scrollAnimId) cancelAnimationFrame(scrollAnimId);

  const inicio = window.scrollY;
  const delta = destino - inicio;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || Math.abs(delta) < 2) {
    window.scrollTo(0, destino);
    return;
  }

  const cancelar = () => {
    if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
    scrollAnimId = null;
    limpiar();
  };
  const limpiar = () => {
    window.removeEventListener('wheel', cancelar);
    window.removeEventListener('touchstart', cancelar);
  };
  window.addEventListener('wheel', cancelar, { passive: true, once: true });
  window.addEventListener('touchstart', cancelar, { passive: true, once: true });

  const t0 = performance.now();
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const paso = (ahora) => {
    const t = Math.min(1, (ahora - t0) / duracion);
    window.scrollTo(0, inicio + delta * easeInOutCubic(t));
    if (t < 1) {
      scrollAnimId = requestAnimationFrame(paso);
    } else {
      scrollAnimId = null;
      limpiar();
    }
  };
  scrollAnimId = requestAnimationFrame(paso);
}

// Exportaciones globales
window.scrollToSection = scrollToSection;
window.closeMobileMenu = closeMobileMenu;
