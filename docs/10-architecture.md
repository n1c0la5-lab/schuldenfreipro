# 10 — Architecture

*Sources: the code in this repository, the architecture overview (April 2026), the concept
note for an AI-native insolvency platform, the monorepo plan and the data-warehouse review.*

## This repository

```
schuldenfreipro/
├── apps/web/                    Next.js 15 (App Router), React 19, Tailwind CSS 4, motion
│   ├── app/landing/             marketing landing page (hero, problem/solution, features,
│   │                            target groups, values, roadmap, team roles, CTA, footer)
│   ├── app/rechner/             public debt calculator UI (uses packages/engine)
│   ├── app/login/               Supabase Auth login
│   ├── app/cockpit/             adviser cockpit: debtor list, detail, create/edit, claims
│   ├── app/api/schuldner/…      route handlers for debtors and their claims
│   ├── app/api/webhook/lead-agency/ lead webhook: parses a lead-ad agency's HTML mail table
│   │                            into the `lead` table (Bearer-token protected)
│   ├── app/impressum, datenschutz   legal pages (placeholders in this public version)
│   └── middleware.ts            auth gate; a "complete lock" switch can close everything
│                                except login and legal pages before launch
├── packages/engine/             debt-calculator engine, pure TS, Vitest (19 tests)
├── packages/db/                 Supabase client, queries, Zod schemas, generated types
├── packages/ui/                 shared UI primitives
└── supabase/migrations/         001 initial · 002 fresh start (19 tables, RLS, triggers) ·
                                 003 role rename
```

Tooling: npm workspaces, Turborepo, TypeScript 5. `.env.example` lists the variables:
Supabase URL/keys, a vision-OCR key and an LLM key (for the planned extraction), a webhook
secret, the site URL and an optional WhatsApp link.

## Target architecture (April 2026)

```
                   ┌────────────────────────────┐
  marketing site → │ Next.js on a static/edge   │  landing page + SEO blog + legal pages
                   │ host                       │
                   └────────────────────────────┘
                   ┌────────────────────────────┐
  app subdomain  → │ dashboard + BFF API +      │  Docker, CI/CD, only reviewed releases,
                   │ calculator                 │  no SSH development access, automatic backups
                   └─────────────┬──────────────┘
                                 │
         ┌───────────────────────┼─────────────────────────┐
         ▼                       ▼                         ▼
   Supabase (Postgres,     workflow engine            ingestion service
   Auth, Storage, RLS)     (self-hosted n8n)          (OCR + LLM extraction)
         │                       │
         ▼                       ▼
   transactional e-mail,   sales CRM, calendar,
   print-and-mail API      WhatsApp bridge, e-signature
```

Three environments were planned: **production** (separate Supabase project, started empty),
**staging** on an existing VPS (dashboard, BFF, calculator, workflow engine, container
management), and a **development** VPS for the pipeline work and the monorepo migration.
Domains registered at one registrar, DNS pointing to the respective hosts; company e-mail and
calendar on a hosted office suite.

Estimated fixed running costs: **~65–85 EUR/month** (production VPS ~8 EUR, Supabase Pro ~25 EUR,
office suite for 2 users ~12 EUR, transactional e-mail ~20 EUR, static host 0–20 EUR, plus
~0.85 EUR per postal letter).

Repository strategy: at first three separate repos (frontend + BFF, the Python ingestion
pipeline, the calculator). A monorepo was planned "first on a dev environment, not on staging or
production — deliver first, then consolidate". This repository is that monorepo for the web part.

## The "insolvency operating system" concept

An earlier concept note sketched a full AI-native alternative to the incumbent desktop tool:

| Layer | Suggested technology | Role |
|---|---|---|
| Case management / CRM | a self-hosted open-source ERP/CRM | every case is a structured record: debtors, creditors, claims, deadlines; extensible with legal workflows; no SaaS limits |
| Document AI | a cloud document-AI API | PDFs, scans, e-mails → names, amounts, file numbers, deadlines → JSON |
| Operational DB | PostgreSQL | cases, parties, claims, document metadata |
| Analytics | a cloud data warehouse | reporting, KPIs, time series |
| Automation | n8n | document in → classify; extract → create case; missing data → manual review; deadlines → reminders |

Simplified core model: cases (file number, status, opening date, court, clerk) · debtors · creditors ·
claims (status: filed, checked, recognised) · documents (type, path, extracted JSON) · deadlines.
Relations: one case → many creditors → many claims; one case → many documents and deadlines.

MVP plan in that note (30–60 days): weeks 1–2 database and CRM, basic model; weeks 3–4 document
AI, upload, first extraction; weeks 5–6 automation (document → case, data → CRM, validation);
weeks 7–8 UI and testing with real documents. After the MVP: e-mail parsing, AI document
classification, a deadline engine, reporting dashboard, interfaces to courts.

Advantage claimed over form-based tools: document-driven + AI-native → 70–90 % less data entry,
faster case creation, fewer errors, scalability. Legal requirements: GDPR with mandatory EU
hosting, complete audit trail, standardised document formats for courts.

### CRM layering (advice recorded in the archive)

A sales CRM is built for leads → opportunities → deals and communication tracking; a legal case
system needs a relational model (case → creditors → claims), deadlines, court steps, status
transitions and legal-grade audit trails. Recommended hybrid:

1. **Intake & qualification layer** — sales CRM: inquiries from web, phone, e-mail; pipeline
   *new inquiry → contacted → qualified → not relevant → converted to case*; tag rejection reasons.
2. **Case system** — Postgres, only for qualified cases.
3. **Document processing** — only once a case is real and documents start flowing.
4. **Automation bridge** — workflow engine for lead → case conversion, document triggers,
   notifications, and pushing key info back to the CRM for visibility.

Later option: an AI pre-qualification layer that analyses incoming e-mails and scores leads.
"Most firms treat every inquiry like a case. Build a filtering machine instead."

## Lessons from the earlier data warehouse

See [05](05-data-model.md#earlier-warehouse-design-for-reference): one flat schema, idempotent
upserts, SQL over application round-trips, database-native fuzzy matching, and one language
(TypeScript) across frontend, BFF and ingestion to avoid a single point of knowledge.
