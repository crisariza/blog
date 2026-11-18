---
title: "Lanús ID and digital tickets"
summary: "The club's single sign-on, used by ~10 club sites and apps, plus the member web and mobile apps and a ticketing pipeline from the vendor's QR codes to Apple and Google Wallet."
company: "Club Atlético Lanús"
role: "Head of Engineering (volunteer)"
period: "2026 - Present"
order: 3
category: "identity · ticketing"
badge: "LIVE PRODUCT"
tagline: "Single sign-on, member app and wallet tickets"
image: "/projects/lanus-id.jpg"
imageAlt: "Lanús ID sign-in screen over a photo of the stadium"
stack:
  - Node.js
  - Express
  - Better Auth
  - Postgres (Neon)
  - Next.js 16
  - Expo
  - Apple / Google Wallet
  - Vitest
  - Playwright
links:
  - label: "app.clublanus.com"
    href: "https://app.clublanus.com"
---

## The problem

Every club website had its own login, or none. Members needed one account for tickets, reservations and benefits, and the club's ticket vendor offered no integration.

## Identity for the whole club

I designed and built Lanús ID end to end: the API, the sign-in site, the member web app and the mobile app.

- **SSO on Better Auth.** The national ID number (DNI) is the username, sessions are bearer tokens, organizations have roles, and other servers authenticate with API keys.
- **Migration without resets.** Moving from a hand-rolled JWT setup to Better Auth, I plugged in a custom bcrypt hasher so every existing password kept working.
- **Sign-in for other sites.** A site opens the sign-in page in a popup or redirect; after login the token goes back by `postMessage` to the exact origin, checked against an allow-list. About ten sites and APIs depend on it today.
- Identity verification against the scanned document, a fan achievements engine, facility reservations and medical clearances.

## Tickets in the wallet

The vendor only gave us QR images. The pipeline I built:

1. A small token-protected proxy reaches the vendor's API (with optional VPN egress when the vendor restricts locations).
2. Admins upload ticket batches; tickets are assigned first-come-first-served by DNI.
3. QR images are decoded and turned into Apple Wallet and Google Wallet passes.
4. Members get an email; staff redeem the QR at the gate.

It started as a one-week tool that scanned the barcode on the ID card at the door, moved into the forms platform, and finally graduated into Lanús ID.

## Mobile app

An Expo app with 25 screens: digital card, tickets, reservations, biometric unlock and deep links. Before launch I cleared the iOS 27 / Xcode 27 blockers (SDK upgrade, a config plugin for pod deployment targets) and realigned the app with the real API contract. Maestro end-to-end flows pass 11/11 on iOS.

## Quality and security

- 100% coverage enforced in CI, integration tests against a fresh database branch per CI run, and a deterministic seed with one persona per role.
- An endpoint-matrix test walks the router and fails if any write endpoint lacks an integration test.
- Those suites surfaced real issues, which I fixed: reading another member's data by DNI, a token sent with a wildcard origin, password changes without the current password and an open redirect.
- Token validation measured at 18 ms p50 / 48 ms p95 in the test environment.
