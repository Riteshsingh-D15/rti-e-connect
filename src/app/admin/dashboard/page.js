import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { AdminCaseMonitor } from "@/components/admin/case-monitor";
import { DashboardCharts } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleShell } from "@/components/layout/role-shell";
import { Button } from "@/components/ui/button";
import { getAnalyticsSummary, readStore } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [store, summary] = await Promise.all([readStore(), getAnalyticsSummary()]);
  const users = store.users || [];
  const applications = store.applications || [];
  const departments = store.departments || [];
  const auditLogs = store.auditLogs || [];
  const officers = users.filter(
    (u) => u.role === "GOVERNMENT OFFICER" && u.isActive !== false
  );

  const stats = [
    {
      title: "Total Portal Users",
      value: String(users.length),
      detail: `${officers.length} active PIO officers`,
      icon: Users,
      tone: "navy",
    },
    {
      title: "RTI Filings",
      value: String(summary.total),
      detail: `${summary.responded} officially disposed`,
      icon: FileText,
      tone: "blue",
    },
    {
      title: "SLA Compliance",
      value: `${summary.statutoryComplianceRate}%`,
      detail: `Avg ${summary.avgProcessingTimeDays} days disposal`,
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      title: "Overdue Cases",
      value: String(summary.overdueCount || 0),
      detail: `${departments.length} active departments`,
      icon: AlertTriangle,
      tone: "amber",
    },
    {
      title: "Audit Log Events",
      value: String(auditLogs.length),
      detail: "Immutable security ledger",
      icon: Activity,
      tone: "rose",
    },
  ];

  return (
    <RoleShell
      title="Administrator Governance Console"
      subtitle="Monitor statutory compliance, manage Public Information Officers, oversee departments, and audit portal operations."
      userRole="ADMINISTRATOR"
    >
      {/* Top Admin Command Header */}
      <div className="hero-3d-banner-navy surface-3d-lg flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 text-white">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
            <ShieldCheck className="w-4 h-4" /> System Administration &amp; Compliance
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold">
            RTI E Connect Enterprise Oversight
          </h2>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Provision officer accounts, balance caseloads across authorities, tune AI categorization
            thresholds, and enforce 30-day statutory SLAs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/officers">
            <Button variant="saffron" size="sm" className="font-bold">
              <UserCog className="mr-1.5 h-4 w-4" /> Manage PIOs
            </Button>
          </Link>
          <Link href="/admin/departments">
            <Button variant="glass" size="sm">
              <Building2 className="mr-1.5 h-4 w-4" /> Departments
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="glass" size="sm">
              <Settings className="mr-1.5 h-4 w-4" /> AI &amp; SLA Config
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Executive KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((st) => (
          <StatCard key={st.title} {...st} />
        ))}
      </div>

      {/* Real-Data Charts */}
      <DashboardCharts summary={summary} />

      {/* Live Application Monitoring & PIO Assignment Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#102A43]">
              RTI Caseload Monitoring &amp; Officer Reassignment
            </h2>
            <p className="text-xs text-slate-500">
              Monitor live deadlines across departments and rebalance PIO workloads immediately.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            Deep Analytics Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <AdminCaseMonitor initialApps={applications} officers={officers} />
      </section>

      {/* Recent Immutable Audit Logs */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102A43]">Recent System Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Latest access control, submission, and official dispatch events.
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-semibold text-[#2563EB] hover:underline"
          >
            Filter &amp; Export Full Ledger →
          </Link>
        </div>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 6).map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#102A43] text-[#F59E0B]">
                  {log.action}
                </span>
                <span className="font-semibold text-[#102A43]">{log.userName}</span>
                <span className="text-slate-600">{log.details}</span>
              </div>
              <span className="text-slate-500 font-mono">
                {formatDate(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </RoleShell>
  );
}
