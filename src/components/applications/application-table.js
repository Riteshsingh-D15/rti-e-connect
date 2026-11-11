"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, ExternalLink, FileText, Flame, Search, X } from "lucide-react";
import { StatusBadge, EmptyState } from "@/components/ui";
import { CopyButton } from "@/components/ui/copy-button";

export function getStatusBadge(status) {
  switch (status) {
    case "Submitted":
    case "AI Analysis":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "Officer Assigned":
    case "Under Review":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "Awaiting Clarification":
      return "bg-orange-50 text-orange-800 border-orange-200";
    case "Draft Prepared":
    case "Awaiting Approval":
      return "bg-purple-50 text-purple-800 border-purple-200";
    case "Response Sent":
    case "Completed":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "Appeal Filed":
    case "Rejected with Reason":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "Transferred":
      return "bg-cyan-50 text-cyan-800 border-cyan-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function formatDeadlineCountdown(deadlineDate, status) {
  if (["Response Sent", "Completed", "Withdrawn"].includes(status)) {
    return { label: "Disposed", tone: "text-emerald-700" };
  }
  if (!deadlineDate) {
    return { label: "30 Days", tone: "text-amber-700" };
  }
  const diffHours = Math.ceil(
    (new Date(deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60)
  );
  if (diffHours <= 0) {
    return { label: "Overdue", tone: "text-rose-700 font-bold" };
  }
  if (diffHours <= 48) {
    return { label: `${diffHours}h left`, tone: "text-rose-700 font-bold" };
  }
  const days = Math.ceil(diffHours / 24);
  return {
    label: `${days}d left`,
    tone: days <= 5 ? "text-amber-700 font-bold" : "text-slate-600",
  };
}

const STATUS_FILTERS = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active / Pending" },
  { key: "CLARIFICATION", label: "Clarification" },
  { key: "RESPONDED", label: "Responded" },
];

function matchesStatusFilter(status, filterKey) {
  if (filterKey === "ALL") return true;
  if (filterKey === "CLARIFICATION") return status === "Awaiting Clarification";
  if (filterKey === "RESPONDED") {
    return ["Response Sent", "Completed"].includes(status);
  }
  return !["Response Sent", "Completed", "Withdrawn", "Rejected with Reason"].includes(status);
}

export function ApplicationTable({ rows = [], isOfficer = false, showFilters = true }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!matchesStatusFilter(row.status, statusFilter)) return false;
      if (!q) return true;
      return (
        String(row.referenceNumber || "").toLowerCase().includes(q) ||
        String(row.subject || "").toLowerCase().includes(q) ||
        String(row.department || "").toLowerCase().includes(q) ||
        String(row.category || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  if (!rows.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No RTI applications found"
        description={
          isOfficer
            ? "Assigned applications matching your criteria will appear here."
            : "Once you file an RTI request, it will appear here with real-time statutory tracking."
        }
        action={
          !isOfficer ? (
            <Link
              href="/citizen/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              Submit New RTI Request
            </Link>
          ) : null
        }
      />
    );
  }

  return (
    <>
      {showFilters && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by Ref No., subject or dept..."
              aria-label="Filter RTI applications"
              className="h-9 w-full rounded-xl border border-slate-200 bg-[#F4F7FB] pr-8 pl-8 text-xs font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search filter"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? "border-[#102A43] bg-[#102A43] text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center">
          <p className="text-sm font-bold text-[#102A43]">No matching RTI applications</p>
          <p className="mt-1 text-xs text-slate-500">
            Try clearing your search text or selecting All statuses.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("ALL");
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#102A43] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1B3A57]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="surface-3d hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-[#102A43] text-white">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-wider uppercase">
                      Reference No.
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-wider uppercase">
                      Subject &amp; Particulars
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-wider uppercase">
                      Department
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-wider uppercase">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[11px] font-bold tracking-wider uppercase">
                      SLA Deadline
                    </th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-bold tracking-wider uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row) => {
                    const sla = formatDeadlineCountdown(row.deadlineDate, row.status);
                    const href = isOfficer
                      ? `/officer/applications?id=${row.id}`
                      : `/citizen/track?ref=${row.referenceNumber}`;
                    return (
                      <tr
                        key={row.referenceNumber}
                        className="transition hover:bg-blue-50/35"
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Link
                              href={href}
                              className="font-mono text-xs font-bold text-[#2563EB] hover:underline"
                            >
                              {row.referenceNumber}
                            </Link>
                            <CopyButton value={row.referenceNumber} compact />
                          </div>
                          {row.isLifeOrLiberty ? (
                            <div className="mt-1 inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                              <Flame className="h-3 w-3" /> 48h Urgent
                            </div>
                          ) : null}
                        </td>
                        <td className="max-w-xs px-5 py-4 align-top">
                          <div className="line-clamp-1 text-xs font-bold text-[#102A43] sm:text-sm">
                            {row.subject}
                          </div>
                          <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {row.question}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-xs">
                          <div className="font-semibold text-slate-900">
                            {row.department}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {row.category || "General"}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-5 py-4 align-top text-xs">
                          <div className={`flex items-center gap-1.5 ${sla.tone}`}>
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{sla.label}</span>
                          </div>
                          {row.deadlineDate ? (
                            <div className="mt-0.5 text-[10px] text-slate-400">
                              {new Date(row.deadlineDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-5 py-4 text-right align-top">
                          <Link
                            href={
                              isOfficer
                                ? `/officer/responses?id=${row.id}`
                                : `/citizen/track?ref=${row.referenceNumber}`
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#2563EB] shadow-2xs transition hover:-translate-y-0.5 hover:bg-[#2563EB] hover:text-white"
                          >
                            {isOfficer ? "Review & Respond" : "Track"}{" "}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredRows.map((row) => {
              const sla = formatDeadlineCountdown(row.deadlineDate, row.status);
              return (
                <div
                  key={row.referenceNumber}
                  className="surface-3d rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        {row.referenceNumber}
                      </span>
                      <CopyButton value={row.referenceNumber} compact />
                      {row.isLifeOrLiberty ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          <Flame className="h-3 w-3" /> 48h Urgent
                        </span>
                      ) : null}
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <h3 className="mt-2 line-clamp-2 text-sm font-bold text-[#102A43]">
                    {row.subject}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {row.question}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {row.department}
                      </div>
                      <div className={`mt-0.5 flex items-center gap-1 ${sla.tone}`}>
                        <Clock className="h-3 w-3" /> {sla.label}
                      </div>
                    </div>
                    <Link
                      href={
                        isOfficer
                          ? `/officer/responses?id=${row.id}`
                          : `/citizen/track?ref=${row.referenceNumber}`
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-[#102A43] px-3 py-1.5 text-xs font-bold text-white shadow-xs"
                    >
                      {isOfficer ? "Review" : "Track"}{" "}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
