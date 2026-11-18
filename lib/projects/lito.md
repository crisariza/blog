---
title: "Lito: a production AI agent on WhatsApp"
summary: "Premedic's WhatsApp assistant for health insurance members: 23,000+ members served, 43,000+ conversations and 156,000+ messages, with measurable answers, safety guardrails and human handoff."
company: "Paisanos · Premedic"
role: "Owner, AI engineer"
period: "2026 - Present"
order: 1
category: "ai agent · whatsapp"
badge: "AI AGENT"
tagline: "Production WhatsApp assistant for a health insurer"
image: "/projects/lito.jpg"
imageAlt: "Lito, Premedic's mascot, sitting on a member's shoulder while she chats on her phone"
stack:
  - Mastra
  - OpenAI
  - TypeScript
  - WhatsApp (Kapso)
  - Supabase
  - Upstash Redis
  - Vitest
links:
  - label: "web.grupopremedic.com.ar"
    href: "https://web.grupopremedic.com.ar/novedades/bienvenido-lito"
---

## Impact

- **23,375** members have talked to Lito.
- **43,638** conversations and **156,159** messages, about 3.6 messages per conversation.

## The problem

Premedic, an Argentine health insurer, answers member questions on WhatsApp every day: coverage, authorizations, appointments, offices. The first-generation bot used embeddings over an FAQ and was hard to trust: nobody could say how often it answered the right question, and it had no clear rules for emergencies or legal topics.

I took over the rewrite on Mastra in July 2026 and have owned it since (around 870 of its ~900 commits). Premedic launched it publicly in November 2026 as Lito: an assistant available 24/7 on WhatsApp that explains how to book appointments, request authorizations and check invoices, answers coverage questions, and hands the conversation to a person when it needs to.

## What I built

- **Retrieval without embeddings.** The agent sees a compact index of the 248 help-center questions and picks one by understanding, then answers through deterministic tools (fetch FAQ, nearest office, start a handoff). A hidden marker on each answer makes matching **measurable**: around 95% on the evaluation set.
- **Guardrails before the model.** An input processor routes emergencies, legal questions, prompt attacks and off-topic messages to fixed, reviewed templates (13 policy categories).
- **Human handoff as a workflow.** Validation, confirmation, cancellation and queue routing run as a Mastra workflow, later turned into an explicit decision tree rooted at "is this person a member?".
- **Member actions.** Members link their identity with a one-time code from the app; after that the bot can check authorizations and manage appointments through a state machine.

## Testing an agent like a product

Unit tests don't catch an agent that gives in when pushed. I built a "challenge QA" gate: 10 non-negotiable checks, clinical-safety smoke tests and multi-run persona matrices graded by an LLM judge. It found failures static tests never would, like the bot confirming things it shouldn't when a user insisted. The eval run gates releases.

## Cost engineering

I instrumented cost per conversation and found a floor of about 23.5K input tokens per step, with **84% of spend coming from uncached input**. From that I designed the reduction plan: guides loaded on demand, a hierarchical knowledge index, models split by operation, an explicit prompt-cache breakpoint and a cost ledger per conversation.

## Production details

- Distributed claim plus shared dedup state for concurrent webhook retries.
- Graceful degradation when the database API errors, and tracing tuned so it stops exhausting the connection pooler.
- Analytics on top of the same classifier call: sentiment, frustration topics, funnel, cost per conversation and suggested FAQs from unanswered messages.
