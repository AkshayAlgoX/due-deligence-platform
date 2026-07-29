// frontend/src/app/support/page.jsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  Mail,
  Bug,
  Lightbulb,
  ChevronDown,
  Clock,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  Shield,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import BackButton from "@/components/BackButton";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "@/constants/faq";

const SUPPORT_EMAIL = "duedeligence8@gmail.com";

// ── Quick action tile ─────────────────────────────────────────────────────────

function QuickAction({ icon: Icon, title, description, subject, body }) {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

  return (
    <a
      href={mailto}
      className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm transition-all hover:border-[#22C55E]/40 dark:hover:border-[#22C55E]/60 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <h3 className="mt-4 text-base font-bold tracking-tight text-gray-900 dark:text-[#e6edf3]">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-[#7d8590] leading-relaxed">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#16a34a] group-hover:gap-2 transition-all">
        <span>Open email</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </div>
    </a>
  );
}

// ── FAQ item (accordion) ──────────────────────────────────────────────────────

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-100 dark:border-[#30363d] last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:bg-gray-50/60 dark:hover:bg-[#1c2128]/60 px-4 -mx-4 rounded-lg cursor-pointer group"
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#22C55E] mb-1.5">
            {item.category}
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3] leading-snug">
            {item.question}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 mt-1 text-gray-400 dark:text-[#6e7681] transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-[#e6edf3] ${
            isOpen ? "rotate-180 text-[#16a34a] dark:text-[#22C55E]" : ""
          }`}
          strokeWidth={2.5}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 -mx-4">
          <p className="text-sm text-gray-600 dark:text-[#7d8590] leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const [query, setQuery]         = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [openItems, setOpenItems] = useState(new Set());

  const filteredFAQ = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (activeCat !== "All" && item.category !== activeCat) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCat]);

  const toggleItem = (idx) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fffb] to-[#edf7f3] dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#0d1117]">

      {/* ── Back link ── */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <BackButton fallback="/login" />
      </div>

      {/* ── Hero with search ── */}
      <header className="mx-auto max-w-4xl px-6 pt-12 pb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/10">
          <LifeBuoy className="h-6 w-6 text-[#22C55E]" strokeWidth={2.2} />
        </div>

        <h1 className="mt-6 text-[42px] font-black tracking-tight text-gray-900 dark:text-[#e6edf3] leading-[1.1]">
          How can we help?
        </h1>

        <p className="mt-3 max-w-2xl text-base text-gray-600 dark:text-[#7d8590] leading-relaxed">
          Answers to common questions and direct ways to reach us. If you can't
          find what you need, email us and we'll respond within 48 hours on
          business days.
        </p>

        {/* Search bar */}
        <div className="mt-6 relative max-w-2xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#6e7681] pointer-events-none"
            strokeWidth={2.2}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, questions, features..."
            className="h-12 w-full rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] pl-11 pr-4 text-sm text-gray-900 dark:text-[#e6edf3] shadow-sm transition-all placeholder:text-gray-400 dark:placeholder:text-[#6e7681] focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
          />
        </div>

        {/* Status pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-[#0d2818] px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-700 dark:text-green-400">
            All systems operational
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 space-y-16">

        {/* ── Quick actions grid ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-8 rounded-full bg-[#22C55E]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#22C55E]">
              Get in touch
            </p>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
            Contact us directly
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-[#7d8590]">
            Choose the option that best fits — clicking opens your email client
            with a pre-filled subject line.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <QuickAction
              icon={MessageCircle}
              title="General question"
              description="Product help, account questions, or anything else that's not urgent."
              subject="Support request — Due Diligence Platform"
              body="Hi team,\n\nI have a question about:\n\n"
            />
            <QuickAction
              icon={Bug}
              title="Report a bug"
              description="Something not working as expected? Tell us what you saw and what you expected."
              subject="Bug report — Due Diligence Platform"
              body="What I did:\n\nWhat I expected:\n\nWhat actually happened:\n\nBrowser & version:\n\n"
            />
            <QuickAction
              icon={Lightbulb}
              title="Request a feature"
              description="Have an idea that would make the platform better? We read every message."
              subject="Feature request — Due Diligence Platform"
              body="I'd like to see:\n\nWhy this would help:\n\n"
            />
          </div>
        </section>

        {/* ── FAQ ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-8 rounded-full bg-[#22C55E]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#22C55E]">
              Knowledge base
            </p>
          </div>

          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
              Frequently asked questions
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] font-medium tabular-nums">
              {filteredFAQ.length} {filteredFAQ.length === 1 ? "article" : "articles"}
            </p>
          </div>

          {/* Category filter chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat("All")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeCat === "All"
                  ? "bg-[#22C55E] text-white shadow-sm"
                  : "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#7d8590] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
              }`}
            >
              All
            </button>
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  activeCat === cat
                    ? "bg-[#22C55E] text-white shadow-sm"
                    : "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] text-gray-600 dark:text-[#7d8590] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ list */}
          <div className="mt-6 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
            {filteredFAQ.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-[#1c2128] mb-3">
                  <Search className="h-5 w-5 text-gray-300 dark:text-[#484f58]" strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-[#e6edf3]">
                  No articles match your search
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590] max-w-xs">
                  Try different keywords or clear the filter to see all articles.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    `Support: ${query || "Question not in FAQ"}`
                  )}`}
                  className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#16a34a]"
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Email us this question
                </a>
              </div>
            ) : (
              <div className="px-6 py-2">
                {filteredFAQ.map((item, i) => (
                  <FAQItem
                    key={`${item.category}-${i}`}
                    item={item}
                    isOpen={openItems.has(`${item.category}-${i}`)}
                    onToggle={() => toggleItem(`${item.category}-${i}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Response time + Direct email cards ── */}
        <section>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Response time */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                  <Clock className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                    Response time
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                    Within 48 hours
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-[#7d8590] leading-relaxed">
                We respond to emails on business days (Mon–Fri).
                Complex issues may take longer — we'll always acknowledge
                receipt first.
              </p>
            </div>

            {/* Direct contact */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                  <Mail className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                    Direct email
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-[#e6edf3] tracking-tight">
                    Contact team
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0d1117] px-3.5 py-2.5 transition hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:border-gray-300 dark:hover:border-[#484f58]"
              >
                <code className="text-sm font-mono text-gray-900 dark:text-[#e6edf3]">
                  {SUPPORT_EMAIL}
                </code>
              </a>
            </div>
          </div>
        </section>

        {/* ── Related resources ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-8 rounded-full bg-[#22C55E]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#22C55E]">
              Related
            </p>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
            More resources
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/security"
              className="group flex items-start gap-3 rounded-xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-sm transition-all hover:border-[#22C55E]/40 dark:hover:border-[#22C55E]/60 hover:shadow-md"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
                <Shield className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">Security</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590] leading-relaxed">
                  How we protect your data — full disclosure of what's built and
                  what's planned.
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 dark:text-[#484f58] group-hover:text-[#22C55E] flex-shrink-0 mt-1" />
            </Link>

            <a
              href="https://github.com/springboardmentor198/team-03"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-sm transition-all hover:border-[#22C55E]/40 dark:hover:border-[#22C55E]/60 hover:shadow-md"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
                <BookOpen className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">Source code</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590] leading-relaxed">
                  Open-source on GitHub. Report issues, read the code, or
                  contribute.
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 dark:text-[#484f58] group-hover:text-[#22C55E] flex-shrink-0 mt-1" />
            </a>
          </div>
        </section>

        {/* ── Honest footer note ── */}
        <div className="border-t border-gray-100 dark:border-[#30363d] pt-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-gray-400 dark:text-[#6e7681] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 dark:text-[#6e7681] leading-relaxed">
              This support page is not a live chat, ticket system, or automated
              helpdesk. It's a direct line to the team that built the platform.
              We read every email and reply personally.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}