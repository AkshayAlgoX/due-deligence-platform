import {
  User,
  Calendar,
  Hash,
  FileText,
  Home,
} from "lucide-react";

const rows = [
  {
    icon: User,
    label: "Primary Owner",
    value: "Simpson Family Trust",
  },
  {
    icon: Calendar,
    label: "Owner Since",
    value: "June 12, 1998",
  },
  {
    icon: Hash,
    label: "Parcel ID",
    value: "88-01-23-456-789",
  },
  {
    icon: FileText,
    label: "Legal Description",
    value: "Lot 24, Block 3, Evergreen Heights",
  },
  {
    icon: Home,
    label: "Property Use",
    value: "Residential - Single Family",
  },
];

export default function OwnershipCard() {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

      <h2 className="font-bold text-lg">
        Ownership Information
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Legal title holder details
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