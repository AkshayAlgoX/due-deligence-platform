"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, ShieldCheck, Menu, LogOut, User, ChevronDown } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/utils/helpers";

export default function Navbar({ toggleSidebar }) {
  const router = useRouter();
  const { logout } = useAuth();

  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Global search handler ──────────────────────────────────────────────
  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/property-search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

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
    <header className="h-[68px] border-b border-gray-100 bg-white px-6 flex items-center justify-between z-10 relative shadow-sm">

      {/* LEFT: Logo + Search */}
      <div className="flex items-center gap-10">

        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-700 transition">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/30">
              <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-[17px] font-black tracking-tight bg-gradient-to-r from-[#22C55E] to-[#16a34a] bg-clip-text text-transparent">
              Real Estate Due Diligence Agent
            </h1>
          </div>
        </div>

        {/* Global search — NOW FUNCTIONAL */}
        <form onSubmit={handleGlobalSearch} className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties or reports..."
            className="w-[420px] rounded-xl border border-gray-100 bg-gray-50/50 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:bg-white focus:ring-4 focus:ring-green-500/10 transition"
          />
          {searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
              Press Enter ↵
            </span>
          )}
        </form>
      </div>

      {/* RIGHT: Notifications + User Profile */}
      <div className="flex items-center gap-5">

        <button className="relative cursor-pointer group">
          <Bell className="text-gray-600 group-hover:text-[#22C55E] transition" size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile dropdown */}
        <div className="relative" ref={menuRef}>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-gray-50"
          >
            <div className="text-right">
              <p className="font-bold text-sm text-gray-900 leading-tight">
                {fullName}
              </p>
              <p className="text-[12px] text-gray-500">
                {role}
              </p>
            </div>

            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center text-white text-sm font-black shadow-lg shadow-green-500/30">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

              <div className="border-b border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center text-white text-sm font-black shadow-lg shadow-green-500/30 flex-shrink-0">
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
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
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
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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