"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MapPin, Phone, Save, ShieldCheck, User } from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada"];

export default function CitizenProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "CITIZEN",
    phone: "",
    state: "",
    district: "",
    address: "",
    preferredLanguage: "English",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (active && res.ok) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            role: data.role || "CITIZEN",
            phone: data.phone || "",
            state: data.state || "",
            district: data.district || "",
            address: data.address || "",
            preferredLanguage: data.preferredLanguage || "English",
          });
        }
      } catch {
        if (active) setError("Could not load profile particulars.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSavedMsg("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to update profile.");
      } else {
        setSavedMsg("Profile particulars saved. Future RTI applications will auto-prefill with these details.");
      }
    } catch {
      setError("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return (
    <RoleShell
      title="Citizen Profile & Communication Preferences"
      subtitle="Manage your verified identity details used to auto-prefill statutory RTI applications."
      userRole="CITIZEN"
    >
      {error && (
        <Alert type="error" title="Update Failed">
          {error}
        </Alert>
      )}
      {savedMsg && (
        <Alert type="success" title="Profile Updated">
          {savedMsg}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Loading citizen profile...
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Identity Summary Card */}
          <Card className="p-6 lg:col-span-4 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#102A43] text-white font-bold text-xl flex items-center justify-center shadow-sm">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#102A43]">{form.name}</h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {form.role}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{form.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{form.phone || "No mobile added"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>
                  {[form.district, form.state].filter(Boolean).join(", ") || "Location not set"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs text-slate-600 leading-relaxed">
              Verified applicant particulars streamline Section 6(1) filings and ensure official
              postal correspondence reaches your current district.
            </div>
          </Card>

          {/* Editable Profile Form */}
          <Card className="p-6 sm:p-8 lg:col-span-8">
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-lg font-bold text-[#102A43] pb-3 border-b border-slate-100">
                Contact &amp; Jurisdiction Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address (Account ID)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={form.email}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))
                    }
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Preferred Response Language
                  </label>
                  <select
                    value={form.preferredLanguage}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, preferredLanguage: e.target.value }))
                    }
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    State / UT
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Postal Communication Address
                  </label>
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="House No, Street, Locality, PIN Code"
                    className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={saving} className="gap-2 px-6">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Profile Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </RoleShell>
  );
}
