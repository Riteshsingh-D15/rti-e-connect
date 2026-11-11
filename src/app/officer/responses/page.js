"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Eye,
  FileEdit,
  Loader2,
  Printer,
  Save,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

function OfficerResponsesContent() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get("id");

  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const [subject, setSubject] = useState("");
  const [responseText, setResponseText] = useState("");
  const [pointWiseResponse, setPointWiseResponse] = useState("");
  const [legalProvisions, setLegalProvisions] = useState("RTI Act 2005 - Section 7(1)");
  const [missingInfoFlag, setMissingInfoFlag] = useState(false);

  const [aiInsights, setAiInsights] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const hydrateFromApplication = (app) => {
    setSelectedId(app.id);
    setSelectedApp(app);
    setAiInsights(null);
    setFeedback({ type: "", message: "" });
    if (app.officialResponse) {
      setSubject(app.officialResponse.subject || `Official Reply: ${app.subject}`);
      setResponseText(app.officialResponse.responseText || "");
      setPointWiseResponse(app.officialResponse.pointWiseResponse || "");
      setLegalProvisions(
        app.officialResponse.legalProvisions || "RTI Act 2005 - Section 7(1)"
      );
      setMissingInfoFlag(Boolean(app.officialResponse.missingInfoFlag));
    } else {
      setSubject(`Information supplied under Section 7(1) regarding: ${app.subject}`);
      setResponseText("");
      setPointWiseResponse("");
      setLegalProvisions("RTI Act 2005 - Section 6(1), Section 7(1), and Section 19(1).");
      setMissingInfoFlag(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/applications");
        const list = res.ok ? await res.json() : [];
        if (!active) return;
        const arr = Array.isArray(list) ? list : [];
        setApplications(arr);
        const match = (initialAppId && arr.find((a) => a.id === initialAppId)) || arr[0];
        if (match) hydrateFromApplication(match);
      } catch {
        if (active) {
          setFeedback({ type: "error", message: "Failed to load RTI applications." });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [initialAppId]);

  const handleGenerateDraft = async () => {
    if (!selectedApp) return;
    setGenerating(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/ai/draft-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: selectedApp.referenceNumber,
          subject: selectedApp.subject,
          question: selectedApp.question,
          department: selectedApp.department,
          applicantName: selectedApp.citizenName,
        }),
      });
      const draft = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: draft.error || "Failed to generate AI draft." });
      } else {
        setSubject(draft.subject || subject);
        setResponseText(draft.fullDraftText || responseText);
        setPointWiseResponse(draft.pointWiseResponse || pointWiseResponse);
        setLegalProvisions(draft.legalProvisions || legalProvisions);
        setMissingInfoFlag((draft.missingInformation || []).length > 0);
        setAiInsights(draft);
        setFeedback({
          type: "success",
          message:
            "Advisory RAG draft synthesized from historical RTI precedents. Review carefully before approving.",
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error generating RAG draft." });
    } finally {
      setGenerating(false);
    }
  };

  const handlePersistResponse = async (targetStatus) => {
    if (!selectedApp) return;
    if (!responseText.trim() && !pointWiseResponse.trim()) {
      setFeedback({
        type: "error",
        message: "Please write or generate response text before saving or approving.",
      });
      return;
    }

    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          subject,
          responseText,
          pointWiseResponse,
          legalProvisions,
          missingInfoFlag,
          status: targetStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Could not save response." });
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? data.application : a))
        );
        setSelectedApp(data.application);
        setFeedback({
          type: "success",
          message:
            targetStatus === "Sent"
              ? `Official reply signed and dispatched for ${selectedApp.referenceNumber}! Citizen notification sent.`
              : targetStatus === "Approved"
              ? `Response approved by PIO for ${selectedApp.referenceNumber}. Ready for dispatch.`
              : `Draft saved for ${selectedApp.referenceNumber}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while saving response." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleShell
      title="Official RTI Response Studio"
      subtitle="Synthesize precedent-grounded AI drafts, verify Section 8 redactions, and sign legally binding orders."
      userRole="GOVERNMENT OFFICER"
    >
      <Alert type="warning" title="Human-in-the-Loop Statutory Rule">
        AI never issues replies automatically. Only an authorized Public Information Officer may
        review, approve, and seal official responses under Section 7(1).
      </Alert>

      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Response Studio Error" : "Saved Successfully"}
        >
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Loading Officer Response Studio...
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Application Selector & Citizen Context */}
          <div className="lg:col-span-4 space-y-4 no-print">
            <Card className="p-5 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Target RTI Case
              </label>
              <select
                value={selectedId}
                onChange={(e) => {
                  const found = applications.find((a) => a.id === e.target.value);
                  if (found) hydrateFromApplication(found);
                }}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.referenceNumber} · {a.status}
                  </option>
                ))}
              </select>

              {selectedApp && (
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563EB]">
                      {selectedApp.referenceNumber}
                    </span>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                  <p className="text-sm font-bold text-[#102A43]">{selectedApp.subject}</p>
                  <p className="text-xs text-slate-600 leading-relaxed bg-[#F4F7FB] p-3 rounded-lg border border-slate-200">
                    {selectedApp.question}
                  </p>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>
                      <strong>Applicant:</strong> {selectedApp.citizenName}
                    </p>
                    <p>
                      <strong>Department:</strong> {selectedApp.department}
                    </p>
                    <p>
                      <strong>Deadline:</strong> {formatDate(selectedApp.deadlineDate)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="saffron"
                    onClick={handleGenerateDraft}
                    disabled={generating}
                    className="w-full gap-2 mt-2"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {generating ? "Generating RAG Draft..." : "Generate AI Precedent Draft"}
                  </Button>
                </div>
              )}
            </Card>

            {/* AI Precedent & Compliance Flags */}
            {aiInsights && (
              <Card className="p-5 space-y-3 border-blue-200 bg-blue-50/30">
                <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                  <Bot className="w-4 h-4 text-[#2563EB]" />
                  RAG Grounding &amp; Compliance Checks
                </div>

                {aiInsights.exemptionsFlagged?.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Section 8 Exemption Alert
                    </p>
                    {aiInsights.exemptionsFlagged.map((ex, i) => (
                      <p key={i}>{ex}</p>
                    ))}
                  </div>
                )}

                {aiInsights.missingInformation?.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Scope Notes
                    </p>
                    {aiInsights.missingInformation.map((mi, i) => (
                      <p key={i}>{mi}</p>
                    ))}
                  </div>
                )}

                {aiInsights.supportingSources?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Precedent Sources Used
                    </p>
                    {aiInsights.supportingSources.map((src, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <div className="flex justify-between font-bold text-[#102A43]">
                          <span className="font-mono">{src.referenceNumber}</span>
                          <span className="text-emerald-700">{src.similarity}% match</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{src.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Official Drafting / Print Preview Studio */}
          <Card className="lg:col-span-8 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-bold text-[#102A43]">
                  {previewMode ? "Official Letterhead Preview" : "PIO Official Reply Editor"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode((p) => !p)}
                  className="gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? "Back to Editor" : "Letterhead Preview"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print Order
                </Button>
              </div>
            </div>

            {previewMode ? (
              <div className="p-6 sm:p-8 rounded-xl border border-slate-300 bg-white space-y-5 text-sm text-slate-900">
                <div className="text-center pb-4 border-b-2 border-[#102A43]">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Government of India / State Public Authority
                  </p>
                  <h3 className="text-lg font-bold text-[#102A43] mt-1">
                    OFFICE OF THE PUBLIC INFORMATION OFFICER · {selectedApp?.department}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    RTI Ref No: {selectedApp?.referenceNumber} · Date:{" "}
                    {new Date().toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-semibold">To: {selectedApp?.citizenName}</p>
                  <p className="font-bold text-[#102A43]">Subject: {subject}</p>
                </div>

                <div className="whitespace-pre-line leading-relaxed">{responseText}</div>

                {pointWiseResponse && (
                  <div className="p-4 rounded-lg bg-[#F4F7FB] border border-slate-200 whitespace-pre-line leading-relaxed">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Point-Wise Factual Schedule
                    </p>
                    {pointWiseResponse}
                  </div>
                )}

                <p className="text-xs font-semibold text-slate-700">
                  Statutory Provisions: {legalProvisions}
                </p>

                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                  <div>
                    <p className="font-semibold">First Appellate Remedy (Section 19(1)):</p>
                    <p className="text-slate-600">
                      Appeal lies within 30 days to First Appellate Authority ({selectedApp?.department}).
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#102A43]">
                      {selectedApp?.officialResponse?.approvedBy || selectedApp?.assignedOfficerName}
                    </p>
                    <p className="text-slate-500">Public Information Officer (PIO)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Official Reply Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Formal Order Body / Covering Reply
                  </label>
                  <textarea
                    rows={8}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Draft or edit the official covering reply letter..."
                    className="w-full p-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Point-Wise Verified Record Summary
                  </label>
                  <textarea
                    rows={5}
                    value={pointWiseResponse}
                    onChange={(e) => setPointWiseResponse(e.target.value)}
                    placeholder="1. Exact expenditure / data figures...&#10;2. Inspection date & record particulars..."
                    className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Cited Legal Provisions
                    </label>
                    <input
                      type="text"
                      value={legalProvisions}
                      onChange={(e) => setLegalProvisions(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 pt-5 cursor-pointer text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={missingInfoFlag}
                      onChange={(e) => setMissingInfoFlag(e.target.checked)}
                      className="w-4 h-4 accent-[#D97706]"
                    />
                    Flag partial records / pending section details
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving || !selectedApp}
                    onClick={() => handlePersistResponse("Draft")}
                    className="gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving || !selectedApp}
                    onClick={() => handlePersistResponse("Approved")}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Mark Approved
                  </Button>
                  <Button
                    type="button"
                    variant="navy"
                    disabled={saving || !selectedApp}
                    onClick={() => handlePersistResponse("Sent")}
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-[#F59E0B]" />
                    )}
                    Sign &amp; Dispatch Official Reply
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </RoleShell>
  );
}

export default function OfficerResponsesPage() {
  return (
    <Suspense
      fallback={
        <RoleShell title="Official RTI Response Studio" userRole="GOVERNMENT OFFICER">
          <Card className="p-8 text-center text-sm text-slate-500">
            Loading Response Studio...
          </Card>
        </RoleShell>
      }
    >
      <OfficerResponsesContent />
    </Suspense>
  );
}
