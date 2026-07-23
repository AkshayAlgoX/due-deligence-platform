"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Loader2, MapIcon, ArrowRight } from "lucide-react";
import { getGeoProperties } from "@/services/propertyService";
import "leaflet/dist/leaflet.css";

// Format INR helper (short form for popups)
function formatINR(value) {
  if (value == null) return "—";
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000)    return `₹${(value / 1_00_000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

// India-centered default view
const INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export default function PortfolioMap({ refreshKey }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  // Dynamic imports — Leaflet needs window (SSR-safe)
  const [MapComponents, setMapComponents] = useState(null);

  useEffect(() => {
    (async () => {
      const [
        { MapContainer, TileLayer, CircleMarker, Popup, Tooltip },
        L,
      ] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
      ]);

      // Fix Leaflet default icon path for Next.js bundling
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setMapComponents({ MapContainer, TileLayer, CircleMarker, Popup, Tooltip });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getGeoProperties();
        setProperties(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshKey]);

  // ── Marker sizing: proportional to market value ──
  const maxValue = Math.max(...properties.map((p) => p.marketValue || 0), 1);
  const getRadius = (value) => {
    if (!value || value <= 0) return 6;
    const scaled = 6 + (value / maxValue) * 12; // 6 to 18 px
    return Math.round(scaled);
  };

  // ── Marker color: green (verified) vs amber (pending) ──
  const getColor = (verified) => (verified ? "#22C55E" : "#f59e0b");

  const isReady = MapComponents && !loading;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf7f3]">
            <MapIcon className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Portfolio geography
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {loading
                ? "Loading map..."
                : `${properties.length} property location${properties.length !== 1 ? "s" : ""} on map`}
            </p>
          </div>
        </div>

       {/* Legend + zoom hint */}
{!loading && properties.length > 0 && (
  <div className="flex items-center gap-4 text-xs text-gray-500">
    <span className="hidden md:inline text-[11px] text-gray-400">
      Use +/− to zoom
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
      Verified
    </span>
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
      Pending
    </span>
  </div>
)}
      </div>

      {/* Body */}
      <div className="relative h-[420px] w-full">
        {loading || !MapComponents ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Couldn't load map data.
          </div>
        ) : properties.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7f3]">
              <MapPin size={22} className="text-[#22C55E]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                No mapped properties yet
              </p>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Add properties using the address suggestions to see them on the map.
              </p>
            </div>
          </div>
        ) : (
          <MapComponents.MapContainer
  center={INDIA_CENTER}
  zoom={DEFAULT_ZOOM}
  scrollWheelZoom={false}
  doubleClickZoom={true}
  className="h-full w-full"
  style={{ borderRadius: 0 }}
>
            <MapComponents.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {properties.map((p) => (
              <MapComponents.CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={getRadius(p.marketValue)}
                pathOptions={{
                  fillColor: getColor(p.verified),
                  fillOpacity: 0.75,
                  color: "#ffffff",
                  weight: 2,
                }}
              >
                <MapComponents.Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                  <div className="text-xs">
                    <p className="font-bold">{p.address}</p>
                    <p className="text-gray-500">{p.city}</p>
                  </div>
                </MapComponents.Tooltip>

                <MapComponents.Popup>
                  <div className="min-w-[180px] space-y-1.5 py-1">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {p.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[p.city, p.state].filter(Boolean).join(", ")}
                    </p>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                      <span className="text-sm font-black text-gray-900">
                        {formatINR(p.marketValue)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          p.verified
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/property-search?q=${encodeURIComponent(p.address)}`}
                      className="mt-1 flex items-center gap-1 text-xs font-bold text-[#16a34a] hover:gap-1.5 transition-all"
                    >
                      View details
                      <ArrowRight size={11} strokeWidth={2.5} />
                    </Link>
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