# blog

Mi sitio personal (blog, timeline, about). Next.js App Router + Tailwind + Geist + Framer Motion.

## Comandos

- `pnpm dev`, `pnpm build` (corre antes `pnpm verify`: ESLint `lint:strict`, `prettier --check`, `tsc --noEmit`).
- Pre-commit con Husky: lint-staged (ESLint `--max-warnings 0` + Prettier) y después `pnpm verify`. Si falla: `pnpm lint:fix` y `pnpm format`.
- CI (`.github/workflows/ci.yml`) corre `pnpm install --frozen-lockfile` y `pnpm build` en push y PR a `main`. Todavía no hay tests.

## Diseño

- Oscuro, minimalista, editorial: una columna `max-w-screen-sm`, `px-6`; contenido principal `my-12 sm:my-24`.
- Tokens en `tailwind.config.js`: `bg-surface` (#1c1c1c), `bg-surface-raised` (#171717), `hover:bg-surface-hover` (#262626), `border-line` (#404040), `border-line-muted` (#262626), `rounded-surface`, `shadow-elevated` (solo con superficies elevadas).
- `rounded-surface` para paneles elevados, botones de ícono y hovers de filas. Los divisores van rectos; el avatar va `rounded-full`.
- Fondo y texto base vienen de `@layer base` en `styles/globals.css` (`bg-surface text-neutral-300`).
- Clases de links en `styles/globals.css`: `link-nav` + `link-nav-active` (navegación), `link-inline` (links en el texto), `link-subtle` (links tenues), `link-external` (links del timeline con ícono).
- Tipografía: Geist Sans. Títulos con `components/title.tsx` (`text-lg md:text-xl`; `size="small"` → `text-base md:text-lg`). Título de post `text-2xl md:text-3xl font-semibold tracking-tight`. Markdown con `prose prose-invert` (los links de `prose-invert` imitan `link-inline`).
- Animaciones con Framer Motion: fade/slide al entrar y hovers chicos.
- La nav cambia de hamburguesa a links en `min-[350px]:`.

## Código

- Server Components por defecto; `"use client"` solo cuando haga falta.
- Estilos con Tailwind. `styles/globals.css` solo para capas base/components y tokens compartidos. Inline styles solo para valores dinámicos.
- Tipos compartidos en `types/index.ts` (import `@/types`). Los de un solo módulo pueden quedar en el archivo. Sin `any` (ESLint lo marca como error), strict mode.
- Nombres en inglés: camelCase para variables y funciones, PascalCase para componentes, kebab-case para archivos. Sin valores mágicos.
- Funciones cortas, early returns, una responsabilidad por función.

## Git

- Commits chicos con formato `tipo(scope): descripción`.
- Nunca commitear secrets (`.env`, `.env.local` y `.env.*.local` están en `.gitignore`).
