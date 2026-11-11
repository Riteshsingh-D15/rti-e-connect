"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutGrid,
  FileText,
  Briefcase,
  BarChart3,
  ShieldCheck,
  UserCircle2,
  Search,
  MessageSquare,
  Users,
  Building2,
  Settings,
  PieChart,
  LogOut,
  ChevronRight,
  X,
  Scale,
} from "lucide-react";

const NAV = {
  CITIZEN: [
    { label: "Dashboard", href: "/citizen/dashboard", icon: LayoutGrid },
    { label: "Submit RTI", href: "/citizen/submit", icon: FileText },
    { label: "My Applications", href: "/citizen/applications", icon: Briefcase },
    { label: "Track Status", href: "/citizen/track", icon: BarChart3 },
    { label: "First Appeals", href: "/citizen/appeals", icon: ShieldCheck },
    { label: "Profile", href: "/citizen/profile", icon: UserCircle2 },
  ],
  "GOVERNMENT OFFICER": [
    { label: "Dashboard", href: "/officer/dashboard", icon: LayoutGrid },
    { label: "Applications", href: "/officer/applications", icon: Briefcase },
    { label: "AI Analysis", href: "/officer/ai-analysis", icon: BarChart3 },
    { label: "Semantic Search", href: "/officer/semantic-search", icon: Search },
    { label: "Responses", href: "/officer/responses", icon: MessageSquare },
    { label: "Appeals Docket", href: "/officer/appeals", icon: ShieldCheck },
  ],
  ADMINISTRATOR: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Officers", href: "/admin/officers", icon: Briefcase },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Analytics", href: "/admin/analytics", icon: PieChart },
    { label: "System & Audit", href: "/admin/settings", icon: Settings },
  ],
};

const ROLE_META = {
  CITIZEN: {
    label: "Citizen Portal",
    dot: "bg-sky-400",
    pill: "text-sky-200 bg-sky-500/15 border-sky-400/20",
  },
  "GOVERNMENT OFFICER": {
    label: "Officer Workspace",
    dot: "bg-amber-400",
    pill: "text-amber-200 bg-amber-500/15 border-amber-400/20",
  },
  ADMINISTRATOR: {
    label: "Admin Command",
    dot: "bg-emerald-400",
    pill: "text-emerald-200 bg-emerald-500/15 border-emerald-400/20",
  },
};

function SidebarContent({ role, pathname, onNavigate }) {
  const { data: session } = useSession();
  const items = NAV[role] || NAV.CITIZEN;
  const meta = ROLE_META[role] || ROLE_META.CITIZEN;

  return (
    <div className="flex h-full flex-col bg-[#102A43] text-white">
      {/* Subtle Digital India Tricolor Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F59E0B] via-white to-emerald-500" />

      {/* Brand Header */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-lg font-black text-white shadow-[0_4px_0_0_#1E3A8A,0_8px_16px_-4px_rgba(37,99,235,0.5)]">
              R
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-wide text-white">
                RTI E CONNECT
              </div>
              <div className="text-[10px] font-medium tracking-wider text-sky-200/80 uppercase">
                Transparency Tech
              </div>
            </div>
          </Link>

          {onNavigate ? (
            <button
              type="button"
              onClick={onNavigate}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div
          className={`mt-4 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${meta.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </div>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
          Workspace
        </div>
        <ul className="space-y-1">
          {items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-[#2563EB] font-semibold text-white shadow-[0_4px_0_0_#1D4ED8,0_8px_16px_-6px_rgba(37,99,235,0.45)]"
                      : "font-medium text-slate-300 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active
                        ? "text-white"
                        : "text-slate-400 group-hover:text-sky-200"
                    }`}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {active ? (
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/80" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Statutory Notice & Authenticated User Panel */}
      <div className="space-y-3 border-t border-white/10 p-3.5">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Scale className="h-3.5 w-3.5 shrink-0" />
            RTI Act, 2005
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
            Section 7(1): 30-day statutory reply window (48 hrs for life &
            liberty). Human review required.
          </p>
        </div>

        {session?.user ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-xs font-bold text-white">
              {(session.user.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-white">
                {session.user.name}
              </div>
              <div className="truncate text-[10px] text-slate-300">
                {session.user.email}
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function Sidebar({
  role = "CITIZEN",
  mobileOpen = false,
  onCloseMobile,
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Fixed Desktop Sidebar */}
      <aside className="no-print hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent role={role} pathname={pathname} />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col shadow-2xl">
            <SidebarContent
              role={role}
              pathname={pathname}
              onNavigate={onCloseMobile}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
