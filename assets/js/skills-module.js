(function(){
  function initSkillsModule() {
    const grid = document.querySelector('#skills-grid') || document.querySelector('#habilidades .mx-auto.grid');
    if (!grid) return;

    // Limpiar contenido estático
    grid.innerHTML = '';

    // Renderizar botón de "Agregar Habilidad" (deshabilitado)
    const headerContainer = document.querySelector('#habilidades .space-y-2');
    if (false && headerContainer && !headerContainer.querySelector('#add-skill-btn')) {
      const addBtn = document.createElement('button');
      addBtn.id = 'add-skill-btn';
      addBtn.className = 'mt-4 border border-primary/50 hover:border-primary px-4 py-2 rounded-md inline-flex items-center';
      addBtn.innerHTML = '<span>Agregar Habilidad</span>';
      addBtn.addEventListener('click', openAddSkillPrompt);
      headerContainer.appendChild(addBtn);
    }

    loadAndRenderSkills(grid);
  }

  async function loadAndRenderSkills(grid) {
    const base = await fetchSkillsData();
    const user = []; // Deshabilitado: cargar solo desde skills.json
    const merged = mergeSkills(base, user);
    renderSkills(merged, grid);
  }

  async function fetchSkillsData() {
    try {
      const res = await fetch('assets/data/skills.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const txt = await res.text();
      if (!txt || !txt.trim()) return [];
      const data = JSON.parse(txt);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('⚠️ No se pudieron cargar skills.json:', err);
      return [];
    }
  }

  function getUserSkills() {
    try {
      const raw = localStorage.getItem('userSkills');
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function saveUserSkills(arr) {
    try { localStorage.setItem('userSkills', JSON.stringify(arr)); } catch {}
  }

  function mergeSkills(base, user) {
    const map = new Map();
    for (const cat of base) {
      map.set(cat.category, { ...cat, items: [...(cat.items || [])] });
    }
    for (const cat of user) {
      if (!map.has(cat.category)) {
        map.set(cat.category, { category: cat.category, key: cat.key || '', items: [] });
      }
      const dest = map.get(cat.category);
      dest.items.push(...(cat.items || []));
    }
    return Array.from(map.values());
  }

  function openAddSkillPrompt() {
    const category = (prompt('Categoría (ej: Frontend, Backend, etc.):') || '').trim();
    if (!category) return;
    const name = (prompt('Nombre de la habilidad (ej: React, PHP, etc.):') || '').trim();
    if (!name) return;
    let levelStr = (prompt('Nivel (0-100):') || '').trim();
    let level = parseInt(levelStr, 10);
    if (isNaN(level) || level < 0) level = 0;
    if (level > 100) level = 100;

    const newSkill = { name, level };

    const user = getUserSkills();
    const idx = user.findIndex(c => (c.category || '').toLowerCase() === category.toLowerCase());
    if (idx >= 0) {
      user[idx].items = user[idx].items || [];
      user[idx].items.push(newSkill);
    } else {
      user.push({ category, key: '', items: [newSkill] });
    }
    saveUserSkills(user);

    const grid = document.querySelector('#skills-grid') || document.querySelector('#habilidades .mx-auto.grid');
    if (grid) loadAndRenderSkills(grid);
  }

  function renderSkills(categories, grid) {
    const frag = document.createDocumentFragment();

    const icons = {
      'Frontend': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
      'Backend': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary"><path d="M16 18l6-6-6-6"></path><path d="M8 6l-6 6 6 6"></path></svg>`,
      'Bases de Datos': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
      'Frameworks': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>`,
      'Lenguajes': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>`,
      'Herramientas': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-primary"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
    };

    const esc = typeof escapeHtml === 'function' ? escapeHtml : function (str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    categories.forEach((cat, i) => {
      const card = document.createElement('div');
      card.className = 'space-y-4 animate-element opacity-0 transition-all duration-700 ' + (i < 6 ? `delay-${400 + i * 100}` : '') + ' p-6 rounded-lg bg-card border border-primary/20 hover:border-primary/50 transition-all duration-300';

      const icon = icons[cat.category] || icons['Herramientas'];

      const headerHTML = `
        <div class="flex items-center gap-2">
          ${icon}
          <h3 class="text-xl font-semibold text-primary">${esc(cat.category)}</h3>
        </div>
      `;

      let itemsHTML = '';
      for (const it of (cat.items || [])) {
        const pct = Math.max(0, Math.min(100, Number(it.level) || 0));
        itemsHTML += `
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-sm font-medium">${esc(it.name || '')}</span>
              <span class="text-sm text-mutedForeground">${pct}%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-muted">
              <div class="h-full" style="width:${pct}%" class="rounded-full bg-gradient-to-r from-primary to-accent"></div>
            </div>
          </div>
        `;
      }

      card.innerHTML = headerHTML + `<div class="space-y-2">${itemsHTML}</div>`;
      frag.appendChild(card);
    });

    grid.innerHTML = '';
    grid.appendChild(frag);
    if (typeof initScrollAnimations === 'function') initScrollAnimations();
  }

  document.addEventListener('DOMContentLoaded', initSkillsModule);
})();