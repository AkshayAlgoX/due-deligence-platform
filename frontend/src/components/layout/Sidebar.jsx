"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  FileText,
  Bell,
  ClipboardList,
  User,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard",           href: "/dashboard",                     icon: LayoutDashboard },
  { title: "Property Search",     href: "/dashboard/property-search",     icon: Search },
  { title: "Due Diligence",       href: "/dashboard/due-diligence",       icon: ShieldCheck },
  { title: "Risk Assessment",     href: "/dashboard/risk-assessment",     icon: AlertTriangle },
  { title: "Property Comparison", href: "/dashboard/property-comparison", icon: GitCompare },
  { title: "Reports",             href: "/dashboard/reports",             icon: FileText },
  { title: "Notifications",       href: "/dashboard/notifications",       icon: Bell },
  { title: "Audit Logs",          href: "/dashboard/audit-logs",          icon: ClipboardList },
  { title: "Profile",             href: "/dashboard/profile",             icon: User },
];

export default function Sidebar({ isOpen = true }) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isOpen ? "ml-0" : "-ml-64"
      }`}
    >

      {/* Navigation — extra padding so shadow doesn't get clipped */}
      <nav className="flex-1 px-4 py-6 whitespace-nowrap overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative mb-1.5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 overflow-hidden ${
                isActive
                  ? "bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white shadow-[0_6px_20px_rgba(34,197,94,0.35)]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {/* Shimmer on active hover */}
              {isActive && (
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1500ms] group-hover:translate-x-full" />
              )}

              {/* Icon */}
              <div className={`relative flex h-5 w-5 items-center justify-center transition-transform group-hover:scale-110 ${
                isActive ? "" : "text-gray-400 group-hover:text-[#22C55E]"
              }`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <span className="relative z-10 flex-1">{item.title}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}