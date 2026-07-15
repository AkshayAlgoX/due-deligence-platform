const data = [
  ["2023", "$1,380,000", "$14,250", "Paid"],
  ["2022", "$1,320,000", "$13,800", "Paid"],
  ["2021", "$1,260,000", "$13,100", "Paid"],
  ["2020", "$1,180,000", "$12,450", "Paid"],
  ["2019", "$1,120,000", "$11,900", "Paid"],
];

export default function TaxHistoryTable() {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

      <h2 className="font-bold text-lg">
        Tax Assessment History
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Historical tax data
      </p>

      <table className="w-full text-sm">

        <thead>

          <tr className="border-b text-gray-500">

            <th className="text-left py-3">Year</th>
            <th className="text-left">Assessed Value</th>
            <th className="text-left">Tax Amount</th>
            <th>Status</th>

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
              <td>{row[2]}</td>

              <td className="text-center">

                <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                  {row[3]}
                </span>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}