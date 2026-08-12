"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { CheckCircle2, Loader2, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "enterprise", label: "Enterprise sales" },
  { value: "technical", label: "Technical support" },
  { value: "billing", label: "Billing" },
  { value: "partnership", label: "Partnership" },
];

const TESTIMONIALS = [
  {
    quote: "We ran 47 property verifications through this platform before our last acquisition. The risk breakdown caught a tax-lien issue our lawyers missed.",
    name: "Priya Raghavan",
    role: "Head of Investments, Meridian Capital Advisors",
  },
  {
    quote: "Their team replied to our enterprise enquiry within 3 hours and had us onboarded with a custom integration in a week.",
    name: "Arjun Mehta",
    role: "CTO, Brickfolio Technologies",
  },
];

export default function ContactPage() {
  const searchParams = useSearchParams();
  const urlTopic = searchParams.get("topic");

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    topic: TOPICS.some((t) => t.value === urlTopic) ? urlTopic : "general",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (urlTopic && TOPICS.some((t) => t.value === urlTopic)) {
      setForm((prev) => ({ ...prev, topic: urlTopic }));
    }
  }, [urlTopic]);

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) next.name = "Enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid work email";
    if (!form.message.trim() || form.message.trim().length < 10) next.message = "Tell us a bit more (min 10 characters)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to send message");
      }
      setSubmitted(true);
    } catch (err) {
      toast.error("Couldn't send your message", {
        description: err.message || "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketingLayout>
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-8">
        <div className="max-w-2xl">
          <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">
            Contact us
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Talk to a human who<br />
            <span className="text-white/40">understands property risk.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/50 max-w-xl">
            No ticket queues, no canned replies. Every message goes straight to the
            engineering and due-diligence teams in Bengaluru — we reply within 24 hours on business days.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-10 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-white">Message received</h2>
                <p className="mt-2 text-sm text-white/50 max-w-sm leading-relaxed">
                  Thanks, {form.name.split(" ")[0]}. Your message is with our team — expect a
                  reply at <span className="text-white/80">{form.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-emerald-400 hover:text-emerald-300 transition inline-flex items-center gap-1.5"
                >
                  Send another message <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/10 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    {errors.name && <p className="mt-1.5 text-[12px] text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-2">Work email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/10 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    {errors.email && <p className="mt-1.5 text-[12px] text-red-400">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-2">Company <span className="text-white/25">(optional)</span></label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="Company or firm"
                      className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/10 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-2">Topic</label>
                    <select
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="w-full h-11 rounded-lg bg-white/[0.04] border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition appearance-none [&>option]:bg-[#0a0a0a]"
                    >
                      {TOPICS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-white/60 mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="What can we help with? Property verification, enterprise API access, a specific risk report…"
                    rows={6}
                    className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                  />
                  {errors.message && <p className="mt-1.5 text-[12px] text-red-400">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 text-sm font-semibold text-[#0a0a0a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send message <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">Office</p>
                  <p className="text-[13px] text-white/50 leading-relaxed mt-1">
                    HSR Layout, Sector 3<br />Bengaluru, Karnataka 560102<br />India
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">Email</p>
                  <a href="mailto:support@redd.in" className="text-[13px] text-emerald-400 hover:text-emerald-300 transition mt-1 inline-block">
                    support@redd.in
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">Response time</p>
                  <p className="text-[13px] text-white/50 leading-relaxed mt-1">
                    Within 24 hours on business days.<br />Enterprise customers: 4-hour SLA.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-6">
              <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-white/30">
                What customers say
              </p>
              {TESTIMONIALS.map((t, i) => (
                <blockquote key={i} className="space-y-3">
                  <p className="text-[13px] leading-relaxed text-white/60">"{t.quote}"</p>
                  <footer>
                    <p className="text-[13px] font-semibold text-white">{t.name}</p>
                    <p className="text-[12px] text-white/40">{t.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
