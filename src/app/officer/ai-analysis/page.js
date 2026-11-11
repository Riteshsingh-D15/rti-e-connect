"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, StatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Public Infrastructure",
  "Education",
  "Healthcare",
  "Electricity",
  "Water Supply",
  "Transportation",
  "Municipal Administration",
  "Police",
  "Revenue and Land Records",
  "Agriculture",
  "Environment",
  "Employment",
  "Finance",
  "Other",
];

export default function OfficerAIAnalysisPage() {
  const [applications, setApplications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [savingId, setSavingId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Live Sandbox
  const [sandboxSubject, setSandboxSubject] = useState("");
  const [sandboxQuestion, setSandboxQuestion] = useState("");
  const [sandboxResult, setSandboxResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [appRes, deptRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/departments"),
        ]);
        const apps = appRes.ok ? await appRes.json() : [];
        const depts = deptRes.ok ? await deptRes.json() : [];
        if (!active) return;

        const list = Array.isArray(apps) ? apps : [];
        setApplications(list);
        setDepartments(Array.isArray(depts) ? depts.map((d) => d.name) : []);

        const initial = {};
        for (const a of list) {
          initial[a.id] = {
            category: a.category || "Other",
            department: a.department || "Public Works Department",
            note: "",
          };
        }
        setOverrides(initial);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveOverride = async (appId) => {
    const choice = overrides[appId];
    if (!choice) return;
    setSavingId(appId);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiOverride: {
            category: choice.category,
            department: choice.department,
            note:
              choice.note?.trim() ||
              `Officer confirmed/adjusted AI routing (${choice.category} · ${choice.department}).`,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to save AI verification." });
      } else {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? data.application : a))
        );
        setFeedback({
          type: "success",
          message: `Verified & saved classification for ${data.application.referenceNumber}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error while saving AI override." });
    } finally {
      setSavingId("");
    }
  };

  const handleRunSandbox = async (e) => {
    e.preventDefault();
    if (!sandboxSubject.trim() || !sandboxQuestion.trim()) return;
    setAnalyzing(true);
    setSandboxResult(null);
    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: sandboxSubject,
          question: sandboxQuestion,
        }),
      });
      if (res.ok) {
        setSandboxResult(await res.json());
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <RoleShell
      title="AI Categorization & Department Verification"
      subtitle="Audit AI predictions across incoming filings, override misclassifications, or run ad-hoc text triage."
      userRole="GOVERNMENT OFFICER"
    >
      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Verification Error" : "AI Classification Saved"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Live Categorization Sandbox */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#102A43]">Live RTI Triage Sandbox</h2>
            <p className="text-xs text-slate-500">
              Test AI categorization &amp; department prediction on physical / postal RTI text.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunSandbox} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <input
            type="text"
            value={sandboxSubject}
            onChange={(e) => setSandboxSubject(e.target.value)}
            placeholder="Subject (e.g., Drinking water pipeline leak and TDS test results)"
            className="md:col-span-5 h-10 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <input
            type="text"
            value={sandboxQuestion}
            onChange={(e) => setSandboxQuestion(e.target.value)}
            placeholder="Detailed question text..."
            className="md:col-span-5 h-10 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <Button type="submit" disabled={analyzing} className="md:col-span-2 gap-1.5">
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Analyze
          </Button>
        </form>

        {sandboxResult && (
          <div className="p-4 rounded-xl bg-[#F4F7FB] border border-blue-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Predicted Category</span>
              <p className="text-sm font-bold text-[#102A43] mt-0.5">{sandboxResult.category}</p>
            </div>
            <div>
              <span className="text-slate-500">Recommended Authority</span>
              <p className="text-sm font-bold text-[#2563EB] mt-0.5">
                {sandboxResult.department}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Confidence &amp; Keywords</span>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {sandboxResult.confidenceScore || sandboxResult.confidence || 90}%
              </p>
              <p className="text-slate-600 mt-0.5">
                {(sandboxResult.keywords || []).slice(0, 4).join(", ")}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Persisted Override Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#102A43]">
          Human-in-the-Loop Classification Verification ({applications.length})
        </h2>

        {applications.map((app) => {
          const cur = overrides[app.id] || {
            category: app.category,
            department: app.department,
            note: "",
          };
          const deptList = departments.includes(cur.department)
            ? departments
            : [cur.department, ...departments];

          return (
            <Card key={app.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563EB]">
                      {app.referenceNumber}
                    </span>
                    <StatusBadge status={app.status} />
                    {app.aiAnalysis?.isOverridden && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Verified by{" "}
                        {app.aiAnalysis.verifiedBy || "PIO"}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#102A43] mt-1">{app.subject}</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#2563EB]">
                  AI Confidence: {app.aiAnalysis?.confidenceScore || 92}%
                </span>
              </div>

              {app.aiAnalysis?.reasoning && (
                <p className="text-xs text-slate-600 bg-[#F4F7FB] p-3 rounded-lg border border-slate-200">
                  <strong>AI Rationale:</strong> {app.aiAnalysis.reasoning}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Confirmed Category
                  </label>
                  <select
                    value={cur.category}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [app.id]: { ...cur, category: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Assigned Department
                  </label>
                  <select
                    value={cur.department}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [app.id]: { ...cur, department: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    {deptList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Officer Audit Note
                  </label>
                  <input
                    type="text"
                    value={cur.note}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [app.id]: { ...cur, note: e.target.value },
                      }))
                    }
                    placeholder="Reason for confirm / override"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="navy"
                    onClick={() => handleSaveOverride(app.id)}
                    disabled={savingId === app.id}
                    className="w-full gap-1.5"
                  >
                    {savingId === app.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Verify &amp; Save
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </RoleShell>
  );
}
