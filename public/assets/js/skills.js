/**
 * Skills — Animación de barras de habilidades con IntersectionObserver
 */

function animateSkillBarsNow() {
  const bars = document.querySelectorAll('#habilidades .h-2 > div');
  if (!bars.length) return;
  bars.forEach((bar) => {
    const match = bar.className.match(/w-\[(\d+)%\]/);
    const target = match ? parseInt(match[1], 10) : null;
    if (target !== null) {
      if (!bar.dataset.targetWidth) bar.dataset.targetWidth = String(target);
      bar.style.width = target + '%';
    }
  });
}

function initSkillBarsAnimation() {
  const bars = document.querySelectorAll('#habilidades .h-2 > div');
  if (!bars.length) return;

  // Preparar barras: leer porcentaje, poner width:0
  bars.forEach((bar) => {
    const match = bar.className.match(/w-\[(\d+)%\]/);
    const target = match ? parseInt(match[1], 10) : null;
    if (target !== null) {
      bar.style.width = '0%';
      bar.dataset.targetWidth = String(target);
    }
  });

  // Observer para animar al entrar en vista
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const target = bar.dataset.targetWidth;
        if (target) bar.style.width = target + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20% 0px' });

  bars.forEach((bar) => observer.observe(bar));

  // Fallback: si la sección ya está visible al cargar
  const habilidades = document.getElementById('habilidades');
  if (habilidades) {
    const rect = habilidades.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh && rect.bottom > 0) {
      animateSkillBarsNow();
    }
  }
}

// Exportaciones globales
window.animateSkillBarsNow = animateSkillBarsNow;
