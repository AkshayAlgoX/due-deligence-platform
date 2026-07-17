"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, ShieldCheck, Menu, LogOut, User, ChevronDown } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/utils/helpers";

export default function Navbar({ toggleSidebar }) {
  const { logout } = useAuth();

  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(getUser());
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const email = user?.email || "";
  const fullName = user?.fullName || email.split("@")[0] || "User";
  const role = user?.role
    ? user.role
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Signed In";

  const initials = (fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-[68px] border-b bg-white px-6 flex items-center justify-between z-10 relative shadow-sm">

      {/* ── LEFT: Logo + Search ── */}
      <div className="flex items-center gap-10">

        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-700 transition">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2">
            {/* Logo — now GREEN with ShieldCheck (matches login/register) */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E] shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-[17px] font-bold text-[#22C55E] tracking-tight">
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
            className="w-[420px] rounded-lg border-none bg-gray-100/80 pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-100 transition"
          />
        </div>
      </div>

      {/* ── RIGHT: Notifications + User Profile ── */}
      <div className="flex items-center gap-5">

        <div className="relative cursor-pointer">
          <Bell className="text-gray-600" size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile dropdown */}
        <div className="relative" ref={menuRef}>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gray-50"
          >
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900 leading-tight">
                {fullName}
              </p>
              <p className="text-[13px] text-gray-500">
                {role}
              </p>
            </div>

            <div className="relative">
              {/* Green gradient avatar */}
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <User size={16} className="text-gray-400" />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}