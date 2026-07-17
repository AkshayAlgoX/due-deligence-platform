"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { loginUser } from "@/services/authService";
import GuestGuard from "@/components/GuestGuard";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Globe,
  Headphones,
  CheckCircle,
  Loader2,
} from "lucide-react";

function LoginPageInner() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // ── Main login handler ─────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser({ email, password, rememberMe });
      toast.success("Welcome back! Redirecting to dashboard…");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Feature-coming-soon handlers (professional UX) ─────────────────────────
  const handleForgotPassword = () => {
    toast.info(
      "Password reset via email is coming soon. Please contact support for now.",
      { duration: 4000 }
    );
  };

  const handleSSOLogin = () => {
    toast.info(
      "Single Sign-On (Google & Microsoft) is coming soon. Please use email & password for now.",
      { duration: 4000 }
    );
  };

  const handleContactSupport = () => {
    // Opens user's default email client
    const subject = encodeURIComponent(
      "Support Request — Real Estate Due Diligence Agent"
    );
    const body = encodeURIComponent(
      "Hi Support Team,\n\nI need help with:\n\n\n---\nSent from the login page"
    );
    window.location.href = `mailto:duedeligence8@gmail.com?subject=${subject}&body=${body}`;

    toast.success("Opening your email client…");
  };

  return (
    <main className="h-screen overflow-hidden bg-[#edf7f3]">
      <div className="mx-auto flex h-screen max-w-[1600px] overflow-hidden bg-white">

        {/* Left Section */}
        <section className="flex w-full flex-col items-center bg-[#f8fffb] px-8 py-6 lg:w-[40%]">

          <div className="flex w-full max-w-[420px] flex-col">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E] shadow-md">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-[18px] font-extrabold tracking-tight text-[#22C55E]">
                Real Estate Due Diligence Agent
              </h1>
            </div>

            {/* Welcome */}
            <div className="mt-5">
              <h2 className="text-[36px] font-black leading-[40px] tracking-tight text-[#111827]">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm leading-5 text-gray-500">
                Sign in to manage your property portfolio risks.
              </p>
            </div>

            {/* Login form */}
            <form
              onSubmit={handleLogin}
              className="mt-4 w-full rounded-[28px] border border-white bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" htmlFor="email">
                  Professional Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-10 rounded-xl border-gray-200 pl-10 text-sm focus-visible:ring-2 focus-visible:ring-green-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-green-500 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 rounded-xl border-gray-200 pl-10 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="mt-4 flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <label htmlFor="rememberMe" className="cursor-pointer text-xs text-gray-600">
                  Remember this device for 30 days
                </label>
              </div>

              {/* Submit — spinner keeps button size fixed */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#22C55E] text-sm font-bold shadow-[0_12px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-[1.02] hover:bg-[#16a34a] disabled:opacity-70 disabled:hover:scale-100"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In to Platform
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="my-4 flex items-center">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="mx-3 text-[10px] text-gray-500">OR CONTINUE WITH</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              {/* Secondary buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSSOLogin}
                  className="h-10 rounded-xl border-gray-200 bg-white text-xs transition hover:bg-gray-50"
                >
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                  SSO Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleContactSupport}
                  className="h-10 rounded-xl border-gray-200 bg-white text-xs transition hover:bg-gray-50"
                >
                  <Headphones className="mr-1.5 h-3.5 w-3.5" />
                  Contact Support
                </Button>
              </div>
            </form>

            {/* Register link */}
            <div className="mt-3 text-center text-xs text-gray-600">
              New to the platform?
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="ml-1 font-semibold text-green-500 hover:underline"
              >
                Create a Free Account
              </button>
            </div>

            {/* Features */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-xs">Comprehensive Property Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-xs">Secure Due Diligence Auditing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="text-xs">Automated Risk Assessment</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-gray-200 pt-3 text-[10px] uppercase tracking-widest text-gray-400">
              <p>Enterprise Grade Compliance & Security</p>
              <p className="mt-1">ISO 27001 Certified • SOC2 Type II Compliant</p>
            </div>

          </div>
        </section>

        {/* Right Section — building image */}
        <section className="relative hidden overflow-hidden rounded-l-3xl lg:block lg:w-[60%]">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
            alt="Modern glass skyscraper"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-900/70 via-sky-700/50 to-blue-500/40" />

          <div className="absolute right-8 top-8 rounded-full border border-white/30 bg-white/10 px-6 py-2 text-xs font-bold tracking-widest text-white backdrop-blur-md">
            SYSTEM ONLINE
          </div>

          <div className="absolute bottom-8 left-8 w-[420px] rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-2xl">
            <h2 className="text-2xl font-bold">Trusted Intelligence</h2>
            <p className="mt-3 text-sm text-white/90">
              Empowering over 2,500 real estate institutions worldwide with actionable due diligence.
            </p>
            <div className="mt-6 flex justify-between">
              <div>
                <h3 className="text-2xl font-bold">98%</h3>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/70">Accuracy</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">12M+</h3>
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/70">Reports</p>
              </div>
              <div>
             <h3 className="text-2xl font-bold">₹4,000 Cr</h3>
<p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/70">Audited</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Export wrapped in GuestGuard so logged-in users skip this page.
export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginPageInner />
    </GuestGuard>
  );
}