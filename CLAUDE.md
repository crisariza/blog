# blog

Mi sitio personal y portfolio (home, proyectos, blog, about, CV). Next.js App Router + Tailwind + Framer Motion.

## Comandos

- `pnpm dev`, `pnpm build` (corre antes `pnpm verify`: ESLint `lint:strict`, `prettier --check`, `tsc --noEmit`).
- `pnpm resume:pdf`: imprime `resume/resume.html` (fuente única del CV) con Chrome headless y pisa `public/Cristian Ariza - Resume.pdf`, que sirve `/resume`. Tiene que entrar en una página A4.
- Pre-commit con Husky: lint-staged (ESLint `--max-warnings 0` + Prettier) y después `pnpm verify`. Si falla: `pnpm lint:fix` y `pnpm format`.
- CI (`.github/workflows/ci.yml`) corre `pnpm install --frozen-lockfile` y `pnpm build` en push y PR a `main`. Todavía no hay tests.

## Diseño

- Referencias: [garvitsingla.in](https://www.garvitsingla.in/) como base, con inspiración de [heyhaigh.ai](https://heyhaigh.ai/). Oscuro, con grilla de puntos de fondo, títulos manuscritos y detalles en monospace.
- Layout: una columna `max-w-3xl`, `px-6`; contenido principal `my-12 sm:my-24`. Las tarjetas de proyecto van en grilla `md:grid-cols-2`.
- Tokens en `tailwind.config.js`:
  - Colores: `bg-surface` (#09090f), `bg-surface-raised` (#101017), `hover:bg-surface-hover` (#17171f), `border-line` (#2a2a33), `border-line-muted` (#1c1c24), `text-accent` (#38bdf8, links destacados y el nombre del hero).
  - `bg-dots` (grilla de puntos del fondo), `rounded-surface` (paneles chicos, hovers de filas), `rounded-card` (tarjetas), `shadow-elevated` (solo con superficies elevadas, como el menú mobile).
- Tipografía:
  - Texto: fuente del sistema (`font-sans`, -apple-system). Nada de Geist ni otras web fonts para el texto; Geist queda solo para las imágenes OG.
  - Títulos de sección y detalles: Gloria Hallelujah (`font-hand`, cargada con `next/font/google` en `app/layout.tsx`), en minúscula ("things i've built & shipped").
  - Nav, etiquetas, chips, fechas y links de acción: `font-mono`, chicos (`text-xs` / `text-[10px]`).
- Clases en `styles/globals.css`:
  - `heading-hand` (título manuscrito), `eyebrow` (etiqueta en mayúsculas espaciadas sobre un título), `chip` (stack o skills), `badge` (como `[AI AGENT]`), `card` (tarjeta).
  - Links: `link-nav` + `link-nav-active` (navegación, minúscula mono), `link-mono` (links de acción, con `↗` si salen del sitio), `link-inline` (links en el texto), `link-subtle` (links tenues).
- Componentes:
  - `components/title.tsx` (título manuscrito con `eyebrow` opcional).
  - Proyectos: `components/projects/` (`project-card`, `browser-frame` con la barra de tres puntos y el dominio, `project-header`).
  - `components/experience-list.tsx` (filas desplegables con `<details>`) y `components/blog/writing-list.tsx` (filas con el año a la derecha).
  - Título de post o proyecto `text-2xl md:text-3xl font-semibold tracking-tight`. Markdown con `prose prose-invert`, sin backticks en el código inline.
- Animaciones con Framer Motion: fade/slide al entrar y hovers chicos.
- La nav pasa de hamburguesa a links en `min-[420px]:`. A la derecha va el indicador "open to work".

## Contenido

- Posts: `lib/*.md` (frontmatter `title`, `date`, `excerpt`).
- Proyectos: `lib/projects/*.md`, en inglés. Los lee `lib/projects.ts`; el parser compartido está en `lib/markdown.ts`.
  - Frontmatter: `title`, `summary`, `company`, `role`, `period`, `order` (define el orden y el `№ 00X`), `category`, `badge`, `tagline`, `stack`, `links` (el primero se muestra en el marco del navegador), `image` e `imageAlt` (opcionales).
- Capturas en `public/projects/*.jpg`, a 1440×900, solo de material público (sitios, fichas de las tiendas, novedades del cliente).
- Solo métricas defendibles. Nada de secrets, URLs internas ni datos personales de usuarios o pacientes.

## Código

- Server Components por defecto; `"use client"` solo cuando haga falta.
- Estilos con Tailwind. `styles/globals.css` solo para capas base/components y tokens compartidos. Inline styles solo para valores dinámicos.
- Tipos compartidos en `types/index.ts` (import `@/types`). Los de un solo módulo pueden quedar en el archivo. Sin `any` (ESLint lo marca como error), strict mode.
- Nombres en inglés: camelCase para variables y funciones, PascalCase para componentes, kebab-case para archivos. Sin valores mágicos.
- Funciones cortas, early returns, una responsabilidad por función.

## Git

- Commits chicos con formato `tipo(scope): descripción`.
- Nunca commitear secrets (`.env`, `.env.local` y `.env.*.local` están en `.gitignore`).
