"use client";

import { Bell, Search, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-[68px] border-b bg-white px-6 flex items-center justify-between">

      <div className="flex items-center gap-10">

        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
            <Shield className="text-white" size={20} />
          </div>

          <div>
            <h1 className="text-[15px] font-semibold text-[#22C55E]">
                Real Estate Due Diligence Agent
            </h1>
          </div>

        </div>

        <div className="relative">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            placeholder="Search properties or reports..."
            className="w-[360px] rounded-full border bg-gray-50 pl-11 pr-4 py-3 outline-none"
          />

        </div>

      </div>

      <div className="flex items-center gap-6">

        <Bell className="text-gray-500" />

        <div className="text-right">
          <p className="font-semibold">
            John Analyst
          </p>

          <p className="text-sm text-gray-500">
            Senior Appraiser
          </p>
        </div>

        <img
          src="https://i.pravatar.cc/100"
          alt=""
          className="h-11 w-11 rounded-full"
        />

      </div>

    </header>
  );
}