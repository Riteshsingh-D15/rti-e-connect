"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRightLeft,
  Bot,
  CheckCircle2,
  ExternalLink,
  FileEdit,
  FileText,
  Flame,
  Lock,
  MessageSquareWarning,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, EmptyState, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  "Submitted",
  "Officer Assigned",
  "Under Review",
  "Awaiting Clarification",
  "Draft Prepared",
  "Awaiting Approval",
  "Response Sent",
  "Rejected with Reason",
];

function OfficerApplicationsContent() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");

  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [newStatus, setNewStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [transferDept, setTransferDept] = useState("");
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);

  const [clarifyOpen, setClarifyOpen] = useState(false);
  const [clarifyPrompt, setClarifyPrompt] = useState("");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appsRes, deptRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/departments"),
        ]);
        const appsData = appsRes.ok ? await appsRes.json() : [];
        const deptData = deptRes.ok ? await deptRes.json() : [];

        if (!active) return;
        const appList = Array.isArray(appsData) ? appsData : [];
        const deptNames = Array.isArray(deptData)
          ? deptData.map((d) => d.name)
          : ["Public Works Department", "Education Department", "Health and Family Welfare Department"];

        setApplications(appList);
        setDepartments(deptNames);

        const preferred =
          (focusId && appList.find((a) => a.id === focusId)) || appList[0];
        if (preferred) {
          setSelectedId(preferred.id);
          setNewStatus(preferred.status);
          setInternalNotes(preferred.internalNotes || "");
          setTransferDept(deptNames.find((d) => d !== preferred.department) || deptNames[0] || "");
        }
      } catch {
        if (active) {
          setFeedback({ type: "error", message: "Failed to load officer docket." });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [focusId]);

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchesQuery =
        !q ||
        a.referenceNumber?.toLowerCase().includes(q) ||
        a.subject?.toLowerCase().includes(q) ||
        a.citizenName?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [applications, searchQuery, statusFilter]);

  const selected = useMemo(
    () => applications.find((a) => a.id === selectedId) || null,
    [applications, selectedId]
  );

  const selectApplication = (app) => {
    setSelectedId(app.id);
    setNewStatus(app.status);
    setInternalNotes(app.internalNotes || "");
    setStatusRemarks("");
    setClarifyOpen(false);
    setFeedback({ type: "", message: "" });
  };

  const applyServerUpdate = async (payload, successMessage) => {
    if (!selected) return;
    setSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      const res = await fetch(`/api/applications/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Update failed." });
      } else {
        setApplications((prev) =>
          prev.map((item) => (item.id === selected.id ? data.application : item))
        );
        setNewStatus(data.application.status);
        setFeedback({ type: "success", message: successMessage });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while saving update." });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    await applyServerUpdate(
      {
        status: newStatus,
        remarks: statusRemarks.trim() || `Status updated to ${newStatus} by PIO.`,
      },
      `Application status updated to "${newStatus}".`
    );
    setStatusRemarks("");
  };

  const handleRequestClarification = async (e) => {
    e.preventDefault();
    if (clarifyPrompt.trim().length < 10) {
      setFeedback({
        type: "error",
        message: "Please write clear clarification instructions (at least 10 characters).",
      });
      return;
    }
    await applyServerUpdate(
      {
        status: "Awaiting Clarification",
        remarks: `Clarification Requested: ${clarifyPrompt.trim()}`,
      },
      "Clarification notice dispatched to the Citizen applicant."
    );
    setClarifyPrompt("");
    setClarifyOpen(false);
  };

  const handleSaveNotes = async () => {
    await applyServerUpdate(
      { internalNotes },
      "Confidential officer notes saved (hidden from citizen)."
    );
  };

  const handleConfirmTransfer = async () => {
    if (!transferDept || transferDept === selected?.department) return;
    await applyServerUpdate(
      { department: transferDept },
      `Section 6(3) transfer executed to ${transferDept}.`
    );
    setTransferConfirmOpen(false);
  };

  return (
    <RoleShell
      title="Officer RTI Queue & Case Dossier"
      subtitle="Inspect citizen submissions, verify AI insights, request clarifications, or transfer under Section 6(3)."
      userRole="GOVERNMENT OFFICER"
    >
      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Action Error" : "Action Completed"}
        >
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Loading assigned RTI queue...
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Queue Panel */}
          <Card className="p-4 lg:col-span-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, subject, citizen..."
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {filteredApps.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No applications match this filter.
                </p>
              ) : (
                filteredApps.map((item) => {
                  const isSelected = item.id === selected?.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectApplication(item)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-[#2563EB]">
                          {item.referenceNumber}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-sm font-semibold text-[#102A43] line-clamp-2">
                        {item.subject}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span className="truncate">{item.department}</span>
                        {item.isLifeOrLiberty && (
                          <span className="inline-flex items-center gap-0.5 text-amber-700 font-bold shrink-0">
                            <Flame className="w-3 h-3" /> 48h
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Right Detailed Case Dossier */}
          <div className="lg:col-span-8 space-y-5">
            {!selected ? (
              <EmptyState
                icon={FileText}
                title="Select an RTI Application"
                description="Choose a filing from the left queue to inspect applicant details, AI categorization, and workflow actions."
              />
            ) : (
              <>
                {/* Main Case Card */}
                <Card className="p-6 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#2563EB]">
                          {selected.referenceNumber}
                        </span>
                        <StatusBadge status={selected.status} />
                        {selected.isLifeOrLiberty && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Flame className="w-3.5 h-3.5" /> 48h Life &amp; Liberty
                          </span>
                        )}
                        {selected.isBplExempt && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            BPL Fee Exempt
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-[#102A43]">{selected.subject}</h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="warning"
                        size="sm"
                        onClick={() => setClarifyOpen((v) => !v)}
                        className="gap-1.5"
                      >
                        <MessageSquareWarning className="w-4 h-4" />
                        Request Clarification
                      </Button>
                      <Link href={`/officer/responses?id=${encodeURIComponent(selected.id)}`}>
                        <Button size="sm" className="gap-1.5">
                          <FileEdit className="w-4 h-4" />
                          Draft &amp; Sign Reply
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Quick Clarification Request Box */}
                  {clarifyOpen && (
                    <form
                      onSubmit={handleRequestClarification}
                      className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Section 5(3) Officer Assistance / Clarification Prompt to Citizen
                      </p>
                      <textarea
                        rows={2}
                        required
                        value={clarifyPrompt}
                        onChange={(e) => setClarifyPrompt(e.target.value)}
                        placeholder="Ask applicant to specify exact ward number, financial year, or voucher reference..."
                        className="w-full p-3 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setClarifyOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="saffron" size="sm" disabled={saving}>
                          Send Clarification Request
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Citizen Question & Metadata */}
                  <div className="p-4 rounded-xl bg-[#F4F7FB] border border-slate-200 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Information Requested
                    </p>
                    <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {selected.question}
                    </p>
                  </div>

                  {selected.clarificationResponse && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Citizen Clarification Submitted
                      </p>
                      <p className="text-sm text-slate-800">{selected.clarificationResponse}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200">
                      <p className="text-slate-500">Applicant</p>
                      <p className="font-bold text-[#102A43] mt-0.5">{selected.citizenName}</p>
                      <p className="text-slate-600">{selected.citizenEmail}</p>
                      <p className="text-slate-600">{selected.citizenMobile}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200">
                      <p className="text-slate-500">Jurisdiction &amp; Authority</p>
                      <p className="font-bold text-[#102A43] mt-0.5">{selected.department}</p>
                      <p className="text-slate-600">{selected.publicAuthority}</p>
                      <p className="text-slate-600">Language: {selected.preferredLanguage}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200">
                      <p className="text-slate-500">Statutory Timeline</p>
                      <p className="font-bold text-[#2563EB] mt-0.5">
                        Due: {formatDate(selected.deadlineDate)}
                      </p>
                      <p className="text-slate-600">Filed: {formatDate(selected.filingDate)}</p>
                      <p className="text-slate-600">PIO: {selected.assignedOfficerName}</p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {Array.isArray(selected.documents) && selected.documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Applicant Supporting Documents ({selected.documents.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selected.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F7FB] border border-slate-200 text-xs font-semibold text-[#2563EB] hover:bg-blue-50"
                          >
                            {doc.fileName}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* AI Analysis + Workflow Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* AI Advisory Dossier */}
                  <Card className="p-5 space-y-3 border-blue-200 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-[#2563EB]" />
                        <h3 className="text-sm font-bold text-[#102A43]">AI Advisory Analysis</h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {selected.aiAnalysis?.confidenceScore || 91}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>Category:</strong> {selected.category}
                      {selected.aiAnalysis?.isOverridden && (
                        <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Verified by PIO
                        </span>
                      )}
                    </p>
                    {selected.aiAnalysis?.summary && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {selected.aiAnalysis.summary}
                      </p>
                    )}
                    {Array.isArray(selected.aiAnalysis?.keywords) && (
                      <div className="flex flex-wrap gap-1.5">
                        {selected.aiAnalysis.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-blue-200 text-[#102A43]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/officer/ai-analysis"
                      className="inline-block text-xs font-semibold text-[#2563EB] hover:underline pt-1"
                    >
                      Verify or Override Category →
                    </Link>
                  </Card>

                  {/* Status Update Control */}
                  <Card className="p-5 space-y-3">
                    <h3 className="text-sm font-bold text-[#102A43]">Update Case Status</h3>
                    <form onSubmit={handleStatusUpdate} className="space-y-3">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={statusRemarks}
                        onChange={(e) => setStatusRemarks(e.target.value)}
                        placeholder="Official status remarks for timeline..."
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                      <Button type="submit" size="sm" disabled={saving} className="w-full gap-1.5">
                        <Send className="w-3.5 h-3.5" /> Save Status Update
                      </Button>
                    </form>
                  </Card>

                  {/* Section 6(3) Inter-Department Transfer */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-[#2563EB]" />
                      <h3 className="text-sm font-bold text-[#102A43]">
                        Section 6(3) Legal Transfer
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600">
                      Transfer misdirected applications to the appropriate public authority within 5
                      days of receipt.
                    </p>
                    <select
                      value={transferDept}
                      onChange={(e) => setTransferDept(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={saving || !transferDept || transferDept === selected.department}
                      onClick={() => setTransferConfirmOpen(true)}
                      className="w-full"
                    >
                      Initiate Sec 6(3) Transfer
                    </Button>
                  </Card>

                  {/* Internal Confidential Notes */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-600" />
                      <h3 className="text-sm font-bold text-[#102A43]">
                        Confidential Officer Notes
                      </h3>
                    </div>
                    <textarea
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Record internal file movement, clerk notes, or inspection dates (invisible to citizen)..."
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={saving}
                      onClick={handleSaveNotes}
                      className="w-full"
                    >
                      Save Confidential Notes
                    </Button>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Section 6(3) Transfer Confirmation Modal */}
      {transferConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-[#102A43]">Confirm Section 6(3) Transfer</h3>
              <button
                type="button"
                onClick={() => setTransferConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Transfer <strong>{selected?.referenceNumber}</strong> from{" "}
              <strong>{selected?.department}</strong> to <strong>{transferDept}</strong>? The
              citizen applicant will receive an automatic statutory transfer notice.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransferConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="navy"
                onClick={handleConfirmTransfer}
                disabled={saving}
              >
                Confirm Transfer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </RoleShell>
  );
}

export default function OfficerApplicationsPage() {
  return (
    <Suspense
      fallback={
        <RoleShell title="Officer RTI Queue & Case Dossier" userRole="GOVERNMENT OFFICER">
          <Card className="p-8 text-center text-sm text-slate-500">Loading docket...</Card>
        </RoleShell>
      }
    >
      <OfficerApplicationsContent />
    </Suspense>
  );
}
