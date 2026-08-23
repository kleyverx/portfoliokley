# Plan — Contenido y posicionamiento

**Fecha:** 2026-08-11
**Complementa a:** `2026-08-11-limpieza-y-deuda.md`. Aquel plan arregla el **código**; este arregla
**lo que el portafolio cuenta de ti**, que es el problema más caro de los dos.
**Fuente de los datos:** el wiki personal (Cerebro), que documenta 14 proyectos con su stack real
verificado leyendo cada repo.

---

## El diagnóstico en una frase

El portafolio te presenta como **maquetador de tiendas Shopify**. La evidencia dice que eres
**ingeniero full-stack con backends en producción**. Muestras 6 trabajos de 14, y los 6 que muestras
son justamente los de menor complejidad técnica.

Un reclutador o cliente que lea el sitio hoy concluye: *"hace temas de Shopify y una tienda en
Laravel"*. No hay forma de que deduzca que tienes una app **NestJS + PostgreSQL + Redis + WebSockets
corriendo en producción para 16 personas**.

---

## Parte 1 — Proyectos ausentes

### 1.1 Lo que falta

Seis proyectos reales, documentados y verificados, que el portafolio **no menciona**:

| Proyecto | Qué es | Stack real | Por qué importa |
|---|---|---|---|
| **MARG Flow** | Gestor de tareas con chat en tiempo real, **en producción** | NestJS 11, Prisma 7, PostgreSQL 16, Redis 7, Socket.IO, React 19, Vite, Tailwind 4, shadcn/ui | **El más fuerte que tienes.** ~24 modelos de datos, chat cifrado AES-256-GCM, sesión por cookie→Redis, desplegado con Coolify tras Cloudflare Tunnel, auditoría de seguridad propia |
| **Grupo Oxford (Payload)** | Plataforma e-commerce/corporativa | Payload CMS 3, Astro 6, PostgreSQL | Migración desde Shopify legado. **Ya lo muestras, pero mal** — ver 1.2 |
| **Eductrack** | Sistema académico con diagnóstico vocacional por IA | React 19, Express, MongoDB, OpenRouter, bot de Telegram | Producto propio: IA aplicada, constancias con QR verificable, bot bidireccional |
| **NQLN Platform** | App Shopify custom de fidelidad y segmentación | React Router v7, Shopify Admin GraphQL | Demuestra **apps** de Shopify, no solo temas |
| **Pictorys Manager** | App Shopify de recetas de fotos y ofertas BxGy | React Router v7, Prisma, Theme App Extension, App Proxy | Extensiones de tema y proxy: Shopify avanzado |
| **Forge Works Welding** | Sitio corporativo bilingüe, EE. UU. | Astro 7, Cloudflare Pages Functions, Resend, Turnstile, i18n nativo | **Cliente internacional** y tu trabajo técnicamente más pulcro |

- [ ] Añadir los 6 a `src/data/projects.json`
- [ ] Conseguir una captura decente de cada uno (hoy solo hay imágenes de los 6 storefronts)

> ⚠️ **Antes de publicar: pide permiso.** MARG Flow es la herramienta **interna** de Inversiones
> MARG y contiene datos privados (personas, negocios, cuentas). Eductrack, Grupo Oxford, NQLN y
> Pictorys son de clientes. Muestra **arquitectura y decisiones técnicas**, nunca datos reales ni
> capturas con información de clientes. Si alguno no se puede enseñar, descríbelo sin nombrar al
> cliente ("plataforma interna de gestión para una agencia de 16 personas").

### 1.2 Grupo Oxford está descrito con datos falsos **hoy**

`src/data/projects.json` (proj-4) dice: `"technologies": ["Shopify Tema Personalizado", "HTML",
"CSS", "JavaScript"]`.

Eso ya no es cierto. El proyecto **migró fuera de Shopify** hacia **Payload CMS 3 + Astro 6 +
PostgreSQL**. Estás describiendo como maquetación lo que en realidad es una plataforma custom — te
perjudica dos veces: es incorrecto y te resta.

- [ ] Corregir el stack y la descripción de proj-4

### 1.3 Los 5 storefronts están infravalorados

Los describes como *"Shopify Ella (Modificado), Liquid, JavaScript, CSS"*. Lo que el wiki documenta
que realmente hiciste en ellos:

- Secciones custom propias, incluido un **banner con fondo WebGL vanilla** (`color-bends-banner`, sin
  React ni build) en Levni Care
- Badge de stock bajo, linter propio de secciones (`check-section.sh`), onboarding con documentación
- En Vauli: **dos mercados** con lógica distinta — Venezuela con checkout estándar y Colombia con
  **pago contra entrega (COD)** vía app Releasit y logística Dropi

- [ ] Reescribir las 5 descripciones para que digan **qué construiste**, no qué tema compraste

---

## Parte 2 — El stack que no declaras

`public/assets/data/skills.json` está desalineado con tu propia evidencia.

### 2.1 Ausentes por completo

Ninguno de estos aparece en tus skills, y todos tienen al menos un proyecto que lo respalda:

| Falta | Proyectos que lo prueban |
|---|---|
| **Shopify** | 5 storefronts + 2 apps custom — **es tu mayor cuerpo de trabajo y no está listado** |
| **Liquid** | Los 5 temas |
| **Astro** | Este portafolio, Forge Works, Grupo Oxford |
| **NestJS** | MARG Flow (producción) |
| **Prisma** | MARG Flow, Pictorys Manager |
| **Redis** | MARG Flow |
| **Socket.IO / WebSockets** | Chat en tiempo real de MARG Flow |
| **React Router v7** | NQLN Platform, Pictorys Manager |
| **Payload CMS** | Grupo Oxford |
| **GSAP** | Este portafolio, Forge Works |
| **Docker / Coolify / Cloudflare** | Despliegue de MARG Flow y Forge Works |

- [ ] Añadirlos, agrupados de forma legible (no hace falta que sean 11 barras nuevas)

### 2.2 Infravalorados

| Skill | Dice | La evidencia dice |
|---|---|---|
| Node.js | **50** | Tienes NestJS 11 y Express en producción. Un 50 no es creíble junto a eso |
| TypeScript | **50** | MARG Flow, Forge Works y Grupo Oxford son TS, dos en modo `strict` |
| PostgreSQL | **60** | Dos proyectos en producción lo usan |
| React | **65** | React 19 en MARG Flow y Eductrack |

### 2.3 Sin respaldo

| Skill | Problema |
|---|---|
| **Angular 50** | No hay **ni un** proyecto con Angular en 14 documentados |
| **Python 45** | Tampoco hay ninguno |

No digo que no los sepas — digo que no puedes demostrarlos y ocupan sitio que necesitan Shopify y
NestJS. Un skill sin proyecto detrás resta credibilidad al resto de la lista.

- [ ] Quitarlos, o dejarlos como "conocimientos básicos" separados de los que sí tienen obra

### 2.4 Sobre los porcentajes

Las barras de nivel (`"level": 95`) son difíciles de defender: nadie sabe qué significa "95 en HTML"
y el número invita a discutirlo. Alternativa: **años de uso** o **agrupación** (Principal / Habitual
/ Básico), respaldados por el proyecto que lo demuestra.

- [ ] Decidir si conservar el formato de barras

---

## Parte 3 — Posicionamiento

### 3.1 El titular no dice lo que haces

La descripción actual es *"Desarrollador Full Stack especializado en transformar ideas complejas en
productos digitales de alto impacto. 4 años de trayectoria…"* — cierto, pero intercambiable con
cualquier otro portafolio.

Lo que te diferencia de verdad, y no está escrito en ninguna parte:

- **E-commerce Shopify de extremo a extremo**: temas Liquid *y* apps custom *y* extensiones de tema
- **Backends en producción**, no demos: MARG Flow sostiene la operación diaria de una agencia
- **Cliente internacional** (EE. UU., bilingüe) además del mercado venezolano

- [ ] Reescribir el titular y el párrafo del hero para reflejar esas tres cosas
- [ ] Recordar que hay **87 claves × 3 idiomas**: todo cambio de texto va en `es`, `en` y `fr`

### 3.2 Agrupar por tipo de trabajo

Con 12 proyectos, una lista plana no se lee. Sugerencia de agrupación:

**Aplicaciones y plataformas** (MARG Flow, Eductrack, Grupo Oxford, NQLN Platform, Pictorys Manager)
· **E-commerce Shopify** (los 5 storefronts) · **Sitios corporativos** (Forge Works, BMV Shop)

Puesto así, el primer grupo es el que un cliente serio mira primero — y hoy ese grupo está vacío.

- [ ] Añadir un campo `category` a `projects.json` y agrupar en `Projects.astro`

### 3.3 Videos con títulos de relleno

`videos.json` tiene entradas como *"Tutorial de desarrollo web" / "Aprende desarrollo web moderno"*.
Suena a marcador de posición. Si el contenido es real, dale su título verdadero; si no, quita la
sección.

- [ ] Revisar `public/assets/data/videos.json`

---

## Orden sugerido

1. **1.2** — corregir Grupo Oxford. Es un dato falso publicado; cuesta cinco minutos
2. **2.3** — quitar Angular y Python. Igual de rápido, sube la credibilidad de golpe
3. **1.1** — añadir MARG Flow. Un solo proyecto que cambia por completo lo que aparentas
4. **2.1** — añadir Shopify, Liquid, NestJS, Astro y el resto
5. **3.1** — reescribir el titular
6. El resto, sin prisa

Los pasos 1 a 4 son media tarde y arreglan el 80% del problema.
