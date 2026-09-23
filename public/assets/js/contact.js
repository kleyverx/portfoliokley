/**
 * Contact — Formulario EmailJS y descarga de CV
 */

function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  contactForm.addEventListener('submit', handleContactFormSubmit);
}

/**
 * Revela el correo y el teléfono en el navegador.
 * Nunca viajan en el HTML servido: se arman aquí desde atributos data-*, para que los
 * rastreadores de spam (que leen el HTML, no ejecutan JS) no puedan cosecharlos.
 */
function initContactoProtegido() {
  document.querySelectorAll('.contacto-protegido').forEach((el) => {
    const tipo = el.getAttribute('data-tipo');
    const cifrado = el.getAttribute('data-c');
    if (!cifrado) return;

    let valor;
    try {
      valor = atob(cifrado);
    } catch (e) {
      console.warn('⚠️ No se pudo decodificar un dato de contacto');
      return;
    }

    if (tipo === 'email') {
      el.textContent = valor;
      el.setAttribute('href', 'mailto:' + valor);
    }

    if (tipo === 'tel') {
      // +584241103017 -> +58 (424) 110-3017
      const m = valor.match(/^\+(\d{2})(\d{3})(\d{3})(\d+)$/);
      el.textContent = m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : valor;
      el.setAttribute('href', 'tel:' + valor);
    }
  });
}

function handleContactFormSubmit(event) {
  event.preventDefault();

  const btn = document.getElementById('submit-btn');
  if (!btn) return;

  const formulario = event.target;

  // 1) Honeypot: si viene relleno es un bot. Se descarta en silencio (no se avisa, para no
  //    enseñarle al bot que fue detectado) y no se gasta cuota de EmailJS.
  const trampa = formulario.querySelector('#empresa-web');
  if (trampa && trampa.value.trim() !== '') {
    console.warn('⚠️ Envío descartado: honeypot relleno');
    formulario.reset();
    return;
  }

  // 2) reCAPTCHA: solo se exige si hay clave de sitio configurada. Sin clave, el widget no
  //    existe y el formulario sigue funcionando con el resto de protecciones.
  const cajaCaptcha = document.getElementById('recaptcha-contacto');
  const captchaActivo = !!(cajaCaptcha && cajaCaptcha.getAttribute('data-sitekey'));
  if (captchaActivo) {
    const respuesta = (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse)
      ? grecaptcha.getResponse()
      : '';
    if (!respuesta) {
      alert('Por favor, confirma que no eres un robot antes de enviar.');
      return;
    }
  }

  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const serviceID = 'default_service';
  const templateID = 'template_b3lq30k';

  emailjs.sendForm(serviceID, templateID, formulario)
    .then(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('¡Mensaje enviado con éxito!');
      formulario.reset();
      if (captchaActivo && typeof grecaptcha !== 'undefined') grecaptcha.reset();
      console.log('✅ Formulario enviado correctamente');
    })
    .catch((err) => {
      btn.textContent = originalText;
      btn.disabled = false;
      if (captchaActivo && typeof grecaptcha !== 'undefined') grecaptcha.reset();

      // 451 = EmailJS rechazó el envío por venir de un navegador automatizado (blockHeadless).
      // 429 = se superó el límite de envíos (limitRate).
      let aviso = 'No se pudo enviar el mensaje. Inténtalo de nuevo en un momento.';
      if (err && err.status === 429) {
        aviso = 'Has enviado un mensaje hace muy poco. Espera unos segundos e inténtalo de nuevo.';
      } else if (err && err.status === 451) {
        aviso = 'Este envío fue bloqueado por seguridad. Escríbeme directamente por correo.';
      }
      alert(aviso);
      console.error('❌ Error al enviar formulario:', err);
    });
}

function initDownloadCV() {
  const downloadBtns = document.querySelectorAll('.cv-download-link');
  if (!downloadBtns.length) return;

  downloadBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const currentLang = localStorage.getItem('language') || 'es';
      let cvFileName = 'cv-es.pdf';
      
      if (currentLang === 'en' || currentLang === 'fr') {
        cvFileName = 'cv-en.pdf';
      }

      const cvUrl = ((window.BASE_URL || '') + '/assets/images/public/' + cvFileName).replace(/\/+/g, '/');
      const link = document.createElement('a');
      link.href = cvUrl;
      link.download = currentLang === 'es' ? 'KleyverUrbina-CV-ES.pdf' : 'KleyverUrbina-CV-EN.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`📄 Descarga de CV (${currentLang}) iniciada`);
      
      // Si el botón está dentro del menú móvil, lo cerramos
      if (window.closeMobileMenu) {
        window.closeMobileMenu();
      }
    });
  });
}

/**
 * Carga la API de reCAPTCHA solo si hay una clave de sitio configurada.
 * Sin clave no se pide nada a Google: cero peticiones externas y cero coste de rendimiento.
 */
function initCaptchaContacto() {
  const caja = document.getElementById('recaptcha-contacto');
  if (!caja) return;

  const clave = (caja.getAttribute('data-sitekey') || '').trim();
  if (!clave) {
    console.log('ℹ️ reCAPTCHA sin configurar: el formulario usa honeypot + blockHeadless + límite de envíos');
    return;
  }

  if (document.getElementById('recaptcha-api')) return;
  const s = document.createElement('script');
  s.id = 'recaptcha-api';
  s.src = 'https://www.google.com/recaptcha/api.js';
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
}

// Exportaciones globales (core.js las invoca en su DOMContentLoaded)
window.initContactoProtegido = initContactoProtegido;
window.initCaptchaContacto = initCaptchaContacto;
