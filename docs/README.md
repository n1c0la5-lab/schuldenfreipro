# Documentation — reading path

These documents disclose the complete SchuldenPRO business idea: what was pitched,
what was planned, what was built, and what was learned. They are condensed English
translations of the project's internal German working documents (concept papers,
investor pitch, process descriptions, technical specs) written between January and
April 2026. Numbers are taken from those sources; where the sources contradict each
other, this is said explicitly. Nothing was added that the sources did not contain.

| # | Document | What it covers |
|---|---|---|
| 01 | [Problem and market](01-problem-and-market.md) | Over-indebtedness in Germany, market segments, the supply gap |
| 02 | [Product](02-product.md) | The four tiers, what happens after signing, the platform features |
| 03 | [Legal model (RDG)](03-legal-model-rdg.md) | "The platform may calculate, not think" — the allowed/forbidden matrix |
| 04 | [Business model](04-business-model.md) | Revenue streams, unit economics, flywheel, seed round, roadmap, risks, case study |
| 05 | [Data model](05-data-model.md) | The 19-table schema, roles, row-level security, file numbers |
| 06 | [Debt calculator](06-debt-calculator.md) | Formulas and decision tree of the three paths (repay / settle / insolvency) |
| 07 | [Settlement process](07-settlement-process.md) | Out-of-court settlement workflow, letters, escalation, negotiation states |
| 08 | [Lead funnel](08-lead-funnel.md) | Channels, welcome flow, recorded calls, follow-ups, lead states, WhatsApp |
| 09 | [Automation](09-automation.md) | Document ingestion (OCR + LLM), creditor matching, letter dispatch, workflows |
| 10 | [Architecture](10-architecture.md) | Target architecture, the "insolvency operating system" idea, CRM layering |
| 11 | [Marketing and SEO](11-marketing-and-seo.md) | Brand, tone of voice, personas, go-to-market, SEO strategy, competition |
| 12 | [AI agents](12-ai-agents.md) | Every agent the project designed or built, and the "agent readiness" rules |
| 13 | [Status and lessons](13-status-and-lessons.md) | What was actually built, what was not, what we would do differently |

Licence of these documents: [CC BY 4.0](LICENSE.md).

A note on terms used throughout:

| German | English used here |
|---|---|
| Schuldner / Mandant | debtor / client |
| Gläubiger / Gläubigervertreter | creditor / creditor's representative (often a collection agency) |
| Forderung | claim |
| Fall / Akte | case / file |
| Aktenzeichen | file number |
| außergerichtliche Einigung (AEV) | out-of-court settlement |
| Vergleich | settlement (a reduced payment the creditor accepts) |
| Privatinsolvenz / Verbraucherinsolvenz | consumer insolvency (in Germany: 3 years to discharge) |
| Pfändung / pfändbarer Betrag | garnishment / garnishable amount |
| P-Konto | garnishment-protected bank account |
| Beratungskreuz | "counselling cross" — the four-quadrant case overview (debts, assets, income, expenses) |
