/**
 * Videos — Módulo dinámico de videos + focus/blur + TikTok embeds
 */

function initVideosModule() {
  const grid = document.querySelector('#videos-grid') || document.querySelector('#videos .mx-auto.grid');
  if (!grid) return;

  grid.innerHTML = '';
  loadAndRenderVideos(grid);
}

async function loadAndRenderVideos(grid) {
  const base = await fetchVideosData();
  const videos = [...base];
  videos.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  const limited = videos.slice(0, 3);
  renderVideos(limited, grid);
}

async function fetchVideosData() {
  try {
    const res = await fetch('assets/data/videos.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const txt = await res.text();
    if (!txt || !txt.trim()) return [];
    const data = JSON.parse(txt);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('⚠️ No se pudieron cargar videos.json:', err);
    return [];
  }
}

function renderVideos(videos, grid) {
  const frag = document.createDocumentFragment();
  const _escapeHtml = window.escapeHtml || ((s) => String(s));

  for (const v of videos) {
    const card = document.createElement('div');
    card.className = 'video-card group';

    const videoId = v.videoId || (v.type === 'youtube' ? v.embedUrl?.split('/').pop().split('?')[0] : '');
    const thumbUrl = v.type === 'youtube' 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : ''; // TikTok handles its own thumbnail if using embed, or we could use a placeholder

    let mediaHTML = '';
    if (v.type === 'youtube') {
      mediaHTML = `
        <div class="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-black">
          <img 
              src="${thumbUrl}" 
              alt="${_escapeHtml(v.title)}"
              class="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100"
              onerror="this.src='https://img.youtube.com/vi/${videoId}/0.jpg'"
          />
          <div class="play-button-overlay">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                  <path d="M8 5v14l11-7z"/>
              </svg>
          </div>
        </div>`;
    } else {
      const cite = v.cite || `https://www.tiktok.com/@unknown/video/${videoId}`;
      mediaHTML = `
        <div class="relative w-full aspect-video overflow-hidden rounded-t-2xl bg-[#010101]">
          <blockquote class="tiktok-embed w-full h-full pointer-events-none" cite="${cite}" data-video-id="${videoId}">
            <section></section>
          </blockquote>
          <div class="play-button-overlay">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                  <path d="M8 5v14l11-7z"/>
              </svg>
          </div>
        </div>`;
    }

    card.dataset.videoUrl = v.embedUrl || v.cite;
    card.style.animationDelay = `${videos.indexOf(v) * 0.15}s`;

    card.innerHTML = `
      ${mediaHTML}
      <div class="video-content">
        <h3 class="line-clamp-1">${_escapeHtml(v.title || 'Video')}</h3>
        <p class="line-clamp-2">${_escapeHtml(v.description || '')}</p>
        <div class="mt-4 flex items-center justify-between opacity-60">
            <span class="text-xs font-black uppercase tracking-[0.2em] text-primary">${v.type === 'youtube' ? 'YouTube' : 'TikTok'}</span>
            <span class="text-[10px] font-mono tracking-tighter">${v.date ? new Date(v.date).toLocaleDateString() : ''}</span>
        </div>
      </div>
      <div class="focus-indicator"></div>
    `;

    // Eventos
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) {
      card.addEventListener('mouseenter', () => handleVideoFocus(card, grid));
      card.addEventListener('mouseleave', () => handleVideoBlur(card, grid));
    }
    card.addEventListener('click', () => handleVideoClick(card, grid));

    frag.appendChild(card);
  }

  grid.innerHTML = '';
  grid.appendChild(frag);
  refreshTikTokEmbeds();
  if (typeof initScrollAnimations === 'function') initScrollAnimations();
}

function refreshTikTokEmbeds() {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.tiktok.com/embed.js';
  document.body.appendChild(s);
}

// ============================================================================
// FOCUS / BLUR / CLICK
// ============================================================================
function handleVideoFocus(card, grid) {
  if (document.body.classList.contains('video-theater-active') || window.performanceOptimizationActive) return;
  grid.querySelectorAll('.video-card').forEach(c => c.classList.remove('focused'));
  card.classList.add('focused');
  grid.classList.add('has-focus');
}

function handleVideoBlur(card, grid) {
  if (document.body.classList.contains('video-theater-active') || window.performanceOptimizationActive) return;
  setTimeout(() => {
    if (document.body.classList.contains('video-theater-active') || window.performanceOptimizationActive) return;
    const focusedCards = grid.querySelectorAll('.video-card.focused');
    if (focusedCards.length === 0 || !grid.matches(':hover')) {
      card.classList.remove('focused');
      grid.classList.remove('has-focus');
    }
  }, 100);
}

function handleVideoClick(card, grid) {
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  const videoUrl = card.dataset.videoUrl;
  const title = card.querySelector('h3')?.textContent || '';
  const description = card.querySelector('p')?.textContent || '';

  if (isMobile) {
    if (videoUrl && typeof openVideoTheater === 'function') openVideoTheater(videoUrl, title, description);
  } else {
    const isFocused = card.classList.contains('focused');
    if (isFocused) {
      if (videoUrl && typeof openVideoTheater === 'function') openVideoTheater(videoUrl, title, description);
    } else {
      grid.querySelectorAll('.video-card').forEach(c => c.classList.remove('focused'));
      card.classList.add('focused');
      grid.classList.add('has-focus');
    }
  }
}
