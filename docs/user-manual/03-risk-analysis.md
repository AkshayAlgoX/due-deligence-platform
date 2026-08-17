# Chapter 3 — Risk Analysis

## What is the risk score?

The risk score is a number from **0 to 100** where a higher score means higher risk.
It is computed across 6 categories using a rule-based engine — no black-box AI.

| Risk Level | Score range | Badge colour |
|------------|-------------|--------------|
| LOW | 0–25 | Green |
| MEDIUM | 26–50 | Yellow |
| HIGH | 51–75 | Orange |
| CRITICAL | 76–100 | Red |

---

## The 6 risk categories

| Category | Weight | What it measures |
|----------|--------|-----------------|
| Flood | 25% | FEMA flood zone classification |
| Legal | 20% | Encumbrances, litigation, title clarity |
| Tax | 15% | Outstanding taxes, arrears, dues |
| Zoning | 15% | Zoning classification, variance risks |
| Environmental | 15% | Hazardous materials, contamination history |
| Market | 10% | Price volatility, days on market, demand index |

The **overall score** is the weighted average of all 6 category scores.

---

## Viewing the risk analysis

1. Open a property's detail page.
2. Click **View Risk Analysis**.
3. You are taken to `/properties/[id]/risk-analysis`.

The risk analysis page shows:

- **Risk Gauge** — circular dial with the overall score and level
- **Radar Chart** — hexagonal chart comparing all 6 category scores at a glance
- **Risk Factor Cards** — one card per category, each showing:
  - Category score
  - Risk level badge
  - **Explanation** — what data was used and why the score is this value
  - **Recommendation** — concrete action to reduce risk
  - **Data Source** — which provider supplied the data

---

## Recalculating the risk score

If you have updated the property data or want fresh data from providers:

1. On the Risk Analysis page, click **Recalculate**.
2. A spinner appears while the calculation runs (usually 2–5 seconds).
3. The previous assessment is saved to history; the new score becomes the current one.

---

## Risk score history

The platform keeps every previous risk calculation.

1. On the Risk Analysis page, scroll to **Risk History**.
2. Each past assessment shows the date, score, level, and delta (change from the previous score).
3. Use this to track whether risk is improving or worsening over time.

---

## Understanding the explainability panel

Click **How is this score calculated?** (the ℹ️ button) to open the explainability panel.
It shows:

- The formula: overall score = Σ (category score × category weight)
- Category weights as a percentage bar chart
- Threshold boundaries (score ranges for each level)
- A note on **data uncertainty**: if a data provider was unavailable, a conservative
  penalty is applied rather than assuming zero risk.

---

## Risk score on property cards

Every property card in the search results and dashboard shows a small risk badge
(LOW / MEDIUM / HIGH / CRITICAL). This updates whenever the risk assessment is recalculated.
