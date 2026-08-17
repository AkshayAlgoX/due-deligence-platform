# Chapter 6 — Exporting Data

## Export formats

The platform supports two export formats:

| Format | Use case |
|--------|---------|
| **PDF** | Share with clients, lawyers, or lenders; print-ready |
| **Excel (.xlsx)** | Further analysis in spreadsheets; structured tabular data |

---

## Exporting a single report

### From the report viewer

1. Go to **Reports** and click on a completed report.
2. In the report toolbar, click:
   - **Download PDF** — generates and downloads the full PDF report
   - **Download Excel** — generates and downloads the Excel workbook

### File naming

Files are named automatically:
```
DueDiligence_Report_<title>_v<version>_<date>.pdf
DueDiligence_Report_<title>_v<version>_<date>.xlsx
```

---

## Exporting a property snapshot

For a quick one-page summary without generating a full report:

1. Open the property detail page.
2. Click the **Export** button (↓ icon) in the top-right.
3. Select **PDF Snapshot** or **Excel Snapshot**.

Property snapshots include: property details, current risk score, and labels.
They do not include comparables, financial analysis, or AI summary.

---

## Bulk export (multiple reports)

To download several reports at once as a ZIP file:

1. Go to **Reports** (`/reports`).
2. Check the boxes next to the reports you want.
3. Click **Bulk Export** (appears in the toolbar when any report is selected).
4. Select **PDF** or **Excel**.
5. Click **Download ZIP** — all selected reports are packaged into a single `.zip` file.

---

## Export history

Every export you generate is recorded in **Export History** (`/reports/export-history`).

The history shows:
- File name and format
- File size
- Date generated
- Download count

To **re-download** a past export:
1. Find it in Export History.
2. Click the **Download** icon.

> **Note:** If the original report was deleted after the export was generated,
> the file may no longer be available (shown as "Expired"). Generate a new export instead.

---

## Admin analytics export

Administrators can export the entire admin analytics dashboard:

1. Go to **Admin Dashboard** (requires ADMIN role).
2. Click the **Export** dropdown.
3. Select:
   - **Excel (.xlsx)** — 4 sheets: Summary, Risk Distribution, Reports Trend, Top Cities
   - **CSV** — same data as comma-separated text
   - **PDF** — formatted analytics report

The export respects the selected **time period** (7d / 30d / 90d) and supports
**11 languages** — the language is set automatically based on your UI language preference.

---

## Export in other languages

Report PDFs and analytics exports support all 11 platform languages.
Switch your UI language before exporting — the exported PDF will use that language's translations.

Supported languages for export: English, Hindi, Bengali, Gujarati, Kannada, Malayalam,
Marathi, Punjabi, Tamil, Telugu, Urdu.

---

## Audit log export (Admin only)

Admins can export the audit log for compliance purposes:

1. Go to **Admin → Audit Logs**.
2. Apply any filters (date range, action type, user).
3. Click **Export** and select CSV or Excel.
