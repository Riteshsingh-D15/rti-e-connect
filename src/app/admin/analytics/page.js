"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  FileBarChart,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        if (!res.ok) {
          if (active) setError(data.error || "Failed to load portal analytics.");
        } else if (active) {
          setSummary(data);
        }
      } catch {
        if (active) setError("Network error fetching analytics telemetry.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleDownloadCSV = () => {
    if (!summary) return;
    const rows = [
      ["Metric", "Value"],
      ["Total RTI Applications", summary.total],
      ["Pending / Assigned", summary.pending],
      ["Under Active Review", summary.underReview],
      ["Responses Issued", summary.responded],
      ["Overdue Cases", summary.overdueCount || 0],
      ["Statutory Compliance Rate (%)", summary.statutoryComplianceRate],
      ["Average Disposal Time (Days)", summary.avgProcessingTimeDays],
      [],
      ["Department", "Volume"],
      ...(summary.departmentData || []).map((d) => [d.name, d.count]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rti-compliance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleShell
      title="Executive Analytics & SLA Telemetry"
      subtitle="Live statutory compliance metrics, departmental volume trends, and AI accuracy telemetry."
      userRole="ADMINISTRATOR"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#102A43]">Statutory Compliance Intelligence</h2>
          <p className="text-xs text-slate-500">
            Computed in real time from active RTI E Connect case records and disposal logs.
          </p>
        </div>

        <Button
          type="button"
          variant="navy"
          disabled={!summary}
          onClick={handleDownloadCSV}
          className="gap-2"
        >
          <Download className="w-4 h-4 text-[#F59E0B]" />
          Export Compliance Report (CSV)
        </Button>
      </div>

      {error && (
        <Alert type="error" title="Telemetry Error">
          {error}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Computing live analytics &amp; department charts...
        </Card>
      ) : (
        summary && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total RTI Volume"
                value={String(summary.total)}
                detail={`${summary.responded} cases disposed`}
                icon={FileBarChart}
                tone="navy"
              />
              <StatCard
                title="Compliance Rate"
                value={`${summary.statutoryComplianceRate}%`}
                detail="Section 7(1) 30-day mandate"
                icon={CheckCircle2}
                tone="emerald"
              />
              <StatCard
                title="Avg. Turnaround"
                value={`${summary.avgProcessingTimeDays} days`}
                detail="Filing to PIO dispatch"
                icon={Clock}
                tone="blue"
              />
              <StatCard
                title="Overdue Breach Risk"
                value={String(summary.overdueCount || 0)}
                detail="Requires immediate escalation"
                icon={AlertTriangle}
                tone="amber"
              />
            </div>

            <DashboardCharts summary={summary} />

            {/* Department Workload Breakdown */}
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-bold text-[#102A43]">
                Department-Wise Caseload Distribution
              </h3>
              <div className="space-y-3">
                {(summary.departmentData || []).map((dept) => {
                  const pct = summary.total
                    ? Math.round((dept.count / summary.total) * 100)
                    : 0;
                  return (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#102A43]">{dept.name}</span>
                        <span className="text-slate-600">
                          {dept.count} filings ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#2563EB]"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )
      )}
    </RoleShell>
  );
}
