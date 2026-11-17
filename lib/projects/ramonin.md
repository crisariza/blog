---
title: "Ramonín: the club's AI assistant"
summary: "An assistant for fans on the web and WhatsApp, with a natural-language-to-SQL agent over the club's historical archive."
company: "Club Atlético Lanús"
role: "Lead Engineer (volunteer)"
period: "2025 - Present"
order: 5
category: "ai assistant · text-to-sql"
badge: "AI AGENT"
tagline: "Fan assistant with a sandboxed SQL agent"
stack:
  - Mastra
  - Hono
  - Vercel AI SDK
  - AI Gateway
  - Zod
  - Postgres (Neon)
links: []
---

## What it does

Ramonín answers fans on the club's websites and WhatsApp: tickets, membership, the help center, travel logistics for away trips, and questions about club history such as "who scored the most goals against River?". It handles 6,000+ conversations a month.

## How it evolved

1. **2025:** a hosted chatbot plus a LangChain "chat with the database" prototype.
2. **Early 2026:** text-to-SQL with OpenAI, SQL validation and a query cache inside the stats API.
3. **Mid 2026:** I moved it off the hosted platform to our own stack on Mastra, with an idempotent import of the old conversation history (dry run by default, deterministic IDs).

## The SQL agent

The museum agent works in three tool steps: read the schema, resolve entities (players, rivals, tournaments) and execute SQL. Every query runs inside a **read-only transaction with a 10-second statement timeout**, behind a SQL guard. I also wrote a design record comparing a public MCP connector with this agent, and recommended typed tools over open SQL for anything exposed outside the club.

## Around the agent

- **Analytics:** overview, time series, heatmaps, conversation bursts and quality metrics.
- **News writing:** an endpoint with versioned prompts (3 styles × 3 lengths, structured output) that the club's admin panel uses to draft articles.
- **Security:** authorization by organization, and members can only see their own trip data. Model access goes through the AI Gateway with project OIDC, so there is no API key to leak.
- 100% test coverage in CI.
