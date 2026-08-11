export const RISK_COLORS = {
  LOW: "#22C55E",
  MEDIUM: "#F59E0B",
  MED: "#F59E0B",
  HIGH: "#EF4444",
  CRITICAL: "#991B1B",
};

export function transformRiskData(data = []) {
  return data.map((d) => ({
    name: d.level,
    value: d.count,
    color: RISK_COLORS[d.level] ?? "#9CA3AF",
  }));
}

export function transformTrendData(data = []) {
  return data.map((d) => ({
    label: d.date,
    reports: d.count,
  }));
}

export function transformTopCitiesData(data = []) {
  return data.map((d) => ({
    city: d.city,
    count: d.count,
  }));
}