# 06 — Debt calculator ("Schuldenrechner")

*Sources: the practising co-founder's calculator logic papers (four versions, early 2026),
the condensed logic spec (March 2026) and the implementation in `packages/engine` of this
repository (engine "v3", 19 unit tests).*

The calculator is the public entry point (Tier 0, route `/rechner`): anonymous, no
registration. It compares the three ways out of debt and ends with a call to action for a
free first consultation.

## Inputs

| Symbol | Meaning |
|---|---|
| S | total debt (EUR) |
| E | monthly net income |
| U | number of persons the debtor owes maintenance to (0–5) |
| L | monthly living costs |
| Fz | voluntary monthly payment the debtor is willing to make |

## Derived values

```
Fb = E − L                                  free amount (may be negative)
E* = floor(E / 10) × 10                     income rounded down to 10 EUR
F(U) = 1,555.00 + min(U,1) × 585.23 + max(0, min(U,5) − 1) × 326.04
                                            garnishment exemption (§ 850c ZPO, valid from 1 July 2025)
q(U) = 0.70 / 0.50 / 0.40 / 0.30 / 0.20 / 0.10   for U = 0 … 5
P  = max(0, min(E*, 4,766.99) − F(U)) × q(U) + max(0, E − 4,766.99)
                                            garnishable amount
```

The engine notes that this closed formula reproduces the official garnishment table
(164 income brackets × 0–5 dependants) exactly, so no lookup file is needed. The values
must be updated every 1 July (`packages/engine/src/config.ts`).

**Instalment priority:** R = Fz if Fz > 0; else Fb if Fb > 0; else P if P > 0; else 0.

## Path 1 — Full repayment

Statutory default interest of 6 % p.a. without compound interest; payments go to interest
first, then principal (§ 367 BGB):

```
each month:  Z(t) = S(t) × 0.005;  T(t) = R − Z(t);  S(t+1) = S(t) − T(t);  stop when S ≤ 0
```

If R ≤ Z(0) the debt is never repaid; path 1 is out.

## Path 2 — Settlement

Settlement amount = S × 0.50, interest-free, monthly instalments: `t = ceil(S × 0.5 / R)`.
Maximum term: 36 months if P is the highest available rate, 48 months if Fz or Fb is higher;
beyond that, settlement is out. The 50 % is an average; the disclaimer says practice ranges
from 40 % to 80 %.

## Path 3 — Consumer insolvency

Always exactly 36 months; total payment = P × 36.

## Indebtedness level and score

| S / E (months of income) | Level |
|---|---|
| ≤ 12 | low (under one year's income) |
| 12–36 | medium |
| 36–72 | high |
| > 72 | very high (over six years' income) |

`Score = P / S × 100` → 0–1 % critical, 1–3 % weak, 3–5 % medium, > 5 % strong.

## Decision tree (17 rules, first match wins)

As implemented in `berechneEmpfehlung()`:

1. S ≤ 2,500 → repay.
2. Instalment does not even cover the first month's interest → insolvency.
3. Expenses exceed income, no voluntary payment, nothing garnishable → insolvency.
4. Nothing above the exemption and S > 5,000 → insolvency.
5. Repayable within 18 months and S ≤ 8,000 (unless P = 0 and S > 4,000) → repay.
6. Only P available and 36 × P < 50 % of S → insolvency (cheaper than settlement).
7. Negative free amount, voluntary payment only, S > 10,000, settlement > 36 months → insolvency.
8. S > 20,000, voluntary payment > P, settlement within 36 months → settle.
9. S > 20,000, voluntary payment > P, settlement > 36 months → insolvency.
10. Repayment from P alone > 96 months and no voluntary payment → insolvency.
11. Full repayment > 120 months → insolvency.
12. Neither repayment nor settlement possible within 60 months → insolvency.
13. Settlement cheaper than insolvency and within maximum term → settle.
14. No instalment and S ≤ 5,000 → settle (lump sum or deferral).
15. Negative free amount, voluntary payment, S ≤ 10,000, settlement ≤ 36 months → settle.
16. Repayment possible within 10 years → repay.
17. Otherwise → insolvency.

## Output

For each path: duration in months, total payment, monthly burden (R / E in %); if both Fz
and Fb exist, both variants are calculated. Savings compared with full repayment.

Disclaimer shown to users: first orientation, no legal advice; the 50 % quota is an average
(practice 40–80 %); not considered: number and type of creditors, their willingness to
negotiate, age of claims, running enforcement, professional particularities. CTA: book a
free first consultation.

## An unresolved tension

The calculator highlights one path as "recommended" with a reason. The project's own legal
matrix ([03](03-legal-model-rdg.md)) lists "highlighting a scenario as better / recommended"
and "in your case insolvency is the right way" as **forbidden for the platform**. The
sources do not resolve this; the persona notes even asked for the result to read as a
recommendation. Anyone
reusing it in a non-lawyer product should switch the output to a neutral side-by-side
comparison.
