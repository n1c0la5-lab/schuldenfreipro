# 03 — Legal model: "The platform may calculate, but not think"

*Sources: concept papers (January 2026), compliance summary (March 2026). This is the
founders' working legal reasoning, not legal advice. The pitch described the model as
"regulatorily reviewed"; internally, a formal inquiry to the regional bar association
about compliance with the Legal Services Act was drafted, and its answer was still listed
as outstanding in March 2026.*

## Why this matters

In Germany, out-of-court legal services are reserved to lawyers and a few licensed bodies
by the **Legal Services Act (Rechtsdienstleistungsgesetz, RDG)**. A platform that tells a
debtor "you are insolvent" or "offer 40 %" provides a legal service. Compliance with the
RDG was therefore called "an elementary precondition for the platform's success".

## The guiding principle

> **Everything that calculates, collects, displays or neutrally describes is allowed.
> Everything that assesses, recommends, steers strategically or estimates chances of
> success is forbidden.**
>
> Or shorter: **the platform may calculate — but not think. Only the debtor himself or the
> lawyer may think.**

## The matrix

| Still allowed (maximum use) | Not allowed — RDG violation, lawyer only |
|---|---|
| Capture all debts, creditors, amounts, due dates | Legal classification of individual claims (justified, time-barred, contestable) |
| Arithmetical finding of a financial shortfall | Finding "you are insolvent / ripe for insolvency" |
| Calculate a quota arithmetically ("if amount X is available, that is Y %") | Assess or recommend a quota ("40 % is realistic / sensible") |
| Table distributing a freely entered amount across all creditors | Producing a "settlement plan", "debt settlement plan" or "offer plan" |
| Neutral title: "arithmetical distribution when paying X EUR" | Titles like "settlement offer", "agreement plan", "starting quota" |
| Show several scenarios (e.g. 20 % / 30 % / 40 %) without ranking | Highlighting a scenario as "better", "recommended", "promising" |
| General information: "settlements are an out-of-court instrument"; explaining objections and defences | Instructions: "how to negotiate settlements successfully" |
| General note: "approaches differ by case" | Strategy hint: "start with a low quota and increase" |
| Free-text field for the user's own letters | Model texts or wording suggestions for settlement offers |
| Technical transmission of a text the user wrote himself | Co-drafting, optimising or assessing the letter |
| AI for spelling/style correction **without changing content** | AI that formulates, adds or strategically adapts texts |
| AI explains terms in general ("what is a settlement?") | AI decides whether a settlement makes sense |
| Download of a neutral calculation sheet | Automatically sending the plan to creditors |
| Status display: "reply received / no reply" | Assessing the reply ("rejection is bad", "acceptance is good") |
| General information about insolvency procedures | "In your case insolvency is the right way" |
| Note: "legal assessment only by a lawyer" | Hidden pre-decision through tool or text |
| Forwarding to a lawyer as an option | Pressure / steering ("file for insolvency now") |

## Platform services and their limits

**Own e-mail address for the debtor** (local part e.g. `firstname.lastname` on the platform's mail domain): a purely
technical communication aid, not a legal service — provided the debtor always remains
recognisable as the sender, the platform does not appear as representative, the user is
told he acts on his own responsibility, and the design stays neutral (no law-firm look).

**Internal reference number:** allowed if clearly labelled as a process/reference number
and not suggesting an official or legal character.

**Mail & scan service:** the debtor may have his post sent to a central platform address
where it is received and digitised — allowed as long as the debtor legally remains the
recipient, a postal power of attorney exists, the activity is purely technical-organisational,
and there is **no** content processing, assessment, reply or deadline assessment by the platform.

**Deadlines and content** may only be displayed technically, without legal evaluation or
recommendations for action. Forwarding of messages the debtor wrote himself is fine if the
platform is only the transmission medium.

**AI reading of incoming mail** is allowed if limited to the technical capture of objective
data (creditor name, amounts, file numbers, dates). The AI may only *propose* data; legal
assessment, selection or decision is excluded. **A human in the loop is mandatory.**

## Two-phase contract structure

From the draft terms and conditions:

| Phase | Nature | Content |
|---|---|---|
| Phase 1 — technical service (platform) | no legal advice | manual data entry and OCR upload; automated requests for claim statements to creditors; c/o postal address and individual e-mail; mail & scan via an external provider; digital file management. **No legal assessment, no recommendation for action.** Registration from age 18, legally competent. |
| Phase 2 — legal advice (lawyer) | separate mandate | mandatory initial consultation (included in the subscription); independent mandate between user and lawyer; the lawyer checks and releases every document individually; the platform is liable only for the technical service. |

## Legal relationships

| Relationship | Type | Price (as planned) |
|---|---|---|
| Platform ↔ debtor | technical service | 600 EUR (the bar-association draft says "per 10 months") |
| Lawyer ↔ debtor | mandate | initial consultation paid via the platform |
| Platform ↔ lawyer | membership fee + commission | 100–500 EUR/month + 100–500 EUR per mandate |

## Other compliance items the project listed

- GDPR: privacy policy and terms before launch; record of processing activities (Art. 30);
  data-processing agreements with every provider (mail scan, database, …); encryption of all
  personal data; deletion and retention periods; **EU hosting mandatory**; full audit trail.
- Liability: platform liable for technical availability and data security; lawyers for their
  advice; clear separation in the terms; business liability insurance.
- Contracts in preparation: terms and conditions, terms of use, partner-lawyer contract,
  privacy policy, data-processing agreement, white-label licence agreement.
- Professional-law compliance for debt counselling.
- Planned legal form: a limited company (GmbH) with the founders holding the majority.

## Regulatory risk (from the pitch)

Risk: a change in how the RDG is interpreted. Mitigation: strict separation of technology
and legal advice, regular legal review, a flexible model.
