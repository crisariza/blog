---
title: "Premedic: members app and API layer"
summary: "Took over a legacy React Native app for a health insurer and built, as sole author, the API layer that unifies 13 upstream systems and now carries 100% of the app's traffic, while shipping to both stores."
company: "Paisanos · Premedic"
role: "Product Engineer"
period: "2026 - Present"
order: 2
category: "mobile app · api layer"
badge: "LIVE PRODUCT"
tagline: "Legacy React Native takeover and a new API layer"
image: "/projects/premedic-app.jpg"
imageAlt: "Premedic Móvil screens from the App Store: digital card, authorization tracking and appointments"
stack:
  - React Native
  - Expo
  - TypeScript
  - Express
  - Zod / OpenAPI
  - Next.js 16
  - Maestro
  - Sentry
links:
  - label: "App Store"
    href: "https://apps.apple.com/ar/app/premedic-m%C3%B3vil/id1091291561"
  - label: "Google Play"
    href: "https://play.google.com/store/apps/details?id=com.paisanoscreando.premedic"
  - label: "Members portal"
    href: "https://afiliados.grupopremedic.com.ar"
---

## Context

Premedic's members app (digital card, provider directory, appointments, authorizations, invoices, telemedicine) had three years of history from five previous developers. In August 2026 it became mine: since then I have written most of its commits and shipped versions 3.3 and 3.4 to the App Store and Google Play.

![Premedic Móvil screens from the App Store: emergency contacts, provider directory and dental centers](/projects/premedic-app-2.jpg)

## Paying down a legacy codebase while shipping

I started with an audit organized by domain and worked through it section by section:

- Lint went from 358 unused-variable findings to zero and became a CI gate; TypeScript reached zero errors and then `noImplicitAny`.
- Typed navigation for all 43 routes, design tokens instead of hard-coded colors and font sizes, and atomic-design layers enforced in CI.
- From almost no tests to ~300 test files and **91 Maestro end-to-end flows covering every route**.
- Platform upgrades: Expo SDK 54 → 57, React Native New Architecture, Android 16 and the Xcode release blockers.
- The Figma redesign was applied with a measured method: a coverage file per screen and a CI gate, with a rule that product differences need a decision instead of a silent change.

## An API layer built from scratch

The app talked to five third-party services with credentials inside the binary, where anyone can extract them. I built **premedic-api** as its only author:

- 44 business operations over 13 upstream systems, with Zod schemas producing an OpenAPI 3.1 spec and problem+json errors.
- Normalization of dates, amounts and booleans, which fixed 5 bugs reachable in production, like a rejected booking displayed as reserved.
- By version 3.4.3, **100% of the app's network calls go through the API**; the secrets left the binary.
- A synthetic monitor runs 7 business flows every 5 minutes, alerts Slack on state change and cuts off failing upstreams automatically.
- Push notifications with scheduling, topics and preferences, plus a back office with roles and an audit log.

## Quality ideas worth stealing

- **Network-traffic baseline:** the end-to-end suite records every outgoing request and compares it to a per-platform baseline, so an extra call turns CI red. Fault-injection flows cover a backend that is down or slow.
- Security and privacy: keystore and credentials out of the repo, no member identifiers in logs or file names, and a secrets gate in pre-commit and CI.

## Around it

![Sign-in screen of the members web portal I rewrote](/projects/premedic-web.jpg)

I also created the cross-platform design system (tokens to web, React Native and email components, with Storybook) used by four products, migrated the back office from Vite to Next.js 16, rewrote the members web portal in phases, and split a shared database into four per-domain projects across three repos.
