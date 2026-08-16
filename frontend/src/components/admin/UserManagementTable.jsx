"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, Ban, ShieldCheck, Search, ChevronLeft, ChevronRight, MoreHorizontal, Check, ChevronDown, UserX, Users as UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

const ROLES = [
  { value: "BUYER", label: "Buyer", color: "blue" },
  { value: "REAL_ESTATE_AGENT", label: "Real Estate Agent", color: "purple" },
  { value: "LEGAL_REVIEWER", label: "Legal Reviewer", color: "amber" },
  { value: "FINANCIAL_INSTITUTION", label: "Financial Institution", color: "emerald" },
  { value: "ADMIN", label: "Admin", color: "rose" },
];

const roleColorMap = {
  blue:    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  purple:  "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  amber:   "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  rose:    "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function getAvatarColor(name) {
  if (!name) return "from-gray-400 to-gray-500";
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-blue-600",
    "from-fuchsia-500 to-purple-600",
    "from-amber-500 to-orange-600",
    "from-lime-500 to-green-600",
  ];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function RolePill({ role, onChange, userId }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const roleData = ROLES.find(r => r.value === role) ?? ROLES[0];

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all hover:opacity-80 ${roleColorMap[roleData.color]}`}
      >
        {roleData.label}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-56 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-xl overflow-hidden">
          {ROLES.map((r) => {
            const active = r.value === role;
            return (
              <button
                key={r.value}
                onClick={() => {
                  onChange(userId, r.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm text-left transition-colors ${
                  active
                    ? "bg-gray-50 dark:bg-[#1c2128]"
                    : "hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${roleColorMap[r.color].split(" ")[0].replace("/10", "")}`} />
                  <span className="text-gray-900 dark:text-[#e6edf3] font-medium">{r.label}</span>
                </div>
                {active && <Check size={14} className="text-emerald-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ user }) {
  const isBanned = user.isBanned;
  const isActive = user.isActive !== false;

  if (isBanned) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 px-2.5 py-1 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Banned
      </span>
    );
  }
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-600 dark:text-gray-400 px-2.5 py-1 text-xs font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  );
}

export default function UserManagementTable({
  users,
  loading,
  search,
  setSearch,
  setPage,
  page,
  totalPages,
  onRoleChange,
  onAction,
  onView,
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");

  const filteredUsers = users.filter(u => {
    if (filter === "active") return u.isActive !== false && !u.isBanned;
    if (filter === "banned") return u.isBanned;
    return true;
  });

  const counts = {
    all: users.length,
    active: users.filter(u => u.isActive !== false && !u.isBanned).length,
    banned: users.filter(u => u.isBanned).length,
  };

  return (
    <div className="space-y-5">
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-[#e6edf3] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-1">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "banned", label: "Banned" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2128]"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${filter === f.key ? "text-indigo-100" : "text-gray-400"}`}>
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-gray-200/70 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden">
               {loading && users.length === 0 ? (
          <div className="p-6 space-y-3">
            {[0,1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={UserX}
              title="No users found"
              description="Try adjusting your search or filter."
            />
          </div>
        ) : (
                   <div className="relative overflow-x-auto">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-[#161b22]/60 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-full bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] px-4 py-2 shadow-lg">
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-[#e6edf3]">Loading...</span>
                </div>
              </div>
            )}
            <table className={`w-full transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/50">
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">User</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">Role</th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">Status</th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-[#1c2128]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${getAvatarColor(u.fullName)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                          {getInitials(u.fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] truncate">{u.fullName}</div>
                          <div className="text-xs text-gray-500 dark:text-[#7d8590] truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RolePill role={u.role} onChange={onRoleChange} userId={u.id} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge user={u} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => onView(u.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] hover:bg-gray-50 dark:hover:bg-[#1c2128] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition-all"
                        >
                          <Eye size={13} />
                          View
                        </button>
                        <button
                          onClick={() => onAction({ user: u, action: u.isBanned ? "unban" : "ban" })}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            u.isBanned
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20"
                          }`}
                        >
                          {u.isBanned ? <ShieldCheck size={13} /> : <Ban size={13} />}
                          {u.isBanned ? "Unban" : "Ban"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/30 dark:bg-[#0d1117]/30">
            <div className="text-xs text-gray-500 dark:text-[#7d8590]">
              Page <span className="font-semibold text-gray-900 dark:text-[#e6edf3]">{page + 1}</span> of <span className="font-semibold text-gray-900 dark:text-[#e6edf3]">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] hover:bg-gray-50 dark:hover:bg-[#1c2128] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] hover:bg-gray-50 dark:hover:bg-[#1c2128] disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-[#e6edf3] transition"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}