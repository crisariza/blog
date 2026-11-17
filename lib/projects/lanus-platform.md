---
title: "Club Lanús engineering platform"
summary: "A design system, a unified admin panel and the quality standards that every club repo follows."
company: "Club Atlético Lanús"
role: "Lead Engineer (volunteer)"
period: "2024 - Present"
order: 6
category: "design system · dx"
badge: "PLATFORM"
tagline: "The design system and standards behind every club repo"
stack:
  - pnpm + Turborepo
  - Changesets
  - Storybook
  - Tailwind 4
  - React Email
  - Next.js 16
  - Playwright
  - GitHub Actions
links: []
---

## Context

I started the club's engineering as a volunteer and have written about 84% of the commits across 20+ repos. A small team now contributes, so the work became less about features and more about making the right thing the easy thing.

## Design system

`@clublanus/platform` is a monorepo with five versioned packages: tokens, web components, React Native components, email templates and an end-to-end kit. The web package alone has had 129 releases and about 90 components, with Storybook stories and accessibility checks. Guards fail the build on colors outside the tokens, and each breaking change ships with a migration guide for the consuming apps.

## One admin panel

The club had three separate admin panels. I consolidated them into one (110 pages) with **feature-based access control**: stable feature IDs, features enabled per organization, a per-person deny-list and 307 redirects from the old URLs. Workflows include press accreditations with QR passes and PDF exports; bulk QR upload went from **238 s to 38 s for 150 codes**.

## Standards across repos

- 100% coverage gates, integration tests on a fresh database branch per CI run, an endpoint-matrix test, and Playwright on every PR against that PR's build.
- Test deploys reach protected environments through OIDC instead of shared secrets.
- Each repo documents its architecture and a prioritized list of pending improvements; teammates pick their tickets from those lists.
- Guidelines and skills for AI coding agents, shared by every repo, so agent-written code follows the same rules as everyone else's.

## Incidents worth telling

- The club site's build hung for over 22 minutes trying to prerender ~10,600 news pages. Bounding prerendering to the newest 100, with on-demand and backup revalidation, took it from **10,714 to 178 static pages**.
- A security pass found authorization holes caused by open sign-up, an API key inlined into a client bundle and an unauthenticated upload endpoint. All closed, with regression tests.
