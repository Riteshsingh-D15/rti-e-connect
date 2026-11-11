import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Clock,
  FilePlus,
  MessageSquareWarning,
  ShieldAlert,
} from "lucide-react";
import { ApplicationTable } from "@/components/applications/application-table";
import { DashboardCharts } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleShell } from "@/components/layout/role-shell";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui";
import { getAuthSession } from "@/lib/auth";
import { readStore } from "@/lib/data-store";

export const dynamic = "force-dynamic";

function buildCitizenSummary(applications = []) {
  const deptCounts = {};
  const monthCounts = {};
  const aiConfMap = {};

  for (const app of applications) {
    const dept = app.department || "Other";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;

    const d = new Date(app.filingDate || app.createdAt || Date.now());
    const valid = !Number.isNaN(d.getTime());
    const monthKey = valid
      ? d.toLocaleString("en-IN", { month: "short", year: "2-digit" })
      : "Current";
    const sortTs = valid ? new Date(d.getFullYear(), d.getMonth(), 1).getTime() : 0;
    if (!monthCounts[monthKey]) {
      monthCounts[monthKey] = { month: monthKey, applications: 0, resolved: 0, sortTs };
    }
    monthCounts[monthKey].applications += 1;
    if (["Response Sent", "Completed"].includes(app.status)) {
      monthCounts[monthKey].resolved += 1;
    }

    const cat = app.category || "General";
    if (!aiConfMap[cat]) {
      aiConfMap[cat] = { sum: 0, count: 0 };
    }
    const rawConf = Number(app.aiAnalysis?.confidenceScore ?? app.aiAnalysis?.confidence ?? 0.92);
    aiConfMap[cat].sum += rawConf > 1 ? rawConf : Math.round(rawConf * 100);
    aiConfMap[cat].count += 1;
  }

  const pending = applications.filter((a) =>
    ["Submitted", "AI Analysis", "Department Identification", "Officer Assigned"].includes(a.status)
  ).length;
  const underReview = applications.filter((a) =>
    ["Under Review", "Draft Prepared", "Awaiting Approval", "Awaiting Clarification"].includes(a.status)
  ).length;
  const responded = applications.filter((a) =>
    ["Response Sent", "Completed"].includes(a.status)
  ).length;

  return {
    total: applications.length,
    pending,
    underReview,
    responded,
    departmentData: Object.entries(deptCounts).map(([name, count]) => ({ name, count })),
    monthlyData: Object.values(monthCounts)
      .sort((a, b) => a.sortTs - b.sortTs)
      .map(({ sortTs, ...rest }) => rest),
    aiConfidenceData: Object.entries(aiConfMap).map(([name, v]) => ({
      name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
      accuracy: Math.min(100, Math.round(v.sum / v.count)),
    })),
  };
}

export default async function CitizenDashboardPage() {
  const session = await getAuthSession();
  const store = await readStore();
  const allApps = store.applications || [];
  const allAppeals = store.appeals || [];

  const isAdmin = session?.user?.role === "ADMINISTRATOR";
  const userId = session?.user?.id;

  const applications =
    isAdmin || !userId
      ? allApps
      : allApps.filter((a) => a.citizenId === userId);
  const appeals =
    isAdmin || !userId
      ? allAppeals
      : allAppeals.filter((ap) => ap.citizenId === userId);

  const summary = buildCitizenSummary(applications);
  const clarificationNeeded = applications.filter(
    (a) => a.status === "Awaiting Clarification"
  );

  const stats = [
    {
      title: "Total Applications",
      value: String(summary.total),
      detail: "Your filed RTI requests",
      icon: Briefcase,
      tone: "navy",
    },
    {
      title: "Pending Routing",
      value: String(summary.pending),
      detail: "Assigned to department",
      icon: Clock,
      tone: "blue",
    },
    {
      title: "Under Review",
      value: String(summary.underReview),
      detail: "Active scrutiny by PIO",
      icon: AlertCircle,
      tone: "amber",
    },
    {
      title: "Responded",
      value: String(summary.responded),
      detail: "Official reply issued",
      icon: CheckCircle,
      tone: "emerald",
    },
    {
      title: "Appeals Filed",
      value: String(appeals.length),
      detail: "Section 19(1) First Appeals",
      icon: ShieldAlert,
      tone: "rose",
    },
  ];

  return (
    <RoleShell
      title="Citizen RTI Services Dashboard"
      subtitle="Track applications, respond to clarifications, review statutory replies, and file appeals under the RTI Act, 2005."
      userRole="CITIZEN"
    >
      {/* Welcome & Primary CTA Banner */}
      <div className="hero-3d-banner surface-3d-lg flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 text-white">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-sky-200">
            Welcome, {session?.user?.name || "Citizen Applicant"}
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Exercise Your Right to Information
          </h2>
          <p className="mt-1 text-sm text-sky-100 max-w-2xl">
            Submit formal RTI requests to Central or State Public Authorities with real-time 30-day
            &amp; 48-hour statutory deadline protection.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/citizen/submit">
            <Button variant="saffron" className="font-bold">
              <FilePlus className="mr-2 h-4 w-4" /> Submit New RTI
            </Button>
          </Link>
          <Link href="/citizen/track">
            <Button variant="glass">
              Track Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Actionable Clarification Needed Alert */}
      {clarificationNeeded.length > 0 && (
        <Alert type="warning" title="PIO Requested Clarification">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <MessageSquareWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                The Public Information Officer needs additional clarification on{" "}
                <strong>{clarificationNeeded[0].referenceNumber}</strong> (
                {clarificationNeeded[0].subject}).
              </span>
            </div>
            <Link
              href={`/citizen/track?ref=${encodeURIComponent(
                clarificationNeeded[0].referenceNumber
              )}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102A43] underline shrink-0"
            >
              Submit Clarification Reply <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Alert>
      )}

      {/* 5 Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Analytics & Distribution Charts */}
      <DashboardCharts summary={summary} />

      {/* Recent RTI Applications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#102A43]">Your RTI Applications</h2>
            <p className="text-xs text-slate-500">
              Live tracker of requests filed under your account across public authorities.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/citizen/applications">
              <Button variant="outline" size="sm">
                View All History
              </Button>
            </Link>
            <Link href="/citizen/submit">
              <Button size="sm">
                File New Request <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        <ApplicationTable rows={applications} isOfficer={false} />
      </section>
    </RoleShell>
  );
}
