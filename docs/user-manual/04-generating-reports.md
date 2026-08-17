# Chapter 4 — Generating Reports

## What is a due diligence report?

A due diligence report is a comprehensive PDF document covering everything a buyer
or lender needs to know about a property. It includes:

1. **Cover Page** — property photo, address, report date, risk badge
2. **Executive Summary** — key findings and recommendation (AI-generated)
3. **Property Overview** — all property fields and metadata
4. **Risk Analysis** — detailed risk breakdown for all 6 categories
5. **Comparable Properties** — nearby similar properties and price comparison
6. **Financial Analysis** — market value, valuation methods, price-per-sqft
7. **Recommendations** — prioritised list of actions to reduce risk
8. **Appendix** — raw data sources and methodology notes

---

## Generating a new report

1. Open the property's detail page.
2. Click **Generate Report**.
3. You are taken to `/properties/[id]/generate-report`.
4. Review the pre-filled details (title, included sections).
5. Click **Generate**.

The report generation is **asynchronous** — it runs in the background while you continue
using the platform. You can monitor progress:
- A progress bar appears on the Generate Report page.
- A notification appears in the bell icon when the report is ready.

Typical generation time: 10–30 seconds depending on data provider response times.

---

## Monitoring report status

Go to **Reports** in the sidebar (`/reports`) to see all your reports.

| Status | Meaning |
|--------|---------|
| PENDING | Queued, not yet started |
| GENERATING | In progress |
| COMPLETED | Ready to view and download |
| FAILED | Generation failed — try regenerating |

---

## Viewing a completed report

1. Go to **Reports** and click on a completed report card.
2. The report viewer opens showing all sections inline.
3. Use the section navigation to jump to specific parts.

---

## AI executive summary

Each completed report includes an **AI Executive Summary** at the top:

- **Verdict** — PROCEED / PROCEED WITH CAUTION / DO NOT PROCEED
- **Key findings** — 3–5 bullet points highlighting the most important risks and positives
- **Recommended next steps** — specific actions to take before completing the transaction

To regenerate the AI summary (e.g. if the risk data has changed):
1. Open the report.
2. Click **Regenerate Summary** (↻ icon next to the summary).

---

## Downloading a report

From the report viewer:
- Click **Download PDF** to get the full PDF.
- Click **Download Excel** to get a structured Excel workbook with all data.

From the Reports list page:
- Hover over any completed report card and click the download icon.
- You can also bulk-download multiple reports (see [Chapter 6 — Exporting Data](06-exporting-data.md)).

---

## Regenerating a report

If property data has changed significantly:
1. Open the report in the viewer.
2. Click **Regenerate**.
3. A new version is created. The old version is preserved in report history.

---

## Report history

Click **Report History** in the sidebar (`/dashboard/report-history`) to see every
version of every report. You can:
- Download any past version
- Share a report via email
- Archive reports you no longer need

---

## Sharing a report

1. Open the report viewer.
2. Click **Share** (📤 icon).
3. Enter the recipient's email address.
4. Click **Send** — the recipient receives the report PDF by email.

Reports can also be shared via a read-only public link (ask your Admin to enable this).

---

## Report limits by plan

| Plan | Reports per month |
|------|-----------------|
| FREE | 3 |
| PRO | 50 |
| BUSINESS | Unlimited |
| ENTERPRISE | Unlimited |

If you reach your limit, upgrade your plan at `/dashboard/billing`.
