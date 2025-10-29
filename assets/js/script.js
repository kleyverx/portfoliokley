/**
 * Script Principal - Funcionalidad Core
 * Contiene únicamente las funciones esenciales para el funcionamiento básico
 * de la aplicación web del portafolio.
 * 
 * Funcionalidades incluidas:
 * - Carga de traducciones
 * - Inicialización básica del sitio
 * - Navegación y menú móvil
 * - Selector de idioma
 * - Formulario de contacto
 * - Animaciones básicas con scroll
 * - Configuración de Lenis (scroll suave)
 * - Animaciones iniciales con GSAP
 * - Funcionalidad de descarga de CV
 */

// ============================================================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ============================================================================

let translations = null;

// ============================================================================
// CARGA DE TRADUCCIONES
// ============================================================================

/**
 * Carga las traducciones desde el archivo JSON externo
 * @returns {Object|null} Objeto con las traducciones o null si hay error
 */
async function loadTranslations() {
  if (translations) return translations;
  
  try {
    const res = await fetch('assets/data/translations.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    
    const text = await res.text();
    if (!text || !text.trim()) throw new Error('Empty translations.json');
    
    translations = JSON.parse(text);
    console.log('✅ Traducciones cargadas correctamente');
    return translations;
  } catch (err) {
    console.error('❌ Error al cargar traducciones:', err);
    translations = null;
    return null;
  }
}

// ============================================================================
// INICIALIZACIÓN PRINCIPAL
// ============================================================================

/**
 * Inicialización principal del sitio web
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Iniciando aplicación...');
  
  // 1. Cargar traducciones (crítico)
  const loadedTranslations = await loadTranslations();
  if (!loadedTranslations) {
    console.error("❌ No se pudieron cargar las traducciones. El sitio no funcionará correctamente.");
    return;
  }
  translations = loadedTranslations;
  
  // 2. Inicializar funcionalidades core en orden de prioridad
  try {
    initScrollAnimations();
    console.log('✅ Animaciones de scroll inicializadas');
  
    // Nueva: animación de barras de habilidades
    initSkillBarsAnimation();
    console.log('✅ Barras de habilidades inicializadas');
  
    initNavigation();
    console.log('✅ Navegación inicializada');
  
    initLanguageSelector();
    console.log('✅ Selector de idioma inicializado');
  
    initContactForm();
    console.log('✅ Formulario de contacto inicializado');
  
    initLenis();
    console.log('✅ Scroll suave (Lenis) inicializado');
  
    initGSAPAnimations();
    console.log('✅ Animaciones GSAP inicializadas');
  
    initDownloadCV();
    console.log('✅ Funcionalidad de descarga CV inicializada');
  
    // Initialize scroll effects
    initScrollEffects();
    console.log('✅ Efectos de scroll inicializados');
  
    // 3. Inicializar módulos opcionales
    initOptionalModules();
  
    console.log('🎉 Aplicación inicializada correctamente');
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
});

// ============================================================================
// ANIMACIONES DE SCROLL
// ============================================================================

/**
 * Inicializa las animaciones que se activan con el scroll
 * Utiliza Intersection Observer para detectar elementos visibles
 */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    },
    { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  // Observar secciones principales
  const sections = document.querySelectorAll(".animate-section");
  sections.forEach((section) => {
    observer.observe(section);
  });

  // Observar elementos individuales
  const elements = document.querySelectorAll(".animate-element");
  elements.forEach((element) => {
    observer.observe(element);
  });
}

// ============================================================================
// SISTEMA DE NAVEGACIÓN
// ============================================================================

/**
 * Inicializa todo el sistema de navegación
 * Incluye menú móvil y enlaces de navegación
 */
function initNavigation() {
  initMobileMenu();
  initNavigationLinks();
  initSpecialButtons();
}

/**
 * Inicializa el menú móvil (hamburguesa)
 */
function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (!mobileMenuButton || !mobileNav) return;
  
  mobileMenuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('flex');
    
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

/**
 * Abre el menú móvil
 */
function openMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  
  mobileNav.classList.remove('hidden');
  mobileNav.classList.add('flex');
  
  // Cambiar ícono a X
  mobileMenuButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
}

/**
 * Cierra el menú móvil
 */
function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  
  mobileNav.classList.remove('flex');
  mobileNav.classList.add('hidden');
  
  // Cambiar ícono a hamburguesa
  mobileMenuButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <line x1="4" x2="20" y1="12" y2="12"></line>
      <line x1="4" x2="20" y1="6" y2="6"></line>
      <line x1="4" x2="20" y1="18" y2="18"></line>
    </svg>
  `;
}

/**
 * Inicializa los enlaces de navegación
 */
function initNavigationLinks() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      if (sectionId) {
        scrollToSection(sectionId);
      }
    });
  });
}

/**
 * Inicializa botones especiales de navegación
 */
function initSpecialButtons() {
  // Botón de proyectos
  const projectsBtn = document.querySelector('.projects-btn');
  if (projectsBtn) {
    projectsBtn.addEventListener('click', () => scrollToSection('proyectos'));
  }

  // Botón de contacto
  const contactBtn = document.querySelector('.contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => scrollToSection('contacto'));
  }
}

/**
 * Desplazamiento suave a una sección específica
 * @param {string} sectionId - ID de la sección destino
 */
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  // Cerrar menú móvil si está abierto
  closeMobileMenu();
  
  // Scroll suave a la sección
  section.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });

  // Si vamos a habilidades, asegurar que las barras se animen al llegar
  if (sectionId === 'habilidades') {
    setTimeout(() => {
      animateSkillBarsNow();
    }, 150);
  }
}

// ============================================================================
// SISTEMA DE IDIOMAS
// ============================================================================

/**
 * Inicializa el selector de idioma y el sistema de traducciones
 */
function initLanguageSelector() {
  const languageSelector = document.getElementById('language-selector');
  if (!languageSelector) return;
  
  // Establecer idioma predeterminado
  let currentLanguage = 'es';
  
  // Verificar idioma guardado
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
    languageSelector.value = currentLanguage;
  }
  
  // Aplicar traducciones iniciales
  applyTranslations(currentLanguage);
  
  // Escuchar cambios de idioma
  languageSelector.addEventListener('change', (e) => {
    const newLanguage = e.target.value;
    if (translations[newLanguage]) {
      localStorage.setItem('language', newLanguage);
      applyTranslations(newLanguage);
      console.log(`🌐 Idioma cambiado a: ${newLanguage}`);
    }
  });
}

/**
 * Aplica las traducciones para el idioma especificado
 * @param {string} language - Código del idioma (es, en, etc.)
 */
function applyTranslations(language) {
  if (!translations || !translations[language]) {
    console.error(`❌ No se encontraron traducciones para: ${language}`);
    return;
  }
  
  const trans = translations[language];
  
  // Aplicar traducciones a elementos con clase lang-text
  const elements = document.querySelectorAll('.lang-text');
  elements.forEach(element => {
    const key = element.getAttribute('data-key');
    if (key && trans[key]) {
      element.textContent = trans[key];
    }
  });
  
  // Actualizar placeholders de formularios
  updateFormPlaceholders(language);
}

/**
 * Actualiza los placeholders de los formularios
 * @param {string} language - Código del idioma
 */
function updateFormPlaceholders(language) {
  const trans = translations[language];
  if (!trans) return;
  
  const placeholderMappings = [
    { id: 'first-name', key: 'nombre' },
    { id: 'last-name', key: 'apellido' },
    { id: 'email', placeholder: 'ejemplo@email.com' },
    { id: 'subject', key: 'asunto' },
    { id: 'message', key: 'escribeMensaje' }
  ];
  
  placeholderMappings.forEach(({ id, key, placeholder }) => {
    const element = document.getElementById(id);
    if (element) {
      element.placeholder = placeholder || trans[key] || '';
    }
  });
}

// ============================================================================
// FORMULARIO DE CONTACTO
// ============================================================================

/**
 * Inicializa el formulario de contacto con EmailJS
 */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', handleContactFormSubmit);
}

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} event - Evento de submit del formulario
 */
function handleContactFormSubmit(event) {
  event.preventDefault();
  
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  
  // Cambiar estado del botón
  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  
  // Configuración de EmailJS
  const serviceID = 'default_service';
  const templateID = 'template_b3lq30k';
  
  // Enviar email
  emailjs.sendForm(serviceID, templateID, event.target)
    .then(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('¡Mensaje enviado con éxito!');
      event.target.reset();
      console.log('✅ Formulario enviado correctamente');
    })
    .catch((err) => {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('Error al enviar el mensaje: ' + JSON.stringify(err));
      console.error('❌ Error al enviar formulario:', err);
    });
}

// ============================================================================
// SCROLL SUAVE CON LENIS
// ============================================================================

/**
 * Inicializa Lenis para scroll suave
 */
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('⚠️ Lenis no está disponible');
    return;
  }

  // Si ya existe una instancia activa, evitar re-inicializar
  if (window.lenis) {
    // Reiniciar su bucle RAF si estuviera detenido
    if (!window.lenisRafId) {
      const raf = (time) => {
        window.lenis.raf(time);
        window.lenisRafId = requestAnimationFrame(raf);
      };
      window.lenisRafId = requestAnimationFrame(raf);
    }
    return;
  }

  // Crear instancia global y bucle RAF controlable
  window.lenis = new Lenis({
    smooth: true,
    lerp: 0.1,
    duration: 1.2
  });

  const raf = (time) => {
    window.lenis.raf(time);
    window.lenisRafId = requestAnimationFrame(raf);
  };
  window.lenisRafId = requestAnimationFrame(raf);
}

// ============================================================================
// ANIMACIONES CON GSAP
// ============================================================================

/**
 * Inicializa las animaciones básicas con GSAP
 */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') {
    console.warn('⚠️ GSAP no está disponible');
    return;
  }
  
  console.log('✅ GSAP disponible, pero las animaciones se manejan via IntersectionObserver');
  // Las animaciones se manejan completamente via CSS + IntersectionObserver
  // No necesitamos GSAP para las animaciones de entrada básicas
}

// ============================================================================
// DESCARGA DE CV
// ============================================================================

/**
 * Inicializa la funcionalidad de descarga del CV
 */
function initDownloadCV() {
  const downloadBtn = document.getElementById('download-cv');
  if (!downloadBtn) return;
  
  downloadBtn.addEventListener('click', function() {
    const cvUrl = 'assets/images/public/cv.pdf';
    const link = document.createElement('a');
    link.href = cvUrl;
    link.download = 'KleyverUrbina-CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('📄 Descarga de CV iniciada');
  });
}

// ============================================================================
// MÓDULOS OPCIONALES
// ============================================================================

// ============================================================================
// INTERACCIÓN REACTIVA CON EL CURSOR
// ============================================================================
function initInteractiveMotion() {
  const hasGSAP = typeof gsap !== 'undefined';
  const elements = Array.from(document.querySelectorAll('.reactive, [data-reactive]'));
  if (!elements.length) {
    console.log('ℹ️ No hay elementos reactivos (.reactive o [data-reactive]) en la página');
    return;
  }

  const state = { x: 0, y: 0, rafId: null };

  const update = () => {
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (state.x - cx) / rect.width;
      const dy = (state.y - cy) / rect.height;
      const dist = Math.hypot(dx, dy);

      // Efectos visuales: rotación, escala y ajuste de brillo/saturación
      const rotateY = dx * 6;        // rotación horizontal
      const rotateX = -dy * 6;       // rotación vertical
      const scale = 1 + Math.max(0, 0.06 - dist * 0.08); // escala cerca del cursor
      const bright = 1 + Math.max(0, 0.25 - dist * 0.5) * 0.25; // conservar paleta, solo brillo
      const sat = 1 + Math.max(0, 0.25 - dist * 0.5) * 0.2;     // conservar paleta, solo saturación
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

  const onMove = (e) => {
    state.x = e.clientX;
    state.y = e.clientY;
    if (!state.rafId) {
      state.rafId = requestAnimationFrame(update);
    }
  };

  const resetAll = () => {
    elements.forEach((el) => {
      if (hasGSAP) {
        gsap.to(el, { transform: 'none', filter: 'none', duration: 0.3, ease: 'power3.out' });
      } else {
        el.style.transform = 'none';
        el.style.filter = 'none';
      }
      el.classList.add('is-reset');
      setTimeout(() => el.classList.remove('is-reset'), 200);
    });
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', resetAll, { passive: true });
  window.addEventListener('blur', resetAll, { passive: true });

  console.log('✅ Interacción reactiva con cursor iniciada');
}

/**
 * Inicializa módulos opcionales (cursor personalizado, etc.)
 * Estos módulos no son críticos para el funcionamiento básico
 */
// Flags de características para habilitar/deshabilitar efectos opcionales
const ENABLE_CUSTOM_CURSOR = false;
const ENABLE_INTERACTIVE_MOTION = false;

function initOptionalModules() {
  // Inicializar cursor personalizado si está disponible y habilitado
  if (ENABLE_CUSTOM_CURSOR && typeof initCustomCursor === 'function') {
    try {
      initCustomCursor();
      console.log('✅ Cursor personalizado inicializado');
    } catch (error) {
      console.warn('⚠️ Error al inicializar cursor personalizado:', error);
    }
  }
  
  // Inicializar interacción reactiva sólo si está habilitada
  if (ENABLE_INTERACTIVE_MOTION) {
    try {
      initInteractiveMotion();
      console.log('✅ Interacción reactiva inicializada');
    } catch (error) {
      console.warn('⚠️ Error al inicializar interacción reactiva:', error);
    }
  }

  // Inicializar módulo dinámico de proyectos
  try {
    initProjectsModule();
    console.log('✅ Proyectos dinámicos inicializados');
  } catch (error) {
    console.warn('⚠️ Error al inicializar proyectos dinámicos:', error);
  }

  // Inicializar módulo dinámico de videos
  try {
    initVideosModule();
    console.log('✅ Videos dinámicos inicializados');
  } catch (error) {
    console.warn('⚠️ Error al inicializar videos dinámicos:', error);
  }
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Función de utilidad para logging con timestamp
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de log (info, warn, error)
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'error':
      console.error(prefix, message);
      break;
    case 'warn':
      console.warn(prefix, message);
      break;
    default:
      console.log(prefix, message);
  }
}

// ============================================================================
// MANEJO DE ERRORES GLOBALES
// ============================================================================

/**
 * Manejo de errores no capturados
 */
window.addEventListener('error', (event) => {
  console.error('❌ Error no capturado:', event.error);
});

/**
 * Manejo de promesas rechazadas no capturadas
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promesa rechazada no capturada:', event.reason);
});

// ============================================================================
// EXPORTACIONES (para compatibilidad con módulos)
// ============================================================================

// Hacer funciones disponibles globalmente si es necesario
window.scrollToSection = scrollToSection;
window.applyTranslations = applyTranslations;

// ============================================================================
// PROJECTS SCROLL EFFECTS
// ============================================================================

/**
 * Simple project reveal on scroll - no horizontal effects
 */
function initAutoScrollProjects() {
  // This function is now handled by initScrollEffects()
  console.log('Auto scroll projects disabled - using simple reveal instead');
}

/**
 * Initialize simple scroll reveal effects for project cards
 */
function initScrollEffects() {
  console.log('Initializing simple scroll effects...');
  
  // Get project cards
  const projectCards = document.querySelectorAll('.project-card');
  
  if (projectCards.length === 0) {
    console.log('No project cards found');
    return;
  }

  console.log(`Found ${projectCards.length} project cards`);

  // Simple scroll reveal animation for each card
  projectCards.forEach((card, index) => {
    // Create intersection observer for reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('revealed');
          }, index * 100); // Stagger animation
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(card);
  });
  
  console.log('Simple scroll effects initialized successfully');
}

// ============================================================================
// PROJECTS MODULE - SIMPLE GRID LAYOUT
// ============================================================================

// ============================================================================
// MÓDULO: PROYECTOS DINÁMICOS
// ============================================================================
function initProjectsModule() {
  const grid = document.querySelector('#projects-grid') || document.querySelector('#proyectos .mx-auto.grid');
  if (!grid) return;

  // Limpiar contenido estático
  grid.innerHTML = '';

  // Renderizar botón de "Agregar Proyecto"
  const actionsRow = document.querySelector('#proyectos .flex.justify-center');
  if (false && actionsRow && !actionsRow.querySelector('#add-project-btn')) {
    const addBtn = document.createElement('button');
    addBtn.id = 'add-project-btn';
    addBtn.className = 'border border-primary/50 hover:border-primary px-4 py-2 rounded-md inline-flex items-center ml-3';
    addBtn.innerHTML = '<span>Agregar Proyecto</span>';
    addBtn.addEventListener('click', openAddProjectPrompt);
    actionsRow.appendChild(addBtn);
  }

  // Cargar y renderizar proyectos
  loadAndRenderProjects(grid);
}

async function loadAndRenderProjects(grid) {
  const base = await fetchProjectsData();
  const user = []; // Deshabilitado: cargar solo desde projects.json
  const projects = [...base, ...user];

  // Ordenar por fecha descendente si existe
  projects.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Limitar a máximo 10 proyectos
  const limited = projects.slice(0, 10);

  renderProjects(limited, grid);
  initProjectDescToggles(grid);
}

async function fetchProjectsData() {
  try {
    const res = await fetch('assets/data/projects.json', { cache: 'no-store' });
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

function getUserProjects() {
  try {
    const raw = localStorage.getItem('userProjects');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function saveUserProjects(arr) {
  try {
    localStorage.setItem('userProjects', JSON.stringify(arr));
  } catch {}
}

function openAddProjectPrompt() {
  const title = prompt('Título del proyecto:');
  if (!title) return;
  const description = prompt('Descripción:') || '';
  const technologies = (prompt('Tecnologías (separadas por coma):') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const image = prompt('URL de imagen (de preferencia local en assets/images/public/...):') || 'assets/images/public/proyecto1/2.png';
  const codeUrl = prompt('URL del código (GitHub):') || '';
  const demoUrl = prompt('URL de demo (opcional):') || '';

  const project = {
    id: 'user-' + Date.now(),
    title, description, technologies, image, codeUrl, demoUrl,
    date: new Date().toISOString(),
    featured: false
  };

  const user = getUserProjects();
  user.push(project);
  saveUserProjects(user);

  const grid = document.querySelector('#projects-grid') || document.querySelector('#proyectos .mx-auto.grid');
  if (grid) loadAndRenderProjects(grid);
}

function renderProjects(projects, grid) {
  // Clear grid and render as simple cards
  grid.innerHTML = '';
  
  for (const p of projects) {
    const card = document.createElement('div');
    card.className = 'project-card bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8';

    const imgSrc = p.image || 'assets/images/public/perfil.jpeg';

    card.innerHTML = `
      <div class="aspect-video">
        <img src="${imgSrc}" alt="Imagen del proyecto" class="object-cover w-full h-full" onerror="this.src='assets/images/public/perfil.jpeg';this.onerror=null;">
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2 text-foreground">${escapeHtml(p.title || 'Proyecto')}</h3>
        <p class="text-muted-foreground mb-4">${escapeHtml(p.description || '')}</p>
        <div class="flex flex-wrap gap-2 mb-4">
          ${(Array.isArray(p.technologies) ? p.technologies : []).map(t => `<span class="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-full">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="flex gap-3">
          ${p.codeUrl ? `<a href="${p.codeUrl}" target="_blank" class="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
            Código
          </a>` : ''}
          ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" class="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Demo
          </a>` : ''}
        </div>
      </div>
    `;

    grid.appendChild(card);
  }
  
  // Initialize simple reveal animation
  initScrollEffects();
  
  if (typeof initScrollAnimations === 'function') initScrollAnimations();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================================
// MÓDULO: VIDEOS DINÁMICOS
// ============================================================================
function initVideosModule() {
  const grid = document.querySelector('#videos-grid') || document.querySelector('#videos .mx-auto.grid');
  if (!grid) return;

  // Limpiar contenido estático
  grid.innerHTML = '';

  // Renderizar botón de "Agregar Video"
  const actionsRow = document.querySelector('#videos .flex.justify-center');
  if (false && actionsRow && !actionsRow.querySelector('#add-video-btn')) {
    const addBtn = document.createElement('button');
    addBtn.id = 'add-video-btn';
    addBtn.className = 'border border-primary/50 hover:border-primary px-4 py-2 rounded-md inline-flex items-center ml-3';
    addBtn.innerHTML = '<span>Agregar Video</span>';
    addBtn.addEventListener('click', openAddVideoPrompt);
    actionsRow.appendChild(addBtn);
  }

  loadAndRenderVideos(grid);
}

async function loadAndRenderVideos(grid) {
  const base = await fetchVideosData();
  const user = []; // Deshabilitado: cargar solo desde videos.json
  const videos = [...base, ...user];
  videos.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Limitar a máximo 3 videos
  const limited = videos.slice(0, 3);

  renderVideos(limited, grid);
}

async function fetchVideosData() {
  try {
    const res = await fetch('assets/data/videos.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const txt = await res.text();
    if (!txt || !txt.trim()) return [];
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('⚠️ No se pudieron cargar videos.json:', err);
    return [];
  }
}

function getUserVideos() {
  try {
    const raw = localStorage.getItem('userVideos');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function saveUserVideos(arr) {
  try { localStorage.setItem('userVideos', JSON.stringify(arr)); } catch {}
}

function openAddVideoPrompt() {
  const type = (prompt('Tipo de video (youtube/tiktok):') || '').trim().toLowerCase();
  if (!['youtube', 'tiktok'].includes(type)) return;
  const title = prompt('Título del video:') || '';
  const description = prompt('Descripción:') || '';

  let embedUrl = '';
  let cite = '';
  let videoId = '';

  if (type === 'youtube') {
    const input = prompt('URL completa de YouTube o ID del video:') || '';
    if (/^https?:\/\//.test(input)) {
      const m = input.match(/[?&]v=([\w-]+)/) || input.match(/youtu\.be\/([\w-]+)/) || input.match(/embed\/([\w-]+)/);
      videoId = m ? m[1] : input;
    } else {
      videoId = input;
    }
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (type === 'tiktok') {
    const url = prompt('URL completa de TikTok (ej: https://www.tiktok.com/@usuario/VIDEO_ID):') || '';
    cite = url;
    const mm = url.match(/\/(\d{10,})/);
    videoId = mm ? mm[1] : '';
  }

  const video = { id: 'userv-' + Date.now(), type, title, description, embedUrl, cite, videoId, date: new Date().toISOString() };
  const user = getUserVideos();
  user.push(video);
  saveUserVideos(user);

  const grid = document.querySelector('#videos-grid') || document.querySelector('#videos .mx-auto.grid');
  if (grid) loadAndRenderVideos(grid);
}

function renderVideos(videos, grid) {
  const frag = document.createDocumentFragment();

  for (const v of videos) {
    const card = document.createElement('div');
    card.className = 'video-card group relative overflow-hidden rounded-lg border border-primary/20 animate-element opacity-0 transition-all duration-700 hover:border-primary/50 transition-all duration-300';

    let mediaHTML = '';
    if (v.type === 'youtube' && v.embedUrl) {
      // Crear un overlay clickeable para YouTube
      mediaHTML = `<div class="aspect-video relative cursor-pointer" onclick="openVideoTheater('${v.embedUrl}', '${escapeHtml(v.title || 'Video')}', '${escapeHtml(v.description || '')}')">
        <iframe class="w-full h-full pointer-events-none" src="${v.embedUrl}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div class="play-button-overlay opacity-0 hover:opacity-100 transition-opacity duration-300">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="rgba(191, 0, 255, 0.8)"/>
              <path d="M10 8l6 4-6 4V8z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>`;
    } else if (v.type === 'tiktok' && (v.cite || v.videoId)) {
      const cite = v.cite || `https://www.tiktok.com/@unknown/${v.videoId}`;
      const vidId = v.videoId || '';
      // Para TikTok, crear un overlay similar
      mediaHTML = `<div class="aspect-video relative cursor-pointer" onclick="openVideoTheater('${cite}', '${escapeHtml(v.title || 'Video')}', '${escapeHtml(v.description || '')}')">
        <blockquote class="tiktok-embed w-full pointer-events-none" cite="${cite}" ${vidId ? `data-video-id="${vidId}"` : ''}></blockquote>
        <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
          <div class="play-button-overlay opacity-0 hover:opacity-100 transition-opacity duration-300">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="12" fill="rgba(191, 0, 255, 0.8)"/>
              <path d="M10 8l6 4-6 4V8z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>`;
    }

    card.innerHTML = `
      ${mediaHTML}
      <div class="video-content p-4">
        <h3 class="font-semibold text-primary">${escapeHtml(v.title || 'Video')}</h3>
        <p class="text-sm text-mutedForeground">${escapeHtml(v.description || '')}</p>
      </div>
      <div class="focus-indicator"></div>
    `;

    // Agregar eventos de focus y táctiles (optimizado para mobile)
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
      // Desktop: usar hover para focus y click para abrir
      card.addEventListener('mouseenter', () => handleVideoFocus(card, grid));
      card.addEventListener('mouseleave', () => handleVideoBlur(card, grid));
      card.addEventListener('click', () => handleVideoClick(card, grid));
    } else {
      // Mobile/Touch: no bloquear scroll ni usar preventDefault
      // Sólo abrir el teatro con tap; no activar focus al tocar para evitar fricción
      let touchStartX = 0, touchStartY = 0, touchStartTime = 0, moved = false;

      const onTouchStart = (e) => {
        const t = e.changedTouches ? e.changedTouches[0] : e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchStartTime = Date.now();
        moved = false;
        // No llamar a handleVideoFocus en mobile para evitar bloqueos de scroll
      };

      const onTouchMove = (e) => {
        const t = e.changedTouches ? e.changedTouches[0] : e.touches[0];
        const dx = Math.abs(t.clientX - touchStartX);
        const dy = Math.abs(t.clientY - touchStartY);
        if (dx > 6 || dy > 6) {
          moved = true; // Considerar como scroll
        }
      };

      const onTouchEnd = (e) => {
        const duration = Date.now() - touchStartTime;
        // Tap si no hubo desplazamiento significativo y la pulsación fue breve
        if (!moved && duration < 300) {
          handleVideoClick(card, grid);
        }
      };

      // Añadir listeners pasivos para permitir el scroll nativo
      card.addEventListener('touchstart', onTouchStart, { passive: true });
      card.addEventListener('touchmove', onTouchMove, { passive: true });
      card.addEventListener('touchend', onTouchEnd, { passive: true });
      // También reaccionar al click (por si hay emulación de click en algunos navegadores móviles)
      card.addEventListener('click', () => handleVideoClick(card, grid));
    }

    frag.appendChild(card);
  }

  grid.innerHTML = '';
  grid.appendChild(frag);
  refreshTikTokEmbeds();
  if (typeof initScrollAnimations === 'function') initScrollAnimations();
}

function refreshTikTokEmbeds() {
  // Si el script de TikTok ya está cargado, intentar refrescar; si no, cargarlo.
  const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
  if (!existing) {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.tiktok.com/embed.js';
    document.body.appendChild(s);
  } else {
    // Reinsertar para forzar reprocesado de nuevos blockquotes
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.tiktok.com/embed.js';
    document.body.appendChild(s);
  }
}

// Funciones para manejar efectos de focus en videos
function handleVideoFocus(card, grid) {
  // No procesar hover si el teatro de videos está activo
  if (document.body.classList.contains('video-theater-active') || window.performanceOptimizationActive) {
    return;
  }
  
  // Remover focus de otros videos
  const allCards = grid.querySelectorAll('.video-card');
  allCards.forEach(c => c.classList.remove('focused'));
  
  // Agregar focus al video actual
  card.classList.add('focused');
  grid.classList.add('has-focus');
}

function handleVideoBlur(card, grid) {
  // No procesar hover si el teatro de videos está activo
  if (document.body.classList.contains('video-theater-active') || window.performanceOptimizationActive) {
    return;
  }
  
  // Usar un pequeño delay para evitar parpadeos
  setTimeout(() => {
    // Verificar nuevamente si el teatro sigue inactivo
    if (document.body.classList.contains('video-theater-active') || window.performanceOptimizationActive) {
      return;
    }
    
    const focusedCards = grid.querySelectorAll('.video-card.focused');
    if (focusedCards.length === 0 || !grid.matches(':hover')) {
      card.classList.remove('focused');
      grid.classList.remove('has-focus');
    }
  }, 100);
}

function handleVideoClick(card, grid) {
  // Detectar si es dispositivo móvil
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  
  if (isMobile) {
    // En mobile, abrir directamente el video sin toggle de focus
    const videoUrl = card.dataset.videoUrl;
    const title = card.querySelector('h3')?.textContent || '';
    const description = card.querySelector('p')?.textContent || '';
    
    if (videoUrl) {
      openVideoTheater(videoUrl, title, description);
    }
  } else {
    // En desktop, mantener el comportamiento de toggle focus
    const isFocused = card.classList.contains('focused');
    
    if (isFocused) {
      // Si ya está enfocado, abrir el video
      const videoUrl = card.dataset.videoUrl;
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      
      if (videoUrl) {
        openVideoTheater(videoUrl, title, description);
      }
    } else {
      // Remover focus de otros videos
      const allCards = grid.querySelectorAll('.video-card');
      allCards.forEach(c => c.classList.remove('focused'));
      
      // Agregar focus al video actual
      card.classList.add('focused');
      grid.classList.add('has-focus');
    }
  }
}

// Funciones del Teatro de Video
// Variables globales para control de rendimiento (usamos window.* para consistencia entre archivos)
window.performanceOptimizationActive = false;
window.pausedAnimations = [];

// Función optimizada para abrir el teatro de videos
function openVideoTheater(videoUrl, title = '', description = '') {
  console.log('🎬 Abriendo teatro de video:', { videoUrl, title });
  
  // Pausar elementos intensivos ANTES de mostrar el video
  pausePerformanceIntensiveElements();
  
  const overlay = document.getElementById('video-theater-overlay');
  const iframe = document.getElementById('video-theater-iframe');
  const titleEl = document.getElementById('video-theater-title');
  const descEl = document.getElementById('video-theater-description');
  const loading = overlay.querySelector('.video-theater-loading');
  
  if (!overlay || !iframe) {
    console.error('❌ Elementos del teatro de video no encontrados');
    return;
  }
  
  // Configurar información del video
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = description;
  
  // Mostrar loading
  if (loading) {
    loading.style.display = 'flex';
  }
  iframe.classList.remove('loaded');
  
  // Mostrar overlay inmediatamente
  overlay.classList.add('active');
  document.body.classList.add('video-theater-active');
  
  // Configurar URL del video con parámetros optimizados
  let optimizedUrl = videoUrl;
  
  // Para YouTube, agregar parámetros de optimización
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const separator = videoUrl.includes('?') ? '&' : '?';
    optimizedUrl = `${videoUrl}${separator}autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}&controls=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`;
  }
  
  // Cargar video con un pequeño delay para suavizar la transición
  setTimeout(() => {
    iframe.src = optimizedUrl;
    
    // Ocultar loading cuando el iframe cargue
    iframe.onload = function() {
      setTimeout(() => {
        if (loading) loading.style.display = 'none';
        iframe.classList.add('loaded');
      }, 500);
    };
  }, 100);
  
  console.log('✅ Teatro de video abierto correctamente');
}

// Función optimizada para cerrar el teatro de videos
function closeVideoTheater() {
  console.log('🎬 Cerrando teatro de video...');
  
  const overlay = document.getElementById('video-theater-overlay');
  const iframe = document.getElementById('video-theater-iframe');
  
  // Verificar que el overlay existe y está activo
  if (!overlay || !overlay.classList.contains('active')) return;
  
  // Detener video inmediatamente
  if (iframe) {
    iframe.src = '';
    iframe.classList.remove('loaded');
  }
  
  // Ocultar overlay
  overlay.classList.remove('active');
  document.body.classList.remove('video-theater-active');
  
  // Reanudar elementos pausados después de cerrar
  setTimeout(() => {
    console.log('🔄 Reanudando elementos de performance después de cerrar video');
    resumePerformanceIntensiveElements();
  }, 300);
  
  console.log('✅ Teatro de video cerrado correctamente');
}

// Cerrar con tecla Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('video-theater-overlay');
    if (overlay && overlay.classList.contains('active')) {
      closeVideoTheater();
    }
  }
});

// Cerrar al hacer clic fuera del video
document.addEventListener('click', function(e) {
  const overlay = document.getElementById('video-theater-overlay');
  const container = document.querySelector('.video-theater-container');
  
  // Verificar si el overlay está activo
  if (!overlay || !overlay.classList.contains('active')) return;
  
  // Cerrar si se hace clic en el overlay (fondo) pero NO en el contenedor del video
  if (e.target === overlay) {
    closeVideoTheater();
  }
});

// Mejorar cierre táctil para mobile
document.addEventListener('touchend', function(e) {
  const overlay = document.getElementById('video-theater-overlay');
  
  // Verificar si el overlay está activo
  if (!overlay || !overlay.classList.contains('active')) return;
  
  // Cerrar si se toca el overlay (fondo) pero NO el contenedor del video
  if (e.target === overlay) {
    e.preventDefault();
    closeVideoTheater();
  }
}, { passive: false });

// Hacer las funciones globales para que sean accesibles desde el HTML
window.closeVideoTheater = closeVideoTheater;

// (Variables globales ya definidas arriba con window.performanceOptimizationActive y window.pausedAnimations)

// FUNCIONES DE OPTIMIZACIÓN DE RENDIMIENTO
function pausePerformanceIntensiveElements() {
  if (window.performanceOptimizationActive) return;
  
  console.log('🔄 Pausando elementos que consumen recursos durante video...');
  window.performanceOptimizationActive = true;
  window.pausedAnimations = []; // Limpiar array
  
  // 1. Pausar animaciones GSAP de forma más agresiva
  if (typeof gsap !== 'undefined') {
    // Pausar todas las animaciones GSAP activas
    gsap.globalTimeline.pause();
    // También pausar cualquier ScrollTrigger activo
    if (gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.disable());
    }
    window.pausedAnimations.push('gsap');
  }
  
  // 2. Pausar Lenis (scroll suave) sin destruir (evita reflows y jank)
  if (window.lenis) {
    try {
      window.lenis.stop();
      if (window.lenisRafId) {
        cancelAnimationFrame(window.lenisRafId);
        window.lenisRafId = null;
      }
      window.pausedAnimations.push('lenis');
    } catch (e) {
      console.warn('⚠️ Error al pausar Lenis:', e);
    }
  }
  
  // 3. Pausar animaciones CSS intensivas (excluir [data-squares-bg], que es canvas)
  const intensiveElements = document.querySelectorAll('.spline-3d-container, .cursor-dot, .cursor-ring');
  intensiveElements.forEach(el => {
    el.style.animationPlayState = 'paused';
    el.style.transform = 'none'; // Detener transformaciones CSS
    el.classList.add('performance-paused');
  });
  
  // 4. Pausar animaciones de fondo de cuadrados de forma más eficiente
  if (typeof window.pauseSquaresBg === 'function') {
    console.log('🔄 Pausando fondo de cuadrados...');
    window.pauseSquaresBg();
    // Activar modo de rendimiento reducido
    if (typeof window.setSquaresBgReducedMode === 'function') {
      window.setSquaresBgReducedMode(true);
    }
    window.pausedAnimations.push('squares-bg');
  }
  
  // 5. Desactivar efectos de hover y motion
  document.body.classList.add('video-performance-mode');
  
  // 6. Reducir la frecuencia de actualización del cursor personalizado
  if (window.cursor) {
    window.cursor.style.display = 'none';
  }
  
  // 7. Pausar cualquier animación de partículas o efectos 3D
  const splineViewers = document.querySelectorAll('spline-viewer');
  splineViewers.forEach(viewer => {
    if (viewer.pause) viewer.pause();
  });
  
  console.log('✅ Elementos pausados para optimizar rendimiento');
}

function resumePerformanceIntensiveElements() {
  const wasActive = window.performanceOptimizationActive;
  if (!wasActive) {
    console.log('⚠️ No hay elementos pausados para reanudar (intentando asegurar estado del fondo de todas formas)');
  }
  
  console.log('🔄 Reanudando elementos pausados...', window.pausedAnimations);
  window.performanceOptimizationActive = false;
  
  // 1. Reanudar animaciones GSAP
  if (wasActive && window.pausedAnimations.includes('gsap') && typeof gsap !== 'undefined') {
    console.log('🔄 Reanudando GSAP...');
    gsap.globalTimeline.resume();
    // Reactivar ScrollTriggers
    if (gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.enable());
    }
  }
  
  // 2. Reanudar Lenis (scroll suave) sin recrear la instancia
  if (wasActive && window.pausedAnimations.includes('lenis')) {
    console.log('🔄 Reanudando Lenis...');
    try {
      if (window.lenis) {
        window.lenis.start();
        if (!window.lenisRafId) {
          const raf = (time) => {
            window.lenis.raf(time);
            window.lenisRafId = requestAnimationFrame(raf);
          };
          window.lenisRafId = requestAnimationFrame(raf);
        }
      } else {
        // Si no existe (por ejemplo, nunca se inicializó), inicializar suavemente
        setTimeout(() => initLenis(), 300);
      }
    } catch (e) {
      console.warn('⚠️ Error al reanudar Lenis:', e);
      setTimeout(() => initLenis(), 500);
    }
  }
  
  // 3. Reanudar animaciones de fondo de cuadrados
  // Reanudar SIEMPRE el fondo de cuadrados, aunque la bandera global no esté activa
  console.log('🔄 Asegurando estado del fondo de cuadrados...');
  if (typeof window.setSquaresBgReducedMode === 'function') {
    window.setSquaresBgReducedMode(false);
  }
  if (typeof window.resumeSquaresBg === 'function') {
    window.resumeSquaresBg();
  }
  setTimeout(() => {
    console.log('🔄 Forzando reinicio completo del fondo (fallback)...');
    if (typeof window.forceRestartSquaresBg === 'function') {
      window.forceRestartSquaresBg();
    }
  }, 200);
  
  // 4. Reanudar animaciones CSS
  const pausedElements = document.querySelectorAll('.performance-paused');
  pausedElements.forEach(el => {
    el.style.animationPlayState = 'running';
    el.style.transform = ''; // Restaurar transformaciones
    el.classList.remove('performance-paused');
  });
  
  // 5. Reanudar efectos normales
  document.body.classList.remove('video-performance-mode');
  
  // 6. Reactivar cursor personalizado
  if (window.cursor) {
    window.cursor.style.display = '';
  }
  
  // 7. Reanudar efectos 3D
  const splineViewers = document.querySelectorAll('spline-viewer');
  splineViewers.forEach(viewer => {
    if (viewer.play) viewer.play();
  });
  
  // Limpiar array de animaciones pausadas
  if (wasActive) {
    window.pausedAnimations = [];
  }
  
  console.log('✅ Elementos reanudados correctamente');
}


function animateSkillBarsNow() {
  const bars = document.querySelectorAll('#habilidades .h-2 > div');
  if (!bars.length) return;
  bars.forEach((bar) => {
    const match = bar.className.match(/w-\[(\d+)%\]/);
    const target = match ? parseInt(match[1], 10) : null;
    if (target !== null) {
      if (!bar.dataset.targetWidth) {
        bar.dataset.targetWidth = String(target);
      }
      // Dispara la animación inmediatamente
      bar.style.width = target + '%';
    }
  });
}
function initSkillBarsAnimation() {
  // Seleccionar todas las barras dentro de la sección habilidades
  const bars = document.querySelectorAll('#habilidades .h-2 > div');
  if (!bars.length) return;

  // Preparar cada barra: leer porcentaje de su clase w-[xx%], poner width:0 inicial
  bars.forEach((bar) => {
    const match = bar.className.match(/w-\[(\d+)%\]/);
    const target = match ? parseInt(match[1], 10) : null;
    if (target !== null) {
      bar.style.width = '0%';
      bar.dataset.targetWidth = String(target);
    }
  });

  // Observer para animar cuando entre en vista
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.dataset.targetWidth;
        if (target) {
          bar.style.width = target + '%';
        }
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20% 0px' });

  bars.forEach((bar) => observer.observe(bar));

  // Fallback: si la sección ya está visible al cargar, disparar animación
  const habilidades = document.getElementById('habilidades');
  if (habilidades) {
    const rect = habilidades.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      animateSkillBarsNow();
    }
  }
}
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // Cerrar menú móvil si está abierto
  closeMobileMenu();

  // Scroll suave a la sección
  section.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });

  // Si vamos a habilidades, asegurar que las barras se animen al llegar
  if (sectionId === 'habilidades') {
    setTimeout(() => {
      animateSkillBarsNow();
    }, 150);
  }
}

function initProjectDescToggles(grid) {
  try {
    const cards = grid.querySelectorAll('.project-card');
    cards.forEach(card => {
      const body = card.querySelector('.p-6');
      const desc = body ? body.querySelector('p.text-muted-foreground') : null;
      if (!desc || card.querySelector('.desc-toggle')) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'desc-toggle inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors mb-4';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="toggle-label">Ver más</span>\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="chevron" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

      // Insertar el botón justo después de la descripción
      desc.insertAdjacentElement('afterend', btn);

      // Manejador de despliegue
      btn.addEventListener('click', () => {
        const expanded = desc.classList.toggle('expanded');
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        const label = btn.querySelector('.toggle-label');
        if (label) label.textContent = expanded ? 'Ver menos' : 'Ver más';
      });
    });
  } catch (e) {
    console.warn('initProjectDescToggles error:', e);
  }
}