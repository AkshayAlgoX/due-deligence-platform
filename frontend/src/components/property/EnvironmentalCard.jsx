import {
  Wind,
  Layers,
  Factory,
  Leaf,
  Volume2,
} from "lucide-react";

const airQualityIndex = 42;
const soilType = "Loamy Clay";
const nearbyIndustrial = false;
const greenCoverPercent = 68;
const noiseLevel = "Low (Residential Zone)";

function getAqiStyle(aqi) {
  if (aqi <= 50) return "bg-green-100 text-green-700";
  if (aqi <= 100) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function EnvironmentalCard() {
  const aqiStyle = getAqiStyle(airQualityIndex);
  const greenCoverWidth = Math.max(0, Math.min(100, greenCoverPercent));

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

      <h2 className="font-bold text-lg">
        Environmental
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Air, soil and surrounding area conditions
      </p>

      <div className="space-y-5">

        <div className="flex gap-4 items-start justify-between">
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-green-100 p-2">
              <Wind size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Air Quality Index</p>
              <p className="font-semibold">{airQualityIndex}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${aqiStyle}`}>
            {airQualityIndex <= 50 ? "Good" : airQualityIndex <= 100 ? "Moderate" : "Poor"}
          </span>
        </div>

        <div className="flex gap-4 items-start">
          <div className="rounded-full bg-green-100 p-2">
            <Layers size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Soil Type</p>
            <p className="font-semibold">{soilType}</p>
          </div>
        </div>

        <div className="flex gap-4 items-start justify-between">
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-green-100 p-2">
              <Factory size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Nearby Industrial Activity</p>
              <p className="font-semibold">{nearbyIndustrial ? "Yes" : "No"}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              nearbyIndustrial ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            }`}
          >
            {nearbyIndustrial ? "Yes" : "No"}
          </span>
        </div>

        <div>
          <div className="flex gap-4 items-start">
            <div className="rounded-full bg-green-100 p-2">
              <Leaf size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Green Cover</p>
                <p className="font-semibold">{greenCoverWidth}%</p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${greenCoverWidth}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="rounded-full bg-green-100 p-2">
            <Volume2 size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Noise Level</p>
            <p className="font-semibold">{noiseLevel}</p>
          </div>
        </div>

      </div>

    </div>
  );
}