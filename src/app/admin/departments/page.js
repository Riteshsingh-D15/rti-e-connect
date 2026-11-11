"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Loader2,
  Mail,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    code: "",
    contactEmail: "",
    isStateLevel: true,
  });
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/departments");
        const data = res.ok ? await res.json() : [];
        if (active) setDepartments(Array.isArray(data) ? data : []);
      } catch {
        if (active) setFeedback({ type: "error", message: "Failed to load departments." });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Unable to register department." });
      } else {
        setDepartments((prev) => [...prev, data.department]);
        setForm({ name: "", code: "", contactEmail: "", isStateLevel: true });
        setFeedback({
          type: "success",
          message: `Registered public authority "${data.department.name}" (${data.department.code}).`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error adding department." });
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/departments?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to remove department." });
      } else {
        setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
        setFeedback({
          type: "success",
          message: `Removed department "${deleteTarget.name}" from registry.`,
        });
        setDeleteTarget(null);
      }
    } catch {
      setFeedback({ type: "error", message: "Network error removing department." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <RoleShell
      title="Departments & Public Authorities Registry"
      subtitle="Register government authorities, monitor caseload distribution, and maintain AI routing targets."
      userRole="ADMINISTRATOR"
    >
      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Registry Error" : "Registry Updated"}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Add Department Card */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-[#102A43]">Register New Public Authority</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Department of Environment & Forests"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Short Code <span className="text-red-500">*</span>
            </label>
            <input
              required
              maxLength={8}
              value={form.code}
              onChange={(e) =>
                setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              placeholder="ENV"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono uppercase"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nodal PIO Email
            </label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
              placeholder="pio.env@gov.in"
              className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
            />
          </div>
          <div className="md:col-span-1 flex items-center h-10">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isStateLevel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isStateLevel: e.target.checked }))
                }
                className="w-4 h-4 accent-[#2563EB]"
              />
              State
            </label>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" variant="navy" disabled={creating} className="w-full gap-1.5">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Dept
            </Button>
          </div>
        </form>
      </Card>

      {/* Department Grid */}
      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">Loading departments...</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <Card key={dept.id} className="p-5 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#102A43] leading-snug">
                        {dept.name}
                      </h3>
                      <span className="inline-block font-mono text-[11px] font-bold text-slate-500 mt-0.5">
                        CODE: {dept.code} · {dept.isStateLevel ? "State Authority" : "Central Ministry"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(dept)}
                    aria-label={`Remove ${dept.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{dept.contactEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-lg bg-[#F4F7FB]">
                  <p className="text-base font-bold text-[#102A43]">
                    {dept.totalApplications ?? 0}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500">Total</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50">
                  <p className="text-base font-bold text-amber-800">{dept.pending ?? 0}</p>
                  <p className="text-[10px] font-medium text-amber-700">Active</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50">
                  <p className="text-base font-bold text-emerald-800">{dept.resolved ?? 0}</p>
                  <p className="text-[10px] font-medium text-emerald-700">Resolved</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#102A43]">Confirm Department Removal</h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Remove <strong>{deleteTarget.name}</strong> ({deleteTarget.code}) from the public
              authority registry? Existing historical applications remain intact.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? "Removing..." : "Remove Department"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </RoleShell>
  );
}
