/**
 * Contact — Formulario EmailJS y descarga de CV
 */

function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  contactForm.addEventListener('submit', handleContactFormSubmit);
}

function handleContactFormSubmit(event) {
  event.preventDefault();

  const btn = document.getElementById('submit-btn');
  if (!btn) return;

  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  const serviceID = 'default_service';
  const templateID = 'template_b3lq30k';

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
