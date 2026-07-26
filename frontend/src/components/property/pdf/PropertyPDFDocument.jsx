// frontend/src/components/property/pdf/PropertyPDFDocument.jsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/**
 * PropertyPDFDocument
 *
 * Pure @react-pdf/renderer component — no Tailwind, no HTML.
 * All styling via StyleSheet.create().
 *
 * Props:
 *   property    - PropertyResponse from backend
 *   aggregated  - AggregatedPropertyResponse (may be null)
 *   risk        - RiskScoreResponse (may be null)
 *
 * Design decisions:
 *   - UNAVAILABLE/MOCK sections show honest status, never invented data
 *   - Null fields show "—", never "0" or "N/A"
 *   - Watermark rendered as fixed diagonal text on every page
 *   - No images in PDF (URL images are unreliable in @react-pdf at runtime)
 *   - Geist font not available in @react-pdf — uses Helvetica (clean system font)
 */

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val == null || val === "") return "—";
  return String(val);
}

function fmtINR(amount) {
  if (amount == null || isNaN(amount)) return "—";
  const num = Number(amount);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function fmtINRFull(amount) {
  if (amount == null || isNaN(amount)) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function fmtTimestamp(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function statusLabel(status) {
  const map = {
    LIVE:        "Live data",
    CACHED:      "Cached data",
    MOCK:        "Sample data (mock)",
    UNAVAILABLE: "Unavailable",
    TIMEOUT:     "Timed out",
    ERROR:       "Error",
    NO_DATA:     "No data found",
  };
  return map[status] ?? status ?? "—";
}

function riskColor(label) {
  if (label === "HIGH")   return "#dc2626"; // red-600
  if (label === "MEDIUM") return "#d97706"; // amber-600
  return "#16a34a"; // green-700
}

// ── Styles ─────────────────────────────────────────────────────────────────

const C = {
  green:      "#16a34a",
  greenLight: "#dcfce7",
  gray50:     "#f9fafb",
  gray100:    "#f3f4f6",
  gray200:    "#e5e7eb",
  gray400:    "#9ca3af",
  gray500:    "#6b7280",
  gray700:    "#374151",
  gray900:    "#111827",
  white:      "#ffffff",
  amber:      "#d97706",
  red:        "#dc2626",
  blue:       "#2563eb",
};

const s = StyleSheet.create({
  page: {
    fontFamily:      "Helvetica",
    fontSize:        9,
    color:           C.gray900,
    backgroundColor: C.white,
    paddingTop:      48,
    paddingBottom:   56,
    paddingHorizontal: 44,
  },

  // ── Watermark ─────────────────────────────────────────────────
  watermark: {
    position:   "absolute",
    top:        "38%",
    left:       "10%",
    width:      500,
    transform:  "rotate(-35deg)",
    opacity:    0.045,
    fontSize:   52,
    fontFamily: "Helvetica-Bold",
    color:      C.gray900,
    letterSpacing: 4,
  },

  // ── Page header ───────────────────────────────────────────────
  pageHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    marginBottom:   24,
    paddingBottom:  14,
    borderBottomWidth: 1.5,
    borderBottomColor: C.green,
  },
  platformName: {
    fontSize:   14,
    fontFamily: "Helvetica-Bold",
    color:      C.green,
    letterSpacing: 0.5,
  },
  platformSub: {
    fontSize:  8,
    color:     C.gray500,
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerMeta: {
    fontSize:  8,
    color:     C.gray500,
  },
  headerMetaBold: {
    fontSize:   8,
    fontFamily: "Helvetica-Bold",
    color:      C.gray700,
  },

  // ── Section title ─────────────────────────────────────────────
  sectionTitle: {
    fontSize:       10,
    fontFamily:     "Helvetica-Bold",
    color:          C.gray900,
    textTransform:  "uppercase",
    letterSpacing:  1.2,
    marginBottom:   8,
    marginTop:      18,
    paddingBottom:  5,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },

  // ── Property hero ─────────────────────────────────────────────
  heroBox: {
    backgroundColor: C.gray50,
    borderRadius:    8,
    padding:         14,
    marginBottom:    4,
    borderWidth:     1,
    borderColor:     C.gray200,
  },
  heroAddress: {
    fontSize:   16,
    fontFamily: "Helvetica-Bold",
    color:      C.gray900,
    lineHeight: 1.3,
  },
  heroLocation: {
    fontSize:  9,
    color:     C.gray500,
    marginTop: 3,
  },
  heroRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-end",
    marginTop:      10,
  },
  heroValue: {
    fontSize:   18,
    fontFamily: "Helvetica-Bold",
    color:      C.green,
  },
  heroValueLabel: {
    fontSize:  7,
    color:     C.gray500,
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: C.greenLight,
    borderRadius:    20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth:     1,
    borderColor:     "#86efac",
  },
  verifiedText: {
    fontSize:   7.5,
    fontFamily: "Helvetica-Bold",
    color:      C.green,
  },
  pendingBadge: {
    backgroundColor: "#fffbeb",
    borderRadius:    20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth:     1,
    borderColor:     "#fcd34d",
  },
  pendingText: {
    fontSize:   7.5,
    fontFamily: "Helvetica-Bold",
    color:      C.amber,
  },

  // ── Quick facts strip ─────────────────────────────────────────
  factsRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           6,
    marginTop:     10,
  },
  factPill: {
    backgroundColor: C.white,
    borderRadius:    20,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth:     1,
    borderColor:     C.gray200,
  },
  factText: {
    fontSize:   8,
    fontFamily: "Helvetica-Bold",
    color:      C.gray700,
  },

  // ── Risk score ────────────────────────────────────────────────
  riskBox: {
    borderRadius:    8,
    padding:         12,
    borderWidth:     1,
    marginBottom:    4,
  },
  riskHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   10,
  },
  riskScoreBig: {
    fontSize:   28,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  riskLabel: {
    fontSize:   9,
    fontFamily: "Helvetica-Bold",
    marginTop:  2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  riskSubLabel: {
    fontSize: 8,
    color:    C.gray500,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   5,
  },
  categoryLabel: {
    fontSize: 8,
    color:    C.gray700,
    width:    80,
  },
  categoryWeight: {
    fontSize: 7,
    color:    C.gray400,
    width:    30,
    textAlign: "right",
  },
  barBg: {
    flex:            1,
    height:          6,
    backgroundColor: C.gray100,
    borderRadius:    3,
    marginHorizontal: 8,
    overflow:        "hidden",
  },
  barFill: {
    height:       6,
    borderRadius: 3,
  },
  categoryScore: {
    fontSize:  8,
    fontFamily: "Helvetica-Bold",
    color:     C.gray900,
    width:     20,
    textAlign: "right",
  },
  flagRow: {
    flexDirection: "row",
    alignItems:    "flex-start",
    marginBottom:  4,
    gap:           5,
  },
  flagDot: {
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: C.gray400,
    marginTop:       3,
    flexShrink:      0,
  },
  flagText: {
    fontSize:  8,
    color:     C.gray700,
    flex:      1,
    lineHeight: 1.4,
  },
  incompleteNote: {
    fontSize:        7.5,
    color:           C.gray400,
    marginTop:       6,
    fontStyle:       "italic",
    paddingTop:      6,
    borderTopWidth:  1,
    borderTopColor:  C.gray100,
  },

  // ── Aggregation section card ───────────────────────────────────
  aggCard: {
    borderRadius:    8,
    borderWidth:     1,
    borderColor:     C.gray200,
    marginBottom:    10,
    overflow:        "hidden",
  },
  aggCardHeader: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    backgroundColor: C.gray50,
    paddingHorizontal: 10,
    paddingVertical:   7,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  aggCardTitle: {
    fontSize:   9,
    fontFamily: "Helvetica-Bold",
    color:      C.gray900,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statusPill: {
    borderRadius:    20,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  statusText: {
    fontSize:   7,
    fontFamily: "Helvetica-Bold",
  },
  aggCardBody: {
    paddingHorizontal: 10,
    paddingVertical:   8,
  },
  unavailableText: {
    fontSize:  8.5,
    color:     C.gray400,
    fontStyle: "italic",
  },

  // ── Key-value rows ─────────────────────────────────────────────
  kvRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray100,
  },
  kvLabel: {
    fontSize: 8,
    color:    C.gray500,
    flex:     1,
  },
  kvValue: {
    fontSize:  8,
    fontFamily: "Helvetica-Bold",
    color:     C.gray900,
    flex:      2,
    textAlign: "right",
  },

  // ── Two-column grid ───────────────────────────────────────────
  twoCol: {
    flexDirection: "row",
    gap:           10,
  },
  col: {
    flex: 1,
  },

  // ── Completeness footer ───────────────────────────────────────
  completenessBox: {
    marginTop:       14,
    borderRadius:    8,
    borderWidth:     1,
    borderColor:     C.gray200,
    backgroundColor: C.gray50,
    padding:         12,
  },
  completenessTitle: {
    fontSize:   9,
    fontFamily: "Helvetica-Bold",
    color:      C.gray700,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  completenessRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    gap:            8,
  },
  completenessStat: {
    flex:            1,
    alignItems:      "center",
    backgroundColor: C.white,
    borderRadius:    6,
    paddingVertical: 8,
    borderWidth:     1,
    borderColor:     C.gray200,
  },
  completenessNum: {
    fontSize:   14,
    fontFamily: "Helvetica-Bold",
    color:      C.gray900,
  },
  completenessLabel: {
    fontSize:  7,
    color:     C.gray500,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Page footer ───────────────────────────────────────────────
  pageFooter: {
    position:   "absolute",
    bottom:     20,
    left:       44,
    right:      44,
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    paddingTop:     8,
  },
  footerText: {
    fontSize: 7,
    color:    C.gray400,
  },
  footerBold: {
    fontSize:   7,
    fontFamily: "Helvetica-Bold",
    color:      C.gray500,
  },
});

// ── Sub-components ─────────────────────────────────────────────────────────

function Watermark() {
  return (
    <Text fixed style={s.watermark}>
      DUE DILIGENCE
    </Text>
  );
}

function PageHeader({ generatedAt }) {
  return (
    <View fixed style={s.pageHeader}>
      <View>
        <Text style={s.platformName}>Due Diligence Platform</Text>
        <Text style={s.platformSub}>Real estate data intelligence</Text>
      </View>
      <View style={s.headerRight}>
        <Text style={s.headerMeta}>Generated on</Text>
        <Text style={s.headerMetaBold}>{fmtTimestamp(generatedAt)}</Text>
      </View>
    </View>
  );
}

function PageFooter({ propertyId }) {
  return (
    <View fixed style={s.pageFooter}>
      <Text style={s.footerText}>
        Property ID #{propertyId} · Generated from Due Diligence Platform
      </Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

function KVRow({ label, value }) {
  return (
    <View style={s.kvRow}>
      <Text style={s.kvLabel}>{label}</Text>
      <Text style={s.kvValue}>{fmt(value)}</Text>
    </View>
  );
}

function StatusPill({ status }) {
  const colors = {
    LIVE:        { bg: "#dcfce7", text: "#16a34a" },
    CACHED:      { bg: "#dcfce7", text: "#16a34a" },
    MOCK:        { bg: "#fffbeb", text: "#d97706" },
    UNAVAILABLE: { bg: "#fee2e2", text: "#dc2626" },
    TIMEOUT:     { bg: "#fee2e2", text: "#dc2626" },
    ERROR:       { bg: "#fee2e2", text: "#dc2626" },
    NO_DATA:     { bg: "#f3f4f6", text: "#6b7280" },
  };
  const c = colors[status] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <View style={[s.statusPill, { backgroundColor: c.bg }]}>
      <Text style={[s.statusText, { color: c.text }]}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}

function AggCard({ title, section, children }) {
  const hasData =
    section?.data != null &&
    section?.status !== "UNAVAILABLE" &&
    section?.status !== "TIMEOUT" &&
    section?.status !== "ERROR";

  return (
    <View style={s.aggCard}>
      <View style={s.aggCardHeader}>
        <Text style={s.aggCardTitle}>{title}</Text>
        {section?.status && <StatusPill status={section.status} />}
      </View>
      <View style={s.aggCardBody}>
        {hasData ? (
          children
        ) : (
          <Text style={s.unavailableText}>
            {section?.reason ?? "Data not available for this property."}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Section renderers ──────────────────────────────────────────────────────

function OwnershipSection({ section }) {
  const d = section?.data;
  return (
    <AggCard title="Ownership" section={section}>
      {d && (
        <View>
          <KVRow label="Current owner"    value={d.currentOwner} />
          {d.ownershipType && (
            <KVRow label="Ownership type" value={d.ownershipType?.replace(/_/g, " ")} />
          )}
          {d.registrationNumber && (
            <KVRow label="Registration no." value={d.registrationNumber} />
          )}
          {d.registrationDate && (
            <KVRow label="Registered on" value={fmtDate(d.registrationDate)} />
          )}
          {d.registeredValue != null && (
            <KVRow label="Registered value" value={fmtINRFull(d.registeredValue)} />
          )}
          {d.stampDutyPaid != null && (
            <KVRow label="Stamp duty paid" value={fmtINRFull(d.stampDutyPaid)} />
          )}
          {d.subRegistrarOffice && (
            <KVRow label="Sub-registrar office" value={d.subRegistrarOffice} />
          )}
          {d.coOwners?.length > 0 && (
            <KVRow label="Co-owners" value={d.coOwners.join(", ")} />
          )}
          {d.ownershipHistory?.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 7.5, color: C.gray500, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Previous owners
              </Text>
              {d.ownershipHistory.map((h, i) => (
                <View key={i} style={{ marginBottom: 3, paddingLeft: 6, borderLeftWidth: 1.5, borderLeftColor: C.gray200 }}>
                  <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray900 }}>
                    {h.ownerName}
                  </Text>
                  <Text style={{ fontSize: 7.5, color: C.gray500 }}>
                    {fmtDate(h.ownedFrom)} to {fmtDate(h.ownedUntil)}
                    {h.transferReason ? `  ·  ${h.transferReason}` : ""}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </AggCard>
  );
}

function TaxSection({ section }) {
  const records = section?.data;
  return (
    <AggCard title="Tax history" section={section}>
      {records?.length > 0 && (
        <View>
          {records.slice(0, 5).map((r, i) => (
            <View key={i} style={s.kvRow}>
              <Text style={s.kvLabel}>
                {r.taxYear ?? fmtDate(r.assessmentDate)}
              </Text>
              <Text style={s.kvValue}>
                {fmtINR(r.annualTaxAmount ?? r.taxAmount)}
                {r.paid != null
                  ? r.paid
                    ? "  ·  Paid"
                    : "  ·  Unpaid"
                  : ""}
              </Text>
            </View>
          ))}
          {records.length > 5 && (
            <Text style={{ fontSize: 7.5, color: C.gray400, marginTop: 4 }}>
              +{records.length - 5} more records
            </Text>
          )}
        </View>
      )}
    </AggCard>
  );
}

function ZoningSection({ section }) {
  const d = section?.data;
  return (
    <AggCard title="Zoning" section={section}>
      {d && (
        <View>
          {d.zoneCode && <KVRow label="Zone code"       value={d.zoneCode} />}
          {d.zoneType && <KVRow label="Zone type"       value={d.zoneType} />}
          {d.description && <KVRow label="Description"  value={d.description} />}
          {d.maxBuildingHeight != null && (
            <KVRow label="Max height" value={`${d.maxBuildingHeight} m`} />
          )}
          {d.floorAreaRatio != null && (
            <KVRow label="FAR" value={String(d.floorAreaRatio)} />
          )}
          {d.permittedUses?.length > 0 && (
            <KVRow label="Permitted uses" value={d.permittedUses.join(", ")} />
          )}
        </View>
      )}
    </AggCard>
  );
}

function FloodSection({ section }) {
  const d = section?.data;
  return (
    <AggCard title="Flood zone" section={section}>
      {d && (
        <View>
          {d.riskLevel && (
            <KVRow label="Risk level" value={d.riskLevel} />
          )}
          {d.zoneClassification && (
            <KVRow label="Classification" value={d.zoneClassification} />
          )}
          {d.nearestWaterBody && (
            <KVRow label="Nearest water body" value={d.nearestWaterBody} />
          )}
          {d.distanceToWaterBodyMeters != null && (
            <KVRow
              label="Distance to water"
              value={`${d.distanceToWaterBodyMeters.toFixed(0)} m`}
            />
          )}
          {d.insuranceRequired != null && (
            <KVRow
              label="Insurance required"
              value={d.insuranceRequired ? "Yes" : "No"}
            />
          )}
          {d.lastMajorFloodDate && (
            <KVRow label="Last major flood" value={fmtDate(d.lastMajorFloodDate)} />
          )}
          {d.dataAgency && (
            <KVRow label="Data agency" value={d.dataAgency} />
          )}
        </View>
      )}
    </AggCard>
  );
}

function PermitsSection({ section }) {
  const records = section?.data;
  return (
    <AggCard title="Permits" section={section}>
      {records?.length > 0 && (
        <View>
          {records.slice(0, 4).map((r, i) => (
            <View
              key={i}
              style={{
                marginBottom:    6,
                paddingBottom:   6,
                borderBottomWidth: i < records.length - 1 ? 0.5 : 0,
                borderBottomColor: C.gray100,
              }}
            >
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.gray900 }}>
                {r.permitType ?? r.type ?? "Permit"}
              </Text>
              <Text style={{ fontSize: 7.5, color: C.gray500, marginTop: 1 }}>
                {r.permitNumber ?? ""}
                {r.issuedDate ? `  ·  Issued ${fmtDate(r.issuedDate)}` : ""}
                {r.status ? `  ·  ${r.status}` : ""}
              </Text>
            </View>
          ))}
          {records.length > 4 && (
            <Text style={{ fontSize: 7.5, color: C.gray400 }}>
              +{records.length - 4} more permits
            </Text>
          )}
        </View>
      )}
    </AggCard>
  );
}

function EnvironmentalSection({ section }) {
  const d = section?.data;
  return (
    <AggCard title="Environmental" section={section}>
      {d && (
        <View>
          {d.airQualityIndex != null && (
            <KVRow
              label="AQI"
              value={`${d.airQualityIndex}${d.aqiCategory ? `  ·  ${d.aqiCategory}` : ""}`}
            />
          )}
          {d.dominantPollutant && (
            <KVRow label="Dominant pollutant" value={d.dominantPollutant} />
          )}
          {d.nearestStation && (
            <KVRow label="Monitoring station" value={d.nearestStation} />
          )}
          {d.stationDistanceKm != null && (
            <KVRow
              label="Station distance"
              value={`${d.stationDistanceKm.toFixed(1)} km`}
            />
          )}
          {d.soilType && (
            <KVRow label="Soil type" value={d.soilType} />
          )}
          {d.noiseLevelDb != null && (
            <KVRow label="Noise level" value={`${d.noiseLevelDb} dB`} />
          )}
          {d.nearIndustrialZone != null && (
            <KVRow
              label="Near industrial zone"
              value={d.nearIndustrialZone ? "Yes" : "No"}
            />
          )}
          {d.greenCoveragePercent != null && (
            <KVRow
              label="Green coverage"
              value={`${d.greenCoveragePercent.toFixed(1)}%`}
            />
          )}
          {d.measuredAt && (
            <KVRow label="Measured at" value={fmtTimestamp(d.measuredAt)} />
          )}
        </View>
      )}
    </AggCard>
  );
}

function RiskSection({ risk }) {
  if (!risk) {
    return (
      <View style={[s.aggCard, { marginBottom: 4 }]}>
        <View style={s.aggCardHeader}>
          <Text style={s.aggCardTitle}>Risk assessment</Text>
        </View>
        <View style={s.aggCardBody}>
          <Text style={s.unavailableText}>Risk data not available.</Text>
        </View>
      </View>
    );
  }

  const color = riskColor(risk.riskLabel);
  const categories = [
    { label: "Financial",     key: "financialScore",     weight: "30%" },
    { label: "Legal",         key: "legalScore",         weight: "30%" },
    { label: "Environmental", key: "environmentalScore", weight: "25%" },
    { label: "Structural",    key: "structuralScore",    weight: "15%" },
  ];

  return (
    <View style={[s.riskBox, { borderColor: color + "40", backgroundColor: color + "08" }]}>
      {/* Header row */}
      <View style={s.riskHeader}>
        <View>
          <Text style={[s.riskScoreBig, { color }]}>
            {risk.overallScore}
            <Text style={{ fontSize: 12, color: C.gray400 }}>/100</Text>
          </Text>
          <Text style={[s.riskLabel, { color }]}>
            {risk.riskLabel === "LOW"
              ? "Low risk"
              : risk.riskLabel === "MEDIUM"
              ? "Medium risk"
              : "High risk"}
          </Text>
          <Text style={s.riskSubLabel}>Rule-based · real aggregated data</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 8, color: C.gray500, marginBottom: 4 }}>
            Category breakdown
          </Text>
          {categories.map((cat) => (
            <View key={cat.key} style={[s.categoryRow, { width: 200 }]}>
              <Text style={s.categoryLabel}>{cat.label}</Text>
              <Text style={s.categoryWeight}>{cat.weight}</Text>
              <View style={s.barBg}>
                <View
                  style={[
                    s.barFill,
                    {
                      width:           `${risk[cat.key]}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
              <Text style={s.categoryScore}>{risk[cat.key]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Risk flags */}
      {risk.riskFlags?.length > 0 && (
        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: color + "30",
            paddingTop:     8,
            marginTop:      4,
          }}
        >
          <Text
            style={{
              fontSize:      7.5,
              color:         C.gray500,
              marginBottom:  5,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Risk factors · {risk.riskFlags.length}
          </Text>
          {risk.riskFlags.map((flag, i) => (
            <View key={i} style={s.flagRow}>
              <View style={s.flagDot} />
              <Text style={s.flagText}>{flag}</Text>
            </View>
          ))}
        </View>
      )}

      {risk.dataIncomplete && (
        <Text style={s.incompleteNote}>
          Some data sources returned mock or unavailable data. Score may improve as more real data becomes available.
        </Text>
      )}
    </View>
  );
}

function CompletenessFooter({ aggregated }) {
  if (!aggregated) return null;

  const sections = [
    aggregated.ownership,
    aggregated.taxHistory,
    aggregated.zoning,
    aggregated.floodZone,
    aggregated.permits,
    aggregated.environmental,
  ];

  const liveCount = sections.filter(
    (s) => s?.status === "LIVE" || s?.status === "CACHED"
  ).length;
  const mockCount  = sections.filter((s) => s?.status === "MOCK").length;
  const failedCount = sections.filter((s) =>
    ["UNAVAILABLE", "TIMEOUT", "ERROR", "NO_DATA"].includes(s?.status)
  ).length;
  const pct = Math.round(((liveCount + mockCount) / sections.length) * 100);

  return (
    <View style={s.completenessBox}>
      <Text style={s.completenessTitle}>Data completeness</Text>
      <View style={s.completenessRow}>
        <View style={s.completenessStat}>
          <Text style={s.completenessNum}>{pct}%</Text>
          <Text style={s.completenessLabel}>Coverage</Text>
        </View>
        <View style={s.completenessStat}>
          <Text style={[s.completenessNum, { color: C.green }]}>{liveCount}</Text>
          <Text style={s.completenessLabel}>Live sources</Text>
        </View>
        <View style={s.completenessStat}>
          <Text style={[s.completenessNum, { color: C.amber }]}>{mockCount}</Text>
          <Text style={s.completenessLabel}>Mock sources</Text>
        </View>
        <View style={s.completenessStat}>
          <Text style={[s.completenessNum, { color: C.red }]}>{failedCount}</Text>
          <Text style={s.completenessLabel}>Unavailable</Text>
        </View>
        {aggregated.totalDurationMs != null && (
          <View style={s.completenessStat}>
            <Text style={s.completenessNum}>{aggregated.totalDurationMs}</Text>
            <Text style={s.completenessLabel}>ms total</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main document ──────────────────────────────────────────────────────────

export default function PropertyPDFDocument({ property, aggregated, risk }) {
  if (!property) return null;

  const generatedAt = new Date().toISOString();

  const locationLine = [property.city, property.state]
    .filter(Boolean)
    .join(", ");

  const quickFacts = [
    property.bedrooms  != null && `${property.bedrooms} bedrooms`,
    property.bathrooms != null && `${property.bathrooms} bathrooms`,
    property.area      != null && `${property.area.toLocaleString()} sqft`,
    property.yearBuilt != null && `Built ${property.yearBuilt}`,
    property.stories   != null && `${property.stories} ${property.stories === 1 ? "storey" : "storeys"}`,
    property.lotSize   != null && `Lot: ${property.lotSize.toLocaleString()} sqft`,
    property.zoning                && `Zone: ${property.zoning}`,
    property.condition             && `Condition: ${property.condition}`,
    property.structureType         && `Structure: ${property.structureType}`,
  ].filter(Boolean);

  return (
    <Document
      title={`Property Report — ${property.address}`}
      author="Due Diligence Platform"
      subject="Property due diligence report"
      keywords="real estate, due diligence, risk, India"
      creator="Due Diligence Platform"
    >
      <Page size="A4" style={s.page}>
        <Watermark />
        <PageHeader generatedAt={generatedAt} />

        {/* ── 1. Property hero ──────────────────────────────────── */}
        <SectionTitle>Property overview</SectionTitle>

        <View style={s.heroBox}>
          <View style={s.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.heroAddress}>{property.address ?? "—"}</Text>
              {locationLine && (
                <Text style={s.heroLocation}>
                  {locationLine}
                  {property.zipCode ? ` — ${property.zipCode}` : ""}
                </Text>
              )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {property.verified ? (
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedText}>Verified property</Text>
                </View>
              ) : (
                <View style={s.pendingBadge}>
                  <Text style={s.pendingText}>Pending verification</Text>
                </View>
              )}
            </View>
          </View>

          {property.marketValue != null && property.marketValue > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={s.heroValue}>{fmtINRFull(property.marketValue)}</Text>
              <Text style={s.heroValueLabel}>Estimated market value</Text>
            </View>
          )}

          {property.propertyType && (
            <View style={{ marginTop: 6 }}>
              <Text style={{ fontSize: 8, color: C.green, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1 }}>
                {property.propertyType}
              </Text>
            </View>
          )}

          {quickFacts.length > 0 && (
            <View style={s.factsRow}>
              {quickFacts.map((f) => (
                <View key={f} style={s.factPill}>
                  <Text style={s.factText}>{f}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── 2. Risk assessment ─────────────────────────────────── */}
        <SectionTitle>Risk assessment</SectionTitle>
        <RiskSection risk={risk} />

        {/* ── 3. Ownership + Tax (two-column) ────────────────────── */}
        <SectionTitle>Legal and financial records</SectionTitle>
        <View style={s.twoCol}>
          <View style={s.col}>
            <OwnershipSection section={aggregated?.ownership} />
          </View>
          <View style={s.col}>
            <TaxSection section={aggregated?.taxHistory} />
          </View>
        </View>

        {/* ── 4. Zoning + Flood (two-column) ─────────────────────── */}
        <SectionTitle>Zoning and flood assessment</SectionTitle>
        <View style={s.twoCol}>
          <View style={s.col}>
            <ZoningSection section={aggregated?.zoning} />
          </View>
          <View style={s.col}>
            <FloodSection section={aggregated?.floodZone} />
          </View>
        </View>

        {/* ── 5. Permits + Environmental (two-column) ─────────────── */}
        <SectionTitle>Permits and environmental</SectionTitle>
        <View style={s.twoCol}>
          <View style={s.col}>
            <PermitsSection section={aggregated?.permits} />
          </View>
          <View style={s.col}>
            <EnvironmentalSection section={aggregated?.environmental} />
          </View>
        </View>

        {/* ── 6. Data completeness ───────────────────────────────── */}
        <CompletenessFooter aggregated={aggregated} />

        <PageFooter propertyId={property.id} />
      </Page>
    </Document>
  );
}