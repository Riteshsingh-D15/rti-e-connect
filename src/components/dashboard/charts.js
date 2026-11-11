"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#102A43", "#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#0EA5E9"];
const emptySubscribe = () => () => {};

export function DashboardCharts({ summary = null }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const departmentData =
    summary?.departmentData?.length > 0
      ? summary.departmentData.map((d) => ({
          name: d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name,
          value: d.count,
        }))
      : [
          { name: "Public Works", value: 1 },
          { name: "Education", value: 1 },
          { name: "Health", value: 1 },
        ];

  const monthlyTrend =
    summary?.monthlyData?.length > 0
      ? summary.monthlyData
      : [{ month: "Current", applications: summary?.total || 3, resolved: summary?.responded || 1 }];

  const pieData = [
    { name: "Initial / Assigned", value: summary?.pending ?? 1 },
    { name: "Active Review", value: summary?.underReview ?? 1 },
    { name: "Response Sent", value: summary?.responded ?? 1 },
  ].filter((d) => d.value > 0);

  const aiConfidenceData =
    summary?.aiConfidenceData?.length > 0
      ? summary.aiConfidenceData
      : [
          { name: "Infrastructure", accuracy: 94 },
          { name: "Education", accuracy: 96 },
          { name: "Healthcare", accuracy: 91 },
        ];

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102A43] sm:text-base">
              Department-Wise Caseload
            </h3>
            <p className="text-xs text-slate-500">
              Live application count across public authorities
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#2563EB]">
            Live Data
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip />
              <Bar dataKey="value" name="Applications" radius={[8, 8, 0, 0]} fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102A43] sm:text-base">
              Filing vs Disposal Activity
            </h3>
            <p className="text-xs text-slate-500">
              Submitted requests and official replies dispatched
            </p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="applications"
                name="Filed"
                stroke="#102A43"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                name="Responded"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#102A43] sm:text-base">
            Workflow Stage Distribution
          </h3>
          <p className="text-xs text-slate-500">
            Active RTI portfolio breakdown by lifecycle stage
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: "Active", value: 1 }]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                outerRadius={82}
                innerRadius={48}
                paddingAngle={3}
              >
                {(pieData.length ? pieData : [{ name: "Active", value: 1 }]).map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102A43] sm:text-base">
              AI Classification Confidence (%)
            </h3>
            <p className="text-xs text-slate-500">
              Average confidence score per predicted domain
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
            Advisory AI
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aiConfidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip />
              <Bar
                dataKey="accuracy"
                name="Confidence %"
                radius={[8, 8, 0, 0]}
                fill="#F59E0B"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
