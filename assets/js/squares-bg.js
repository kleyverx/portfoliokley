/* Fondo de cuadrados interactivo (Squares) por sección
   - Renderiza un canvas por cada contenedor con [data-squares-bg]
   - El canvas se coloca DETRÁS del contenido (z-index: -1) dentro del contenedor
   - Mantiene paleta y densidad: 20px, bordes rgba(255, 0, 128, 0.1), hover fill rgba(255, 0, 128, 0.06)
   - Animación suave: desplazamiento a la derecha (20px cada 20s => 1px/s)
*/
(function () {
  'use strict';

  const CONFIG = {
    squareSize: 20,
    borderColor: 'rgba(191, 0, 255, 0.1)',
    hoverFillColor: 'rgba(191, 0, 255, 0.06)',
    speedPxPerSec: 1,
    direction: 'right',
    lineWidth: 1,
    maxDPR: 2,
  };

  const instances = [];
  let lastTime = 0;
  let animationId = null;
  let isPaused = false; // Variable para controlar la pausa

  // Función global para pausar las animaciones
  window.pauseSquaresBg = function() {
    isPaused = true;
  };

  // Función global para reanudar las animaciones
  window.resumeSquaresBg = function() {
    isPaused = false;
  };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initContainer(container) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';

    const cs = getComputedStyle(container);
    if (cs.position === 'static') container.style.position = 'relative';
    if (!cs.zIndex || cs.zIndex === 'auto') container.style.zIndex = '0';
    if (cs.overflow === 'visible') container.style.overflow = 'hidden';

    // Insertar al principio para orden de pintura predecible
    container.insertBefore(canvas, container.firstChild || null);

    // Leer configuración desde data- atributos (compatibles con React Bits)
    const ds = container.dataset;
    const instanceConfig = {
      squareSize: Math.max(4, parseInt(ds.squaresSize || ds.squareSize || CONFIG.squareSize, 10)),
      borderColor: ds.squaresBorder || ds.borderColor || CONFIG.borderColor,
      hoverFillColor: ds.squaresHoverFill || ds.hoverFillColor || CONFIG.hoverFillColor,
      speedPxPerSec: parseFloat(ds.squaresSpeed || ds.speed || CONFIG.speedPxPerSec),
      direction: (ds.squaresDirection || ds.direction || CONFIG.direction).toLowerCase(),
      // Permite forzar animación aunque el sistema tenga "reduce motion"
      ignoreReduced: (ds.squaresIgnoreReduced === 'true' || ds.ignoreReducedMotion === 'true' || ds.motionForce === 'true')
    };

    const ctx = canvas.getContext('2d');
    const state = {
      container,
      canvas,
      ctx,
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
      mouseX: -9999,
      mouseY: -9999,
      dpr: Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR),
      // Config per-instance
      squareSize: instanceConfig.squareSize,
      borderColor: instanceConfig.borderColor,
      hoverFillColor: instanceConfig.hoverFillColor,
      speedPxPerSec: instanceConfig.speedPxPerSec,
      direction: instanceConfig.direction,
      ignoreReduced: instanceConfig.ignoreReduced,
    };

    function resize() {
      const rect = container.getBoundingClientRect();
      state.width = Math.round(rect.width);
      state.height = Math.round(rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);
      state.dpr = dpr;
      canvas.width = Math.max(1, Math.floor(state.width * dpr));
      canvas.height = Math.max(1, Math.floor(state.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      state.mouseX = e.clientX - rect.left;
      state.mouseY = e.clientY - rect.top;
    }
    function onPointerLeave() {
      state.mouseX = -9999;
      state.mouseY = -9999;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener('resize', resize, { passive: true });
    // Escuchar movimientos del cursor a nivel de ventana para asegurar interacción aunque otro elemento esté delante
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    resize();
    instances.push(state);
  }

  function drawAll(time) {
    // Si está pausado, no actualizar las animaciones pero seguir el loop
    if (isPaused) {
      animationId = requestAnimationFrame(drawAll);
      return;
    }

    const dt = (time - lastTime) / 1000;
    lastTime = time;

    for (const s of instances) {
      const { ctx, width, height } = s;
      if (!prefersReduced || s.ignoreReduced) {
        const delta = s.speedPxPerSec * dt;
        switch (s.direction) {
          case 'right':
            s.offsetX = (s.offsetX + delta) % s.squareSize;
            break;
          case 'left':
            s.offsetX = (s.offsetX - delta + s.squareSize) % s.squareSize;
            break;
          case 'down':
            s.offsetY = (s.offsetY + delta) % s.squareSize;
            break;
          case 'up':
            s.offsetY = (s.offsetY - delta + s.squareSize) % s.squareSize;
            break;
          case 'diagonal':
            s.offsetX = (s.offsetX + delta) % s.squareSize;
            s.offsetY = (s.offsetY + delta) % s.squareSize;
            break;
          default:
            s.offsetX = (s.offsetX + delta) % s.squareSize;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(s.offsetX, s.offsetY);

      ctx.lineWidth = CONFIG.lineWidth;
      ctx.strokeStyle = s.borderColor;

      for (let x = -s.squareSize; x < width + s.squareSize; x += s.squareSize) {
        for (let y = -s.squareSize; y < height + s.squareSize; y += s.squareSize) {
          const cx = x + s.squareSize / 2;
          const cy = y + s.squareSize / 2;
          const dist = Math.hypot(s.mouseX - (cx - s.offsetX), s.mouseY - (cy - s.offsetY));
          const radius = s.squareSize * 1.2;
          if (dist < radius) {
            ctx.fillStyle = s.hoverFillColor;
            ctx.fillRect(x + 1, y + 1, s.squareSize - 2, s.squareSize - 2);
          }
          ctx.strokeRect(x + 0.5, y + 0.5, s.squareSize, s.squareSize);
        }
      }

      ctx.restore();
    }

    animationId = requestAnimationFrame(drawAll);
  }

  function init() {
    const containers = Array.from(document.querySelectorAll('[data-squares-bg]'));
    if (!containers.length) {
      console.warn('Squares BG: no hay contenedores con [data-squares-bg].');
      return;
    }
    for (const c of containers) initContainer(c);
    animationId = requestAnimationFrame(drawAll);
    console.log(`✅ Fondo de cuadrados por sección iniciado en ${containers.length} contenedor(es)`);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();