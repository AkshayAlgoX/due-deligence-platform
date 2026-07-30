"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ShieldCheck,
  Menu,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getUser } from "@/utils/helpers";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import CommandPalette from "@/components/CommandPalette";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar({ toggleSidebar }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setUser(getUser());
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPhone|iPad|iPod/.test(window.navigator.platform));
    }
    const handleUserUpdate = () => setUser(getUser());
    window.addEventListener("user-updated", handleUserUpdate);
    return () => window.removeEventListener("user-updated", handleUserUpdate);
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

  const handleLogoutClick = () => {
    setMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
  };

  const handlePaletteAction = (kind) => {
    if (kind === "logout") {
      setLogoutModalOpen(true);
    } else if (kind === "add-property") {
      router.push("/dashboard/property-search?action=add");
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
    <>
      <header className="h-[68px] border-b border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-6 flex items-center justify-between z-[1000] relative shadow-sm">
        <div className="flex items-center gap-10">
          {/* Sidebar toggle + brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-gray-700 dark:text-[#7d8590] dark:hover:text-[#e6edf3] transition"
              aria-label="Toggle sidebar"
            >
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

          {/* Command palette trigger */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
            className="
              group
              flex items-center gap-3
              w-[420px]
              rounded-xl
              border border-gray-100 dark:border-[#30363d]
              bg-gray-50/50 dark:bg-[#0d1117]
              pl-4 pr-2 py-2.5
              text-sm text-left
              outline-none
              transition-all
              hover:border-gray-200 dark:hover:border-[#484f58]
              hover:bg-white dark:hover:bg-[#1c2128]
              hover:shadow-sm
              focus:border-[#22C55E]
              focus:bg-white dark:focus:bg-[#1c2128]
              focus:ring-4 focus:ring-green-500/10
            "
          >
            <Search className="h-4 w-4 text-gray-400 dark:text-[#7d8590] group-hover:text-[#22C55E] transition-colors flex-shrink-0" />
            <span className="flex-1 text-gray-400 dark:text-[#7d8590] group-hover:text-gray-600 dark:group-hover:text-[#e6edf3] transition-colors truncate">
              Search pages, properties, actions...
            </span>
            <kbd className="
              flex-shrink-0
              flex items-center gap-0.5
              rounded-md border border-gray-200 dark:border-[#30363d]
              bg-white dark:bg-[#161b22]
              px-1.5 py-0.5
              text-[10px] font-mono font-semibold text-gray-500 dark:text-[#7d8590]
              shadow-sm
            ">
              <span className="text-[11px] leading-none">
                {isMac ? "⌘" : "Ctrl"}
              </span>
              <span className="text-[10px] leading-none">K</span>
            </kbd>
          </button>
        </div>

        {/* Right side: bell → ThemeToggle → divider → user menu */}
        <div className="flex items-center gap-3">

          {/* ── Notification bell — now navigates ── */}
          <button
            type="button"
            onClick={() => router.push("/dashboard/notifications")}
            className="relative cursor-pointer group flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-gray-50 dark:hover:bg-[#1c2128]"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell
              className="text-gray-600 dark:text-[#7d8590] group-hover:text-[#22C55E] transition"
              size={20}
            />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 dark:bg-[#30363d]" />

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-gray-50 dark:hover:bg-[#1c2128]"
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              <div className="text-right">
                <p className="font-bold text-sm text-gray-900 dark:text-[#e6edf3] leading-tight">
                  {fullName}
                </p>
                <p className="text-[12px] text-gray-500 dark:text-[#7d8590]">{role}</p>
              </div>

              <div className="relative">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={fullName}
                    className="h-10 w-10 rounded-full object-cover shadow-lg shadow-green-500/30 ring-2 ring-white dark:ring-[#161b22]"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`${
                    user?.profilePicture ? "hidden" : "flex"
                  } h-10 w-10 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] items-center justify-center text-white text-sm font-black shadow-lg shadow-green-500/30`}
                >
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#161b22] animate-pulse" />
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 dark:text-[#7d8590] transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-2xl z-[1001] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="border-b border-gray-100 dark:border-[#30363d] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-[#0d2818] dark:to-[#0d2818] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={fullName}
                        className="h-11 w-11 rounded-full object-cover shadow-lg shadow-green-500/30 ring-2 ring-white dark:ring-[#161b22] flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`${
                        user?.profilePicture ? "hidden" : "flex"
                      } h-11 w-11 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] items-center justify-center text-white text-sm font-black shadow-lg shadow-green-500/30 flex-shrink-0`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] truncate">
                        {fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#7d8590] truncate">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                  >
                    <User size={16} className="text-gray-400 dark:text-[#7d8590]" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-[#2d1214]"
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

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAction={handlePaletteAction}
      />
    </>
  );
}