import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  FileText,
  Scale,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { getAuthSession, getHomeRouteForRole } from "@/lib/auth";
import { TiltCard } from "@/components/ui/tilt-card";
import { Hero3DShowcase } from "@/components/landing/hero-3d-showcase";
import { RTIHelperSection } from "@/components/landing/rti-helper-section";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getAuthSession();
  const homeRoute = session?.user?.role
    ? getHomeRouteForRole(session.user.role)
    : "/login";

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col">
      {/* Digital India Tricolor Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#102A43] text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-[#102A43] leading-none">
                RTI E CONNECT
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                Transparency Through Technology
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-[#102A43] transition-colors">
              How It Works
            </a>
            <a href="#quick-templates" className="hover:text-[#102A43] transition-colors">
              Templates &amp; FAQ
            </a>
            <a href="#rti-act" className="hover:text-[#102A43] transition-colors">
              RTI Process
            </a>
            <a href="#capabilities" className="hover:text-[#102A43] transition-colors">
              AI Intelligence
            </a>
            <a href="#workspaces" className="hover:text-[#102A43] transition-colors">
              Portals
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {session?.user ? (
              <Link
                href={homeRoute}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#102A43] text-white text-sm font-semibold hover:bg-[#1B3A57] transition-colors shadow-sm"
              >
                Open {session.user.role === "GOVERNMENT OFFICER" ? "Officer" : session.user.role === "ADMINISTRATOR" ? "Admin" : "Citizen"} Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg text-sm font-semibold text-[#102A43] hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Register
                </Link>
                <Link
                  href="/citizen/submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] hover:-translate-y-0.5 active:translate-y-0.5 transition-all shadow-[0_4px_0_0_#1D4ED8,0_6px_14px_-4px_rgba(37,99,235,0.4)]"
                >
                  File RTI
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-3d-grid relative overflow-hidden bg-[#102A43] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#2563EB]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#F59E0B]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#F59E0B]">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Indian RTI Portal · Statutory Act, 2005
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] text-white">
              Right to Information,{" "}
              <span className="text-[#93C5FD]">Faster, Smarter & Transparent</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Submit statutory RTI requests in minutes, get automatic department routing and
              clarity scoring, track 30-day & 48-hour deadlines live, and empower Public
              Information Officers with human-verified RAG drafts.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/citizen/submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] hover:-translate-y-0.5 active:translate-y-0.5 text-white font-semibold text-sm shadow-[0_4px_0_0_#1E40AF,0_14px_24px_-8px_rgba(37,99,235,0.55)] transition-all"
              >
                <FileText className="w-4 h-4" />
                Submit New RTI Application
              </Link>
              <Link
                href="/citizen/track"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 hover:-translate-y-0.5 border border-white/20 text-white font-semibold text-sm shadow-[0_8px_20px_-8px_rgba(2,6,23,0.45)] transition-all"
              >
                <Search className="w-4 h-4 text-[#F59E0B]" />
                Track Application Status
              </Link>
              {!session?.user && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-slate-200 hover:text-white text-sm font-medium transition-colors"
                >
                  Officer / Admin Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-xl">
              <div>
                <p className="text-2xl font-bold text-white">30 Days</p>
                <p className="text-xs text-slate-300 mt-0.5">Standard Sec 7(1) SLA</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F59E0B]">48 Hours</p>
                <p className="text-xs text-slate-300 mt-0.5">Life & Liberty Urgent SLA</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">100%</p>
                <p className="text-xs text-slate-300 mt-0.5">Officer Human Sign-off</p>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Portal Preview Showcase */}
          <div className="lg:col-span-5">
            <Hero3DShowcase />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            End-to-End Statutory Workflow
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43] mt-1">
            How RTI E Connect Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Designed around the Indian Right to Information Act, 2005 to eliminate misrouted forms,
            missed deadlines, and opaque responses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Guided Filing & AI Quality Check",
              desc: "Complete the 4-step Section 6(1) form, verify question clarity with AI Quality Check, mark Life & Liberty or BPL exemptions, and upload PDF/DOCX/Image evidence.",
              icon: FileText,
            },
            {
              step: "02",
              title: "Intelligent Routing & PIO Review",
              desc: "AI predicts category, recommends the right Public Authority, and surfaces similar past RTI precedents via vector semantic search inside the Officer Dossier.",
              icon: Bot,
            },
            {
              step: "03",
              title: "Official Approval, Tracking & Appeal",
              desc: "The designated PIO approves & dispatches the signed order within 30 days. Citizens track live milestones, reply to clarifications, or file Section 19(1) appeals.",
              icon: Scale,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <TiltCard key={item.step} intensity={6} className="p-6 hover:border-blue-300/70">
                <div className="tilt-3d-pop">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EFF6FF] to-blue-100 text-[#2563EB] flex items-center justify-center shadow-[0_6px_12px_-4px_rgba(37,99,235,0.28)] ring-1 ring-blue-200/70">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 shadow-2xs">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#102A43] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Citizen-Friendly Ready Templates & FAQ */}
      <RTIHelperSection />

      {/* RTI Process & Statutory Guarantees */}
      <section id="rti-act" className="bg-white border-y border-slate-200 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                RTI Act, 2005 Alignment
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43] mt-1">
                Built-In Statutory Safeguards & Processes
              </h2>
            </div>
            <Link
              href="/citizen/submit"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:underline"
            >
              Start Section 6(1) Application <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                section: "Section 6(1) & 7(5)",
                title: "Filing & BPL Exemption",
                text: "Simple multi-step application capture with automatic tracking of BPL fee waiver declarations and preferred reply language.",
              },
              {
                section: "Section 6(3)",
                title: "Inter-Department Transfer",
                text: "Officers can transfer misdirected applications within 5 days with full immutable audit trail updates for citizens.",
              },
              {
                section: "Section 7(1)",
                title: "30-Day & 48-Hour SLAs",
                text: "Automated statutory deadline countdowns, highlighting overdue queues and Life & Liberty 48-hour emergency filings.",
              },
              {
                section: "Section 19(1)",
                title: "First Appellate Review",
                text: "Built-in appeal filing for delayed or unsatisfactory orders, routed directly to First Appellate Authority tracking.",
              },
            ].map((card) => (
              <div
                key={card.section}
                className="p-5 rounded-xl bg-[#F4F7FB] border border-slate-200/80 space-y-2.5"
              >
                <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#102A43] text-[#F59E0B]">
                  {card.section}
                </span>
                <h3 className="text-base font-bold text-[#102A43]">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Intelligence Features */}
      <section id="capabilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              AI Intelligence Engine
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43]">
              Advisory AI Built for Accountability
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every prediction, precedent match, and response draft runs through our modular AI
              pipeline while preserving strict human governance and transparent auditability.
            </p>
            <ul className="space-y-2.5 pt-2">
              {[
                "Multi-label category & Public Authority routing with confidence scores",
                "Real-time Question Clarity Analyzer before citizens submit",
                "Vector semantic search over historical resolved RTI orders",
                "PIO override controls to correct AI labels and refine training logs",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Semantic Precedent Search",
                desc: "384-dimensional vector embeddings locate past RTI responses to maintain consistency across districts.",
                icon: FileSearch,
              },
              {
                title: "RAG Response Drafting",
                desc: "Synthesizes formal statutory draft letters citing relevant RTI provisions for PIO verification.",
                icon: Bot,
              },
              {
                title: "Real-Time Document Uploads",
                desc: "Secure attachment handling for PDF, DOCX, JPG, and PNG evidence with OCR readiness status.",
                icon: FileText,
              },
              {
                title: "Immutable Audit Logs",
                desc: "Every status change, Section 6(3) transfer, and response dispatch is timestamped for Admin review.",
                icon: ShieldCheck,
              },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <TiltCard key={feat.title} intensity={6} className="p-5 hover:border-blue-300/70">
                  <div className="tilt-3d-pop">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#102A43] to-[#1E3A5F] text-[#F59E0B] flex items-center justify-center mb-3 shadow-[0_6px_12px_-4px_rgba(16,42,67,0.38)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#102A43] mb-1.5">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Workspaces */}
      <section id="workspaces" className="bg-white border-t border-slate-200 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Unified Role-Based Access
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102A43] mt-1">
              Dedicated Portal for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Citizen Workspace",
                badge: "Applicants",
                desc: "Submit guided RTI requests, track live 30-day deadlines, respond to clarifications, download signed orders, and file appeals.",
                href: "/citizen/dashboard",
                cta: "Enter Citizen Portal",
                icon: Users,
              },
              {
                role: "PIO Officer Workspace",
                badge: "Government Officers",
                desc: "Review assigned queues, inspect AI categorization & semantic precedents, draft RAG replies, request clarifications, and approve official responses.",
                href: "/officer/dashboard",
                cta: "Enter Officer Portal",
                icon: UserCheck,
              },
              {
                role: "Administrator Console",
                badge: "System Governance",
                desc: "Provision officer accounts, configure statutory SLA days & AI providers, manage departments, analyze compliance charts, and inspect audit logs.",
                href: "/admin/dashboard",
                cta: "Enter Admin Console",
                icon: ShieldCheck,
              },
            ].map((ws) => {
              const Icon = ws.icon;
              return (
                <TiltCard
                  key={ws.role}
                  intensity={6}
                  className="p-6 flex flex-col justify-between hover:border-[#2563EB]/50"
                >
                  <div className="tilt-3d-pop">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F4F7FB] to-blue-50 text-[#102A43] flex items-center justify-center border border-slate-200 shadow-xs">
                        <Icon className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {ws.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#102A43] mb-2">{ws.role}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">{ws.desc}</p>
                  </div>

                  <Link
                    href={ws.href}
                    className="tilt-3d-pop inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F4F7FB] hover:bg-[#102A43] text-[#102A43] hover:text-white text-sm font-semibold shadow-2xs transition-colors"
                  >
                    <span>{ws.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Authoritative Footer */}
      <footer className="bg-[#102A43] text-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-white">
              <Shield className="w-5 h-5 text-[#F59E0B]" />
              <span className="font-bold tracking-tight">RTI E CONNECT</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              AI-powered Right to Information management platform designed for transparent Indian
              public governance.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-sm font-semibold text-white mb-2">Quick Links</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/citizen/submit" className="hover:text-white transition-colors">
                Submit RTI
              </Link>
              <Link href="/citizen/track" className="hover:text-white transition-colors">
                Track Status
              </Link>
              <Link href="/login" className="hover:text-white transition-colors">
                Portal Sign In
              </Link>
              <Link href="/register" className="hover:text-white transition-colors">
                Citizen Registration
              </Link>
            </div>
          </div>

          <div className="text-xs leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-semibold text-[#F59E0B] mb-1">Legal Notice & Governance</p>
            AI classification and response drafting are strictly advisory. Only authorized Public
            Information Officers may approve and dispatch binding RTI orders.
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <span>© 2026 RTI E Connect · Digital India Citizen Services Prototype</span>
            <span>RTI Act, 2005 Compliant Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
