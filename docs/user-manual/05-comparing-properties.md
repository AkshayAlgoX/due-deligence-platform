# Chapter 5 — Comparing Properties

## Comparable property analysis

Comparable property analysis finds similar properties near your target property
and compares their prices, areas, and other attributes. This helps you determine
whether the asking price is fair.

---

## Viewing comparables

1. Open a property's detail page.
2. Click **View Comparables**.
3. You are taken to `/properties/[id]/comparables`.

The comparables page shows:

- **Interactive Map** — your property in blue; comparable properties as coloured pins
  (green = very similar, yellow = similar, orange = somewhat similar)
- **Comparable Cards** — each card shows:
  - Address and distance (km)
  - Similarity score (0–100%) and similarity level badge
  - Price per sq ft vs your property
  - **Better Deal indicator** — shown if this comparable is priced below market
- **Comparables Table** — side-by-side table for detailed comparison

---

## Adjusting the search radius

Use the **Radius Selector** buttons above the map to filter comparables by distance:

| Button | Radius |
|--------|--------|
| 1 km | Very close neighbourhood |
| 3 km | Local area |
| 5 km | *(default)* |
| 10 km | Wider area |

---

## Advanced search

For more control over which comparables are returned:

1. Click **Advanced Search**.
2. Set filters:
   - **Price range** — minimum and maximum market value
   - **Area range** — minimum and maximum sq ft
   - **Property type** — match only the same type
   - **Max distance** — override the radius selector
3. Click **Search**.

Results are saved as a new comparable analysis record.

---

## Price trends

Below the comparables map, the **Price Trends** chart shows:

- Historical price-per-sqft values for the comparable market over the past 12 months
- Your property's price-per-sqft plotted against the trend

Use this to assess whether the market is rising, stable, or declining.

---

## Property valuation

The platform can automatically estimate your property's value using three methods:

1. Open a property's detail page.
2. Click **Valuation** (or go to `/properties/[id]/valuation`).

### Valuation methods

| Method | How it works |
|--------|-------------|
| **Comparable Sales** | Adjusts prices of nearby sold comparables for size, age, and condition |
| **Cost Approach** | Estimates replacement cost of the structure plus land value |
| **Income Approach** | Capitalises estimated rental income at a market cap rate |

### Triggering a valuation

Click **Calculate Valuation** to run a fresh computation.
The result shows:
- **Estimated Value** (₹)
- **Confidence Range** — low and high estimates
- **Method** — which approach was used (the one with the most available data)

### Methods breakdown

Click **Methods Breakdown** to see all three estimates side by side in a bar chart.
This is useful when the three methods diverge — a large gap may indicate data quality issues.

---

## Saving a comparison

To save a set of properties for later comparison:

1. Select properties using their checkboxes in the search results.
2. Click **Save Comparison**.
3. Enter a name (e.g. "Chennai 2BHK options — August 2025") and optional notes.
4. Click **Save**.

Access saved comparisons at **Saved Comparisons** in the sidebar.

---

## Managing saved comparisons

Go to `/dashboard/saved-comparisons` to:
- View all saved comparisons
- Edit the name or notes
- Open the comparison (loads all properties for side-by-side view)
- Delete comparisons you no longer need
