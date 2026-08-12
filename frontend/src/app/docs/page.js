"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { Search, BookOpen, ArrowRight, FileText } from "lucide-react";
import { DOCS_CATEGORIES, DOCS_ARTICLES, searchArticles } from "@/lib/docsData";

export default function DocsIndexPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchArticles(query), [query]);

  return (
    <MarketingLayout>
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Documentation</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Everything you need to ship<br />
            <span className="text-white/40">due diligence at speed.</span>
          </h1>
          <p className="mt-4 text-[15px] text-white/50">
            Guides, API reference, and integration docs — written by the team that built the scoring engine.
          </p>
        </div>

        {/* Search */}
        <div className="mt-10 relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs… e.g. 'risk scoring', 'reports API', 'Cashfree'"
            className="w-full h-12 rounded-xl bg-white/[0.04] border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
        </div>

        {/* Search results */}
        {query.trim() && (
          <div className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.05]">
            {results.length === 0 ? (
              <p className="p-6 text-sm text-white/40">No articles match "{query}". Try "risk" or "export".</p>
            ) : (
              results.map((a) => (
                <Link
                  key={a.slug}
                  href={`/docs/${a.slug}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.03] transition group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-emerald-400/70" />
                    <span className="text-sm text-white/80 group-hover:text-white transition">{a.title}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-white/25 group-hover:text-emerald-400 transition" />
                </Link>
              ))
            )}
          </div>
        )}

        {/* Categories */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCS_CATEGORIES.map((cat) => {
            const articles = DOCS_ARTICLES.filter((a) => a.category === cat.slug);
            return (
              <div key={cat.slug} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-emerald-500/20 transition group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-[15px] font-semibold text-white">{cat.label}</h2>
                </div>
                <ul className="space-y-2.5">
                  {articles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/docs/${a.slug}`}
                        className="text-[13px] text-white/50 hover:text-emerald-400 transition inline-flex items-center gap-2"
                      >
                        <span className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-emerald-400 transition" />
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </MarketingLayout>
  );
}
