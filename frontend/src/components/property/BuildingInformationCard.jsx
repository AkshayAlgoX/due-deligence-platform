import {
  Hammer,
  CheckCircle2,
  Building2,
  BedDouble,
  Wind,
} from "lucide-react";

const rows = [
  {
    icon: Hammer,
    label: "Structure Type",
    value: "Wood Frame / Stucco",
  },
  {
    icon: CheckCircle2,
    label: "Condition",
    value: "Excellent (Renovated 2018)",
  },
  {
    icon: Building2,
    label: "Stories",
    value: "2 Story",
  },
  {
    icon: BedDouble,
    label: "Total Rooms",
    value: "9 (4 Bed, 3 Bath)",
  },
  {
    icon: Wind,
    label: "Heating/Cooling",
    value: "Central HVAC",
  },
];

export default function BuildingInformationCard() {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
      <h2 className="font-bold text-lg">
        Building Information
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Structural and utility specifications
      </p>

      <div className="space-y-5">

        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <div
              key={row.label}
              className="flex gap-4 items-start"
            >
              <div className="rounded-full bg-green-100 p-2">
                <Icon
                  size={16}
                  className="text-green-600"
                />
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  {row.label}
                </p>

                <p className="font-semibold">
                  {row.value}
                </p>
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}