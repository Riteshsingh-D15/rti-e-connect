"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { RTI_TEMPLATES } from "@/lib/rti-templates";
import { CopyButton } from "@/components/ui/copy-button";
import { TiltCard } from "@/components/ui/tilt-card";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "How much is the RTI fee, and who gets a fee waiver?",
    a: "Under Section 6(1) & 7(5) of the RTI Act, 2005, the standard application fee is Rs. 10. Citizens holding a valid Below Poverty Line (BPL) card receive a 100% statutory fee exemption directly inside Step 2 of the filing form.",
  },
  {
    q: "What if I am unsure which Government Department holds the record?",
    a: "You do not have to guess. Run the AI Quality & Dept Check in Step 2 to get a recommended Public Authority. Even if misrouted, Section 6(3) requires the receiving PIO to transfer the request to the correct department within 5 days.",
  },
  {
    q: "When does the urgent 48-hour Life & Liberty rule apply?",
    a: "Section 7(1) mandates a 48-hour reply window when the requested information directly concerns the life or personal liberty of an individual (such as urgent medical records, wrongful detention, or acute safety hazards).",
  },
  {
    q: "Does AI ever send official replies automatically without a human officer?",
    a: "Never. In strict compliance with RTI statutory rules, AI only classifies queries, checks question clarity, and retrieves historical precedents. Only an authorized Public Information Officer can approve and seal an official reply.",
  },
];

export function RTIHelperSection() {
  const [selectedSlug, setSelectedSlug] = useState(RTI_TEMPLATES[0].slug);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const selectedTemplate =
    RTI_TEMPLATES.find((t) => t.slug === selectedSlug) || RTI_TEMPLATES[0];

  return (
    <section
      id="quick-templates"
      className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#2563EB] uppercase">
            Citizen-Friendly Filing Assistance
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#102A43] sm:text-3xl">
            One-Click RTI Question Templates &amp; Plain Guide
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            New to filing an RTI? Preview pre-formatted Section 6(1) question structures and launch
            straight into the guided form with fields pre-filled.
          </p>
        </div>
        <Link href="/citizen/submit" className="shrink-0">
          <Button variant="outline" size="sm">
            Blank Section 6(1) Form <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Template Explorer */}
        <TiltCard intensity={4} scale={1.005} className="p-6 lg:col-span-7">
          <div className="tilt-3d-pop space-y-5">
            <div className="flex flex-wrap gap-2">
              {RTI_TEMPLATES.map((tpl) => {
                const active = tpl.slug === selectedTemplate.slug;
                return (
                  <button
                    key={tpl.slug}
                    type="button"
                    onClick={() => setSelectedSlug(tpl.slug)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "border-[#102A43] bg-[#102A43] text-white shadow-[0_4px_10px_-2px_rgba(16,42,67,0.3)]"
                        : "border-slate-200 bg-[#F4F7FB] text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {tpl.title}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-[#F4F7FB] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-[#2563EB]">
                    <Sparkles className="h-3 w-3" /> {selectedTemplate.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedTemplate.department}
                  </span>
                </div>
                <CopyButton value={selectedTemplate.question} label="Copy Text" />
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Suggested Subject
                </p>
                <p className="mt-1 text-sm font-bold text-[#102A43]">
                  {selectedTemplate.subject}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Section 6(1) Specific Points
                </p>
                <p className="mt-1.5 rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-700 sm:text-sm">
                  {selectedTemplate.question}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs text-slate-500">
                  Target SLA: <strong className="text-[#102A43]">{selectedTemplate.slaDays} Days</strong>{" "}
                  · Editable before submitting
                </span>
                <Link href={`/citizen/submit?template=${encodeURIComponent(selectedTemplate.slug)}`}>
                  <Button size="sm">
                    <FileText className="h-3.5 w-3.5" />
                    Use This Template
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* Plain-Language RTI FAQ Accordion */}
        <div className="surface-3d flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-[#D97706] ring-1 ring-amber-200">
                <HelpCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A43]">
                  Citizen RTI Quick FAQ
                </h3>
                <p className="text-xs text-slate-500">
                  Clear answers to everyday filing questions
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.q} className="py-3 first:pt-1 last:pb-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                      className="flex w-full items-start justify-between gap-3 text-left text-xs font-bold text-[#102A43] transition hover:text-[#2563EB] sm:text-sm"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#2563EB]" : ""
                        }`}
                      />
                    </button>
                    {isOpen ? (
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {faq.a}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-[#F4F7FB] p-3.5 text-xs text-slate-600">
            Already filed an RTI request?{" "}
            <Link href="/citizen/track" className="font-bold text-[#2563EB] hover:underline">
              Track your Reference Number live →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
