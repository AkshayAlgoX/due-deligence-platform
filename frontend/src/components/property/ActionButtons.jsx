import { ShieldCheck, ArrowRight } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-white shadow">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-full bg-white/20 p-3">
            <ShieldCheck size={24} />
          </div>

          <div>

            <h2 className="text-xl font-bold">
              Ready for Deep Analysis?
            </h2>

            <p className="mt-1 text-sm text-green-100">
              Generate a complete Due Diligence Report including ownership,
              tax history, zoning and environmental risks.
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-green-600 shadow hover:bg-gray-100">

          Start Due Diligence Report

          <ArrowRight size={18} />

        </button>

      </div>

    </div>
  );
}