# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Portafolio personal de **Kleyver Urbina** (desarrollador full stack): una **landing de una sola
página** en Astro 7, estática, desplegada en GitHub Pages en
`https://kleyverx.github.io/portfoliokley/`. Sin backend propio — el formulario de contacto sale por
EmailJS desde el navegador.

Idioma del código y del contenido: **español** (la UI se traduce a en/fr en runtime).

## Comandos

```powershell
npm install
npm run dev       # dev server en localhost:4321
npm run build     # build estático a ./dist/
npm run preview   # sirve ./dist/ para revisar antes de desplegar
```

No hay tests, linter ni formateador configurados. `npm run astro check` da chequeo de tipos
(`tsconfig` extiende `astro/tsconfigs/strict`), pero no está cableado a ningún script ni a CI.

**Verificación de cualquier cambio:** `npm run build && npm run preview` **y abrir la consola del
navegador**. Buena parte de esta app vive en JS de runtime que falla en silencio (los `fetch` de la
capa heredada tienen `catch` que solo hacen `console.warn`), así que un build verde no prueba nada
por sí solo.

**Despliegue:** automático. `.github/workflows/deploy.yml` corre `withastro/action@v3` en cada push a
`main`. No se despliega a mano.

## Arquitectura: dos capas que conviven

Esto es lo primero que hay que entender, porque no es un proyecto Astro idiomático. Conviven **dos
sistemas** y `src/layouts/Layout.astro` es el **único punto donde se cablean**:

| Capa | Dónde | Cuándo corre |
|---|---|---|
| **Astro** | `src/components/*.astro`, `src/pages/index.astro` | build (SSG) |
| **Vanilla JS/CSS heredado** | `public/assets/js/*.js`, `public/assets/css/*.css` | runtime, vía `<script is:inline>` |

`index.astro` compone 9 secciones (`Header`, `Hero`, `TechMarquee`, `Projects`, `Videos`, `Skills`,
`Services`, `Contact`, `Footer`). Astro genera el HTML; los 12 módulos JS de `public/assets/js/`
después lo animan, traducen y le añaden interactividad **manipulando el DOM ya renderizado**.

### `core.js` es el orquestador

Los módulos JS son **globales, sin bundler ni imports**. El contrato real es este: cada módulo
define funciones globales `initX()`, y `core.js` las invoca en un único `DOMContentLoaded`
(`core.js:166`), siempre con guarda `typeof initX === 'function'` y `try/catch` individual:

```js
document.addEventListener('DOMContentLoaded', async function () {
  await loadTranslations();            // primero: todo lo demás depende de window.translations
  if (typeof initSkillBarsAnimation === 'function') initSkillBarsAnimation();
  if (typeof initLanguageSelector    === 'function') initLanguageSelector();
  // ...
});
```

Consecuencias al editar:

- **El orden de los `<script>` en `Layout.astro` importa** (está comentado ahí: "orden importa por
  dependencias"). `core.js` primero; `squares-bg.js` y `preloader.js` van con `defer`.
- Si añades un módulo: exponlo como función global `initX`, añade el `<script>` en `Layout.astro` en
  la posición correcta **y** su llamada en el bloque `DOMContentLoaded` de `core.js`. Si solo haces
  lo primero, no se ejecuta nunca.
- `services.js` es la excepción: es un IIFE que se auto-inicializa, no pasa por `core.js`.
- Al añadir una sección nueva, decide en qué capa vive. Lo nuevo debería ir en Astro; la capa
  `public/` es deuda que se está migrando.

### `window.BASE_URL`: la trampa principal

El sitio se sirve bajo el subpath `/portfoliokley` (`base` en `astro.config.mjs`). Astro resuelve eso
en build, pero el **JS de `public/` no pasa por el build**, así que cualquier ruta que construya en
runtime se rompe en producción y funciona en local.

La solución adoptada: `Layout.astro` define `window.BASE_URL` en un script inline en el `<head>`, y
todo `fetch`/`src` de la capa heredada se arma así:

```js
const path = ((window.BASE_URL || '') + '/assets/data/algo.json').replace(/\/+/g, '/');
```

El `.replace(/\/+/g, '/')` no es decorativo: `import.meta.env.BASE_URL` ya termina en `/`, así que
sin él sale `/portfoliokley//assets/...`.

**Nunca escribas rutas absolutas tipo `/assets/...` en el JS de `public/`.** Tres commits del
historial son exactamente este bug.

**La misma trampa aplica al CSS de `public/`**, donde no hay JS que la salve. La solución ahí son
**rutas relativas**, que el navegador resuelve contra la ubicación del propio `.css`:

```css
/* en public/assets/css/fonts.css, servido desde /portfoliokley/assets/css/ */
src: url('../../fonts/satoshi/Satoshi-Variable.woff2');  /* ✅ -> /portfoliokley/fonts/... */
src: url('/fonts/satoshi/Satoshi-Variable.woff2');       /* ❌ -> /fonts/... (404 en prod) */
```

### El scroll suave nativo no funciona en esta página

`behavior: 'smooth'` es un **no-op** aquí, tanto en `scrollIntoView` como en `window.scrollTo`:
GSAP ScrollTrigger ancla secciones (`pin` en `#proyectos`, spacer en `#servicios`) y cancela la
animación nativa del navegador. El scroll instantáneo sí funciona.

Por eso `scrollToSection()` en `navigation.js` usa un tween propio por `requestAnimationFrame`, y
descuenta el alto de la cabecera (que es `sticky top-0`). **No lo sustituyas por `scrollIntoView`
"para simplificar": deja toda la navegación del sitio muerta en silencio** — los 16 `.nav-link`,
los botones del Hero y los CTA de servicios.

El patrón de un enlace navegable es el de `Projects.astro:105`: `<a href="#seccion">` (funciona sin
JS) **+** clase `.nav-link` **+** `data-section="seccion"` (lo engancha `initNavigationLinks()`).

### De dónde salen los datos

Los archivos de datos vivos están repartidos entre las dos capas:

| Datos | Archivo | Consumido por |
|---|---|---|
| Proyectos | `src/data/projects.json` | `Projects.astro` (import en build) |
| Videos | `public/assets/data/videos.json` | `videos.js` (fetch en runtime) |
| Traducciones | `public/assets/data/translations.json` | `core.js` (fetch en runtime) → `i18n.js` |
| Animación del preloader | `public/assets/data/abstract-isometric-loader.json` | `preloader.js` (Lottie) |

- **Proyectos:** `projects.json` es una lista (hoy 6 entradas); `Projects.astro` toma
  `.slice(0, 10)`. El campo `image` es solo un **nombre de archivo** (`"2.png"`); las imágenes reales
  se resuelven con `import.meta.glob` sobre **`src/assets/images/projects/`** y las optimiza Astro.
  Añadir un proyecto = entrada en el JSON + imagen en esa carpeta.
- **Videos:** es la única sección de contenido **renderizada en runtime**. `videos.js` hace
  `grid.innerHTML = ''` sobre `#videos-grid` y pinta los 3 más recientes. Cualquier cosa que Astro
  renderice dentro de ese contenedor se destruye — no pongas contenido real ahí.
- **`public/assets/data/skills.json` está muerto.** Nadie lo lee. Las habilidades están hardcodeadas
  en el markup de `Skills.astro`, y `skills.js` solo **anima** las barras leyendo el porcentaje de la
  clase Tailwind `w-[N%]` con una regex. Para cambiar una habilidad se edita el `.astro`, no el JSON.

### Estilos

**Tailwind v4** vía `@tailwindcss/vite` (no hay `tailwind.config.js` — v4 es CSS-first). El tema vive
en el bloque `@theme` de **`src/styles/global.css`**: ahí están la paleta (`--color-primary: #4808AA`
morado, `--color-secondary` lavanda, fondo casi negro `#0a0b10`) y las fuentes. Ese archivo también
define las utilidades `.glass-panel` / `.glass-panel-hover` (glassmorphism), que son la firma visual
del sitio y se usan en casi todas las tarjetas.

En paralelo, `Layout.astro` carga **9 hojas CSS heredadas** desde `public/assets/css/`. Si un estilo
no responde a clases de Tailwind, búscalo ahí antes de pelear con la utilidad.

Fuentes: **Satoshi** (cuerpo) y **Cabinet Grotesk** (títulos), servidas localmente como woff2 desde
`public/fonts/{satoshi,cabinet-grotesk}/` y declaradas en `public/assets/css/fonts.css`.

### i18n

Traducción en cliente. El mecanismo exacto (`i18n.js:52`) es:

```js
document.querySelectorAll('.lang-text').forEach(el => {
  const key = el.getAttribute('data-key');
  if (key && trans[key]) el.textContent = trans[key];
});
```

O sea: **hace falta la clase `.lang-text` Y el atributo `data-key`**. Una sola de las dos cosas no
hace nada. Ojo: quedan 2 atributos `data-translate="projects.*"` en `Projects.astro` que **ningún
módulo lee** — son restos de otro esquema y ese texto nunca se traduce.

Tres idiomas — **es / en / fr**, 88 claves cada uno. Detección automática del idioma del navegador,
con `localStorage.language` como override. Al añadir texto visible, añade su clave a los **tres**
idiomas o quedará sin traducir.

El botón de CV (`.cv-download-link`, en desktop y en el menú móvil) elige el PDF según el idioma
activo: `cv-es.pdf` para es, `cv-en.pdf` para en **y también para fr** (`contact.js:49`) — no hay CV
en francés. Los PDFs servidos están en `public/assets/images/public/` (ruta heredada: son PDFs dentro
de una carpeta `images`); los `Cv Kleyver urbina 2026*.pdf` de la raíz son los originales.

### Librerías externas (CDN, no npm)

`package.json` solo declara `astro` y `tailwindcss`. Todo lo demás entra por CDN en `Layout.astro`:
**GSAP 3.14.2 + ScrollTrigger** (animaciones y el scroll horizontal de proyectos), **Lottie 5.12.2**
(preloader), **Spline viewer 1.9.28** (3D) y **EmailJS 4** (contacto). Son dependencias reales aunque
no estén en el lockfile: si una CDN cae, la página se degrada.

El contacto usa `serviceID: 'default_service'` y `templateID: 'template_b3lq30k'` en `contact.js`, con
la clave pública de EmailJS inicializada en `Layout.astro`. Es una clave publicable (diseñada para ir
en el cliente), no un secreto filtrado.

## Principios de diseño heredados

Vienen de unas reglas de IA anteriores (`.trae/`, ya eliminado) y siguen siendo la intención del
sitio: mantener las secciones base (Inicio / Proyectos / Contacto), jerarquía visual clara, estética
minimalista y oscura, 100% responsive, feedback visual en cada interacción, formulario de contacto
con validación, y GSAP + Lottie para animación y preloader.

Esas reglas también decían "sin Tailwind", "React Bits + Shadcn UI" y "integrar Lenis". Nada de eso
aplica: el proyecto usa Tailwind v4, no hay React, y el scroll lo maneja GSAP ScrollTrigger.

## Deuda conocida

Hay dos planes por fases, con verificaciones y criterios de aceptación:

- **`docs/plans/2026-08-11-limpieza-y-deuda.md`** — deuda técnica. Consúltalo antes de "arreglar"
  cualquier resto sospechoso por tu cuenta; varias cosas parecen basura pero tienen un matiz.
- **`docs/plans/2026-08-11-contenido-y-posicionamiento.md`** — qué cuenta el portafolio (contenido,
  no código).

Restos vivos que aún no se han limpiado:

- `public/assets/data/skills.json` — muerto (ver arriba).
- `src/assets/images/projects/3.png` y `4.png` — ya no los referencia `projects.json`.
- Los 2 `data-translate` huérfanos de `Projects.astro`.
- `PROFILE_README.md` no es el readme de este repo: es el perfil de GitHub de `kleyverx`, guardado
  aquí. Referencia `public/assets/images/preloader.gif`, que solo existe para eso.

## Estado del repo (2026-08-22)

- Todos los commits son del **2026-03-24**; el árbol de trabajo tiene cambios **sin commitear**:
  limpieza (`asset/`, `.trae/` y las imágenes de proyecto duplicadas — todo eliminado), reescritura
  de `README.md`, `PROFILE_README.md`, `translations.json`, `skills.json` y `projects.json`, y purga
  del fallback muerto de `projects.js`. `CLAUDE.md` y `docs/` están **sin trackear**.
- `README.md` ya es un readme real del proyecto y delega la parte técnica en este archivo.
