"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { ChevronRight, Menu, X, ArrowLeft, ExternalLink } from "lucide-react";
import { DOCS_CATEGORIES, DOCS_ARTICLES, getArticleBySlug } from "@/lib/docsData";

export default function DocsArticlePage({ params }) {
  const { slug } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const article = getArticleBySlug(slug);
  const category = article
    ? DOCS_CATEGORIES.find((c) => c.slug === article.category)
    : null;

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [slug]);

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex gap-10">
        {/* ── Sidebar ── */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 flex-shrink-0 bg-[#0a0a0a] lg:bg-transparent border-r border-white/[0.06] lg:border-0 transform transition-transform duration-200 lg:transform-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 overflow-y-auto pt-20 lg:pt-8 pb-8 px-4 lg:px-0`}
        >
          <nav className="space-y-8">
            {DOCS_CATEGORIES.map((cat) => {
              const articles = DOCS_ARTICLES.filter((a) => a.category === cat.slug);
              return (
                <div key={cat.slug}>
                  <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/30 mb-3 px-2">
                    {cat.label}
                  </p>
                  <ul className="space-y-0.5">
                    {articles.map((a) => {
                      const active = a.slug === slug;
                      return (
                        <li key={a.slug}>
                          <Link
                            href={`/docs/${a.slug}`}
                            className={`block px-2 py-1.5 rounded-md text-[13px] transition ${
                              active
                                ? "text-emerald-400 bg-emerald-500/[0.08] font-medium"
                                : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                            }`}
                          >
                            {a.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-5 right-5 z-50 h-11 w-11 rounded-full bg-emerald-500 text-[#0a0a0a] flex items-center justify-center shadow-lg shadow-emerald-500/40"
            aria-label="Open docs menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {article ? (
            <article className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-[12px] text-white/35 mb-6">
                <Link href="/docs" className="hover:text-white transition inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Docs
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/60">{category?.label}</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{article.title}</h1>
              <p className="mt-3 text-[12px] text-white/30">Last updated {article.updated}</p>

              <div className="mt-10 prose prose-invert max-w-none
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-10 [&_h3]:mb-3
                [&_p]:text-[14px] [&_p]:leading-[1.75] [&_p]:text-white/60 [&_p]:mb-4
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:text-[14px] [&_ul]:text-white/60
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_ol]:mb-4 [&_ol]:text-[14px] [&_ol]:text-white/60
                [&_li]:leading-[1.7]
                [&_strong]:text-white/90
                [&_code]:text-[13px] [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-emerald-300 [&_code]:font-mono
                [&_pre]:bg-white/[0.03] [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-xl [&_pre]:p-5 [&_pre]:mb-5 [&_pre]:overflow-x-auto
                [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed [&_pre_code]:text-white/75 [&_pre_code]:whitespace-pre
                [&_table]:w-full [&_table]:text-[13px] [&_table]:mb-5 [&_table]:border-collapse
                [&_th]:text-left [&_th]:text-white/45 [&_th]:font-medium [&_th]:px-3 [&_th]:py-2 [&_th]:border-b [&_th]:border-white/[0.08]
                [&_td]:px-3 [&_td]:py-2.5 [&_td]:border-b [&_td]:border-white/[0.05] [&_td]:text-white/65"
              >
                {article.body}
              </div>
            </article>
          ) : (
            <div className="max-w-lg">
              <h1 className="text-3xl font-bold text-white">Article not found</h1>
              <p className="mt-3 text-sm text-white/50">
                This article doesn't exist. Browse the docs index to find what you're looking for.
              </p>
              <Link
                href="/docs"
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-5 text-sm font-semibold text-[#0a0a0a] transition"
              >
                <ExternalLink className="h-4 w-4" /> Back to docs
              </Link>
            </div>
          )}
        </div>
      </div>
    </MarketingLayout>
  );
}
