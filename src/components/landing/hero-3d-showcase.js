"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";

const TABS = [
  { id: "dossier", label: "AI Routing" },
  { id: "timeline", label: "Live SLA" },
  { id: "safeguard", label: "PIO Seal" },
];

export function Hero3DShowcase() {
  const [activeTab, setActiveTab] = useState("dossier");

  return (
    <div className="perspective-1000 relative mx-auto w-full max-w-lg px-2 py-4 sm:px-4">
      {/* 3D Back Structural Layer */}
      <div
        aria-hidden="true"
        className="preserve-3d absolute inset-4 rounded-3xl border border-white/15 bg-gradient-to-br from-[#2563EB]/30 via-[#102A43]/60 to-[#F59E0B]/20 shadow-2xl backdrop-blur-md"
        style={{ transform: "rotateZ(-2.5deg) rotateY(4deg) translate3d(8px, 10px, -24px)" }}
      />

      {/* Interactive 3D Center Dossier Card */}
      <TiltCard
        intensity={8}
        scale={1.015}
        className="relative z-10 border-white/80 bg-white/95 p-5 text-slate-900 shadow-[0_30px_70px_-15px_rgba(2,6,23,0.65),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur sm:p-6"
      >
        {/* Top Floating 3D Pill */}
        <div className="float-3d-slow pointer-events-none absolute -top-3.5 right-4 z-20 hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-[0_12px_24px_-6px_rgba(16,42,67,0.28)] sm:inline-flex">
          <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
          94% AI Routing Match
        </div>

        {/* Bottom Floating 3D Pill */}
        <div className="float-3d-reverse pointer-events-none absolute -bottom-3.5 left-4 z-20 hidden items-center gap-1.5 rounded-full border border-slate-200 bg-[#102A43] px-3 py-1 text-[11px] font-bold text-white shadow-[0_12px_24px_-6px_rgba(2,6,23,0.45)] sm:inline-flex">
          <ShieldCheck className="h-3.5 w-3.5 text-[#F59E0B]" />
          PIO Human-Verified Seal
        </div>

        <div className="tilt-3d-pop space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Interactive 3D AI Dossier
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-[#102A43]">
                RTI-2026-PWD-4821
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
              <Clock className="h-3.5 w-3.5" />
              18 Days Left
            </span>
          </div>

          {/* Interactive View Switcher */}
          <div
            role="tablist"
            aria-label="Preview dossier aspects"
            className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100/90 p-1"
          >
            {TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    selected
                      ? "bg-white text-[#102A43] shadow-sm"
                      : "text-slate-600 hover:text-[#102A43]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panel 1: Dossier Routing */}
          {activeTab === "dossier" && (
            <div className="space-y-3">
              <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-[#F4F7FB] p-3.5">
                <p className="text-xs font-semibold text-slate-500">Citizen Query Subject</p>
                <p className="text-sm font-semibold text-[#102A43]">
                  Ward 14 Road Repair Budget Utilization &amp; Contractor Verification (FY 2025-26)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <p className="text-[11px] font-medium text-slate-500">AI Category Match</p>
                  <p className="mt-1 text-xs font-bold text-[#102A43]">Public Infrastructure</p>
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                    94% Confidence
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <p className="text-[11px] font-medium text-slate-500">Routed Authority</p>
                  <p className="mt-1 text-xs font-bold text-[#102A43]">Public Works Dept.</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#2563EB]">
                    RAG Precedents: 3
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Panel 2: Statutory Timeline */}
          {activeTab === "timeline" && (
            <div className="space-y-3 rounded-xl border border-slate-200/90 bg-[#F4F7FB] p-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#102A43]">
                <span>Section 7(1) 30-Day Progress</span>
                <span className="text-[#2563EB]">Stage 3 of 5</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6]" />
              </div>
              <div className="space-y-2 pt-1">
                {[
                  { label: "Filed & Auto-Indexed (Day 0)", done: true },
                  { label: "PIO Assigned · Public Works Dept.", done: true },
                  { label: "RAG Precedents Matched & Draft Ready", done: true },
                  { label: "Authorized PIO Legal Sign-Off", done: false },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-2 text-xs text-slate-700"
                  >
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${
                        step.done ? "text-emerald-600" : "text-slate-300"
                      }`}
                    />
                    <span className={step.done ? "font-medium" : "text-slate-400"}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Panel 3: PIO Governance Seal */}
          {activeTab === "safeguard" && (
            <div className="space-y-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                <Bot className="h-4 w-4 text-[#2563EB]" />
                Human-in-the-Loop Statutory Control
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                AI recommends the right department, detects vague queries, and prepares draft talking
                points from verified precedents — but never dispatches binding orders automatically.
              </p>
              <Link
                href="/citizen/submit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Try Filing with AI Quality Check <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Bottom Governance Notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
            <p className="text-xs leading-relaxed text-amber-900">
              <strong>Statutory Safeguard:</strong> AI generates structured draft points from
              precedents; only the designated PIO approves &amp; seals the official RTI reply.
            </p>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
