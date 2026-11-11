"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Download,
  Loader2,
  Save,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    aiModelProvider: "auto",
    similarityCutoff: 0.25,
    statutoryDeadlineDays: 30,
    lifeLibertyDeadlineHours: 48,
    defaultFeeAmount: 10,
    enableOcr: true,
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [cfgRes, logRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/audit-logs"),
        ]);
        const cfg = cfgRes.ok ? await cfgRes.json() : null;
        const logs = logRes.ok ? await logRes.json() : [];
        if (!active) return;
        if (cfg) setConfig(cfg);
        setAuditLogs(Array.isArray(logs) ? logs : []);
      } catch {
        if (active) setFeedback({ type: "error", message: "Failed to load portal settings." });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Unable to update settings." });
      } else {
        setConfig(data.config);
        setFeedback({
          type: "success",
          message: "Portal AI & Statutory SLA settings persisted to database.",
        });
        const refreshLogs = await fetch("/api/audit-logs");
        if (refreshLogs.ok) setAuditLogs(await refreshLogs.json());
      }
    } catch {
      setFeedback({ type: "error", message: "Network error saving configuration." });
    } finally {
      setSaving(false);
    }
  };

  const uniqueActions = useMemo(() => {
    return ["ALL", ...Array.from(new Set(auditLogs.map((l) => l.action).filter(Boolean)))];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return auditLogs.filter((l) => {
      const actionOk = actionFilter === "ALL" || l.action === actionFilter;
      const textOk =
        !q ||
        l.userName?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q);
      return actionOk && textOk;
    });
  }, [auditLogs, actionFilter, logSearch]);

  const handleExportLogsCSV = () => {
    const rows = [
      ["Timestamp", "Action", "Actor", "Entity Type", "Entity ID", "Details"],
      ...filteredLogs.map((l) => [
        l.createdAt,
        l.action,
        l.userName,
        l.entityType,
        l.entityId,
        l.details,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rti-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RoleShell
      title="AI Engine Configuration & Audit Ledger"
      subtitle="Tune LLM providers, semantic search thresholds, statutory SLA mandates, and inspect security audit trails."
      userRole="ADMINISTRATOR"
    >
      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Configuration Error" : "Settings Saved"}
        >
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Loading configuration and audit ledger...
        </Card>
      ) : (
        <div className="space-y-6">
          {/* AI & Statutory Rule Configuration */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#102A43]">
                  System Governance &amp; AI Parameters
                </h2>
                <p className="text-xs text-slate-500">
                  All changes automatically record an entry in the Admin Audit Ledger.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#2563EB]" /> AI Inference Provider
                  </label>
                  <select
                    value={config.aiModelProvider}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, aiModelProvider: e.target.value }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="auto">Auto (LLM Key or Deterministic Heuristic)</option>
                    <option value="openai">OpenAI Compatible Endpoint</option>
                    <option value="gemini">Google Gemini Intelligence</option>
                    <option value="local-heuristic">Air-Gapped Local Heuristic Engine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Semantic Similarity Cutoff (0.10 – 0.90)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.9"
                    value={config.similarityCutoff}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, similarityCutoff: Number(e.target.value) }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Standard RTI Deadline (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={config.statutoryDeadlineDays}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        statutoryDeadlineDays: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Life &amp; Liberty Proviso SLA (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={config.lifeLibertyDeadlineHours}
                    onChange={(e) =>
                      setConfig((p) => ({
                        ...p,
                        lifeLibertyDeadlineHours: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Statutory Application Fee (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={config.defaultFeeAmount}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, defaultFeeAmount: Number(e.target.value) }))
                    }
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-5 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(config.enableOcr)}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, enableOcr: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#2563EB]"
                  />
                  Enable OCR Indexing for Uploaded Attachments
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="navy" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#F59E0B]" />}
                  Save Configuration
                </Button>
              </div>
            </form>
          </Card>

          {/* Searchable Immutable Audit Logs */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <h2 className="text-base font-bold text-[#102A43]">
                    Security &amp; Statutory Audit Trail ({filteredLogs.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Complete chronological log of authentication, submissions, and officer orders.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportLogsCSV}
                className="gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Audit CSV
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter by actor name, action, or details..."
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="sm:w-64 h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
              >
                {uniqueActions.map((act) => (
                  <option key={act} value={act}>
                    {act === "ALL" ? "All Event Types" : act}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 pr-4">Timestamp</th>
                    <th className="py-2.5 pr-4">Event Action</th>
                    <th className="py-2.5 pr-4">Actor</th>
                    <th className="py-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pr-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#102A43] text-[#F59E0B]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-semibold text-[#102A43] whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-2.5 text-slate-700">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </RoleShell>
  );
}
