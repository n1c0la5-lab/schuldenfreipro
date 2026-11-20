# 13 — Status and lessons

*Sources: this repository (20 commits, 11–17 April 2026, history not published), the
project's status overviews and reviews (March/April 2026).*

## Timeline

| When | What |
|---|---|
| Jan 2026 | concept paper, investor teaser, two-page pitch, case study; calculator logic; first ER data model; UI mock-ups |
| Feb–Mar 2026 | "foundation" phase: law-firm website with booking, lead workflows live (lead ads, website form), welcome mail with SOS PDF; data-warehouse ingestion pipeline (OCR + LLM) in a separate repo; SEO pipeline produced 9 articles; first React dashboard and calculator in separate repos |
| Mar 2026 | lead-funnel redesign ("slim"), self-registration workflows live, letter templates, dispatch/escalation specs |
| Apr 2026 | sales CRM pipeline set up; architecture review of the warehouse ("over-engineered for the scale"); domain review → 19-table schema; this monorepo built in one week; legal pages added |

## What this repository contains (and runs)

- Landing page (migrated from the earlier React app).
- Public debt calculator: engine with 19 unit tests + UI with comparison table, pros/cons,
  recommendation, financial overview.
- Supabase Auth login/logout; middleware with a launch lock.
- Adviser cockpit: debtor list with nearest deadline, debtor detail, debtor create/edit,
  claim create/edit (principal/interest/costs split, flags, deadlines).
- Lead webhook for a lead-ad agency's e-mails.
- 19-table schema with enums, triggers (updated_at, file numbers, audit log, user profile),
  57 RLS policies.
- Builds with placeholder environment variables (`npm ci && npm run build`, verified for the
  public release).

## What does not exist here

Payment and the lawyer gate; the debtor self-service portal and counselling cross; document upload
and ingestion; letter generation and dispatch; escalation scheduler; deadline alerts; WhatsApp bot;
call-summary pipeline; mobile app; white-label; statistics export. Parts of these existed as
no-code workflows or separate prototypes (see [09](09-automation.md)), which are not included.

The pitched roadmap (50 → 500 → 3,000 paying users, 3 → 10 → 30 partner lawyers) was never reached;
the seed round is not documented as having closed.

## Lessons

Points 1–6 and 8–9 come from the project's own reviews; point 7 was observed while preparing
this public release.

1. **Build for your real scale.** A six-schema warehouse with four copies of every claim was built
   for dozens of clients. One flat schema with a status column and idempotent upserts would have done.
2. **Use the database before the LLM.** Trigram/Levenshtein matching on a known creditor pool is
   cheaper, faster and auditable; keep the LLM as fallback.
3. **One language across the stack** avoids a single point of knowledge (a Python pipeline only one
   person could maintain next to a TypeScript app).
4. **Slim beats clever in the funnel.** 150+ no-code fields with AI sentiment and "next best step"
   were replaced by 22 fields; the human counsellor knows his clients.
5. **Model the case, not the claim.** Without a `case` entity there is no fee, no product tier,
   no procedure type, no re-engagement — the schema had to be restarted.
6. **Derive the domain model from the incumbent's documentation.** The established tool encodes
   two decades of regulation (§ 305 InsO forms, statistics duty); copying its entity list closed
   the 60 % gap in one step.
7. **The legal line must be enforced in the product, not just written down.** The calculator still
   labels one path "recommended" although the project's own RDG matrix forbids that for the platform
   (see [06](06-debt-calculator.md)).
8. **Deliver first, then consolidate.** The monorepo was only attempted once the separate pieces
   worked.
9. **Agents need discipline, not complexity:** linting, tests, specs and clean data structures
   ([12](12-ai-agents.md)).

## If you want to take it further

The parts with the most reusable value, in the project's own assessment:
- the **RDG matrix** as a product-design constraint for any German legal-tech product;
- the **calculator engine** (statutory garnishment formula + three-path comparison);
- the **19-table domain schema** with RLS;
- the **process knowledge**: first letter, escalation chain, offer matrix, negotiation states,
  failure rule (> 50 % by head or amount);
- the **document-to-claim pipeline** design with a mandatory human in the loop;
- the **call-recording split** (client summary vs. internal instructions by a spoken code phrase).

Things you would have to add: payment, the debtor portal, letter dispatch, a GDPR-complete
operations setup with EU hosting, and — above all — partner lawyers and a fresh legal review.
