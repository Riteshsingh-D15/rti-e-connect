import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  FileEdit,
  Flame,
  Scale,
} from "lucide-react";
import { ApplicationTable } from "@/components/applications/application-table";
import { DashboardCharts } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleShell } from "@/components/layout/role-shell";
import { StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth";
import { getAnalyticsSummary, readStore } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function computeRemainingLabel(deadlineDate, referenceMs) {
  if (!deadlineDate) return { label: "30d SLA", urgent: false };
  const hours = Math.ceil((new Date(deadlineDate).getTime() - referenceMs) / (1000 * 60 * 60));
  if (hours <= 0) return { label: "OVERDUE", urgent: true };
  if (hours <= 48) return { label: `${hours}h remaining`, urgent: true };
  const days = Math.ceil(hours / 24);
  return { label: `${days}d remaining`, urgent: days <= 5 };
}

export default async function OfficerDashboardPage() {
  const session = await getAuthSession();
  const [store, summary] = await Promise.all([readStore(), getAnalyticsSummary()]);
  const applications = store.applications || [];
  const appeals = store.appeals || [];
  const referenceMs = summary.serverNow || 0;

  const activeQueue = applications
    .filter((a) => !["Response Sent", "Completed", "Withdrawn"].includes(a.status))
    .sort((a, b) => new Date(a.deadlineDate || 0) - new Date(b.deadlineDate || 0));

  const urgentCount = activeQueue.filter((a) => {
    if (a.isLifeOrLiberty) return true;
    const hours = (new Date(a.deadlineDate).getTime() - referenceMs) / (1000 * 60 * 60);
    return hours <= 120;
  }).length;

  const openAppeals = appeals.filter(
    (ap) => !["Allowed", "Dismissed", "Disposed"].includes(ap.status)
  ).length;

  const stats = [
    {
      title: "Total Docket",
      value: String(summary.total),
      detail: `${activeQueue.length} currently active`,
      icon: Briefcase,
      tone: "navy",
    },
    {
      title: "Active Review Queue",
      value: String(summary.underReview + summary.pending),
      detail: "Pending or under scrutiny",
      icon: Clock,
      tone: "blue",
    },
    {
      title: "Urgent / ≤5d SLA",
      value: String(urgentCount),
      detail: `${summary.overdueCount || 0} past statutory deadline`,
      icon: AlertTriangle,
      tone: "amber",
    },
    {
      title: "Responses Issued",
      value: String(summary.responded),
      detail: `${summary.statutoryComplianceRate}% SLA compliance`,
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      title: "Open First Appeals",
      value: String(openAppeals),
      detail: `${appeals.length} total Sec 19(1) appeals`,
      icon: Scale,
      tone: "rose",
    },
  ];

  return (
    <RoleShell
      title="Public Information Officer Workbench"
      subtitle={`Signed in as ${session?.user?.name || "PIO Officer"} · ${
        session?.user?.designation || "Public Information Officer"
      }`}
      userRole="GOVERNMENT OFFICER"
    >
      {/* Top Statutory Command Banner */}
      <div className="hero-3d-banner-navy surface-3d-lg flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 text-white">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
            <Bot className="w-4 h-4" /> AI-Assisted Decision Support Active
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Officer Review, Drafting &amp; Statutory Sign-Off
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            AI provides advisory categorization and RAG precedent drafts. Final statutory approval
            and legal dispatch require authorized PIO verification.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/officer/applications">
            <Button variant="saffron" className="font-bold">
              Open Review Queue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/officer/responses">
            <Button variant="glass">
              <FileEdit className="mr-2 h-4 w-4" /> Draft / Sign Reply
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Live Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((st) => (
          <StatCard key={st.title} {...st} />
        ))}
      </div>

      {/* Urgent SLA Priority Queue */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#102A43]">
              Priority SLA Queue ({activeQueue.length} Active)
            </h2>
            <p className="text-xs text-slate-500">
              Sorted by earliest statutory deadline (48-hour Life &amp; Liberty and 30-day due
              dates).
            </p>
          </div>
          <Link
            href="/officer/applications"
            className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            Manage All Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeQueue.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">
            All pending RTI applications have been disposed of!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeQueue.slice(0, 6).map((item) => {
              const rem = computeRemainingLabel(item.deadlineDate, referenceMs);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${
                    item.isLifeOrLiberty || rem.urgent
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-[#F4F7FB] border-slate-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        {item.referenceNumber}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <h3 className="text-sm font-bold text-[#102A43] line-clamp-2">
                      {item.subject}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span>{item.department}</span>
                      <span>·</span>
                      <span className={rem.urgent ? "text-rose-700 font-bold" : "font-medium"}>
                        {rem.label}
                      </span>
                      {item.isLifeOrLiberty && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <Flame className="w-3 h-3" /> 48h Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Due: {formatDate(item.deadlineDate)} · Applicant: {item.citizenName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                    <Link
                      href={`/officer/applications?id=${encodeURIComponent(item.id)}`}
                      className="flex-1 text-center px-3 py-1.5 rounded-lg bg-[#102A43] text-white text-xs font-semibold hover:bg-[#1B3A57] transition-colors"
                    >
                      Inspect Dossier
                    </Link>
                    <Link
                      href={`/officer/responses?id=${encodeURIComponent(item.id)}`}
                      className="flex-1 text-center px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[#102A43] text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Draft Response
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Analytics Charts */}
      <DashboardCharts summary={summary} />

      {/* Full Docket Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102A43]">Recent Applications Docket</h2>
            <p className="text-xs text-slate-500">Complete citizen filing stream across units.</p>
          </div>
        </div>
        <ApplicationTable rows={applications} isOfficer={true} />
      </section>
    </RoleShell>
  );
}
