"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  Bookmark,
  Settings,
} from "lucide-react";

import { getUser } from "@/utils/helpers";

const ROUTE_ROLES = {
  "/dashboard":                     ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/property-search":     ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/due-diligence":       ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/risk-assessment":     ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/property-comparison": ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/saved-comparisons":   ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/reports":             ["REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/notifications":       ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/audit-logs":          ["ADMIN"],
  "/dashboard/profile":             ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/settings":            ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/support":                       ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
};

function canAccess(href, role) {
  if (!role) return true;
  const allowed = ROUTE_ROLES[href];
  if (!allowed) return true;
  return allowed.includes(role);
}

// ─── Key-based config (no hardcoded strings — resolved via t() inside component) ───
const MENU_SECTION_CONFIGS = [
  {
    sectionKey: "nav.sections.main",
    items: [
      { titleKey: "nav.dashboard",      href: "/dashboard",                  icon: LayoutDashboard, badge: null },
      { titleKey: "nav.propertySearch", href: "/dashboard/property-search",  icon: Search,          badge: null },
    ],
  },
  {
    sectionKey: "nav.sections.analysis",
    items: [
      { titleKey: "nav.dueDiligence",       href: "/dashboard/due-diligence",       icon: ShieldCheck,   badge: null },
      { titleKey: "nav.riskAssessment",     href: "/dashboard/risk-assessment",     icon: AlertTriangle, badge: null },
      { titleKey: "nav.propertyComparison", href: "/dashboard/property-comparison", icon: GitCompare,    badge: null },
      { titleKey: "nav.savedComparisons",   href: "/dashboard/saved-comparisons",   icon: Bookmark,      badge: null },
    ],
  },
  {
    sectionKey: "nav.sections.insights",
    items: [
      { titleKey: "nav.reports",       href: "/dashboard/reports",       icon: FileText,      badge: null },
      { titleKey: "nav.notifications", href: "/dashboard/notifications", icon: Bell,          badge: null },
      { titleKey: "nav.auditLogs",     href: "/dashboard/audit-logs",    icon: ClipboardList, badge: null },
    ],
  },
  {
    sectionKey: "nav.sections.account",
    items: [
      { titleKey: "nav.profile",  href: "/dashboard/profile",  icon: User,     badge: null },
      { titleKey: "nav.settings", href: "/dashboard/settings", icon: Settings, badge: null },
      { titleKey: "nav.support",  href: "/support",            icon: LifeBuoy, badge: null },
    ],
  },
];

function timeAgo(date, t) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return t("common.justNow");
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return t("common.minutesAgo", { n: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("common.hoursAgo", { n: hrs });
  return date.toLocaleDateString();
}

export default function Sidebar({ isOpen = true, onClose }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sessionStart] = useState(() => new Date());
  const [, tick] = useState(0);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const user = getUser();
    setUserRole(user?.role ?? "");
  }, []);

  useEffect(() => {
    const interval = setInterval(() => tick((prev) => prev + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile backdrop (stays dark in both themes) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      )}

      <aside
        className={`w-64 fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto bg-white dark:bg-[#161b22] border-r border-gray-100 dark:border-[#30363d] flex flex-col h-full transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {MENU_SECTION_CONFIGS.map((section) => {
            const visibleItems = section.items.filter((item) =>
              canAccess(item.href, userRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.sectionKey} className="mb-5">
                <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                  {t(section.sectionKey)}
                </p>

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : item.href === "/support"
                      ? pathname === "/support"
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.titleKey}
                      href={item.href}
                      onClick={() => {
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          onClose?.();
                        }
                      }}
                      className={`
                        group relative mb-1 flex items-center gap-3
                        rounded-lg px-3 py-2.5
                        text-sm font-semibold transition
                        ${isActive
                          ? "bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-[#7d8590] dark:hover:bg-[#1c2128] dark:hover:text-[#e6edf3]"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                          transition-colors
                          ${isActive
                            ? "bg-white/20"
                            : "bg-gray-100 group-hover:bg-white dark:bg-[#1c2128] dark:group-hover:bg-[#30363d]"
                          }
                        `}
                      >
                        <Icon
                          size={15}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={
                            isActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-[#22C55E] dark:text-[#7d8590] dark:group-hover:text-[#22C55E]"
                          }
                        />
                      </div>

                      <span className="flex-1 truncate">{t(item.titleKey)}</span>

                      {item.badge && (
                        <span
                          className={`
                            rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums
                            ${isActive
                              ? "bg-white/25 text-white"
                              : "bg-red-50 text-red-600 dark:bg-[#2d1214] dark:text-red-400"
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
            );
          })}
        </nav>

        <div className="border-t border-gray-100 dark:border-[#30363d] px-4 py-3">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              <span className="font-semibold text-gray-500 dark:text-[#7d8590] truncate">
                {t("nav.sessionActive")} · {timeAgo(sessionStart, t)}
              </span>
            </div>
            <span className="font-medium text-gray-400 dark:text-[#6e7681] flex-shrink-0 ml-2">
              {t("nav.version")}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}