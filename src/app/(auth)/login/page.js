"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";

const ROLE_PRESETS = [
  {
    key: "CITIZEN",
    label: "Citizen",
    subtitle: "File & track RTIs",
    email: "citizen@example.com",
    password: "password123",
    icon: Users,
  },
  {
    key: "GOVERNMENT OFFICER",
    label: "PIO Officer",
    subtitle: "Draft & approve replies",
    email: "officer@example.com",
    password: "password123",
    icon: UserCheck,
  },
  {
    key: "ADMINISTRATOR",
    label: "Administrator",
    subtitle: "Manage portal & SLAs",
    email: "admin@example.com",
    password: "password123",
    icon: ShieldCheck,
  },
];

function resolveHomeRoute(role) {
  if (role === "GOVERNMENT OFFICER") return "/officer/dashboard";
  if (role === "ADMINISTRATOR") return "/admin/dashboard";
  return "/citizen/dashboard";
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const registeredSuccess = searchParams.get("registered") === "1";

  const [selectedRole, setSelectedRole] = useState("CITIZEN");
  const [form, setForm] = useState({
    email: "citizen@example.com",
    password: "password123",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectRolePreset = (preset) => {
    setSelectedRole(preset.key);
    setForm({ email: preset.email, password: preset.password });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password, or account deactivated."
            : result.error
        );
        setLoading(false);
        return;
      }

      const session = await getSession();
      const targetRoute =
        callbackUrl && callbackUrl.startsWith("/")
          ? callbackUrl
          : resolveHomeRoute(session?.user?.role);

      router.push(targetRoute);
      router.refresh();
    } catch {
      setError("Unable to complete authentication right now. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      {/* Subtle Digital India Tricolor Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Minimal Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-[#102A43] hover:text-[#2563EB] transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[#102A43] text-white flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-[#102A43]">RTI E CONNECT</p>
            <p className="text-[11px] font-medium text-slate-500">Digital India Portal</p>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#102A43] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Centered Two-Panel Auth Shell */}
      <main className="perspective-1000 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="surface-3d-lg w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-200/90 bg-white">
          {/* Left Navy Government Identity Panel */}
          <div className="hero-3d-grid lg:col-span-5 bg-[#102A43] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#2563EB]/20 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#F59E0B]/15 blur-2xl pointer-events-none" />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#F59E0B]">
                <Sparkles className="w-3.5 h-3.5" />
                RTI Act, 2005 Compliant
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  Transparency Through Technology
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Unified digital gateway for Indian citizens to exercise their Right to Information
                  and for Public Information Officers to deliver statutory replies on time.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  "30-day statutory SLA monitoring & 48-hour Life/Liberty alerts",
                  "AI-assisted department routing & RAG precedent retrieval",
                  "End-to-end audit trails & Officer human-in-the-loop sign-off",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 pt-6 border-t border-white/15 text-xs text-slate-300 flex items-center justify-between">
              <span>Role-Based Access Control</span>
              <span className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px]">
                v2.4 · SECURE
              </span>
            </div>
          </div>

          {/* Right Sign-In Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#102A43]">Sign in to RTI E Connect</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Select a demo role workspace or sign in with your registered credentials.
                </p>
              </div>

              {registeredSuccess && (
                <Alert type="success" title="Registration Successful">
                  Your citizen account has been created. Sign in below to file and track your RTI applications.
                </Alert>
              )}

              {callbackUrl && (
                <Alert type="info" title="Authentication Required">
                  Please sign in to access <span className="font-mono text-xs">{callbackUrl}</span>.
                </Alert>
              )}

              {/* Quick Demo Role Switcher */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Quick Role Login (Demo Accounts)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {ROLE_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const active = selectedRole === preset.key && form.email === preset.email;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => selectRolePreset(preset)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? "bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#2563EB]/20 -translate-y-0.5 shadow-[0_6px_14px_-4px_rgba(37,99,235,0.28)]"
                            : "bg-slate-50/70 border-slate-200 hover:-translate-y-0.5 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            className={`w-4 h-4 ${
                              active ? "text-[#2563EB]" : "text-slate-500"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold ${
                              active ? "text-[#102A43]" : "text-slate-700"
                            }`}
                          >
                            {preset.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{preset.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <Alert type="error" title="Authentication Failed">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Demo password: <code className="font-mono text-slate-700">password123</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="w-full h-11 pl-10 pr-11 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={loading}
                  className="w-full justify-center gap-2 font-semibold"
                >
                  {loading ? "Signing In..." : "Sign In to Workspace"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                <span className="text-slate-600">New Indian citizen applicant?</span>
                <Link
                  href="/register"
                  className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                >
                  Create Citizen Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-6">
          <Card className="p-8 max-w-sm w-full text-center">
            <p className="text-sm font-medium text-slate-600">Loading authentication portal...</p>
          </Card>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
