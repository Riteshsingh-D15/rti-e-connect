"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { Alert } from "@/components/ui";
import { Button } from "@/components/ui/button";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other / Union Territory",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "Maharashtra",
    district: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6–9.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          state: form.state,
          district: form.district.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to complete registration. Please check your details.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Network error while creating account. Please retry.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

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
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#102A43] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </header>

      <main className="perspective-1000 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="surface-3d-lg w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden border border-slate-200/90 bg-white">
          {/* Left Onboarding Info Panel */}
          <div className="hero-3d-grid lg:col-span-5 bg-[#102A43] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#2563EB]/20 blur-2xl pointer-events-none" />

            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#F59E0B]">
                Citizen Account Portal
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  Register as a Citizen Applicant
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Create your verified RTI E Connect citizen profile under Section 6(1) of the Right
                  to Information Act, 2005.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  "Auto-prefill contact details when filing multiple RTIs",
                  "Real-time 30-day statutory deadline & clarification alerts",
                  "Download official Officer-signed digital RTI responses",
                  "File Section 19(1) First Appeals directly from your dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 pt-6 border-t border-white/15 text-xs text-slate-300">
              Note: Public Information Officer and Administrator accounts are provisioned exclusively
              by portal Administrators.
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-10">
            <div className="max-w-lg mx-auto space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#102A43]">Citizen Registration</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Provide accurate applicant details for statutory correspondence.
                </p>
              </div>

              {error && (
                <Alert type="error" title="Registration Error">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="reg-name"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="e.g., Aarav Deshmukh"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="citizen@example.com"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-phone"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Mobile Number (10 digits) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-phone"
                        type="tel"
                        required
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) =>
                          updateField("phone", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="9876543210"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-state"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      State / Union Territory <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="reg-state"
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-district"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      District <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-district"
                        type="text"
                        required
                        value={form.district}
                        onChange={(e) => updateField("district", e.target.value)}
                        placeholder="e.g., Pune"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-confirm"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={form.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={loading}
                  className="w-full justify-center gap-2 font-semibold mt-2"
                >
                  {loading ? "Creating Account..." : "Create Citizen Account"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="text-slate-600">Already registered?</span>
                <Link
                  href="/login"
                  className="font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                >
                  Sign In Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
