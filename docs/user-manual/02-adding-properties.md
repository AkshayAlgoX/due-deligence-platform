# Chapter 2 — Adding Properties

## Adding your first property

1. Click **Properties** in the sidebar, then click **Add Property** (or the **+** button).
2. Fill in the property details:

   | Field | Required? | Notes |
   |-------|-----------|-------|
   | Address | ✅ | Street address |
   | City | ✅ | e.g. Chennai, Mumbai |
   | State | | e.g. Tamil Nadu |
   | ZIP Code | | Postal / PIN code |
   | Property Type | | Residential, Commercial, Industrial, Land, etc. |
   | Area (sq ft) | | Total built-up area |
   | Market Value (₹) | | Current estimated market value |
   | Year Built | | Construction year |
   | Bedrooms / Bathrooms | | For residential properties |
   | Stories | | Number of floors |
   | Condition | | Excellent / Good / Fair / Poor |
   | Image URL | | Link to a property photo |

3. Click **Save Property**.

The property is saved immediately. In the background, the platform:
- Geocodes the address to latitude/longitude (used for the map view)
- Queues it for automatic risk scoring (first access triggers computation)

---

## Viewing your properties

- Go to **Properties** in the sidebar to see all your properties in a card grid.
- Use the **search bar** at the top to filter by address, city, state, zip code, or property type.
- Click any property card to open its detail page.

---

## Property detail page

The property detail page (`/dashboard/property-search/[id]`) shows:

- **Overview** — all fields you entered
- **Risk Score badge** — LOW / MEDIUM / HIGH / CRITICAL with the numeric score
- **Labels** — auto-applied tags (e.g. VERIFIED, HIGH_RISK, HOT_DEAL)
- **Action buttons**:
  - **View Risk Analysis** → opens the risk breakdown page
  - **Generate Report** → opens the report generation page
  - **View Comparables** → finds similar nearby properties
  - **Valuation** → automated market valuation

---

## Editing a property

1. Open the property detail page.
2. Click **Edit** (pencil icon).
3. Update any field and click **Save Changes**.

> **Note:** Editing a property does not automatically re-run the risk assessment.
> Use **Recalculate** on the Risk Analysis page if the data has changed significantly.

---

## Deleting a property

1. Open the property detail page.
2. Click **Delete** (trash icon) and confirm when prompted.

> ⚠️ **Warning:** Deletion is permanent. All associated risk assessments, reports,
> comparables, and valuations are also deleted.

---

## Map view

Click the **Map** tab on the Properties page to see all your properties plotted
on an interactive Leaflet map. Each pin shows the property address and risk level.
Click a pin to jump to the property detail page.

---

## Property labels

Labels are colour-coded tags automatically applied by the platform:

| Label | Meaning |
|-------|---------|
| VERIFIED | The property's address data has been cross-verified |
| HIGH_RISK | Overall risk score is HIGH or CRITICAL |
| HOT_DEAL | Market value significantly below comparable properties |
| FLOOD_RISK | Property is in a flood-prone area |

Admins can also apply and remove labels manually.
