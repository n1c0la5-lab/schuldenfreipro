# 12 — AI agents

*Sources: WhatsApp-bot architecture note, lead-funnel specs, ingestion pipeline layout, the
"SEO content pipeline" pitch and its skill definitions, the commit-gate agent pipeline README,
and the "code quality & agent readiness" paper (all March 2026).*

The project used AI in three places: **in the product** (customer-facing and case-processing
agents), **in marketing** (an editorial agent team), and **in engineering** (a commit-gate
agent pipeline). Every product agent was bound by the legal line in
[03](03-legal-model-rdg.md): agents may capture, transcribe, summarise, translate between
formats and correct spelling — they may not assess, recommend or decide.

## Product agents

| Agent | Input → output | Guardrails | State |
|---|---|---|---|
| **WhatsApp first-contact & qualification bot** | incoming WhatsApp message → lead lookup by phone → first-contact reply, qualification score, document intake, payment trigger after signature | distinguishes new leads from existing clients; documents go to object storage; humans take over for counselling | designed; blocked by WhatsApp Business verification |
| **Call-summary agent** | call recording → speech-to-text → split at the spoken code phrase "instruction to the clerk" → client-friendly summary + internal instruction block | the internal part is never sent; the lead is matched by subject line, LLM recognition only as fallback | specified, effort estimated at 4–5 h |
| **Document extraction agent** | scan / photo / e-mail → OCR → LLM → structured claim JSON | output is a *suggestion*; mandatory human confirmation; raw extraction stored for audit | built as a Python service in a separate pipeline |
| **Creditor "deep search" matcher** | unknown creditor name → LLM-assisted match against ~2,500 master records | review recommended trigram matching first, LLM only below 80 % confidence | built (LLM-first); the simplification was recommended, not done |
| **Lead pre-qualification (idea)** | incoming e-mails → auto-score, prioritise high-value cases | — | idea only |
| **Spelling/style assistant (idea)** | the debtor's own letter text → corrected text | explicitly *without* changing content (RDG) | idea only |

## Marketing: the SEO editorial agent team

A local "SEO factory" producing YMYL-compliant articles from keyword research to a published
WordPress post — with no SaaS in between and "~0 EUR per month" running cost.

**Nine stages:** ICP generator → competitor research → keyword research → long-tail generation →
subtopic generation → **planning agent** → **research agent** → **writing agent** → publishing.

**Three layers:**

| Layer | Technology | Function |
|---|---|---|
| Intelligence | a coding-agent CLI with six slash commands | planning, research, writing with YMYL guardrails |
| Database | a Markdown vault with frontmatter + query dashboards | keywords, articles, pipeline status (planned → draft → review → published), review dashboard, publishing log |
| Automation | n8n + WP-CLI | keyword data API, image generation, WordPress publishing |

Why Markdown files instead of a no-code database (the course template it was derived from used
one): every article and keyword is a file with full frontmatter, no API call needed; Git is a
free and unlimited audit trail; a new client is a copied folder, not a new base with 30 views;
no vendor risk.

**The agents work like an editorial team, not a single prompt:**
- *Planning agent* — analyses the search results page, finds content gaps, builds an E-E-A-T outline.
- *Research agent* — facts, § references, current figures.
- *Writing agent* — writes section by section, handing context from one section to the next;
  quality checklist: no unexplained legalese, no AI filler phrases (explicit forbidden-word list),
  active voice and short sentences, empathetic opening, disclaimer, meta description < 160
  characters, CTA at the end, § references for legal statements, internal links to related
  published articles.
- *Audit agent* — technical SEO audit (crawler + WP-CLI) and action list.
- Commands: plan, write, keywords, ICP setup, audit, publish.

**Multi-client by design:** `context/<client>/brand.md, seo-strategy.md, persona.md, competitors.md`
— a new brand is a new folder, same pipeline.

**Competitor monitor workflow:** weekly (Monday morning) or manual; per competitor fetch the
sitemap, diff against the last run, write a report into the vault, create a task when something
changed.

State in March 2026 (self-assessed ~65 %): knowledge base 100 %, review database 95 %, planning and
writing agents 90 % (9 articles produced), audit 90 %, competitor workflow ready, research 80 %,
publishing 70 % (manual), keyword research 70 % (no volume data), long-tail/subtopic 50 %, workflow
automation 5 %, image generation 0 %.

The pitch also argued against hiring an SEO freelancer (500–2,000 EUR/month) and for spending
100–200 EUR/month on tools instead (a backlink/keyword suite, an on-page optimiser, a keyword data
API) — "scalable systems, not hourly rates". The one-sentence pitch: *"An SEO factory that produces
YMYL-compliant articles at the push of a button — the lawyer presses 'approve', not 'write'."*

## Engineering: the commit-gate agent pipeline

A local CI pipeline running as a Git pre-commit hook; five agents check every commit:

| Agent | Check |
|---|---|
| 1 Resource guard | estimated RAM/CPU/file size (abort above a threshold, default 2 GB) |
| 1.5 Lint checker | ESLint with `--max-warnings 0`, Prettier `--check` |
| 2 Code reviewer | LLM code review (optional, needs an API key); findings of severity CRITICAL/HIGH block |
| 3 Test runner | `npm test` |
| 4 Deploy gate | go/no-go, `npm audit`, JSON report; all agents must pass |

Mirrored in CI (build matrix for BFF and frontend, lint, security audit) so PRs that bypassed the
local hook are still blocked. Emergency bypass: `git commit --no-verify`.

## "Agent readiness" — the engineering rules

A short paper applied Rob Pike's five rules of programming to agentic engineering:

| Pike's rule | Agentic reading |
|---|---|
| Bottlenecks are surprising | measure agent latencies before tuning |
| Measure before optimising | golden test sets for LLM responses |
| Fancy algorithms are slow for small n | simple architectures scale better |
| Fancy algorithms are buggier | strict linting forces simplicity |
| Data dominates | with clean data structures, agent behaviour becomes self-evident |

It assessed the stack against an eight-pillar agent-readiness framework (style & validation, build
systems, testing, documentation, dev environment, code quality, observability, security & governance)
and named five hard production problems: **context compression** (incremental structured summaries,
fresh agents for fresh context), **instrumentation** (structured logging, baselines), **strict linting**
("agents are lazy developers"), **multi-agent coordination** (planner/executor, spawn fresh, every agent
has one role and ends with its task) and **spec fatigue** (an agent guide file per repository; no "hope
and pray"). Conclusion: *fix the data structures, don't complicate the agents.*
