"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Flame,
  Loader2,
  MessageSquarePlus,
  Printer,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, EmptyState, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/utils";

const STAGES = [
  { key: "Submitted", label: "Filed" },
  { key: "Officer Assigned", label: "PIO Assigned" },
  { key: "Under Review", label: "Scrutiny" },
  { key: "Draft Prepared", label: "Drafting / Approval" },
  { key: "Response Sent", label: "Reply Issued" },
];

function getStageIndex(status) {
  if (["Submitted", "AI Analysis", "Department Identification"].includes(status)) return 0;
  if (status === "Officer Assigned" || status === "Transferred") return 1;
  if (["Under Review", "Awaiting Clarification"].includes(status)) return 2;
  if (["Draft Prepared", "Awaiting Approval"].includes(status)) return 3;
  if (["Response Sent", "Completed"].includes(status)) return 4;
  return 2;
}

function computeSlaProgress(app) {
  if (!app?.filingDate || !app?.deadlineDate) {
    return { percent: 15, label: "Within statutory timeframe", overdue: false };
  }
  if (["Response Sent", "Completed", "Withdrawn"].includes(app.status)) {
    return { percent: 100, label: "Statutorily disposed", overdue: false };
  }
  const start = new Date(app.filingDate).getTime();
  const end = new Date(app.deadlineDate).getTime();
  const now = Date.now();
  const total = Math.max(1, end - start);
  const elapsed = Math.max(0, now - start);
  const percent = Math.min(100, Math.round((elapsed / total) * 100));
  const diffHours = Math.ceil((end - now) / (1000 * 60 * 60));

  if (diffHours <= 0) {
    return { percent: 100, label: "Statutory deadline exceeded", overdue: true };
  }
  if (diffHours <= 48) {
    return { percent, label: `${diffHours} hours remaining`, overdue: false };
  }
  const days = Math.ceil(diffHours / 24);
  return { percent, label: `${days} days remaining`, overdue: false };
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [myApps, setMyApps] = useState([]);
  const [searchRef, setSearchRef] = useState(initialRef);
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const [clarificationText, setClarificationText] = useState("");
  const [submittingClarification, setSubmittingClarification] = useState(false);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawRemarks, setWithdrawRemarks] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const lookupReference = useCallback(async (refValue) => {
    const cleanRef = String(refValue || "").trim();
    if (!cleanRef) return;
    setLoading(true);
    setError("");
    setActionMsg("");

    try {
      const res = await fetch(`/api/applications?ref=${encodeURIComponent(cleanRef)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Application not found");
        setApp(null);
      } else {
        setApp(data);
        setSearchRef(data.referenceNumber);
      }
    } catch {
      setError("Failed to query RTI tracking service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const list = await res.json();
          if (!active) return;
          setMyApps(Array.isArray(list) ? list : []);
          if (initialRef) {
            await lookupReference(initialRef);
          } else if (Array.isArray(list) && list.length > 0) {
            setApp(list[0]);
            setSearchRef(list[0].referenceNumber);
          }
        }
      } catch {
        // ignore list failure
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [initialRef, lookupReference]);

  const handleSubmitClarification = async (e) => {
    e.preventDefault();
    if (!app) return;
    setError("");
    setActionMsg("");
    setSubmittingClarification(true);

    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clarificationReply: clarificationText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit clarification.");
      } else {
        setApp(data.application);
        setClarificationText("");
        setActionMsg("Clarification submitted! Status moved back to Under Review.");
      }
    } catch {
      setError("Network error while sending clarification.");
    } finally {
      setSubmittingClarification(false);
    }
  };

  const handleWithdraw = async () => {
    if (!app) return;
    setWithdrawing(true);
    setError("");

    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          remarks:
            withdrawRemarks.trim() || "Voluntarily withdrawn by citizen applicant.",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not withdraw application.");
      } else {
        setApp(data.application);
        setWithdrawModalOpen(false);
        setActionMsg("Application has been withdrawn.");
      }
    } catch {
      setError("Network error while withdrawing application.");
    } finally {
      setWithdrawing(false);
    }
  };

  const sla = app ? computeSlaProgress(app) : null;
  const activeStageIndex = app ? getStageIndex(app.status) : 0;
  const officialResponse =
    app?.officialResponse &&
    (["Approved", "Sent"].includes(app.officialResponse.status) ||
      ["Response Sent", "Completed"].includes(app.status))
      ? app.officialResponse
      : null;
  const documents = Array.isArray(app?.documents) ? app.documents : [];

  return (
    <RoleShell
      title="Track RTI Application"
      subtitle="Monitor live milestones, reply to PIO clarification requests, and download official orders."
      userRole="CITIZEN"
    >
      {/* Search & Quick Selector Bar */}
      <Card className="p-5 sm:p-6 space-y-4 no-print">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupReference(searchRef);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="Enter Reference Number (e.g., RTI-2026-PWD-4821)"
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 px-6 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Track Status
          </Button>
        </form>

        {myApps.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Your Filings:</span>
            {myApps.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => lookupReference(item.referenceNumber)}
                className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  app?.referenceNumber === item.referenceNumber
                    ? "bg-[#102A43] text-white border-[#102A43]"
                    : "bg-[#F4F7FB] text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {item.referenceNumber}
              </button>
            ))}
          </div>
        )}
      </Card>

      {error && (
        <Alert type="error" title="Lookup Failed">
          {error}
        </Alert>
      )}
      {actionMsg && (
        <Alert type="success" title="Status Updated">
          {actionMsg}
        </Alert>
      )}

      {!app && !loading && (
        <EmptyState
          icon={FileText}
          title="Select or search an RTI Reference Number"
          description="Enter your statutory reference number above or click one of your filings to inspect live milestones."
        />
      )}

      {app && (
        <div className="space-y-6">
          {/* Header Dossier & SLA Progress */}
          <Card className="p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
                    {app.referenceNumber}
                  </span>
                  <CopyButton value={app.referenceNumber} label="Copy Ref" compact />
                  <StatusBadge status={app.status} />
                  {app.isLifeOrLiberty && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Flame className="w-3.5 h-3.5" /> 48h Life & Liberty
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-[#102A43]">{app.subject}</h2>
                <p className="text-sm text-slate-600">{app.question}</p>
              </div>

              <div className="flex flex-wrap gap-2.5 no-print shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Certificate
                </Button>
                {!["Response Sent", "Completed", "Withdrawn"].includes(app.status) && (
                  <>
                    <Link href="/citizen/appeals">
                      <Button variant="secondary" size="sm">
                        File First Appeal
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setWithdrawModalOpen(true)}
                      className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                    >
                      Withdraw RTI
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Horizontal Stage Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {STAGES.map((stage, idx) => {
                const completed = idx <= activeStageIndex && app.status !== "Withdrawn";
                return (
                  <div
                    key={stage.key}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      completed
                        ? "bg-[#EFF6FF] border-[#2563EB]/40"
                        : "bg-slate-50 border-slate-200 opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1.5">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#102A43]">{stage.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Metadata + SLA Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500">Department & Authority</p>
                <p className="text-sm font-bold text-[#102A43] mt-1">{app.department}</p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{app.publicAuthority}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500">Assigned PIO</p>
                <p className="text-sm font-bold text-[#102A43] mt-1">
                  {app.assignedOfficerName || "Pending Assignment"}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">Category: {app.category}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
                <p className="text-[11px] font-medium text-slate-500">Filing & Deadline Dates</p>
                <p className="text-xs text-slate-700 mt-1">Filed: {formatDate(app.filingDate)}</p>
                <p className="text-sm font-bold text-[#2563EB] mt-0.5">
                  Due: {formatDate(app.deadlineDate)}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F7FB] border border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                  <span>Statutory SLA Progress</span>
                  <span className={sla?.overdue ? "text-rose-700 font-bold" : "text-[#102A43] font-bold"}>
                    {sla?.percent}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sla?.overdue
                        ? "bg-rose-600"
                        : app.status === "Response Sent"
                        ? "bg-emerald-600"
                        : "bg-[#2563EB]"
                    }`}
                    style={{ width: `${sla?.percent || 0}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-1.5">{sla?.label}</p>
              </div>
            </div>
          </Card>

          {/* Citizen Clarification Form (when requested by PIO) */}
          {app.status === "Awaiting Clarification" && (
            <Card className="p-6 border-orange-300 bg-orange-50/50 space-y-4 no-print">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-[#102A43]">
                    Action Required: PIO Clarification Request
                  </h3>
                  <p className="text-sm text-slate-700 mt-1">
                    {app.statusHistory?.[app.statusHistory.length - 1]?.remarks ||
                      "Please clarify the exact date range, ward, or document reference requested."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitClarification} className="space-y-3">
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  value={clarificationText}
                  onChange={(e) => setClarificationText(e.target.value)}
                  placeholder="Provide specific additional details or clarify exact scope (minimum 10 characters)..."
                  className="w-full p-3.5 rounded-xl border border-orange-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <Button
                  type="submit"
                  variant="saffron"
                  disabled={submittingClarification}
                  className="gap-2"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  {submittingClarification ? "Sending Reply..." : "Submit Clarification Reply"}
                </Button>
              </form>
            </Card>
          )}

          {/* Official Approved Response */}
          {officialResponse && (
            <Card className="p-6 border-emerald-300 bg-emerald-50/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-lg font-bold text-[#102A43]">
                    Official Approved RTI Order ({officialResponse.status})
                  </h3>
                </div>
                <span className="text-xs font-medium text-emerald-800">
                  Authorized by {officialResponse.approvedBy || app.assignedOfficerName}
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white border border-emerald-200 space-y-3 text-sm text-slate-800">
                {officialResponse.subject && (
                  <p className="font-bold text-[#102A43]">{officialResponse.subject}</p>
                )}
                <p className="leading-relaxed whitespace-pre-line">
                  {officialResponse.responseText}
                </p>
                {officialResponse.pointWiseResponse && (
                  <div className="p-3.5 rounded-lg bg-[#F4F7FB] border border-slate-200 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                    {officialResponse.pointWiseResponse}
                  </div>
                )}
                {officialResponse.legalProvisions && (
                  <p className="text-xs font-semibold text-slate-600 pt-1">
                    Cited Statutory Provisions: {officialResponse.legalProvisions}
                  </p>
                )}
              </div>

              {(officialResponse.sentAt || officialResponse.approvedAt) && (
                <p className="text-xs text-slate-600">
                  Signed &amp; Dispatched on{" "}
                  {formatDate(officialResponse.sentAt || officialResponse.approvedAt)}
                </p>
              )}
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Status Timeline */}
            <Card className="p-6 lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-[#102A43]">Statutory Audit Timeline</h3>
              <div className="space-y-4">
                {(app.statusHistory || []).map((entry, index) => (
                  <div key={entry.id || index} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#2563EB] mt-1.5" />
                      {index < app.statusHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-slate-500">
                          {formatDate(entry.createdAt)} · {entry.updatedBy}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1">{entry.remarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Uploaded Attachments */}
            <Card className="p-6 lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-[#102A43]">
                Supporting Documents ({documents.length})
              </h3>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No supporting documents were attached with this filing.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#F4F7FB] border border-slate-200"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#102A43] truncate">
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-slate-500">{doc.ocrStatus || "Verified"}</p>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline shrink-0"
                        >
                          Open <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-[#102A43]">Confirm RTI Withdrawal</h3>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Withdrawing <strong>{app?.referenceNumber}</strong> will mark the filing permanently as{" "}
              <strong>Withdrawn</strong>.
            </p>
            <textarea
              rows={2}
              value={withdrawRemarks}
              onChange={(e) => setWithdrawRemarks(e.target.value)}
              placeholder="Optional reason for withdrawal..."
              className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setWithdrawModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </RoleShell>
  );
}

export default function CitizenTrackPage() {
  return (
    <Suspense
      fallback={
        <RoleShell title="Track RTI Application" userRole="CITIZEN">
          <Card className="p-8 text-center text-sm text-slate-600">
            Loading RTI application tracker...
          </Card>
        </RoleShell>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
