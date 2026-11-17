---
title: "Juegos Granates and Football Head"
summary: "A mini-games hub built on the club's archive, including an arcade game with its own physics engine tuned by simulation."
company: "Club Atlético Lanús"
role: "Lead Engineer (volunteer)"
period: "2025 - Present"
order: 8
category: "games · physics engine"
badge: "LIVE PRODUCT"
tagline: "Archive trivia and an arcade game tuned by simulation"
image: "/projects/football-head.jpg"
imageAlt: "Juegos Granates menu with six mini-game modes"
stack:
  - Next.js 16
  - React 19
  - Canvas 2D
  - Zustand
  - Vitest
  - Playwright
links:
  - label: "juegos.clublanus.com"
    href: "https://juegos.clublanus.com"
---

## Mini-games driven by the API

The hub's menu comes from the stats API, so the museum team can add, order or hide game modes from the admin panel without a deploy. Six round types (multiple choice, comparison, free text, build the XI, ordering, complete the phrase) share one reducer-based session engine. Grading happens on the server: rounds reach the browser without their solution.

## Football Head

An arcade game where you play as the club against a bot, with its own physics engine (physics, world, bot, match and render modules, about 2,650 lines of Canvas 2D).

To tune it I wrote a simulator that runs the real match loop thousands of times. The documented baseline is about 5–4 over 150 matches, with the player winning 57%. The counter-intuitive finding is in the README: a more accurate bot doesn't make the game harder, it makes it faster, and scores blow up to around 30 goals.

## Details

- The API key moved out of the browser bundle into a server proxy with an allow-list.
- Each game page is pre-rendered with incremental static regeneration, with real 404s for unknown games.
- 100% coverage, including canvas tests, and a Playwright run that plays one match of each round type.
