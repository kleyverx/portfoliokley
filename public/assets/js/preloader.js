(function(){
  // Duración exacta del preloader: 3 segundos
  const DURATION_MS = 3000;
  const fileName = 'abstract-isometric-loader.json';
  const jsonUrl = `assets/data/${fileName}`;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preloader = document.getElementById('preloader');
  const container = document.getElementById('preloader-animation');

  if (!preloader || !container) return;

  // Bloquear scroll/interacción visual detrás del preloader
  document.documentElement.classList.add('preloading');

  function hidePreloader() {
    preloader.classList.add('preloader--hide');
    document.documentElement.classList.remove('preloading');
    setTimeout(() => {
      if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 400);
  }

  // Inicia un temporizador único para ocultar el preloader luego de 3s
  function startHideTimer() {
    if (startHideTimer._started) return;
    startHideTimer._started = true;
    setTimeout(hidePreloader, DURATION_MS);
  }

  // Obtiene colores desde CSS: fill y stroke (con fallback al accent)
  function getAccentColors() {
    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--preloader-accent').trim();
    const fill = styles.getPropertyValue('--preloader-fill').trim();
    const stroke = styles.getPropertyValue('--preloader-stroke').trim();
    return {
      fill: fill || accent || '',
      stroke: stroke || accent || ''
    };
  }

  // Recolorea todos los elementos SVG de la animación (fill y stroke) con colores distintos
  function recolorSvg(colors) {
    if (!colors || (!colors.fill && !colors.stroke)) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const setFill = (el) => {
      try {
        if (colors.fill) {
          if (el.style && el.style.fill) el.style.fill = colors.fill;
          el.setAttribute('fill', colors.fill);
        }
      } catch {}
    };
    const setStroke = (el) => {
      try {
        if (colors.stroke) {
          if (el.style && el.style.stroke) el.style.stroke = colors.stroke;
          el.setAttribute('stroke', colors.stroke);
        }
      } catch {}
    };

    // Actualizamos todos los nodos que tengan fill/stroke
    if (colors.fill) {
      svg.querySelectorAll('[fill]').forEach(setFill);
      svg.querySelectorAll('[style*="fill"]').forEach(setFill);
    }
    if (colors.stroke) {
      svg.querySelectorAll('[stroke]').forEach(setStroke);
      svg.querySelectorAll('[style*="stroke"]').forEach(setStroke);
    }
  }

  function attachRecolorOnLoad(animation) {
    const colors = getAccentColors();
    if (!colors.fill && !colors.stroke) return; // sin variables CSS, mantenemos los colores del JSON

    const run = () => recolorSvg(colors);
    animation.addEventListener('DOMLoaded', run);
    animation.addEventListener('data_ready', run);
    // Asegura el recolor en cada frame por si Lottie reaplica colores durante la animación
    animation.addEventListener('enterFrame', run);
  }

  function initLottie(){
    // Mostrar overlay de inmediato
    preloader.classList.add('preloader--show');

    if (!window.lottie) {
      // Si lottie-web no está disponible, mostrar fallback y ocultar tras 3s
      container.innerHTML = '<div class="preloader-fallback">Cargando...</div>';
      startHideTimer();
      return;
    }

    // Quitar spinner visual si Lottie está disponible (evitar que tape la animación)
    const spinner = preloader.querySelector('.preloader-spinner');
    if (spinner) spinner.remove();

    // Cargar el JSON de la animación y arrancar el temporizador de 3s
    fetch(jsonUrl, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} al cargar ${jsonUrl}`);
        return res.json();
      })
      .then((data) => {
        const animation = window.lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data
        });

        // Ajuste de velocidad según preferencias del usuario
        animation.setSpeed(prefersReduced ? 0.75 : 1.0);

        // Recolor dinámico cuando el SVG esté listo (si hay color CSS definido)
        attachRecolorOnLoad(animation);

        // Independientemente del estado, el preloader dura 3s
        startHideTimer();

        // Si ocurriera un error de lottie, mostramos texto pero mantenemos la duración de 3s
        animation.addEventListener('error', (e) => {
          console.error('Lottie error:', e);
          if (!container.querySelector('.preloader-fallback')) {
            container.innerHTML = '<div class="preloader-fallback">Cargando...</div>';
          }
        });
      })
      .catch((err) => {
        console.error('Error cargando Lottie JSON via fetch:', err);
        // Fallback: intentar por path directo
        const animation = window.lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: jsonUrl
        });
        animation.setSpeed(prefersReduced ? 0.75 : 1.0);
        // Recolor también en el flujo de fallback
        attachRecolorOnLoad(animation);
        startHideTimer();
        animation.addEventListener('data_failed', () => {
          if (!container.querySelector('.preloader-fallback')) {
            container.innerHTML = '<div class="preloader-fallback">Cargando...</div>';
          }
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLottie, { once: true });
  } else {
    initLottie();
  }
})();