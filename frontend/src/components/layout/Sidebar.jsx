"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  LifeBuoy,
} from "lucide-react";

const menuSections = [
  {
    label: "Main",
    items: [
      { title: "Dashboard",       href: "/dashboard",                 icon: LayoutDashboard, badge: null },
      { title: "Property Search", href: "/dashboard/property-search", icon: Search,          badge: null },
    ],
  },
  {
    label: "Analysis",
    items: [
      { title: "Due Diligence",       href: "/dashboard/due-diligence",       icon: ShieldCheck,    badge: null },
      { title: "Risk Assessment",     href: "/dashboard/risk-assessment",     icon: AlertTriangle,  badge: null },
      { title: "Property Comparison", href: "/dashboard/property-comparison", icon: GitCompare,     badge: null },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports",       href: "/dashboard/reports",       icon: FileText,      badge: null },
     { title: "Notifications", href: "/dashboard/notifications", icon: Bell,          badge: null },
      { title: "Audit Logs",    href: "/dashboard/audit-logs",    icon: ClipboardList, badge: null },
    ],
  },
  {
  label: "Account",
  items: [
    { title: "Profile", href: "/dashboard/profile", icon: User,      badge: null },
    { title: "Support", href: "/support",           icon: LifeBuoy,  badge: null },
  ],
},
];

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)  return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60)     return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)      return `${hrs}h ago`;
  return date.toLocaleDateString();
}

export default function Sidebar({ isOpen = true }) {
  const pathname = usePathname();
  const [sessionStart] = useState(() => new Date());
  const [, tick] = useState(0);

  // Re-render every 30s to update "session active" timer
  useEffect(() => {
    const interval = setInterval(() => tick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300 ease-in-out ${
        isOpen ? "ml-0" : "-ml-64"
      }`}
    >
      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {section.label}
            </p>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
  item.href === "/dashboard"
    ? pathname === "/dashboard"
    : item.href === "/support"
    ? pathname === "/support"
    : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`
                    group relative mb-1 flex items-center gap-3
                    rounded-lg px-3 py-2.5
                    text-sm font-semibold transition
                    ${isActive
                      ? "bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <div
                    className={`
                      flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                      transition-colors
                      ${isActive
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-white"
                      }
                    `}
                  >
                    <Icon
                      size={15}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isActive ? "text-white" : "text-gray-500 group-hover:text-[#22C55E]"}
                    />
                  </div>

                  <span className="flex-1 truncate">{item.title}</span>

                  {item.badge && (
                    <span
                      className={`
                        rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums
                        ${isActive
                          ? "bg-white/25 text-white"
                          : "bg-red-50 text-red-600"
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer — honest session info, not corporate filler ── */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            <span className="font-semibold text-gray-500 truncate">
              Session active · {timeAgo(sessionStart)}
            </span>
          </div>
          <span className="font-medium text-gray-400 flex-shrink-0 ml-2">v1.0</span>
        </div>
      </div>
    </aside>
  );
}