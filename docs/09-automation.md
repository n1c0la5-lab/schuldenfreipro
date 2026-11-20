# 09 — Automation

*Sources: lead-funnel specs, feature specs FEAT-01..03 (PDF generation, dispatch, escalation),
quick-win specs LHF-02..04 (claim overview, deadline alert, letter status), the architecture
overview, the data-lineage note and the data-warehouse review (March/April 2026).*

The thesis: the biggest lever is not OCR technology itself but **process automation, data
structuring and decision support** — building an "insolvency operating system" rather than an
administration tool.

## 1. Document ingestion: letter in → structured claim

```
incoming e-mail / scan / photo / forwarded post
  → landing zone (object storage, per-client folders)
  → OCR (a cloud vision API)
  → LLM extraction → JSON: creditor, amount (principal / interest / costs), creditor file
    number, letter date, deadline, letter type
  → validation + normalisation
  → creditor matching against the master database
  → claim record with match confidence and the raw extraction kept for audit
  → human confirmation (mandatory, see the legal model)
```

Built at the time as a Python service with a mailbox downloader, scan and e-mail loaders,
extraction, normalisation, validation and matching modules, and a "deep search" step that
asked an LLM to resolve unknown creditor names. The extraction tagged each letter with a
letter-type code; the meaning of those codes was never fully documented.

**Creditor master database:** about 2,500 creditor entries from the practice's previous
Excel tool (salutation, company name, department, contact, address split into street/number,
P.O. box, phone, fax, e-mail, legal representative, creditor type, customer and file numbers).
Known quality problems: duplicates (the same telecom brand in several spellings), creditor type
empty in an estimated > 50 %, **e-mail missing in an estimated > 80 %** (a blocker for automatic
e-mail dispatch), stray whitespace in postcodes.

**Matching recommendation from the review:** Postgres `pg_trgm` trigram similarity,
Levenshtein and phonetic functions are sufficient for German company names from a known pool;
use the LLM only as a fallback when confidence is below 80 %. The schema in this repository
has the trigram index on `glaeubiger.name` for that reason.

## 2. Letter generation (FEAT-01)

Templates with mail-merge placeholders (`«Salutation»`, `«Name»`, `«FileNumber»` …; the first
letter has 12, the settlement letter 18+) are filled from the database and rendered to PDF
(DIN 5008 business-letter layout) — for e-mail attachment **and** physical letter. Options
evaluated: headless-browser HTML→PDF, React-PDF, PDFKit; an earlier implementation filled Word
templates. PDFs stored per client under `/clients/{id}/letters/`. A single-letter preview in
the dashboard lets the lawyer check before sending.

## 3. Dispatch pipeline (FEAT-02)

```
[Send] button in the dashboard
  → POST /api/letters/send  { debtor, creditor, channel: "email+post" }
     → generate PDF if missing
     → transactional e-mail API: e-mail with PDF attachment (fast)
     → print-and-mail API: PDF → physical letter (legally safer)
     → write status: channel, email_sent_at / email_status, letter_sent_at / letter_status
  ← webhooks (async) from both providers update delivery status
```

Retry on temporary errors, alert on permanent ones, every dispatch logged. Cost assumptions:
transactional e-mail free tier 100/day, paid ~20 EUR/month; postal letter ~0.85 EUR each.

## 4. Escalation engine (FEAT-03)

A daily scheduler checks due deadlines and sends reminders automatically through the dispatch
pipeline: day 21 deadline → day 35 friendly reminder → day 56 unfriendly reminder → day 70
dashboard alert for a manual decision. The escalation level is tracked per claim. Details of the
chain: [07](07-settlement-process.md).

## 5. Dashboards for the lawyer (LHF-02..04)

"Low-hanging fruit" screens that replace manual database joins:
- **Claim overview per client:** all claims, creditors, amounts (total / principal / interest),
  letter types as badges, deadlines (red when < 7 days), matching confidence as tooltip.
- **Deadline alert:** on app start and every 4 hours, all deadlines in the next 7 days
  (configurable) → a header badge "3 deadlines this week" (variant A: browser notifications).
- **Letter status:** which first letters went out, which are pending; badges SENT / PENDING;
  filter; counter "3 pending · 47 sent"; later a send button per row; e-mail and postal status
  side by side (delivered / in transit / pending / bounced).

The lawyer cockpit in this repository (`/cockpit`) implements the debtor list (with nearest
deadline), debtor detail, and claim create/edit. The other screens were not built here.

## 6. Call recording → client summary

```
recorded call (any recorder; audio file mailed to an intake address, subject "Call: <surname>")
  → workflow: mail trigger with subject filter → extract audio attachment
  → speech-to-text (a hosted Whisper large-v3, German) — about 0.01 EUR per 30-minute call
  → split at the code phrase "Anweisung an den Bearbeiter"
       part 1 (client-relevant) → LLM: client-friendly summary
       part 2 (internal)        → stored as internal instructions, never sent
  → match to the lead (surname from the subject; fallback: LLM recognises the client from content)
  → summary + booking link mailed to the client → status "sent", "last reaction" updated
```

Decision recorded: the recording device is only a microphone — its vendor API turned out to be
meant for app developers, not for access to one's own account data, so transcription runs in
the project's own stack. Any audio format (ogg, mp3, wav, m4a) works; no vendor lock-in. This
was called "the core innovation of the whole system". Estimated build effort: 4–5 hours.

## 7. Workflow inventory (as planned / live in March 2026)

| # | Workflow | Trigger | State then |
|---|---|---|---|
| WF1a | lead-ad mail → lead record + admin notice + welcome mail with SOS PDF | mailbox | live |
| WF1b | website form → lead record + notice + welcome mail | form webhook (shared secret) | live |
| WF2 | call recording → transcript → split → summary → client | mailbox | to build |
| WF3 | monthly follow-up to warm leads | monthly cron | to build |
| WF4 | inactivity check: warm + last reaction > 6 months → inactive | daily cron | to build |
| WF5 | document intake → creditor list → client confirmation | new file in landing zone | phase 2 |
| — | self-registration: lead → debtor + file number → pre-filled form link | checkbox on lead | live |
| — | sync self-registration answers back into the database | new form submission | live |

## 8. What automation must not do

Everything above stays on the "calculate, collect, display, transmit" side of the legal line
([03](03-legal-model-rdg.md)): extraction produces suggestions that a human confirms; status
displays say "reply received / no reply", never "good" or "bad"; letters that contain legal
content are released by the lawyer.
