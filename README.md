# SchuldenPRO (schuldenfreipro)

**A digital debt-settlement platform for Germany — code and the complete business idea, open-sourced.**

> **Status: archived project, built in 2026, open for anyone to take further.**
> Nothing here is maintained. There is no company behind this repository any more,
> no support and no running service. Take the code, take the idea, build it better.

The product language is German (it was built for the German market), so UI texts,
database names and code comments are German. Everything you need to *understand*
the project — this README and everything under [`docs/`](docs/README.md) — is in English.

---

## The pitch in one page

### Problem

About **6 million people in Germany are over-indebted** (roughly 8 % of adults; average
debt 30,000–33,000 EUR). Only about 575,000–600,000 of them get professional help per
year — a **supply gap of 85–90 %**.

- Free social debt-counselling services (around 1,350–1,440 offices) have waiting times
  of six months and more.
- Lawyers charge 1,500–3,500 EUR for a full debt settlement including insolvency.
- Commercial debt-advice providers cost 1,500–4,000 EUR and are often opaque.
- The tooling of the industry is antiquated: Excel/VBA tools, Word mail merge, paper files.
  The most expensive part of debt counselling is **file keeping and capturing the debts**.

The market for debt counselling was estimated at **600–900 million EUR per year**, with no
scaled digital platform serving it.

### Solution

SchuldenPRO digitises the whole debt-settlement process — from capturing every debt,
through communication with creditors, to the consumer-insolvency application — and
connects debtors with partner lawyers.

**Core promise:** a complete debt settlement for **899 EUR instead of 3,500 EUR+**,
including legal support and the insolvency application.

Key design principle (because of the German Legal Services Act, *RDG*):

> **The platform may calculate — but not think. Only the debtor or the lawyer may think.**

The platform captures, structures, calculates and transmits. Every legal assessment,
recommendation or representation is done by an admitted lawyer in a separate mandate.
See [docs/03-legal-model-rdg.md](docs/03-legal-model-rdg.md).

### Target groups

1. **Debtors (B2C)** — over-indebted private persons; the sharpest persona was the
   overwhelmed self-employed person (35–55, 15,000–80,000 EUR debt), a niche few serve.
   Secondary: worried partners/relatives.
2. **Partner lawyers (B2B)** — career starters and small firms who need mandates. They do
   not need to be insolvency specialists; the plan assumed a 4-day training is enough.
   Value proposition: *"mandates on a silver platter"* — fully prepared digital files.
3. **Debt-counselling offices (B2B)** — white-label licence of the platform.

### Product tiers

| Tier | Price | What the debtor gets |
|---|---|---|
| 0 — Free analysis | 0 EUR | Self-capture of debts, income, expenses; neutral calculation of three paths (repay / settle / insolvency); optional free call. Lead magnet. |
| 1 — Do it yourself | 600 EUR (50 EUR/month × 12) | Full platform, mail & scan service, document management, initial legal consultation included, model letters; debtor talks to creditors via the portal. Insolvency application optional for 199–399 EUR. |
| 2 — Economy | 1,200 EUR | Tier 1 plus an ongoing lawyer mandate that supervises the negotiations; insolvency application incl. § 305 InsO certificate. |
| 3 — Premium | individual | Full legal representation; all communication in the lawyer's name. |

Details: [docs/02-product.md](docs/02-product.md).

### Funnel

Ads, SEO content, a public debt calculator and WhatsApp feed one lead pipeline:

```
Trigger (dunning letter, account seizure, fear)
  → search / ad / social  → free debt calculator or contact form
  → automatic welcome message with an "SOS debt emergency plan"
  → self-booked first call → recorded call, AI summary sent to the lead
  → closing call → contract + power of attorney → first payment = go
  → first letter to all creditors → 3-month quiet period → settlement or insolvency
Non-closers: monthly friendly follow-up; after 6 months without reaction → inactive.
```

Details: [docs/08-lead-funnel.md](docs/08-lead-funnel.md).

### Business model

| Revenue stream | Share (target) |
|---|---|
| Platform subscription, debtors (600–899 EUR) | ~70 % |
| Licence fees, partner lawyers (100–500 EUR/month) | ~20 % |
| White label for counselling offices | ~10 % |

Target unit economics: **LTV 750 EUR, CAC 150 EUR (5:1), payback 3 months, gross margin > 70 %.**
The pitch asked for a 600k–1M EUR seed round with 18 months runway.
Details and the "win-win-win" case study: [docs/04-business-model.md](docs/04-business-model.md).

### Automation and AI

- **Document ingestion:** every letter a debtor receives (scan, photo, e-mail, forwarded post)
  goes through OCR + LLM extraction (creditor, amount, file number, deadline, letter type),
  fuzzy-matched against a creditor master database of ~2,500 entries — always as a
  *suggestion* with a human in the loop.
- **Letter engine:** first letters, reminders and settlement offers generated from
  templates, sent by e-mail and as physical letters, with an automatic escalation chain.
- **Call pipeline:** recorded consultations are transcribed, split at a spoken code word into
  a client part and an internal part, and the client part is summarised and sent.
- **Agents:** a WhatsApp qualification bot, an editorial agent team for YMYL-compliant SEO
  content, and a commit-gate agent pipeline for the codebase.

See [docs/09-automation.md](docs/09-automation.md) and [docs/12-ai-agents.md](docs/12-ai-agents.md).

### Architecture (this repository)

```
apps/web            Next.js 15 / React 19 / Tailwind 4 — landing page, public debt
                    calculator (/rechner), lawyer cockpit (/cockpit), login, webhook
packages/engine     Pure TypeScript debt-calculator engine (§ 850c ZPO garnishment
                    formula, three settlement paths, scoring) + Vitest tests
packages/db         Supabase client, typed queries, Zod schemas, generated DB types
packages/ui         Small shared UI primitives
supabase/           Postgres schema: 19 tables modelled on the established desktop
                    tools of the industry (case, claim, creditor, plan, creditor
                    response, insolvency application, audit log, …) with RLS per role
```

Monorepo with npm workspaces + Turborepo. Backend is Supabase (Postgres, Auth, Storage, RLS).
See [docs/10-architecture.md](docs/10-architecture.md) and [docs/05-data-model.md](docs/05-data-model.md).

### What exists and what does not

Built: landing page, the debt calculator (engine + UI, 19 unit tests), login, a lawyer
cockpit for debtors and claims (list, detail, create, edit), the full 19-table schema with
row-level security and audit log, a lead webhook. Not built: payment, the debtor
self-service portal, the letter dispatch, OCR ingestion inside this repo, the mobile app.
Honest status: [docs/13-status-and-lessons.md](docs/13-status-and-lessons.md).

---

## Running it locally

Requirements: Node.js 20+, npm 10, a Supabase project (or the Supabase CLI for a local one).

```bash
npm ci
cp .env.example apps/web/.env.local     # fill in your own Supabase URL and keys
# apply supabase/migrations/*.sql to your database (supabase db push, or SQL editor)
# optional: supabase/seed.sql inserts clearly fictional demo data
npm run dev                             # turbo dev → Next.js on http://localhost:3000
npm test                                # engine unit tests (Vitest)
npm run build
```

The public calculator (`/rechner`) and the landing page work without a database.
The cockpit needs Supabase Auth and a `user_profile` row with role `berater` or `admin`.

The legal pages (`/impressum`, `/datenschutz`) contain placeholders — whoever operates
this in Germany must fill in their own provider details. Two screenshots of a
third-party product, a background photo of unclear licence and a third-party messenger logo
were removed for this public release; their places show
a neutral placeholder.

## Documentation

Start with [docs/README.md](docs/README.md).

## Licence

- **Code** (everything outside `docs/` and this README): [MIT](LICENSE).
- **Documentation** (`docs/` and this README): [Creative Commons Attribution 4.0 International (CC BY 4.0)](docs/LICENSE.md).

The product logo files in `apps/web/public/` are included so the app renders; they are
the old project brand. If you build something new, give it your own name and logo.

Nothing in this repository is legal advice. The legal reasoning documented here reflects
the founders' working assumptions in 2026; an inquiry to the bar association was drafted, but
no answer is documented.
