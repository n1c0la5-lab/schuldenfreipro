# 08 — Lead funnel

*Sources: the developer briefing for the lead and automation process (v1.0, March 2026), the
technical counter-proposal "Lead Funnel v2 (Slim)" (v2.1, March 2026), the WhatsApp-bot
architecture note, the self-registration workflow notes, and the architecture overview
(April 2026).*

The idea: the prospect is treated as a client from the first second. **Trust is the core
promise.** WhatsApp communication is active counselling, not a support channel. Non-closers
are not dropped; they stay warm.

## Entry channels

- Facebook/Meta lead ads (via a lead-ad agency, delivered as an HTML table by e-mail)
- the website contact/booking form and the public debt calculator
- direct phone calls
- WhatsApp
- e-mail

Lead numbering: `YYYYMMDD-001`. Open problem noted at the time: direct callers without a
form had no automatic numbering.

## Flow

```
1. Lead arrives (any channel)
2. Automation checks: mobile number present? reachable on WhatsApp?
3. Welcome message via WhatsApp, else e-mail:
     – "SOS debt emergency plan" (PDF) attached
     – what to expect in the first call, what to prepare
     – link to the debt calculator
4. Lead record created automatically (file number, date, channel, contact)
5. Natural chat first — no cold booking link straight away; then a booking link;
   the lead books a first-call slot himself (fixed slots, mornings and evenings)
6. First call by phone (15 min flexibility on timing). Questions: total debt; urgent topics;
   family situation; garnishable income; types of creditors; need for protective measures
7. Call is recorded; at the end the lawyer speaks date and file number, then — without the
   client — internal instructions after the code phrase
   "Anweisung an den Bearbeiter" ("instruction to the clerk")
8. Automatic post-call message: client-friendly summary (internal part removed),
   booking link for the closing call, friendly cover text
9. Closing call (on site preferred — contract signed immediately; or online with e-signature).
   Consultation protocol: number and type of creditors; total debt; income (current and
   possible increases); assets; expenses; family framework; can the debtor solve it from his
   own income?; goals and wishes matched against the calculation; prognosis; what would have
   to change; explanation of the options, timelines and what to expect
10. Recorded and summarised the same way
11. Three outcomes: close now → onboarding; no close / close later → stays active, monthly follow-up
12. Closing e-mail (all three outcomes): reachability, a dedicated client WhatsApp number,
    file number, client created in the system
13. **Final go = receipt of the first payment.** Only then does active processing start.
```

### Onboarding after closing

- File number assigned; contract and power of attorney signed together; client status "active".
- Documents arrive by four routes: physical folder (scanned in), WhatsApp photos (quality often
  insufficient — a photo guide for clients was planned), post, or **cloud upload** (preferred;
  the client gets a link to an upload landing zone).
- **Automatic creditor list:** documents land in the landing zone → AI reads every letter →
  creditor list is generated → sent to the client for confirmation → client confirms →
  active processing starts. This ends the lead process; handover to the settlement process
  ([07](07-settlement-process.md)).

### Follow-up for non-closers

- Status "warm": an automatic **monthly** follow-up by WhatsApp or e-mail. Tone: friendly,
  no sales pressure — *"I'm still here when you're ready."*
- **After 6 months without reaction: status "inactive"** automatically; no more automatic
  follow-up; manual reactivation any time.

### Lead states

`new → warm → first call → close → active / inactive` (v2); the briefing lists
`new / warm / active / inactive / closed`. The later sales-CRM pipeline had 12 stages.

## Minimal data model for leads ("Slim" principle)

The original no-code setup had grown to 3 bases, 12+ tables and 150+ fields with AI fields,
rollups and lookups. The counter-proposal: **one base, one leads table, one log — 10 minutes
of onboarding. Everything else is done by the workflow engine. No tool talks to the
database directly; everything goes through the workflow engine.**

Leads (14 fields): file number, first name, last name, phone, e-mail, channel, status, estimated
debt, created at, **last reaction** (drives the 6-month rule), assignee, documents, notes,
link to calls.

Calls (8 fields): lead, type (first / closing / follow-up), date, raw transcript, client summary,
internal instructions, status (`raw → processed → sent`), created at.

Explicitly **not** stored: a communication log of every message (WhatsApp and mail are the log
already), AI sentiment analysis ("a gimmick for < 10 leads"), "next best step" AI, company,
deal, task, contract or source tables (a lead *is* the deal; a contract is an attachment;
five channels are a select field).

## Self-registration

A later workflow let the lawyer tick a box on a lead; the automation then created the debtor in
the database (a trigger generated the file number), built a pre-filled online form link and
mailed it to the client (or produced a WhatsApp link if no e-mail existed). The client filled
in his own master data (about 30 fields: names, former names, birth date and place, marital
status, profession, phones, e-mail, former self-employment, …); a second workflow synced the
answers back into the database and notified an admin.

Lessons recorded: prefer native workflow nodes over raw HTTP calls; conditional nodes are
unreliable with nested objects — use code nodes; the no-code database trigger needs a
timestamp field; non-public Postgres schemas are reached via a `Content-Profile` header.

## WhatsApp bot (designed, not built)

- WhatsApp Cloud API (direct, no reseller) → webhook into the workflow engine.
- Look up the phone number: unknown → create lead, status "Lead", an LLM agent sends a
  first-contact reply and performs a **first qualification** (qualification score).
- Distinguish new leads from existing clients; accept documents (stored in object storage,
  not as CRM attachments); trigger the payment flow after contract signature.
- Status chain: Lead → Qualified → Contract Sent → Contract Signed → Payment Received → Converted.
- Blocker at the time: WhatsApp Business verification by Meta was pending; all flows were built
  so WhatsApp could be added later, with e-mail as the fallback.

## Evolution of the tool stack

| Period | Lead system | Notes |
|---|---|---|
| early 2026 | no-code database + workflow engine + Google Calendar + Gmail | lead-ad and website-form workflows live; welcome mail with SOS PDF |
| April 2026 | dedicated sales CRM (12-stage pipeline, 14 custom fields, 7 e-mail templates, smart views) + scheduling tool + a WhatsApp-to-CRM bridge + e-signature service | the slim no-code design was superseded |

An external advisory note in the archive argued the same split: a sales CRM is a strong
**intake and filtering engine** for many non-converting first contacts (track qualified-lead
rate, conversion per source, time to qualification, rejection reasons), but must never be the
case-management core. Qualified leads become structured cases in Postgres; documents flow only
once a case is real. See [10](10-architecture.md).
