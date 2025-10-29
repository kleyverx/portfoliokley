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
  let isReducedMode = false; // Modo de rendimiento reducido

  // Función global para pausar las animaciones
  window.pauseSquaresBg = function() {
    isPaused = true;
    console.log('🔄 Squares BG: Animaciones pausadas - Estado:', { isPaused, instances: instances.length });
  };

  // Función global para reanudar las animaciones
  window.resumeSquaresBg = function() {
    isPaused = false;
    console.log('🔄 Squares BG: Animaciones reanudadas - Estado:', { isPaused, instances: instances.length, animationId });
    // Asegurar que el loop de animación esté corriendo
    if (!animationId) {
      console.log('🔄 Squares BG: Reiniciando loop de animación');
      lastTime = performance.now(); // Resetear el tiempo
      animationId = requestAnimationFrame(drawAll);
    }
  };

  // Función para forzar el reinicio de las animaciones
  window.forceRestartSquaresBg = function() {
    console.log('🔄 Squares BG: Forzando reinicio completo');
    isPaused = false;
    isReducedMode = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    lastTime = performance.now();
    animationId = requestAnimationFrame(drawAll);
  };

  // Función para activar modo de rendimiento reducido
  window.setSquaresBgReducedMode = function(enabled) {
    isReducedMode = enabled;
    if (enabled) {
      console.log('🔄 Squares BG: Modo de rendimiento reducido activado');
    } else {
      console.log('🔄 Squares BG: Modo de rendimiento reducido desactivado');
    }
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

    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDPR);

    const dirAttr = container.getAttribute('data-squares-direction');
    const speedAttr = parseFloat(container.getAttribute('data-squares-speed'));
    const ignoreReducedAttr = container.hasAttribute('data-squares-ignore-reduced');

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
      squareSize: CONFIG.squareSize,
      borderColor: CONFIG.borderColor,
      hoverFillColor: CONFIG.hoverFillColor,
      speedPxPerSec: Number.isFinite(speedAttr) ? speedAttr : CONFIG.speedPxPerSec,
      direction: dirAttr || CONFIG.direction,
      dpr,
      ignoreReduced: ignoreReducedAttr,
    };

    function resize() {
      const rect = container.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.height;
      canvas.width = state.width * dpr;
      canvas.height = state.height * dpr;
      canvas.style.width = state.width + 'px';
      canvas.style.height = state.height + 'px';
      // Evitar acumulación de escala al redimensionar
      if (typeof ctx.setTransform === 'function') {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        ctx.resetTransform && ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }
    }

    function onPointerMove(e) {
      // Evitar trabajo durante video/optimización o cuando está pausado
      if (isPaused || isReducedMode || document.body.classList.contains('video-theater-active') || document.body.classList.contains('video-performance-mode')) {
        return;
      }
      
      // Throttle simple para reducir carga (máx ~30fps)
      const now = performance.now();
      if (!state.lastPointerMoveTs) state.lastPointerMoveTs = 0;
      if (now - state.lastPointerMoveTs < 33) return;
      state.lastPointerMoveTs = now;

      // Si el contenedor es global y fijo, usar clientX/Y directamente
      if (state.container.id === 'global-squares-bg') {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
        return;
      }

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

    // En modo reducido, reducir la frecuencia de actualización
    if (isReducedMode && Math.floor(time / 100) % 3 !== 0) {
      animationId = requestAnimationFrame(drawAll);
      return;
    }

    for (const s of instances) {
      const { ctx, width, height } = s;
      // Siempre actualizar el delta, pero respetando reducción (OS y modo reducido)
      const reductionFactor = (isReducedMode ? 0.5 : 1) * ((prefersReduced && !s.ignoreReduced) ? 0.3 : 1);
      const delta = s.speedPxPerSec * dt * reductionFactor;

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

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(s.offsetX, s.offsetY);

      ctx.lineWidth = CONFIG.lineWidth;
      ctx.strokeStyle = s.borderColor;

      // En modo reducido, dibujar menos cuadrados
      const step = isReducedMode ? s.squareSize * 2 : s.squareSize;
      
      for (let x = -s.squareSize; x < width + s.squareSize; x += step) {
        for (let y = -s.squareSize; y < height + s.squareSize; y += step) {
          const cx = x + s.squareSize / 2;
          const cy = y + s.squareSize / 2;
          
          // Solo calcular hover si no estamos en modo reducido
          if (!isReducedMode) {
            const dist = Math.hypot(s.mouseX - (cx - s.offsetX), s.mouseY - (cy - s.offsetY));
            const radius = s.squareSize * 1.2;
            if (dist < radius) {
              ctx.fillStyle = s.hoverFillColor;
              ctx.fillRect(x + 1, y + 1, s.squareSize - 2, s.squareSize - 2);
            }
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
    
    // Limpiar instancias anteriores
    instances.length = 0;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    for (const c of containers) initContainer(c);
    
    // Forzar inicio de animación
    isPaused = false;
    isReducedMode = false;
    lastTime = performance.now();
    animationId = requestAnimationFrame(drawAll);
    
    console.log(`✅ Fondo de cuadrados por sección iniciado en ${containers.length} contenedor(es)`);
    console.log('🔄 Estado inicial:', { isPaused, isReducedMode, animationId, instances: instances.length });
  }

  // Función para verificar y diagnosticar el estado del fondo
  function checkSquaresBgStatus() {
    console.log('🔍 Estado del fondo de cuadrados:', {
      isPaused: isPaused,
      isReducedMode: isReducedMode,
      instances: instances.length,
      animationId: animationId,
      performanceOptimizationActive: window.performanceOptimizationActive || false
    });
    
    // Si está pausado pero no debería estarlo, intentar reanudar
    if (isPaused && !window.performanceOptimizationActive) {
      console.log('⚠️ Fondo pausado sin razón aparente, intentando reanudar...');
      resumeSquaresBg();
    }
    
    return {
      isPaused,
      isReducedMode,
      instances: instances.length,
      animationId,
      performanceOptimizationActive: window.performanceOptimizationActive || false
    };
  }

  // Exponer función de diagnóstico
  window.checkSquaresBgStatus = checkSquaresBgStatus;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();