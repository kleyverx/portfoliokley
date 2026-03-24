/**
 * Video Theater — Modal de video fullscreen + optimización de rendimiento
 */

// Variables globales de rendimiento
window.performanceOptimizationActive = false;
window.pausedAnimations = [];

// ============================================================================
// ABRIR TEATRO
// ============================================================================
function openVideoTheater(videoUrl, title = '', description = '') {
  console.log('🎬 Abriendo teatro de video:', { videoUrl, title });

  pausePerformanceIntensiveElements();

  const overlay = document.getElementById('video-theater-overlay');
  const iframe = document.getElementById('video-theater-iframe');
  const titleEl = document.getElementById('video-theater-title');
  const descEl = document.getElementById('video-theater-description');
  const loading = overlay ? overlay.querySelector('.video-theater-loading') : null;

  if (!overlay || !iframe) {
    console.error('❌ Elementos del teatro de video no encontrados');
    return;
  }

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = description;

  if (loading) loading.style.display = 'flex';
  iframe.classList.remove('loaded');

  overlay.classList.add('active');
  document.body.classList.add('video-theater-active');

  let optimizedUrl = videoUrl;
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const separator = videoUrl.includes('?') ? '&' : '?';
    optimizedUrl = `${videoUrl}${separator}autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}&controls=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`;
  }

  setTimeout(() => {
    iframe.src = optimizedUrl;
    iframe.onload = function () {
      setTimeout(() => {
        if (loading) loading.style.display = 'none';
        iframe.classList.add('loaded');
      }, 500);
    };
  }, 100);

  console.log('✅ Teatro de video abierto correctamente');
}

// ============================================================================
// CERRAR TEATRO
// ============================================================================
function closeVideoTheater() {
  console.log('🎬 Cerrando teatro de video...');

  const overlay = document.getElementById('video-theater-overlay');
  const iframe = document.getElementById('video-theater-iframe');

  if (!overlay || !overlay.classList.contains('active')) return;

  if (iframe) {
    iframe.src = '';
    iframe.classList.remove('loaded');
  }

  overlay.classList.remove('active');
  document.body.classList.remove('video-theater-active');

  setTimeout(() => {
    console.log('🔄 Reanudando elementos de performance después de cerrar video');
    resumePerformanceIntensiveElements();
  }, 300);

  console.log('✅ Teatro de video cerrado correctamente');
}

// Cerrar con Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('video-theater-overlay');
    if (overlay && overlay.classList.contains('active')) closeVideoTheater();
  }
});

// Cerrar al hacer clic fuera del video
document.addEventListener('click', function (e) {
  const overlay = document.getElementById('video-theater-overlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  if (e.target === overlay) closeVideoTheater();
});

// Cierre táctil para mobile
document.addEventListener('touchend', function (e) {
  const overlay = document.getElementById('video-theater-overlay');
  if (!overlay || !overlay.classList.contains('active')) return;
  if (e.target === overlay) {
    e.preventDefault();
    closeVideoTheater();
  }
}, { passive: false });

// ============================================================================
// OPTIMIZACIÓN DE RENDIMIENTO
// ============================================================================
function pausePerformanceIntensiveElements() {
  if (window.performanceOptimizationActive) return;

  console.log('🔄 Pausando elementos que consumen recursos durante video...');
  window.performanceOptimizationActive = true;
  window.pausedAnimations = [];

  // 1. Pausar GSAP
  if (typeof gsap !== 'undefined') {
    gsap.globalTimeline.pause();
    if (gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.disable());
    }
    window.pausedAnimations.push('gsap');
  }

  // 3. Pausar animaciones CSS intensivas
  document.querySelectorAll('.spline-3d-container, .cursor-dot, .cursor-ring').forEach(el => {
    el.style.animationPlayState = 'paused';
    el.style.transform = 'none';
    el.classList.add('performance-paused');
  });

  // 4. Pausar fondo de cuadrados
  if (typeof window.pauseSquaresBg === 'function') {
    window.pauseSquaresBg();
    if (typeof window.setSquaresBgReducedMode === 'function') {
      window.setSquaresBgReducedMode(true);
    }
    window.pausedAnimations.push('squares-bg');
  }

  // 5. Modo rendimiento
  document.body.classList.add('video-performance-mode');

  // 6. Ocultar cursor custom
  if (window.cursor) window.cursor.style.display = 'none';

  // 7. Pausar Spline viewers
  document.querySelectorAll('spline-viewer').forEach(viewer => {
    if (viewer.pause) viewer.pause();
  });

  console.log('✅ Elementos pausados para optimizar rendimiento');
}

function resumePerformanceIntensiveElements() {
  const wasActive = window.performanceOptimizationActive;
  if (!wasActive) {
    console.log('⚠️ No hay elementos pausados para reanudar');
  }

  console.log('🔄 Reanudando elementos pausados...', window.pausedAnimations);
  window.performanceOptimizationActive = false;

  // 1. Reanudar GSAP
  if (wasActive && window.pausedAnimations.includes('gsap') && typeof gsap !== 'undefined') {
    gsap.globalTimeline.resume();
    if (gsap.ScrollTrigger) {
      gsap.ScrollTrigger.getAll().forEach(trigger => trigger.enable());
    }
  }

  // 3. Reanudar fondo de cuadrados
  if (typeof window.setSquaresBgReducedMode === 'function') window.setSquaresBgReducedMode(false);
  if (typeof window.resumeSquaresBg === 'function') window.resumeSquaresBg();
  setTimeout(() => {
    if (typeof window.forceRestartSquaresBg === 'function') window.forceRestartSquaresBg();
  }, 200);

  // 4. Reanudar CSS
  document.querySelectorAll('.performance-paused').forEach(el => {
    el.style.animationPlayState = 'running';
    el.style.transform = '';
    el.classList.remove('performance-paused');
  });

  // 5. Modo normal
  document.body.classList.remove('video-performance-mode');

  // 6. Restaurar cursor
  if (window.cursor) window.cursor.style.display = '';

  // 7. Reanudar Spline
  document.querySelectorAll('spline-viewer').forEach(viewer => {
    if (viewer.play) viewer.play();
  });

  if (wasActive) window.pausedAnimations = [];
  console.log('✅ Elementos reanudados correctamente');
}

// Exportaciones globales
window.openVideoTheater = openVideoTheater;
window.closeVideoTheater = closeVideoTheater;
