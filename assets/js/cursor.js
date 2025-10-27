/**
 * Módulo de Cursor Personalizado
 * Maneja toda la funcionalidad relacionada con el cursor personalizado
 * Incluye efectos visuales, animaciones y estados interactivos
 */

class CustomCursor {
  constructor() {
    // Verificar si ya existe una instancia
    if (window.customCursorInstance) {
      console.warn('⚠️ CustomCursor ya está inicializado');
      return window.customCursorInstance;
    }

    this.dot = null;
    this.ring = null;
    this.isHovering = false;
    this.isClicking = false;
    this.isInteractive = false;
    this.hasGSAP = typeof gsap !== 'undefined';
    this.setDotX = null;
    this.setDotY = null;
    this.setRingX = null;
    this.setRingY = null;
    
    this.init();
    
    // Guardar instancia global
    window.customCursorInstance = this;
  }

  init() {
    // Evitar en dispositivos táctiles
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarse) {
      console.log('ℹ️ Cursor personalizado no soportado en este dispositivo');
      return;
    }

    this.createCursorElements();
    this.setupInitialPosition();
    this.setupMovement();
    this.setupEventListeners();
    this.addCursorStyles();
  }

  createCursorElements() {
    // Limpiar elementos existentes primero
    this.removeCursorElements();
    
    // Crear elementos del cursor
    this.dot = document.createElement('div');
    this.dot.className = 'cursor-dot';
    
    this.ring = document.createElement('div');
    this.ring.className = 'cursor-ring';
    
    // Agregar al DOM
    document.body.appendChild(this.dot);
    document.body.appendChild(this.ring);
    
    console.log('✅ Elementos del cursor creados');
  }

  removeCursorElements() {
    // Remover elementos existentes si los hay
    const existingDots = document.querySelectorAll('.cursor-dot');
    const existingRings = document.querySelectorAll('.cursor-ring');
    
    existingDots.forEach(el => el.remove());
    existingRings.forEach(el => el.remove());
    
    if (existingDots.length > 0 || existingRings.length > 0) {
      console.log('🧹 Elementos duplicados del cursor removidos');
    }
  }

  setupInitialPosition() {
    // Posición inicial (centro de la pantalla)
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    if (this.hasGSAP) {
      gsap.set([this.dot, this.ring], { x: startX, y: startY });
    } else {
      this.dot.style.transform = `translate(${startX}px, ${startY}px)`;
      this.ring.style.transform = `translate(${startX}px, ${startY}px)`;
    }
  }

  setupMovement() {
    if (this.hasGSAP) {
      this.setDotX = gsap.quickTo(this.dot, 'x', { duration: 0.08, ease: 'power3.out' });
      this.setDotY = gsap.quickTo(this.dot, 'y', { duration: 0.08, ease: 'power3.out' });
      this.setRingX = gsap.quickTo(this.ring, 'x', { duration: 0.2, ease: 'power3.out' });
      this.setRingY = gsap.quickTo(this.ring, 'y', { duration: 0.2, ease: 'power3.out' });
    } else {
      // Fallback sin GSAP
      let dx = window.innerWidth / 2;
      let dy = window.innerHeight / 2;
      let rx = window.innerWidth / 2;
      let ry = window.innerHeight / 2;
      
      const lerp = (a, b, n) => a + (b - a) * n;
      
      const tick = () => {
        this.dot.style.transform = `translate(${dx}px, ${dy}px)`;
        this.ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(tick);
      };
      
      requestAnimationFrame(tick);
      
      this.setDotX = (x) => { dx = x; };
      this.setDotY = (y) => { dy = y; };
      this.setRingX = (x) => { rx = lerp(rx, x, 0.12); };
      this.setRingY = (y) => { ry = lerp(ry, y, 0.12); };
    }
  }

  updateCursorState() {
    document.body.classList.toggle('cursor-hover', this.isHovering);
    document.body.classList.toggle('cursor-click', this.isClicking);
    document.body.classList.toggle('cursor-interactive', this.isInteractive);
  }

  onMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    this.setDotX(x);
    this.setDotY(y);
    this.setRingX(x);
    this.setRingY(y);

    // Detectar elementos interactivos
    const target = e.target;
    const isInteractiveElement = target && (
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.type === 'submit' ||
      target.type === 'button' ||
      target.classList.contains('clickable') ||
      target.closest('a, button, [role="button"], .clickable, input, textarea, select')
    );
    
    if (isInteractiveElement !== this.isInteractive) {
      this.isInteractive = isInteractiveElement;
      this.updateCursorState();
    }
  };

  setupEventListeners() {
    // Capturar movimiento a nivel alto
    const addMoveListener = (target) => target && target.addEventListener('pointermove', this.onMove, { passive: true, capture: true });
    addMoveListener(window);
    addMoveListener(document);
    addMoveListener(document.documentElement);

    // Re-sincronizar al entrar al viewport
    const resync = (e) => this.onMove(e);
    window.addEventListener('pointerenter', resync, { passive: true, capture: true });

    // Efectos de clic
    window.addEventListener('pointerdown', (e) => {
      this.isClicking = true;
      this.updateCursorState();
      resync(e);
      
      if (this.hasGSAP) {
        gsap.to(this.ring, { scale: 0.7, duration: 0.1, ease: 'power3.out' });
        gsap.to(this.dot, { scale: 0.8, duration: 0.1, ease: 'power3.out' });
      }
    }, { passive: true, capture: true });

    window.addEventListener('pointerup', (e) => {
      this.isClicking = false;
      this.updateCursorState();
      resync(e);
      
      if (this.hasGSAP) {
        gsap.to(this.ring, { scale: 1, duration: 0.15, ease: 'power3.out' });
        gsap.to(this.dot, { scale: 1, duration: 0.15, ease: 'power3.out' });
      }
    }, { passive: true, capture: true });

    // Efectos de hover
    document.addEventListener('mouseenter', (e) => {
      const target = e.target;
      if (target && target.classList && (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.classList.contains('hover-effect') ||
        target.closest('a, button, [role="button"], .hover-effect')
      )) {
        this.isHovering = true;
        this.updateCursorState();
      }
    }, { capture: true });

    document.addEventListener('mouseleave', (e) => {
      const target = e.target;
      if (target && target.classList && (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.classList.contains('hover-effect') ||
        target.closest('a, button, [role="button"], .hover-effect')
      )) {
        this.isHovering = false;
        this.updateCursorState();
      }
    }, { capture: true });
  }

  addCursorStyles() {
    // Ocultar cursor nativo en elementos interactivos
    const style = document.createElement('style');
    style.textContent = `
      a, button, input, textarea, select, [role="button"], .clickable {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  destroy() {
    // Método para limpiar el cursor si es necesario
    this.removeCursorElements();
    document.body.classList.remove('cursor-hover', 'cursor-click', 'cursor-interactive');
    
    // Limpiar instancia global
    window.customCursorInstance = null;
    
    console.log('🗑️ Cursor personalizado destruido');
  }
}

// Función de inicialización para compatibilidad con el script principal
function initCustomCursor() {
  // Verificar si ya está inicializado
  if (window.customCursorInstance) {
    console.log('ℹ️ Cursor personalizado ya está activo');
    return window.customCursorInstance;
  }
  
  return new CustomCursor();
}

// Exportar para uso como módulo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CustomCursor, initCustomCursor };
}

// Hacer disponible globalmente
window.CustomCursor = CustomCursor;
window.initCustomCursor = initCustomCursor;