"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MapIcon, Layers } from "lucide-react";
import { formatINR } from "@/utils/currency";
import PriceHeatmap from "./PriceHeatmap";
import "leaflet/dist/leaflet.css";

export default function ComparableMap({ subject, comparables = [], loading = false }) {
  const { t } = useTranslation();
  const [MapComponents, setMapComponents] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      const [{ MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip }, L] =
        await Promise.all([import("react-leaflet"), import("leaflet")]);

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setMapComponents({ MapContainer, TileLayer, CircleMarker, Circle, Popup, Tooltip });
    })();
  }, []);

  const TILE_LIGHT = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  };
  const TILE_DARK = {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  };
  const tile = isDark ? TILE_DARK : TILE_LIGHT;

  const hasSubjectCoords = subject?.latitude != null && subject?.longitude != null;
  const center = hasSubjectCoords ? [subject.latitude, subject.longitude] : [20.5937, 78.9629];
  const zoom = hasSubjectCoords ? 13 : 5;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf7f3] dark:bg-[#0d2818]">
            <MapIcon className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
            {t("report.comparable.map.title")}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowHeatmap((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            showHeatmap
              ? "bg-[#22C55E] text-white"
              : "border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#7d8590] hover:border-[#22C55E] hover:text-[#16a34a]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" strokeWidth={2.2} />
          {t("report.comparable.map.priceHeatmap")}
        </button>
      </div>

      <div className="relative h-[420px] w-full">
        {loading || !MapComponents ? (
          <div className="flex h-full items-center justify-center bg-white dark:bg-[#0d1117]">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300 dark:text-[#7d8590]" />
          </div>
        ) : !hasSubjectCoords ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-[#7d8590] px-6 text-center">
            {t("report.comparable.map.noCoords")}
          </div>
        ) : (
          <MapComponents.MapContainer
            key={isDark ? "dark" : "light"}
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            className="h-full w-full"
            style={{ borderRadius: 0 }}
          >
            <MapComponents.TileLayer attribution={tile.attribution} url={tile.url} />

            {showHeatmap && (
              <PriceHeatmap CircleComponent={MapComponents.Circle} comparables={comparables} />
            )}

            <MapComponents.CircleMarker
              center={center}
              radius={10}
              pathOptions={{
                fillColor: "#16a34a",
                fillOpacity: 1,
                color: "#ffffff",
                weight: 3,
              }}
            >
              <MapComponents.Tooltip direction="top" offset={[0, -10]} permanent opacity={0.95}>
                <span className="text-xs font-bold">{t("report.comparable.map.subjectProperty")}</span>
              </MapComponents.Tooltip>
            </MapComponents.CircleMarker>

            {comparables
              .filter((c) => c.latitude != null && c.longitude != null)
              .map((c) => (
                <MapComponents.CircleMarker
                  key={c.id}
                  center={[c.latitude, c.longitude]}
                  radius={7}
                  pathOptions={{
                    fillColor: "#22C55E",
                    fillOpacity: 0.8,
                    color: isDark ? "#161b22" : "#ffffff",
                    weight: 2,
                  }}
                >
                  <MapComponents.Popup>
                    <div className="min-w-[160px] space-y-1 py-1">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{c.address}</p>
                      <p className="text-xs text-gray-500">{c.city}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-sm font-black text-gray-900">
                          {c.marketValue != null ? formatINR(c.marketValue) : "—"}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {c.distanceKm != null ? `${c.distanceKm.toFixed(1)} km` : ""}
                        </span>
                      </div>
                    </div>
                  </MapComponents.Popup>
                </MapComponents.CircleMarker>
              ))}
          </MapComponents.MapContainer>
        )}
      </div>
    </div>
  );
}