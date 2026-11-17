# blog

My personal site and portfolio (home, projects, blog, about, resume). Next.js App Router + Tailwind + Framer Motion.

## Language

- **Everything in this repo is in English**: code, comments, docs (including this file), UI copy, content, script output, commit messages, branch names, and PR titles and descriptions.
- Proper nouns keep their original spelling (Club Atlético Lanús, Ramonín, Museo Granate).

## Commands

- `pnpm dev`, `pnpm build` (runs `pnpm verify` first: ESLint `lint:strict`, `prettier --check`, `tsc --noEmit`).
- `pnpm resume:pdf`: prints `resume/resume.html` (the single source of the resume) with headless Chrome and overwrites `public/Cristian Ariza - Resume.pdf`, which `/resume` serves. It must fit on one A4 page.
- Husky pre-commit: lint-staged (ESLint `--max-warnings 0` + Prettier), then `pnpm build`. If it fails: `pnpm lint:fix` and `pnpm format`.
- CI (`.github/workflows/ci.yml`) runs `pnpm install --frozen-lockfile` and `pnpm build` on pushes and PRs to `main`. There are no tests yet.

## Design

- References: [garvitsingla.in](https://www.garvitsingla.in/) as the base, with inspiration from [heyhaigh.ai](https://heyhaigh.ai/). Dark, with a dot-grid background, handwritten headings and monospace details.
- Layout: a single `max-w-3xl` column, `px-6`; main content `my-12 sm:my-24`. Project cards go in a `md:grid-cols-2` grid.
- Tokens in `tailwind.config.js`:
  - Colors: `bg-surface` (#09090f), `bg-surface-raised` (#101017), `hover:bg-surface-hover` (#17171f), `border-line` (#2a2a33), `border-line-muted` (#1c1c24), `text-accent` (#38bdf8, for highlighted links and the name in the hero).
  - `bg-dots` (background dot grid), `rounded-surface` (small panels, row hovers), `rounded-card` (cards), `shadow-elevated` (only on elevated surfaces, like the mobile menu).
- Typography:
  - Body: the system font (`font-sans`, -apple-system). No Geist or other web fonts for text; Geist is only used for OG images.
  - Section headings and small accents: Gloria Hallelujah (`font-hand`, loaded with `next/font/google` in `app/layout.tsx`), in lowercase ("things i've built & shipped").
  - Nav, labels, chips, dates and action links: `font-mono`, small (`text-xs` / `text-[10px]`).
- Classes in `styles/globals.css`:
  - `heading-hand` (handwritten heading), `eyebrow` (letter-spaced uppercase label above a heading), `chip` (stack or skills), `badge` (like `[AI AGENT]`), `card` (card surface).
  - Links: `link-nav` + `link-nav-active` (navigation, lowercase mono), `link-mono` (action links, with `↗` when they leave the site), `link-inline` (links in body text), `link-subtle` (muted links).
- Components:
  - `components/title.tsx` (handwritten heading with an optional `eyebrow`).
  - Projects: `components/projects/` (`project-card`, `browser-frame` with the three-dot bar and the domain, `project-header`).
  - `components/experience-list.tsx` (expandable rows with `<details>`) and `components/blog/writing-list.tsx` (rows with the year on the right).
  - Post or project title: `text-2xl md:text-3xl font-semibold tracking-tight`. Markdown uses `prose prose-invert`, without backticks around inline code.
- Animations with Framer Motion: fade/slide on enter and small hovers.
- The nav switches from a hamburger to links at `min-[420px]:`. The "open to work" indicator sits on the right.

## Content

- Posts: `lib/*.md` (frontmatter `title`, `date`, `excerpt`).
- Projects: `lib/projects/*.md`, read by `lib/projects.ts`; the shared parser is `lib/markdown.ts`.
  - Frontmatter: `title`, `summary`, `company`, `role`, `period`, `order` (sets the order and the `№ 00X`), `category`, `badge`, `tagline`, `stack`, `links` (the first one shows in the browser frame), and optional `image` and `imageAlt`.
- Screenshots go in `public/projects/*.jpg` at 1440×900, only from public material (websites, store listings, client announcements).
- Only metrics you can defend. No secrets, internal URLs or personal data about users or patients.

## Code

- Server Components by default; `"use client"` only when needed.
- Styles with Tailwind. `styles/globals.css` only holds base/components layers and shared tokens. Inline styles only for dynamic values.
- Shared types live in `types/index.ts` (import from `@/types`). Types used by a single module can stay in that file. No `any` (ESLint errors on it), strict mode.
- Naming: camelCase for variables and functions, PascalCase for components, kebab-case for files. No magic values.
- Short functions, early returns, one responsibility per function.

## Git

- Small commits formatted as `type(scope): description`.
- Never commit secrets (`.env`, `.env.local` and `.env.*.local` are in `.gitignore`).
