# 07 — Out-of-court settlement process

*Sources: the practising co-founder's process papers (Excel-tool requirements, letter
templates, requirement notes), the condensed process spec (March 2026), and the feature
specs for PDF generation, dispatch and escalation (March 2026).*

The out-of-court settlement attempt (German: *außergerichtlicher Einigungsversuch*, AEV) is
the core process. It is standardised and fits about **90 % of cases**. It is also the legal
precondition for consumer insolvency: § 305 InsO requires a failed attempt, certified by a
lawyer or an approved counselling office.

## Step 1 — Data entry

Capture client data; import or enter creditors and claims; export as an **offer matrix**.

The offer matrix (from the Excel tool the practice used before) holds per claim:
- facts: age, enforcement title yes/no, amount, principal, creditor, representative, particularities;
- offer: amount, quota (suggestions 40 % / 60 %), lump sum or instalments, instalment amount,
  number of instalments, acceptance deadline, payment date;
- negotiation status and result (see below).

## Step 2 — Exploration (first letter)

Two options:
- **Standard first letter:** request the claim statement, grant authority to receive mail,
  ask to refrain from enforcement.
- **"Quick-shot" offer:** send an offer by e-mail immediately, without a prior request.

Content of the standard first letter (in the counselling office's name, mail-merge fields
for salutation, creditor, address, file numbers, debtor name, claim origin and deadline):
1. the client has turned to the counselling office;
2. out-of-court settlement attempt under § 305 InsO;
3. request for contracts, current claim statement, title, assignment declaration;
4. request for a summonable address for possible court proceedings;
5. request to refrain from enforcement;
6. statute of limitations raised as a precaution.

Follow-up variants: "receipt confirmed, not all creditors have reported yet, please be
patient" and "friendly reminder under § 305 InsO, duty to cooperate".

Possible reactions:
1. claim statement arrives → a **human** checks it (time-barred? costs too high?);
2. no reply → escalation;
3. incomplete / ignoring the limitation period → follow up.

### Escalation chain

```
Day 0    first letter sent (e-mail + post)          deadline 21 days
Day 21   deadline — reply received? yes → step 3
Day 35   reminder 1 (friendly)                       deadline 14 days
Day 56   reminder 2 (unfriendly)                     deadline 14 days
Day 70   the responsible adviser decides manually (dashboard alert)
```

(The process paper states the same chain relative to deadlines: +2 weeks after the deadline
friendly reminder, +3 weeks after that unfriendly reminder, +2 weeks then the adviser decides.
The lawyer's CRM notes ask for an automatic reminder after 35 days.)

## Step 3 — Offer

- One offer per creditor **or** one quota for all; deadline 4 weeks.
- Content: settlement amount and quota (suggested 40–60 %); lump sum, instalments or a combination;
  instalment amount ↔ number of instalments linked and calculated automatically;
  payment start, payment end, acceptance deadline.
- Offer escalation in the CRM notes: offer 1 → +4 weeks → offer 2 → +4 weeks → offer 3.
- Settlement letter structure: (1) starting situation — number of creditors, total debt,
  this claim, garnishable income; (2) personal and economic situation of the debtor;
  (3) the offer — amount, quota, payment method, due date; (4) annex with further
  conditions — waiver of enforcement, termination, return of title, deletion of the
  credit-bureau entry.

**Negotiation status per claim:** claim statement received · rejection (red) · counter-offer (red) ·
consent (green) · time-barred / waived (green) · no reply (yellow) · done.

The Excel-tool requirements use a slightly different traffic light for results: consent (green),
rejection (red), no reply (yellow), counter-offer (yellow), waiting (grey), failed (blue).

**Claim priority:** 1 existential · 2 priority · 3 normal (default) · 4 low · 5 ignore (not part of the plan).

## Step 4 — After agreement

The debtor pays the instalments to the creditors. Alternatively a creditor is "held off"
(payment date postponed) while the overall settlement is not yet complete. Special case: the
debtor no longer wants to pay → the mandate ends, or insolvency.

## Step 5 — After payment

Request a settlement confirmation. The creditor has 2 months to return the title, delete the
credit-bureau entry and confirm settlement. 1 month after the last payment: friendly reminder;
3 months after: unfriendly reminder.

## If the plan fails

A plan counts as failed when more than 50 % of creditors by head or by amount reject it
(see [05](05-data-model.md)). The creditor-response table tracks 6- and 10-week deadlines and
two reminders per creditor. Then: § 305 certificate → consumer (or, for the self-employed,
regular) insolvency application.

## Letter types and dispatch

| Letter | When | Deadline |
|---|---|---|
| First letter | after the mandate | 21 days |
| Reminder 1 (friendly) | +2 weeks after deadline | 14 days |
| Reminder 2 (unfriendly) | +3 weeks after response deadline | 14 days |
| Settlement letter | after claim statement arrived and was checked | 4 weeks |
| Request settlement confirmation | after last payment | 2 months |

The digital version of the Excel tool was specified as: instalment amount ↔ number linked;
a credit field (savings / special payments); priority 1–5 per claim; settlement history
("attempt 1", "attempt 2"); client sheet auto-filling the letters; letter management
(first letter, quick-shot, settlement, follow-up); dispatch by e-mail (PDF) or postal letter;
automatic PDF filing in the client folder; deadline and task overview with calendar.

How the dispatch was to be automated: [09](09-automation.md).
