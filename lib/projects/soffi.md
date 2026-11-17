---
title: "Soffi: launch site for an AI design editor"
summary: "Marketing site for Soffi with a live, editable demo of the product embedded in the hero."
company: "Paisanos · Soffi"
role: "Product Engineer"
period: "2026"
order: 7
category: "launch site · motion"
badge: "MARKETING SITE"
tagline: "Launch site with a live product demo in the hero"
stack:
  - Next.js 16
  - Tailwind 4
  - GSAP
  - Motion
  - Radix
  - Upstash
  - PostHog
  - Sentry
links:
  - label: "soffi.ai"
    href: "https://soffi.ai"
---

## Context

Soffi is an AI design editor. For its launch in mid 2026 the team wanted a site that showed the product instead of describing it. I made the first commit and wrote most of the site, working closely with Paisanos' designers. soffi.ai now shows a newer version of the site.

## What I built

- **A live demo in the hero.** A small "baby canvas" of the editor runs as a separate Next.js app inside an iframe, with allowed origins, a health check and a graceful fallback when the iframe can't load.
- **Story pages.** Manifesto and vision pages with interactive cards, parallax and GSAP animations, tuned pixel by pixel against Figma.
- **Lead capture.** Access, partner and contact forms with email-provider integrations, reCAPTCHA, rate limiting and feature flags.
- Fixes for real devices, like a fullscreen bug on iOS, plus analytics and error tracking from day one.
