# 02 — Product

*Sources: the concept papers (two versions, January 2026), the condensed concept summary
(March 2026) and the later schema/product decision (April 2026).*

## Positioning

SchuldenPRO is a **technical platform** for capturing, structuring, organising and carrying
out a debtor's affairs. The platform itself provides **no legal services**. It offers only
technical, organisational and arithmetical functions. Every legally relevant activity —
assessment, advice, drafting, representation — is done by admitted lawyers in separate
mandates. In the words of the concept: the client is delivered to the lawyer *"on a silver
platter"*, because the client has already captured all data himself.

**Core promise:** complete debt settlement for **899 EUR instead of 3,500 EUR+**, including
legal support and the insolvency application. The base fee of 600 EUR for using the
platform is justified by the savings it enables (reduced claims, avoided enforcement costs,
faster discharge).

## What "debt settlement" means here

1. Capture all debts, creditors, interest, fees and running proceedings.
2. **Stop all payments on existing debts** (existential debts such as rent arrears excepted).
   This is counter-intuitive but decisive: only now does the debtor control his full income.
3. Optimise income and expenses; realise assets where appropriate.
4. Treat **all creditors at once** with one overall plan instead of isolated deals.
5. Negotiate realistic settlement offers — in practice often accepted from about **40 %** of
   the original claim.
6. If no out-of-court settlement is reached, consumer insolvency remains as the safe route
   to a full discharge.

Credibility of the advising party is what makes creditors accept settlements: they only
agree when they trust that the debtor's situation is presented correctly and the offer is
realistic. Debt settlement is therefore primarily communicative and strategic work.

## The four tiers

All communication runs through the platform. Depending on the tier it is sent in the
debtor's name or in the name of the mandated lawyer. Lawyers use the platform with their
own access.

### Tier 0 — Free analysis (0 EUR)

- The user captures debts, creditors, amounts, due dates, income and expenses himself.
- The platform determines, by fixed mathematical thresholds and **without legal
  assessment**, the total liabilities, the monthly burden and whether there is arithmetical
  over-indebtedness.
- Three paths are shown side by side with pros and cons: **repay**, **settle**, **insolvency**
  (see [06](06-debt-calculator.md)).
- General information on rights and options; optional free consultation call.
- Purpose: self-information and preparation — and the **lead funnel**: it produces a
  well-prepared lead for the first call.
- No communication with creditors in this tier.

### Tier 1 — Do it yourself (600 EUR = 50 EUR/month × 12)

The entry product, the core product for **low debts**.

- Full platform access; mail and scan service; document management; calculation tools;
  overviews; information and learning content.
- **Initial legal consultation included** in the subscription. After the cancellation period
  the client books a partner lawyer. In urgent cases (detected by the system) the
  consultation happens immediately. The lawyer gives a legal assessment (e.g. statute of
  limitations) and discusses the strategy.
- Model letters and wording aids. Apart from the initial letter, the platform writes no
  letters itself, assesses no claims, gives no legal recommendation.
- The debtor communicates with creditors himself, through the portal, in his own name.
- If he has properly conducted the settlement attempt himself, he can file for insolvency:
  199–399 EUR extra depending on scope. The § 305 InsO certificate (proof of a failed
  out-of-court attempt) is issued by a lawyer or an approved counselling office.
- The concept notes it should be checked whether social welfare could cover the fee; in the
  founders' experience "every debtor can manage 50 EUR a month for 12 months".

### Tier 2 — Economy (1,200 EUR)

The **core product**.

- Everything from Tier 1.
- An **ongoing lawyer mandate**: the partner lawyer accompanies the out-of-court process,
  checks the approach, gives legal feedback, supervises the settlement negotiations,
  pre-formulates or adapts letters and explains legal background and risks.
- The client stays operationally active, but acts under the lawyer's guidance and control.
- If the out-of-court settlement fails, insolvency is already part of the mandate: the lawyer
  prepares the application including the § 305 InsO certificate.

### Tier 3 — Premium (individual price)

- The partner lawyer takes over complete counselling and representation.
- All communication via the platform is sent in the lawyer's name: correspondence,
  settlement negotiations, letters, legal options, insolvency proceedings incl. all applications.
- The client is informed but not operationally involved; the platform is back-end
  infrastructure for the lawyer.

> Pricing inconsistencies in the sources: the subscription is described as 600 EUR over
> 12 months (50 EUR/month) in the concept, as "10 × 60 EUR" in the later product decision,
> and as "60 EUR per month" in the case study. "899 EUR complete" is the headline price.

## What happens after signing

1. **Immediate measure:** stop all payments on existing debts.
2. **First letter to all creditors** via the platform:
   - all further correspondence runs through SchuldenPRO;
   - request for a current statement of the claim (principal, interest, costs, fees) and a
     copy of any enforcement title;
   - **authority to receive mail** — explicitly *excluding* dunning orders, enforcement orders
     and court documents;
   - request to refrain from costly measures and enforcement until clarified;
   - reply deadline: 21 days (the letter says "three weeks").
3. The debtor gets **his own e-mail address on the platform's mail domain**, with the local
   part built as `<file-number>.<surname>`, and a c/o postal address.
4. His post goes to the platform's central address (**mail & scan service**) and is digitised.
5. After the cancellation period: initial consultation with a partner lawyer.
6. **Exploration phase (~6 months):** all claims are captured and checked. The later product
   decision describes this as a 3-month quiet period after the lawyer's first letter during
   which the lawyer builds the plan.
7. Negotiate settlement offers (typically from 40 %).

A full example of the first letter (German original wording, in the debtor's name):

> *Subject: Future correspondence / statement of claim / [creditor's file number]*
> I am currently seeking an orderly debt settlement. To get a complete overview of my
> liabilities, please send me a current statement of claim showing principal, interest,
> costs and fees. If a title has been issued against me, please send a copy. Please reply
> within three weeks. Please conduct all future correspondence exclusively via:
> [Name] c/o [platform], [file-number e-mail], [platform postal address]. I hereby grant
> authority to receive all correspondence in this matter, excluding dunning orders,
> enforcement orders and court documents. As I seek an amicable solution, please refrain
> from costly and enforcement measures until clarification.

## Platform features (as conceived)

| Component | Function |
|---|---|
| Website | informative, low-threshold entry into the free analysis; blog with current topics |
| Web app | dashboard; the **"counselling cross"** (four quadrants: debts, assets, income, expenses — plus garnishment protection, goals, strategy, notes, deadlines, tasks, procedure status); capture of all four areas |
| Mobile app | high-speed document scanning (camera + OCR) of invoices, dunning letters, bank statements, official letters — connected to the web app |
| Backend | Supabase (Postgres with row-level security, real-time, auth) |
| AI/OCR | reads incoming letters automatically and transfers the data to the dashboard |
| Document generation | consumer-insolvency application incl. annexes; application for a P-account certificate (§ 850k ZPO); garnishment-protection applications; formal creditor letters (deferral, instalments, settlement offers, claim information) — all pre-filled from templates that are updated regularly |
| Lawyer access | own access; receives a complete digital file package (plausibility-checked financial overview, pre-filled applications and letters, change log with source references); only checks, individualises and signs |
| Cross-cutting | real-time sync between web, mobile and lawyer; versioning and audit log for every change; end-to-end encryption of sensitive fields; need-to-know access control |

The concept estimated a **75–90 % reduction of administrative effort per standard case**,
and a second concept note "70–90 % less data entry".

### Requirements from the legal practice (the lawyer's wish list)

Collected from the practising co-founder's requirement notes:

- **Clients:** master-data form with multi-user access; online self-entry by the client;
  client's goal, strategy, internal comment; contract, mandate fees, payment terms;
  **processing stop when the client is in arrears**; confidential details visible only to
  lawyers; assets with restricted visibility (not for clerks).
- **Creditor claims:** one central creditor database plus creditor representatives (merge
  both records); input masks for creditor + file number, representative + file number,
  claim details; search across everything (file numbers, creditor, collection agency).
- **Case overview:** the counselling cross (see above).
- **Out-of-court settlement:** disputed amounts can be reduced; offer per creditor *or* one
  quota for all; system suggestion 40 %; offer escalation (offer 1 → +4 weeks → offer 2 →
  +4 weeks → offer 3); automatic reminder to creditors after 35 days; combination of
  lump sum and instalments.
- **Payment plan:** transmitted to creditors after agreement.
- **Client communication:** WhatsApp Business (with data stored), e-mail, phone; document
  upload by the client (proof of income, children's birth certificates, medical certificates,
  job-centre notices, judgements); automatic notices ("first letter sent", "offer before
  dispatch"); offer to the creditor automatically 5 working days after announcing it to the client.

## Product decision of April 2026 (as built in the schema)

The later decision reframed the product as **"one product with a lawyer gate"**, not "one
installation per law firm":

1. **Self-service phase (free):** the lead registers, maintains master data, uses the
   calculator, sees his own counselling cross, prepares the settlement. **Cannot send
   letters to creditors.**
2. **Lawyer gate (payment point):** the lead chooses a lawyer (first one, later a
   marketplace) and pays. The lead becomes a client with an assigned lawyer.
3. **Lawyer phase (paid):** the lawyer sends the first letters; the plan follows; creditor
   responses; if needed, insolvency application.

Leads who never pay are not auto-expired — they invested their own work; data stays until
they delete it (marketing follow-up requires a separate consent). Self-service letter
downloads for unpaid leads were explicitly postponed ("only if very simple and without
legal risk").
