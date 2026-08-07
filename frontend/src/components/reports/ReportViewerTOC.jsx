"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  TrendingUp,
  Home,
  Activity,
  BarChart3,
  DollarSign,
  Sparkles,
  BookOpen,
} from "lucide-react";

const TOC_ITEMS = [
  { id: "COVER", labelKey: "report.sections.cover", icon: Shield },
  { id: "EXECUTIVE_SUMMARY", labelKey: "report.sections.executiveSummary", icon: TrendingUp },
  { id: "PROPERTY_OVERVIEW", labelKey: "report.sections.propertyOverview", icon: Home },
  { id: "RISK_ANALYSIS", labelKey: "report.sections.riskAnalysis", icon: Activity },
  { id: "COMPARABLE", labelKey: "report.sections.comparable", icon: BarChart3 },
  { id: "FINANCIAL", labelKey: "report.sections.financial", icon: DollarSign },
  { id: "RECOMMENDATIONS", labelKey: "report.sections.recommendations", icon: Sparkles },
  { id: "APPENDIX", labelKey: "report.sections.appendix", icon: BookOpen },
];

export default function ReportViewerTOC({ sections = [] }) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState("COVER");
  const observerRef = useRef(null);

  const presentIds = new Set(sections.map((s) => s.sectionType));
  const visibleItems = TOC_ITEMS.filter((item) => presentIds.has(item.id));

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          const id = intersecting[0].target.id.replace("section-", "");
          setActiveId(id);
        }
      },
      { rootMargin: "-80px 0px -50% 0px", threshold: 0 }
    );

    TOC_ITEMS.forEach((item) => {
      const el = document.getElementById(`section-${item.id}`);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [sections]);

  function scrollToSection(id) {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (visibleItems.length === 0) return null;

  return (
    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0">
      <div className="sticky top-[80px]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] mb-3 px-2">
          {t("report.viewer.toc")}
        </p>
        <nav className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left
                  transition-all duration-150 group
                  ${
                    isActive
                      ? "bg-gray-100 dark:bg-[#21262d] text-gray-900 dark:text-[#e6edf3]"
                      : "text-gray-500 dark:text-[#7d8590] hover:bg-gray-50 dark:hover:bg-[#21262d]/60 hover:text-gray-700 dark:hover:text-[#e6edf3]"
                  }
                `}
              >
                <Icon
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-colors duration-150 ${
                    isActive
                      ? "text-gray-700 dark:text-[#e6edf3]"
                      : "text-gray-400 dark:text-[#6e7681] group-hover:text-gray-500 dark:group-hover:text-[#7d8590]"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[12px] leading-tight transition-all duration-150 ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {t(item.labelKey)}
                </span>
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-gray-800 dark:bg-[#e6edf3] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}