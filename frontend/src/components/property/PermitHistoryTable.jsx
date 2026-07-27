const data = [
  ["Renovation Permit", "Approved", "Mar 04, 2018", "Mar 04, 2019", "City Building Dept"],
  ["Electrical Permit", "Approved", "Feb 18, 2018", "Feb 18, 2019", "City Building Dept"],
  ["Solar Panel Installation", "Pending", "Jan 09, 2024", "Jan 09, 2025", "County Permit Office"],
  ["Fence Installation", "Expired", "May 22, 2015", "May 22, 2016", "City Building Dept"],
];

const statusStyles = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Expired: "bg-gray-100 text-gray-600",
};

export default function PermitHistoryTable() {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

      <h2 className="font-bold text-lg">
        Permit History
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Building and construction permits on record
      </p>

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b text-gray-500">

            <th className="text-left py-3">Permit Type</th>
            <th className="text-left">Issue Date</th>
            <th className="text-left">Expiry</th>
            <th className="text-left">Authority</th>
            <th className="text-center">Status</th>

          </tr>

        </thead>

        <tbody>

          {data.map((row) => (
            <tr
              key={row[0]}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="py-4">{row[0]}</td>
              <td>{row[2]}</td>
              <td>{row[3]}</td>
              <td>{row[4]}</td>

              <td className="text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[row[1]] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {row[1]}
                </span>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}