"use client";

import { BadgeCheck, MapPin, Ruler, LandPlot, Calendar, Home } from "lucide-react";

export default function PropertyCard() {
  return (
    <div className="mt-6 rounded-2xl border bg-white shadow-sm overflow-hidden">

      <div className="grid grid-cols-12">

        {/* Left Image */}
        <div className="col-span-4">
          <div className="relative h-full min-h-[360px]">

            <img
                src="https://images.unsplash.com/photo-1460317442991-0ec209397118?w=900"
                alt="Property"
                className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow flex items-center gap-2">
              <BadgeCheck className="text-green-600" size={14} />
              Verified Property
            </div>

          </div>
        </div>

        {/* Right */}
        <div className="col-span-8 p-8">

          <p className="text-green-600 font-semibold text-sm uppercase">
            Single Family Residence
          </p>

          <div className="mt-2 flex justify-between">

            <div>

              <h2 className="text-[42px] leading-[48px] font-extrabold">
                742 Evergreen Terrace,
                <br />
                Springfield, OR 97477
              </h2>

            </div>

            <div className="text-right">

              <p className="text-[56px] font-extrabold">
                $1,450,000
              </p>

              <p className="text-gray-500">
                Estimated Market Value
              </p>

            </div>

          </div>

          {/* Stats */}

          <div className="mt-10 grid grid-cols-4 gap-10 border-t pt-8">

            <div>
              <Ruler className="mb-2 text-gray-500" size={18} />
              <p className="text-gray-500 text-xs uppercase">
                Square Footage
              </p>
              <h3 className="font-bold text-xl">
                3,250 sqft
              </h3>
            </div>

            <div>
              <LandPlot className="mb-2 text-gray-500" size={18} />
              <p className="text-gray-500 text-xs uppercase">
                Lot Size
              </p>
              <h3 className="font-bold text-xl">
                0.45 Acres
              </h3>
            </div>

            <div>
              <Calendar className="mb-2 text-gray-500" size={18} />
              <p className="text-gray-500 text-xs uppercase">
                Year Built
              </p>
              <h3 className="font-bold text-xl">
                1994
              </h3>
            </div>

            <div>
              <Home className="mb-2 text-gray-500" size={18} />
              <p className="text-gray-500 text-xs uppercase">
                Zoning
              </p>
              <h3 className="font-bold text-xl">
                R-1
              </h3>
            </div>

          </div>

          {/* Buttons */}

          <div className="mt-10 flex gap-5 border-t pt-8">

            <button className="rounded-xl border px-6 py-3 hover:bg-gray-100">
              Compare Property
            </button>

            <button className="rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700">
              Generate Due Diligence Report
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}