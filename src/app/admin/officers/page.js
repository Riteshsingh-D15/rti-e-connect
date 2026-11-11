"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Loader2,
  Mail,
  Phone,
  Plus,
  ShieldBan,
  UserCheck,
  XCircle,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "password123",
    phone: "",
    department: "Public Works Department",
    designation: "Public Information Officer (PIO)",
    employeeId: "",
  });

  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [userRes, deptRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/departments"),
        ]);
        const userList = userRes.ok ? await userRes.json() : [];
        const deptList = deptRes.ok ? await deptRes.json() : [];
        if (!active) return;

        setOfficers(
          (Array.isArray(userList) ? userList : []).filter(
            (u) => u.role === "GOVERNMENT OFFICER"
          )
        );
        const deptNames = Array.isArray(deptList)
          ? deptList.map((d) => d.name)
          : ["Public Works Department"];
        setDepartments(deptNames);
        if (deptNames.length > 0) {
          setForm((prev) => ({ ...prev, department: deptNames[0] }));
        }
      } catch {
        if (active) setFeedback({ type: "error", message: "Failed to load PIO roster." });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: "GOVERNMENT OFFICER",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to appoint PIO officer." });
      } else {
        setOfficers((prev) => [data.user, ...prev]);
        setModalOpen(false);
        setForm({
          name: "",
          email: "",
          password: "password123",
          phone: "",
          department: departments[0] || "Public Works Department",
          designation: "Public Information Officer (PIO)",
          employeeId: "",
        });
        setFeedback({
          type: "success",
          message: `Appointed ${data.user.name} (${data.user.employeeId}) as PIO.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error creating officer account." });
    } finally {
      setSaving(false);
    }
  };

  const handlePatchOfficer = async (officerId, updates, msg) => {
    setUpdatingId(officerId);
    setFeedback({ type: "", message: "" });
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: officerId, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update officer." });
      } else {
        setOfficers((prev) =>
          prev.map((o) => (o.id === officerId ? data.user : o))
        );
        setFeedback({ type: "success", message: msg });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error updating officer." });
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <RoleShell
      title="Public Information Officer (PIO) Management"
      subtitle="Only portal Administrators can appoint government officers, assign departments, and revoke access."
      userRole="ADMINISTRATOR"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#102A43]">
            Authorized PIO Directory ({officers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Active officers appear automatically in RTI assignment selectors.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} variant="navy" className="gap-2">
          <Plus className="w-4 h-4 text-[#F59E0B]" />
          Appoint New PIO Officer
        </Button>
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Officer Action Error" : "Roster Updated"}
        >
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">Loading PIO roster...</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {officers.map((off) => {
            const active = off.isActive !== false;
            const deptChoices = departments.includes(off.department)
              ? departments
              : [off.department, ...departments].filter(Boolean);

            return (
              <Card key={off.id} className="p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#102A43] text-[#F59E0B] flex items-center justify-center font-bold">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#102A43]">{off.name}</h3>
                        <p className="text-xs text-slate-500">
                          {off.designation || "Public Information Officer"}
                        </p>
                      </div>
                    </div>

                    {active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <BadgeCheck className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                        <ShieldBan className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-[#F4F7FB] p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{off.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{off.phone || "No direct extension"}</span>
                    </div>
                    {off.employeeId && (
                      <p className="font-mono text-[11px] text-[#2563EB] font-bold pt-0.5">
                        Employee ID: {off.employeeId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      <Building2 className="w-3 h-3" /> Assigned Department
                    </label>
                    <select
                      value={off.department || ""}
                      disabled={updatingId === off.id}
                      onChange={(e) =>
                        handlePatchOfficer(
                          off.id,
                          { department: e.target.value },
                          `Transferred ${off.name} to ${e.target.value}.`
                        )
                      }
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-[#102A43]"
                    >
                      {deptChoices.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant={active ? "outline" : "navy"}
                    disabled={updatingId === off.id}
                    onClick={() =>
                      handlePatchOfficer(
                        off.id,
                        { isActive: !active },
                        `${off.name} access ${!active ? "restored" : "suspended"}.`
                      )
                    }
                    className="w-full"
                  >
                    {updatingId === off.id
                      ? "Updating..."
                      : active
                      ? "Suspend Officer Access"
                      : "Restore Officer Access"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Appoint Officer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-[#102A43]">Appoint New Government PIO</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Meera Nair"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="pio.transport@gov.in"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    value={form.designation}
                    onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="9811002200"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="navy" disabled={saving} className="gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Provision PIO Account
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </RoleShell>
  );
}
