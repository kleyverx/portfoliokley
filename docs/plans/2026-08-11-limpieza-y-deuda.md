# Plan — Limpieza y deuda técnica

**Fecha:** 2026-08-11
**Origen:** ingesta del proyecto en el Cerebro (wiki personal). La lista completa de hallazgos está
en `Cerebro/proyectos/portfolio-kley.md` §5.
**Contexto:** último commit `2026-03-24`. Nada de esto es urgente ni rompe el sitio hoy; es deuda
acumulada tras la migración de HTML/CSS/JS a Astro, que quedó a medio camino.

**Cómo verificar cualquier fase:** `npm run build && npm run preview`, y revisar la consola del
navegador (varios de estos ítems solo se manifiestan ahí). El despliegue es automático al hacer push
a `main`, así que **verifica en local antes de subir**.

---

## Fase 1 — Seguro, sin verificación previa

Tres cambios independientes entre sí. Ninguno toca código que se ejecute.

### 1.1 Borrar el peso muerto de `asset/` — libera 4.2 MB

`asset/` (singular, en la raíz) es el ZIP crudo de la fuente Satoshi descomprimido, con anidado
`WEB/WEB/` y formatos `.eot`/`.ttf`. **No se usa:** el sitio sirve los `.woff2` de `public/fonts/`,
declarados en `public/assets/css/fonts.css`.

Lo único vivo ahí es **`asset/preloader.gif`**, referenciado por `PROFILE_README.md`.

- [ ] Mover `asset/preloader.gif` a `public/assets/images/`
- [ ] Actualizar esa ruta en `PROFILE_README.md`
- [ ] `rm -rf asset/`

> El repo pesa hoy ~34 MB en total (`asset` 4.2 + `public` 13 + `src` 17). Esto se lleva el 12%.

### 1.2 Renombrar el paquete

`package.json` declara `"name": "opposite-orbit"`, residuo del scaffold de Astro. No coincide con el
repo, el sitio ni el proyecto.

- [ ] `"name": "portfoliokley"`

Sin efecto en el build: no se publica a npm y nada importa el paquete por nombre.

### 1.3 Reemplazar el `README.md`

Hoy es la plantilla intacta de Astro ("Astro Starter Kit: Minimal"). No describe el proyecto y
contradice su arquitectura real.

- [ ] Escribir uno propio: qué es, URL en vivo, comandos, y un puntero a `CLAUDE.md` para la
      arquitectura

No dupliques `CLAUDE.md` en el README — enlázalo. Un solo sitio con la verdad.

---

## Fase 2 — Requiere verificar antes de tocar

### 2.1 Imágenes duplicadas — **verificado: seguro borrar las de `public/`**

Las 8 capturas existen dos veces: en `src/assets/images/projects/` y en
`public/assets/images/public/proyectos/` (nótese el `public/` repetido en la ruta).

**Verificación ya hecha:** `Projects.astro:44` hace `p.image.split('/').pop()` — se queda **solo con
el nombre del archivo** y lo busca en el glob de `src/assets/images/projects/`. La ruta escrita en
`projects.json` **nunca se usa como ruta**; es decorativa. Las que se publican (optimizadas por
`astro:assets`) son las de `src/`.

- [ ] Borrar `public/assets/images/public/proyectos/`
- [ ] En `src/data/projects.json`, dejar el campo `image` como nombre de archivo a secas
      (`"levnicare.png"`) en vez de la ruta engañosa `"assets/images/public/proyectos/levnicare.png"`
- [ ] Verificar que las 6 tarjetas siguen mostrando imagen (`npm run preview`). Si una falla,
      `Projects.astro` muestra "Image Not Found" en vez de romperse — fácil de detectar

**Ojo:** hazlo junto con 2.2. Si borras las imágenes de `public/` pero dejas vivo el fallback de
`projects.js`, ese código pasaría a apuntar a archivos inexistentes.

### 2.2 Fallback muerto en `projects.js`

`fetchProjectsData()` hace `fetch` de `/assets/data/projects.json`, **archivo que no existe** (en
`public/assets/data/` solo hay `skills`, `videos`, `translations` y el JSON del loader).

No rompe nada: el guard de `initProjectsModule()` (línea 10) detecta que Astro ya renderizó las
tarjetas y sale antes de llegar al fetch. Pero es una ruta de código que **fallaría en silencio**
—grid vacía— si Astro dejara de renderizar esa sección.

Además arrastra dos defectos propios:

- Su imagen de respaldo es `/assets/images/public/perfil.jpeg`, que **tampoco existe** (la foto real
  es `src/assets/images/perfil.png`, usada por `Hero.astro`)
- El `onerror` de la línea 126 escribe la ruta **absoluta y hardcodeada**, sin pasar por
  `window.BASE_URL` — es justo el bug de base path que costó tres commits, latente aquí dentro

Elige una:

- [ ] **Opción A (recomendada):** borrar `fetchProjectsData`, `loadAndRenderProjects` y
      `renderProjects` de `projects.js`. Quedarían solo el scroll horizontal con GSAP y los toggles
      de descripción, que sí se usan. El guard de la línea 10 pasa a ser el único camino.
- [ ] **Opción B:** conservar el fallback y hacerlo real — generar `public/assets/data/projects.json`
      en build desde `src/data/projects.json`, arreglar la imagen de respaldo y pasar el `onerror`
      por `BASE_URL`.

A menos que quieras render en cliente (no lo necesitas: el sitio es estático), la A es la correcta.

### 2.3 `.trae/rules/project_rules.md` contradice el código

Ese archivo desinforma hoy a cualquier agente de IA que lo lea:

| Dice | Realidad |
|---|---|
| "Estilos con CSS o módulos CSS, **sin Tailwind**" | Usa Tailwind v4 (hubo un refactor explícito hacia él) |
| "Basarse en **React Bits y Shadcn UI**" | No hay React en el proyecto |
| "Integrar **Lenis**" | No está; el scroll lo maneja GSAP ScrollTrigger |

Sigue siendo válido de ese archivo: secciones base, jerarquía visual clara, estética minimalista
oscura, 100% responsive, feedback en cada interacción, formulario con validación, GSAP + Lottie.

- [ ] Corregir las tres filas obsoletas, **o** borrar el archivo y dejar que `CLAUDE.md` sea la
      única fuente de reglas

Si sigues usando Trae, corrígelo. Si ya solo usas Claude Code, bórralo — dos archivos de reglas que
se contradicen es peor que uno.

---

## Fase 3 — Mejoras

### 3.1 `astro check` en CI

`tsconfig.json` extiende `astro/tsconfigs/strict`, pero nada valida tipos: no hay tests, ni linter,
ni `check` en el workflow. Un error de tipos llega a producción sin aviso.

- [ ] Añadir un paso a `.github/workflows/deploy.yml`, antes del build:
      `npx astro check`
- [ ] Correrlo primero en local — con `strict` puede sacar errores preexistentes que haya que
      resolver antes de que el paso sea verde

### 3.2 CV en francés

La UI traduce a **es / en / fr** (87 claves cada idioma), pero solo hay `cv-es.pdf` y `cv-en.pdf`.
`contact.js:47-50` cae a `cv-es.pdf` por defecto, así que un visitante en francés se descarga el CV
en español sin explicación.

- [ ] Añadir `cv-fr.pdf`, **o**
- [ ] Que el botón indique el idioma real del CV que va a descargar cuando no haya uno en el idioma
      activo

> Los CV viven en `public/assets/images/public/cv-*.pdf` — PDFs dentro de una carpeta `images`,
> herencia de la estructura vieja. Si mueves algo ahí, actualiza `contact.js`.

### 3.3 `PROFILE_README.md` desactualizado

No es el readme de este repo: es el perfil de GitHub de `kleyverx`, guardado aquí. Su tabla describe
este portafolio como `HTML` `CSS` `JS`, obsoleto desde la migración a Astro.

- [ ] Actualizar ese stack a `Astro` `Tailwind` `GSAP`
- [ ] Decidir si este archivo debe vivir aquí o en el repo de perfil `kleyverx/kleyverx` (las rutas
      relativas como `asset/preloader.gif` solo resuelven en el repo donde estén los archivos)

### 3.4 Imágenes huérfanas

`src/assets/images/projects/` tiene 8 PNG, pero `projects.json` solo referencia 6. **`3.png` y
`4.png` no los usa nadie** (y están duplicados también en `public/`).

- [ ] Confirmar que no corresponden a proyectos que quieras volver a publicar, y borrarlos

---

## Fuera de alcance

**Unificar las dos capas** (migrar los 12 módulos de `public/assets/js/` a componentes Astro con
`<script>` propios, y las 9 hojas CSS a Tailwind) es el trabajo de fondo que cerraría la migración
a medias. Es un refactor grande, con riesgo real de romper animaciones, y no cabe en un plan de
limpieza. Si algún día se hace, el orden natural es por sección: mover una (`Skills`, la más
sencilla), verificar, y repetir.
