"use client";

import { useState } from "react";
import { CheckCircle2, Flame, Loader2, UserCheck } from "lucide-react";
import { Alert, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export function AdminCaseMonitor({ initialApps = [], officers = [] }) {
  const [apps, setApps] = useState(initialApps);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleReassign = async (appId, officerId) => {
    const officer = officers.find((o) => o.id === officerId);
    if (!officer) return;

    setSavingId(appId);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedOfficerId: officer.id,
          assignedOfficerName: officer.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to reassign officer." });
      } else {
        setApps((prev) =>
          prev.map((a) => (a.id === appId ? data.application : a))
        );
        setMessage({
          type: "success",
          text: `Reassigned ${data.application.referenceNumber} to ${officer.name}.`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during reassignment." });
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-4">
      {message.text && (
        <Alert
          type={message.type === "error" ? "error" : "success"}
          title={message.type === "error" ? "Assignment Error" : "Officer Reassigned"}
        >
          {message.text}
        </Alert>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 pr-4">Reference</th>
              <th className="py-3 pr-4">Subject &amp; Applicant</th>
              <th className="py-3 pr-4">Department</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Deadline</th>
              <th className="py-3">Assigned PIO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/70">
                <td className="py-3 pr-4 font-mono text-xs font-bold text-[#2563EB] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {app.referenceNumber}
                    {app.isLifeOrLiberty && (
                      <Flame className="w-3.5 h-3.5 text-amber-600" title="48h Life & Liberty" />
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 max-w-xs">
                  <p className="font-semibold text-[#102A43] truncate">{app.subject}</p>
                  <p className="text-xs text-slate-500">{app.citizenName}</p>
                </td>
                <td className="py-3 pr-4 text-xs font-medium text-slate-700">
                  {app.department}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <StatusBadge status={app.status} />
                </td>
                <td className="py-3 pr-4 text-xs text-slate-600 whitespace-nowrap">
                  {formatDate(app.deadlineDate)}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {savingId === app.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                    ) : (
                      <UserCheck className="w-4 h-4 text-slate-400" />
                    )}
                    <select
                      aria-label={`Assign PIO for ${app.referenceNumber}`}
                      value={app.assignedOfficerId || ""}
                      disabled={savingId === app.id || officers.length === 0}
                      onChange={(e) => handleReassign(app.id, e.target.value)}
                      className="h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                      {!officers.some((o) => o.id === app.assignedOfficerId) && (
                        <option value={app.assignedOfficerId || ""}>
                          {app.assignedOfficerName || "Assigned PIO"}
                        </option>
                      )}
                      {officers.map((off) => (
                        <option key={off.id} value={off.id}>
                          {off.name} ({off.department || "PIO"})
                        </option>
                      ))}
                    </select>
                    {app.officialResponse?.status === "Sent" && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600"
                        title="Official reply sent"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
