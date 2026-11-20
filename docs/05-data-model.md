# 05 — Data model

*Sources: `supabase/migrations/002_fresh_start.sql` and `003_rolle_anwalt_zu_berater.sql` in
this repository; the schema-redesign spec (April 2026); the earlier ER drafts and the
data-warehouse review (March/April 2026).*

## How the schema came about

The first schema (8 tables, `001_initial_schema.sql`) modelled `debtor → claim` directly.
A domain review in April 2026 derived a 13-entity model from the public documentation of the
established desktop software of the German debt-counselling industry (an Excel/VBA tool on
the market for over two decades, built around § 305 InsO and the Over-Indebtedness
Statistics Act). Measured against that, the first schema covered only about 40 % of the
domain. Decision: **fresh start** on the development database, no migration of test data,
and introduce the **case** (`fall`) as the centre of the model. The result is migration
`002_fresh_start.sql` with 19 tables.

The structural change in one line:

```
before:  schuldner → forderung
after:   schuldner → fall → forderung → (plan, creditor response, insolvency application)
```

A case allows re-engagement years later and several cases per debtor; fee, product tier,
procedure type, responsible adviser and status all live on the case, not on the claim.

## Tables

| # | Table | Purpose | Legal background |
|---|---|---|---|
| 1 | `user_profile` | app role and display name per auth user | — |
| 2 | `lead` | incoming leads before they become clients (channel, contact, rough debt) | — |
| 3 | `glaeubiger` | creditor master data; trigram index for fuzzy matching | — |
| 4 | `glaeubiger_vertreter` | creditor representatives (collection agencies, law firms) | — |
| 5 | `schuldner` | debtor master data incl. the fields the official forms require | § 305 InsO forms |
| 6 | `ehepartner` | spouse/partner income | § 850c ZPO (garnishment) |
| 7 | `einnahmen` | income sources as a list | § 850c ZPO |
| 8 | `ausgaben` | fixed costs as a list | household budget |
| 9 | `fall` | **the case / file** — status lifecycle, procedure type, product tier 0–3, fee and payment status, key dates incl. the 3-month protection period | — |
| 10 | `forderung` | claim: principal, interest, costs split; `gesamtbetrag` is a generated column; flags for disputed, right of separation, enforcement title, "do not contact"; dates of letter and deadline; extraction confidence and raw LLM output | — |
| 11 | `verschuldungsursache` | main and secondary causes of over-indebtedness | Over-Indebtedness Statistics Act (mandatory since 2012) |
| 12 | `aktennotiz` | consultation notes | duty of documentation |
| 13 | `dokument` | every incoming and outgoing document (see document types) | — |
| 14 | `dokument_log` | document history | — |
| 15 | `schuldenbereinigungsplan` | out-of-court settlement plan, versioned: term, instalment, quota, zero plan, flexible zero plan, failed | § 305 (1) no. 1 InsO |
| 16 | `glaeubiger_antwort` | each creditor's response to a plan, with 6- and 10-week deadlines and two reminders | § 305 InsO |
| 17 | `insolvenzantrag` | court application: court, court file number, opening, trustee, good-conduct period, discharge date, application and § 305 certificate documents | § 305 ff. InsO |
| 18 | `audit_log` | generic before/after JSON log for core tables, written by triggers | audit trail |
| 19 | `nummernkreis` | gap-free number ranges per year (e.g. cases, outgoing letters) | compliance |

## Enumerations (selection)

- **Case status:** self_service → lawyer chosen → paid → first letter sent → protection period →
  plan → plan sent → plan failed → insolvency application → proceedings opened →
  good-conduct period → closed / aborted.
- **Procedure type:** consumer insolvency, regular insolvency (self-employed), out-of-court.
- **Document types:** outgoing — first letter, power of attorney, settlement offer,
  "quick-shot" offer, friendly reminder, unfriendly reminder, plan, insolvency application,
  annex; incoming — scan, creditor response, counter-offer, statement of claim, settlement
  confirmation, court letter, § 305 certificate.
- **Claim types:** loan, credit card, overdraft, rent arrears, telecommunications, energy, tax,
  social insurance, maintenance, court costs, fines, collection, other.
- **Causes of over-indebtedness:** taken 1:1 from the categories of the official German
  statistics ("main triggers of over-indebtedness") so that a statistics export needs no
  mapping: unemployment; separation/divorce/death of partner; illness/addiction/accident;
  uneconomic household management; failed self-employment; payment obligation from a
  guarantee; failed property financing; insufficient credit advice; low income; other.
- Income types, expense types, marital status, housing situation, employment status,
  creditor types, delivery method.

Several enums carry a `TODO` in the migration: the values were chosen pragmatically and the
final legal review was still pending.

## Roles and row-level security

| Role | May |
|---|---|
| `mandant` (client) | maintain own data, use the calculator, see own counselling cross — **no outgoing letters** |
| `berater` (adviser/lawyer; renamed from `anwalt` in migration 003) | sees only assigned cases (`fall.anwalt_id = auth.uid()`), may send first letters, plans, insolvency applications |
| `admin` | everything |

Multi-tenancy: **one production project**, not one per law firm; lawyer isolation happens via
RLS inside the database. Test and production are two separate Supabase projects; production
was meant to start empty. Migration 002 creates 57 RLS policies.

A sign-up trigger creates a `user_profile` row for every new auth user (the migration
documents a pitfall: if that trigger fails, Supabase Auth sign-up fails with a generic
"Database error").

## File numbers

Generated by trigger on insert of a case, format **`SP` + 2-digit year + initials + month +
3-letter sequence** (e.g. `SP26XYMMABC`). The data-warehouse review rated this scheme as
"clever and collision-free". An earlier lead-tracking format was `YYYYMMDD-###`.

## Rules implemented in application logic (not as DB triggers)

The migration deliberately leaves three rules to application code and points here:

1. **Plan failed** (`schuldenbereinigungsplan.gescheitert`): a plan counts as failed when
   **more than 50 % of creditors by head OR more than 50 % by claim amount** reject it.
2. **Zero plan rejected** (`forderung.nullplan_abgelehnt`): a per-claim flag meant to be
   maintained by the counselling-cross endpoint of the application, not by a trigger.
3. **Decided on the file** (`glaeubiger_antwort.nach_aktenlage`): a scheduled job sets this
   flag when the response deadline passes without reaction.

None of the three is implemented as automatic logic in this repository; the claim form in
the cockpit only lets an adviser set the zero-plan flag by hand.

## Planned but not built

- Phase C of the redesign: a statistics view for the official over-indebtedness statistics
  export (`v_ueberschuldungsstatistik`).
- The ingestion pipeline's raw/staging tables (see [09](09-automation.md)) were intentionally
  **not** carried over: the review of the earlier multi-schema warehouse concluded that one
  flat schema with a status column per claim is enough.

## Earlier warehouse design (for reference)

Before the fresh start, a separate data-warehouse pipeline used six schemas
(`landing → staging → transactional`, plus master data, orchestration and a deprecated
staging version), about 37 SQL migrations and ~50 API endpoints, and copied each claim
through four tables. The internal architecture review judged it **over-engineered for the
scale** (dozens of clients with 5–20 creditors each, not millions of rows) and recommended:
one schema, 5–6 core tables, upserts instead of drop-and-rebuild, SQL instead of Python
round-trips, Postgres trigram/Levenshtein matching with an LLM only as fallback below 80 %
confidence. The 19-table schema in this repository is the outcome of that lesson combined
with the domain review.
