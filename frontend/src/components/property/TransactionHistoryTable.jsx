const data = [
  ["Oct 15, 2021", "Listed for Sale", "$1,495,000", "MLS"],
  ["Jun 12, 1998", "Sold", "$425,000", "County Records"],
  ["May 01, 1998", "Listed for Sale", "$435,000", "MLS"],
  ["Jan 20, 1994", "New Construction", "N/A", "Permit Dept"],
];

export default function TransactionHistoryTable() {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

      <h2 className="font-bold text-lg">
        Transaction History
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Sales, listings and recording timeline
      </p>

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b hover:bg-gray-50 transition">

            <th className="text-left py-3">Date</th>
            <th className="text-left">Event</th>
            <th className="text-left">Price</th>
            <th className="text-left">Source</th>

          </tr>

        </thead>

        <tbody>

          {data.map((row) => (
            <tr
              key={row[0]}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="py-4">{row[0]}</td>
              <td>{row[1]}</td>

              <td className="font-semibold text-green-600">
                {row[2]}
              </td>

              <td>{row[3]}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}