"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Gavel,
  Loader2,
  Paperclip,
  Scale,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, EmptyState, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const GROUNDS = [
  "No response received within 30 days (Section 7(1) Deemed Refusal)",
  "Incomplete, misleading or false information provided",
  "Information refused citing an inapplicable Section 8 exemption",
  "Unreasonable demand for further fee under Section 7(3)",
  "Public Information Officer failed to transfer under Section 6(3)",
];

export default function CitizenAppealsPage() {
  const [applications, setApplications] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    applicationId: "",
    groundOfAppeal: GROUNDS[0],
    reliefSought: "",
  });
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appRes, appealRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/appeals"),
        ]);
        const appData = appRes.ok ? await appRes.json() : [];
        const appealData = appealRes.ok ? await appealRes.json() : [];
        if (!active) return;

        const list = Array.isArray(appData) ? appData : [];
        setApplications(list);
        setAppeals(Array.isArray(appealData) ? appealData : []);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, applicationId: list[0].id }));
        }
      } catch {
        if (active) setError("Failed to load applications or appeals.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleUploadAttachment = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to upload appeal annexure.");
      } else if (data.document) {
        setSupportingDocuments((prev) => [...prev, data.document]);
      }
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.applicationId) {
      setError("Please select an eligible RTI application first.");
      return;
    }
    if (form.reliefSought.trim().length < 15) {
      setError("Relief sought must explain the specific direction requested (min 15 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/appeals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          supportingDocuments,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to submit First Appeal.");
      } else {
        setAppeals((prev) => [data.appeal, ...prev]);
        setForm((prev) => ({ ...prev, reliefSought: "" }));
        setSupportingDocuments([]);
        setSuccess(
          `First Appeal ${data.appeal.appealNumber} filed with ${data.appeal.appellateOfficerName}.`
        );
      }
    } catch {
      setError("Network error while filing First Appeal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleShell
      title="First Appeals (Section 19(1))"
      subtitle="Escalate delayed, incomplete, or denied RTI applications to the First Appellate Authority."
      userRole="CITIZEN"
    >
      {error && (
        <Alert type="error" title="Appeal Error">
          {error}
        </Alert>
      )}
      {success && (
        <Alert type="success" title="Appeal Filed">
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <Card className="p-6 lg:col-span-5 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A43]">File New First Appeal</h2>
              <p className="text-xs text-slate-500">Zero statutory fee under RTI Act, 2005</p>
            </div>
          </div>

          <form onSubmit={handleSubmitAppeal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Original RTI Application
              </label>
              <select
                value={form.applicationId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, applicationId: e.target.value }))
                }
                disabled={applications.length === 0}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {applications.length === 0 ? (
                  <option value="">No RTI filings found</option>
                ) : (
                  applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.referenceNumber} — {a.subject.slice(0, 48)}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Statutory Ground of Appeal
              </label>
              <select
                value={form.groundOfAppeal}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, groundOfAppeal: e.target.value }))
                }
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {GROUNDS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Relief Sought &amp; Statement of Facts
              </label>
              <textarea
                rows={4}
                required
                value={form.reliefSought}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reliefSought: e.target.value }))
                }
                placeholder="State clearly why the PIO order / non-response should be overturned and what exact direction you seek from the FAA..."
                className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Attach Appeal Annexure (Optional)
              </label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 bg-[#F4F7FB] hover:border-[#2563EB] cursor-pointer text-xs font-semibold text-[#102A43]">
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-[#2563EB]" />
                )}
                {uploading ? "Uploading file..." : "Attach PIO Reply or Receipt (PDF/JPG/PNG)"}
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={handleUploadAttachment}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {supportingDocuments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {supportingDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className="truncate font-medium">{doc.fileName}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSupportingDocuments((prev) =>
                            prev.filter((d) => d.id !== doc.id)
                          )
                        }
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="navy"
              disabled={submitting || applications.length === 0}
              className="w-full justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gavel className="w-4 h-4 text-[#F59E0B]" />
              )}
              {submitting ? "Submitting Appeal..." : "Submit First Appeal"}
            </Button>
          </form>
        </Card>

        {/* Right Filed Appeals List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#102A43]">
              Your Submitted First Appeals ({appeals.length})
            </h2>
          </div>

          {loading ? (
            <Card className="p-8 text-center text-sm text-slate-500">
              Loading submitted appeals...
            </Card>
          ) : appeals.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No First Appeals Filed"
              description="If a Public Information Officer has exceeded 30 days or provided unsatisfactory information, file a Section 19(1) appeal using the form."
            />
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <Card key={appeal.id} className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#2563EB]">
                        {appeal.appealNumber}
                      </span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-xs font-mono text-slate-600">
                        RTI: {appeal.applicationReferenceNumber}
                      </span>
                    </div>
                    <StatusBadge status={appeal.status} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ground of Appeal
                    </p>
                    <p className="text-sm font-bold text-[#102A43] mt-0.5">
                      {appeal.groundOfAppeal}
                    </p>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">{appeal.reliefSought}</p>

                  {Array.isArray(appeal.supportingDocuments) &&
                    appeal.supportingDocuments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {appeal.supportingDocuments.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-[#2563EB] hover:bg-blue-50"
                          >
                            <Paperclip className="w-3 h-3" />
                            {doc.fileName}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 bg-[#F4F7FB] p-3.5 rounded-xl">
                    <div>
                      <span className="font-semibold text-[#102A43]">Appellate Authority:</span>{" "}
                      {appeal.appellateOfficerName}
                    </div>
                    <div>
                      <span className="font-semibold text-[#102A43]">Filed Date:</span>{" "}
                      {formatDate(appeal.filedAt)}
                    </div>
                    {appeal.hearingDate && (
                      <div>
                        <span className="font-semibold text-[#102A43]">Hearing Date:</span>{" "}
                        {formatDate(appeal.hearingDate)}
                      </div>
                    )}
                    {appeal.decisionRemarks && (
                      <div className="sm:col-span-2 flex items-start gap-1.5 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>FAA Order: {appeal.decisionRemarks}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleShell>
  );
}
