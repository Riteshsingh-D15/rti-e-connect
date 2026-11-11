"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FilePlus,
  HelpCircle,
  Scale,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

const ROLE_SHORTCUTS = {
  CITIZEN: [
    { label: "Submit New RTI", desc: "Start 4-step Section 6(1) filing", href: "/citizen/submit", icon: FilePlus },
    { label: "Track Reference No.", desc: "Check live milestone & reply to PIO", href: "/citizen/track", icon: Search },
    { label: "File First Appeal", desc: "Section 19(1) appeal after 30 days", href: "/citizen/appeals", icon: Scale },
  ],
  "GOVERNMENT OFFICER": [
    { label: "Assigned RTI Queue", desc: "Inspect priority cases & deadlines", href: "/officer/applications", icon: FilePlus },
    { label: "Semantic RAG Search", desc: "Locate historical RTI precedents", href: "/officer/semantic-search", icon: Search },
    { label: "Official Response Studio", desc: "Draft & legally seal replies", href: "/officer/responses", icon: ShieldCheck },
  ],
  ADMINISTRATOR: [
    { label: "Officer Provisioning", desc: "Manage Public Information Officers", href: "/admin/officers", icon: ShieldCheck },
    { label: "Departments Registry", desc: "Configure authorities & nodal PIOs", href: "/admin/departments", icon: Scale },
    { label: "Analytics & Audit Logs", desc: "SLA telemetry & immutable ledger", href: "/admin/settings", icon: Search },
  ],
};

const STATUTORY_TIMELINES = [
  { badge: "5 Days", title: "Sec 6(3) Transfer", desc: "Deadline to transfer misdirected requests" },
  { badge: "48 Hours", title: "Life & Liberty", desc: "Emergency Sec 7(1) proviso response window" },
  { badge: "30 Days", title: "Standard Disposal", desc: "Default maximum reply window under Sec 7(1)" },
  { badge: "30 Days", title: "Sec 19(1) Appeal", desc: "First Appeal window after PIO reply or expiry" },
];

export function QuickHelpButton({ userRole = "CITIZEN" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const shortcuts = ROLE_SHORTCUTS[userRole] || ROLE_SHORTCUTS.CITIZEN;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open RTI Guide and Quick Actions"
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-[#102A43] shadow-2xs transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
      >
        <HelpCircle className="h-4 w-4 text-[#2563EB]" />
        <span className="hidden sm:inline">RTI Guide</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-help-title"
        >
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div className="surface-3d-lg relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#102A43] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <Scale className="h-5 w-5 text-[#F59E0B]" />
                <div>
                  <h2 id="quick-help-title" className="text-sm font-bold">
                    RTI E Connect · Quick Guide &amp; Shortcuts
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    Fast navigation &amp; statutory deadlines under RTI Act, 2005
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close RTI guide"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  One-Click Role Actions
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {shortcuts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F4F7FB] p-3 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/70 hover:shadow-sm"
                      >
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <Icon className="h-4 w-4 text-[#2563EB]" />
                            <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#2563EB]" />
                          </div>
                          <p className="text-xs font-bold text-[#102A43]">{item.label}</p>
                        </div>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">
                          {item.desc}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  <Clock className="h-3.5 w-3.5 text-[#D97706]" />
                  Statutory SLA Reference
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {STATUTORY_TIMELINES.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5"
                    >
                      <span className="shrink-0 rounded-md bg-[#102A43] px-2 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                        {item.badge}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#102A43]">{item.title}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
