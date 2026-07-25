// frontend/src/components/property/pdf/ComparisonPDFDocument.jsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

function fmtINR(amount) {
  if (amount == null || isNaN(amount)) return "—";
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function fmt(val) {
  if (val == null || val === "") return "—";
  return String(val);
}

function fmtTimestamp(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
}

const C = {
  green: "#16a34a", greenLight: "#dcfce7",
  gray50: "#f9fafb", gray100: "#f3f4f6", gray200: "#e5e7eb",
  gray400: "#9ca3af", gray500: "#6b7280", gray700: "#374151",
  gray900: "#111827", white: "#ffffff",
  amber: "#d97706", red: "#dc2626",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica", fontSize: 8.5,
    color: C.gray900, backgroundColor: C.white,
    paddingTop: 44, paddingBottom: 52, paddingHorizontal: 36,
  },
  watermark: {
    position: "absolute", top: "38%", left: "8%", width: 500,
    transform: "rotate(-35deg)", opacity: 0.04,
    fontSize: 48, fontFamily: "Helvetica-Bold",
    color: C.gray900, letterSpacing: 4,
  },
  pageHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20,
    paddingBottom: 12, borderBottomWidth: 1.5, borderBottomColor: C.green,
  },
  platformName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.green },
  platformSub:  { fontSize: 7.5, color: C.gray500, marginTop: 2 },
  headerMeta:   { fontSize: 7.5, color: C.gray500 },
  headerMetaBold: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.gray700 },

  // Table
  table:      { width: "100%" },
  tableHeader: {
    flexDirection: "row", backgroundColor: C.gray50,
    borderBottomWidth: 1.5, borderBottomColor: C.gray200,
    borderTopWidth: 1, borderTopColor: C.gray200,
    borderLeftWidth: 1, borderLeftColor: C.gray200,
    borderRightWidth: 1, borderRightColor: C.gray200,
  },
  row: {
    flexDirection: "row", borderBottomWidth: 0.5,
    borderBottomColor: C.gray200,
    borderLeftWidth: 1, borderLeftColor: C.gray200,
    borderRightWidth: 1, borderRightColor: C.gray200,
  },
  sectionRow: {
    flexDirection: "row", backgroundColor: C.gray100,
    borderBottomWidth: 0.5, borderBottomColor: C.gray200,
    borderLeftWidth: 1, borderLeftColor: C.gray200,
    borderRightWidth: 1, borderRightColor: C.gray200,
    paddingVertical: 4, paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.gray400,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  labelCell: {
    width: 120, paddingHorizontal: 8, paddingVertical: 5,
    backgroundColor: C.gray50,
    borderRightWidth: 0.5, borderRightColor: C.gray200,
    justifyContent: "center",
  },
  labelText: { fontSize: 7.5, color: C.gray500 },
  dataCell: {
    flex: 1, paddingHorizontal: 8, paddingVertical: 5,
    borderRightWidth: 0.5, borderRightColor: C.gray200,
    justifyContent: "center", alignItems: "center",
  },
  dataText:  { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray900, textAlign: "center" },
  bestCell:  { backgroundColor: "#f0fdf4" },
  worstCell: { backgroundColor: "#fef2f2" },
  bestText:  { color: C.green },
  worstText: { color: C.red },

  headerCell: {
    flex: 1, paddingHorizontal: 8, paddingVertical: 10,
    borderRightWidth: 0.5, borderRightColor: C.gray200,
    alignItems: "center",
  },
  headerLetter: {
    fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white,
    backgroundColor: C.green, borderRadius: 20,
    width: 22, height: 22, textAlign: "center",
    paddingTop: 4,
  },
  headerAddress: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray900, textAlign: "center", marginTop: 4 },
  headerCity:    { fontSize: 7, color: C.gray500, textAlign: "center", marginTop: 1 },

  metricLabelHeader: { width: 120, paddingHorizontal: 8, paddingVertical: 10 },

  footer: {
    position: "absolute", bottom: 18, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: C.gray200, paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: C.gray400 },
});

function computeBest(values, direction) {
  const nums = values.map((v) => (v != null && !isNaN(Number(v)) ? Number(v) : null));
  const valid = nums.filter((v) => v != null);
  if (valid.length < 2) return values.map(() => "neutral");
  const max = Math.max(...valid);
  const min = Math.min(...valid);
  return nums.map((v) => {
    if (v == null) return "neutral";
    if (direction === "higher-better") return v === max ? "best" : v === min ? "worst" : "neutral";
    if (direction === "lower-better")  return v === min ? "best" : v === max ? "worst" : "neutral";
    return "neutral";
  });
}

function TableRow({ label, values, displayValues, direction = "none" }) {
  const deltas = computeBest(values, direction);
  return (
    <View style={s.row}>
      <View style={s.labelCell}>
        <Text style={s.labelText}>{label}</Text>
      </View>
      {displayValues.map((dv, i) => {
        const d = deltas[i];
        return (
          <View key={i} style={[s.dataCell, d === "best" ? s.bestCell : d === "worst" ? s.worstCell : {}]}>
            <Text style={[s.dataText, d === "best" ? s.bestText : d === "worst" ? s.worstText : {}]}>
              {dv ?? "—"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function SectionRow({ label, colCount }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionLabel}>{label}</Text>
    </View>
  );
}

function PlainRow({ label, values }) {
  return (
    <View style={s.row}>
      <View style={s.labelCell}>
        <Text style={s.labelText}>{label}</Text>
      </View>
      {values.map((v, i) => (
        <View key={i} style={s.dataCell}>
          <Text style={s.dataText}>{v ?? "—"}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ComparisonPDFDocument({ properties = [], aggregated = [], risks = [] }) {
  const P = properties;
  const A = aggregated;
  const R = risks;
  const generatedAt = new Date().toISOString();
  const colCount = P.filter(Boolean).length;
  const LABELS = ["A", "B", "C"];

  const pricePerSqft = P.map((p) =>
    p?.marketValue && p?.area ? Math.round(p.marketValue / p.area) : null
  );

  return (
    <Document
      title="Property Comparison Report"
      author="Due Diligence Platform"
      subject="Side-by-side property comparison"
    >
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Watermark */}
        <Text fixed style={s.watermark}>DUE DILIGENCE</Text>

        {/* Header */}
        <View fixed style={s.pageHeader}>
          <View>
            <Text style={s.platformName}>Due Diligence Platform</Text>
            <Text style={s.platformSub}>Property comparison report · {colCount} properties</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.headerMeta}>Generated on</Text>
            <Text style={s.headerMetaBold}>{fmtTimestamp(generatedAt)}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>

          {/* Column headers */}
          <View style={s.tableHeader}>
            <View style={s.metricLabelHeader}>
              <Text style={{ fontSize: 7, color: C.gray400, textTransform: "uppercase", letterSpacing: 0.5 }}>Metric</Text>
            </View>
            {P.map((p, i) => (
              <View key={i} style={s.headerCell}>
                <Text style={s.headerLetter}>{LABELS[i]}</Text>
                <Text style={s.headerAddress} numberOfLines={2}>{p?.address ?? "—"}</Text>
                <Text style={s.headerCity}>{p?.city ?? ""}{p?.state ? `, ${p.state}` : ""}</Text>
                <Text style={{ fontSize: 6.5, color: p?.verified ? C.green : C.amber, marginTop: 3, fontFamily: "Helvetica-Bold" }}>
                  {p?.verified ? "Verified" : "Pending"}
                </Text>
              </View>
            ))}
          </View>

          {/* Financial */}
          <SectionRow label="Financial" colCount={colCount} />
          <TableRow label="Market value" values={P.map((p) => p?.marketValue)} displayValues={P.map((p) => p?.marketValue ? fmtINR(p.marketValue) : null)} direction="higher-better" />
          <TableRow label="Area" values={P.map((p) => p?.area)} displayValues={P.map((p) => p?.area ? `${p.area.toLocaleString()} sqft` : null)} direction="higher-better" />
          <TableRow label="Price / sqft" values={pricePerSqft} displayValues={pricePerSqft.map((v) => v ? `₹${v.toLocaleString("en-IN")}` : null)} direction="lower-better" />
          <TableRow label="Year built" values={P.map((p) => p?.yearBuilt)} displayValues={P.map((p) => fmt(p?.yearBuilt))} direction="higher-better" />

          {/* Property details */}
          <SectionRow label="Property details" colCount={colCount} />
          <PlainRow label="Type" values={P.map((p) => p?.propertyType)} />
          <TableRow label="Bedrooms" values={P.map((p) => p?.bedrooms)} displayValues={P.map((p) => fmt(p?.bedrooms))} direction="higher-better" />
          <TableRow label="Bathrooms" values={P.map((p) => p?.bathrooms)} displayValues={P.map((p) => fmt(p?.bathrooms))} direction="higher-better" />
          <PlainRow label="Condition" values={P.map((p) => p?.condition)} />

          {/* Risk */}
          <SectionRow label="Risk assessment" colCount={colCount} />
          <TableRow label="Overall risk score" values={R.map((r) => r?.overallScore)} displayValues={R.map((r) => r ? `${r.overallScore}/100 · ${r.riskLabel}` : null)} direction="lower-better" />
          <TableRow label="Financial risk" values={R.map((r) => r?.financialScore)} displayValues={R.map((r) => r ? `${r.financialScore}/100` : null)} direction="lower-better" />
          <TableRow label="Legal risk" values={R.map((r) => r?.legalScore)} displayValues={R.map((r) => r ? `${r.legalScore}/100` : null)} direction="lower-better" />
          <TableRow label="Environmental risk" values={R.map((r) => r?.environmentalScore)} displayValues={R.map((r) => r ? `${r.environmentalScore}/100` : null)} direction="lower-better" />
          <TableRow label="Structural risk" values={R.map((r) => r?.structuralScore)} displayValues={R.map((r) => r ? `${r.structuralScore}/100` : null)} direction="lower-better" />

          {/* Environmental */}
          <SectionRow label="Environmental" colCount={colCount} />
          <TableRow label="AQI" values={A.map((a) => a?.environmental?.data?.airQualityIndex)} displayValues={A.map((a) => { const aqi = a?.environmental?.data?.airQualityIndex; return aqi != null ? String(aqi) : null; })} direction="lower-better" />
          <PlainRow label="Flood risk" values={A.map((a) => a?.floodZone?.data?.riskLevel)} />

          {/* Data sources */}
          <SectionRow label="Data sources" colCount={colCount} />
          {[
            ["Ownership",     (a) => a?.ownership?.status],
            ["Tax history",   (a) => a?.taxHistory?.status],
            ["Zoning",        (a) => a?.zoning?.status],
            ["Flood zone",    (a) => a?.floodZone?.status],
            ["Permits",       (a) => a?.permits?.status],
            ["Environmental", (a) => a?.environmental?.status],
          ].map(([label, getter]) => (
            <PlainRow key={label} label={label} values={A.map((a) => getter(a) ?? "—")} />
          ))}
        </View>

        {/* Footer */}
        <View fixed style={s.footer}>
          <Text style={s.footerText}>Generated from Due Diligence Platform · Comparisons are relative — no external benchmarks used</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}