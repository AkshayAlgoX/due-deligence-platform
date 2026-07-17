"use client";

import { Bell, Search, Shield, Menu } from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  return (
    <header className="h-[68px] border-b bg-white px-6 flex items-center justify-between z-10 relative shadow-sm">

      <div className="flex items-center gap-10">

        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-700 transition">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center text-blue-500">
              <Shield className="fill-blue-500 text-white" size={28} />
            </div>

          <div>
            <h1 className="text-[17px] font-bold text-blue-500 tracking-tight">
                Real Estate Due Diligence Agent
            </h1>
          </div>

          </div>
        </div>

        <div className="relative">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />

          <input
            placeholder="Search properties or reports..."
            className="w-[420px] rounded-lg border-none bg-gray-100/80 pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition"
          />

        </div>

      </div>

      <div className="flex items-center gap-5">
        <div className="relative cursor-pointer">
          <Bell className="text-gray-600" size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right">
            <p className="font-bold text-sm text-gray-900 leading-tight">
              John Analyst
            </p>
            <p className="text-[13px] text-gray-500">
              Senior Appraiser
            </p>
          </div>

          <div className="relative">
            <img
              src="https://i.pravatar.cc/100"
              alt="John Analyst"
              className="h-10 w-10 rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </div>

    </header>
  );
}