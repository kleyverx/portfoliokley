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

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (sectionId === 'habilidades' && typeof animateSkillBarsNow === 'function') {
    setTimeout(() => animateSkillBarsNow(), 150);
  }
}

// Exportaciones globales
window.scrollToSection = scrollToSection;
window.closeMobileMenu = closeMobileMenu;
