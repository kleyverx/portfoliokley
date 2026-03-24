/**
 * i18n — Selector de idioma, traducción de elementos y placeholders
 */

function initLanguageSelector() {
  const languageSelector = document.getElementById('language-selector');
  if (!languageSelector) return;

  let currentLanguage = 'es';

  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage && translations && translations[savedLanguage]) {
    currentLanguage = savedLanguage;
    languageSelector.value = currentLanguage;
  }

  applyTranslations(currentLanguage);

  languageSelector.addEventListener('change', (e) => {
    const newLanguage = e.target.value;
    if (translations && translations[newLanguage]) {
      localStorage.setItem('language', newLanguage);
      applyTranslations(newLanguage);
      console.log(`🌐 Idioma cambiado a: ${newLanguage}`);
    }
  });
}

function applyTranslations(language) {
  if (!translations || !translations[language]) {
    console.error(`❌ No se encontraron traducciones para: ${language}`);
    return;
  }

  const trans = translations[language];

  document.querySelectorAll('.lang-text').forEach(element => {
    const key = element.getAttribute('data-key');
    if (key && trans[key]) element.textContent = trans[key];
  });

  updateFormPlaceholders(language);
}

function updateFormPlaceholders(language) {
  const trans = translations[language];
  if (!trans) return;

  const mappings = [
    { id: 'first-name', key: 'nombre' },
    { id: 'last-name', key: 'apellido' },
    { id: 'email', placeholder: 'ejemplo@email.com' },
    { id: 'subject', key: 'asunto' },
    { id: 'message', key: 'escribeMensaje' }
  ];

  mappings.forEach(({ id, key, placeholder }) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = placeholder || trans[key] || '';
  });
}

// Exportaciones globales
window.applyTranslations = applyTranslations;
