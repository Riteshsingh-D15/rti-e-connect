"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Search,
  ShieldBan,
  ShieldCheck,
  Users,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const ROLE_FILTERS = ["ALL", "CITIZEN", "GOVERNMENT OFFICER", "ADMINISTRATOR"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roleTab, setRoleTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    let active = true;
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        const data = res.ok ? await res.json() : [];
        if (active) setUsers(Array.isArray(data) ? data : []);
      } catch {
        if (active) setFeedback({ type: "error", message: "Failed to load user directory." });
      } finally {
        if (active) setLoading(false);
      }
    }
    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const roleMatch = roleTab === "ALL" || u.role === roleTab;
      const queryMatch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q);
      return roleMatch && queryMatch;
    });
  }, [users, roleTab, search]);

  const handleToggleActive = async (user) => {
    const nextActive = user.isActive === false;
    setTogglingId(user.id);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update user access." });
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? data.user : u))
        );
        setFeedback({
          type: "success",
          message: `Account ${user.email} is now ${nextActive ? "Active" : "Deactivated"}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error toggling account status." });
    } finally {
      setTogglingId("");
    }
  };

  return (
    <RoleShell
      title="User Access Control Directory"
      subtitle="Inspect registered Citizens, Public Information Officers, and Administrators with real-time access toggles."
      userRole="ADMINISTRATOR"
    >
      {feedback.message && (
        <Alert
          type={feedback.type === "error" ? "error" : "success"}
          title={feedback.type === "error" ? "Access Control Error" : "Access Updated"}
        >
          {feedback.message}
        </Alert>
      )}

      <Card className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {ROLE_FILTERS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleTab(role)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  roleTab === role
                    ? "bg-[#102A43] text-white"
                    : "bg-[#F4F7FB] text-slate-700 hover:bg-slate-200"
                }`}
              >
                {role === "ALL" ? `All (${users.length})` : role}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, dept..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading registered users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Account Holder</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Location / Authority</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Registered</th>
                  <th className="py-3 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((u) => {
                  const isActive = u.isActive !== false;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#102A43] font-bold text-xs flex items-center justify-center shrink-0">
                            {(u.name || "U")
                              .split(" ")
                              .slice(0, 2)
                              .map((p) => p[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-[#102A43]">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            u.role === "ADMINISTRATOR"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "GOVERNMENT OFFICER"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <Users className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-slate-600">
                        {u.department ||
                          [u.district, u.state].filter(Boolean).join(", ") ||
                          "—"}
                      </td>
                      <td className="py-3.5 pr-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            <ShieldBan className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant={isActive ? "outline" : "navy"}
                          size="sm"
                          disabled={togglingId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className="gap-1.5"
                        >
                          {togglingId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          )}
                          {isActive ? "Disable Access" : "Re-Enable"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </RoleShell>
  );
}
