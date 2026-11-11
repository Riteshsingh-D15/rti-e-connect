"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ExternalLink,
  Gavel,
  Loader2,
  Paperclip,
  Scale,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, EmptyState, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const APPEAL_DECISIONS = ["Submitted", "Under Hearing", "Allowed", "Dismissed"];

export default function OfficerAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [appLookup, setAppLookup] = useState({});
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appealRes, appRes] = await Promise.all([
          fetch("/api/appeals"),
          fetch("/api/applications"),
        ]);
        const appealList = appealRes.ok ? await appealRes.json() : [];
        const appList = appRes.ok ? await appRes.json() : [];
        if (!active) return;

        const map = {};
        for (const a of Array.isArray(appList) ? appList : []) {
          map[a.id] = a;
        }
        setAppLookup(map);

        const arr = Array.isArray(appealList) ? appealList : [];
        setAppeals(arr);

        const draftEdits = {};
        for (const ap of arr) {
          draftEdits[ap.id] = {
            status: ap.status || "Under Hearing",
            hearingDate: ap.hearingDate ? ap.hearingDate.slice(0, 10) : "",
            decisionRemarks: ap.decisionRemarks || "",
          };
        }
        setEdits(draftEdits);
      } catch {
        if (active) setFeedback({ type: "error", message: "Unable to load appeals." });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveOrder = async (appealId) => {
    const form = edits[appealId];
    if (!form) return;
    setSavingId(appealId);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/appeals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appealId,
          status: form.status,
          hearingDate: form.hearingDate || null,
          decisionRemarks: form.decisionRemarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update appeal order." });
      } else {
        setAppeals((prev) =>
          prev.map((a) => (a.id === appealId ? data.appeal : a))
        );
        setFeedback({
          type: "success",
          message: `First Appeal ${data.appeal.appealNumber} updated to "${data.appeal.status}". Citizen notified.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while recording FAA order." });
    } finally {
      setSavingId("");
    }
  };

  return (
    <RoleShell
      title="First Appellate Authority Review (Section 19(1))"
      subtitle="Schedule hearings, inspect disputed RTI orders, and issue binding Appellate directives."
      userRole="GOVERNMENT OFFICER"
    >
      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Order Error" : "Appellate Order Saved"}
        >
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">Loading appeals docket...</Card>
      ) : appeals.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No Pending First Appeals"
          description="No Section 19(1) appeals have been preferred against current RTI orders."
        />
      ) : (
        <div className="space-y-5">
          {appeals.map((appeal) => {
            const linkedRti = appLookup[appeal.applicationId];
            const form = edits[appeal.id] || {
              status: appeal.status,
              hearingDate: "",
              decisionRemarks: "",
            };

            return (
              <Card key={appeal.id} className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        {appeal.appealNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-xs text-slate-600">
                        Linked RTI: {appeal.applicationReferenceNumber}
                      </span>
                      <StatusBadge status={appeal.status} />
                    </div>
                    <h3 className="text-base font-bold text-[#102A43] mt-1">
                      {appeal.groundOfAppeal}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Appellant: {appeal.citizenName} · Filed: {formatDate(appeal.filedAt)} ·{" "}
                      Authority: {appeal.appellateOfficerName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#F4F7FB] border border-slate-200 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Citizen Relief Sought
                    </p>
                    <p className="text-sm text-slate-800">{appeal.reliefSought}</p>

                    {Array.isArray(appeal.supportingDocuments) &&
                      appeal.supportingDocuments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {appeal.supportingDocuments.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:underline"
                            >
                              <Paperclip className="w-3 h-3" /> {doc.fileName}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Original RTI Subject &amp; Question
                    </p>
                    {linkedRti ? (
                      <>
                        <p className="text-sm font-semibold text-[#102A43]">
                          {linkedRti.subject}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-3">{linkedRti.question}</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Original record details unavailable.
                      </p>
                    )}
                  </div>
                </div>

                {/* FAA Decision Form */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end pt-2 border-t border-slate-100">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Appellate Order Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [appeal.id]: { ...form, status: e.target.value },
                        }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                    >
                      {APPEAL_DECISIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-600 mb-1">
                      <Calendar className="w-3.5 h-3.5" /> Hearing Date
                    </label>
                    <input
                      type="date"
                      value={form.hearingDate}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [appeal.id]: { ...form, hearingDate: e.target.value },
                        }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      FAA Directive / Order Remarks
                    </label>
                    <input
                      type="text"
                      value={form.decisionRemarks}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [appeal.id]: { ...form, decisionRemarks: e.target.value },
                        }))
                      }
                      placeholder="Direction to PIO under Section 19(6)..."
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="navy"
                      onClick={() => handleSaveOrder(appeal.id)}
                      disabled={savingId === appeal.id}
                      className="w-full gap-1.5"
                    >
                      {savingId === appeal.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Gavel className="w-4 h-4 text-[#F59E0B]" />
                      )}
                      Issue Order
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </RoleShell>
  );
}
