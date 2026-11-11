"use client";

import { cn } from "@/lib/utils";

const STATUS_CLASS_MAP = {
  Submitted: "bg-blue-50 text-blue-800 border-blue-200",
  "AI Analysis": "bg-indigo-50 text-indigo-800 border-indigo-200",
  "Department Identification": "bg-amber-50 text-amber-800 border-amber-200",
  "Officer Assigned": "bg-sky-50 text-sky-800 border-sky-200",
  "Under Review": "bg-amber-50 text-amber-800 border-amber-200",
  "Awaiting Clarification": "bg-orange-50 text-orange-800 border-orange-200",
  "Draft Prepared": "bg-purple-50 text-purple-800 border-purple-200",
  "Awaiting Approval": "bg-violet-50 text-violet-800 border-violet-200",
  "Response Sent": "bg-emerald-50 text-emerald-800 border-emerald-200",
  Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Transferred: "bg-cyan-50 text-cyan-800 border-cyan-200",
  "Appeal Filed": "bg-rose-50 text-rose-800 border-rose-200",
  "Rejected with Reason": "bg-rose-50 text-rose-800 border-rose-200",
  Withdrawn: "bg-slate-100 text-slate-700 border-slate-200",
  Allowed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-800 border-rose-200",
  "Hearing Scheduled": "bg-blue-50 text-blue-800 border-blue-200",
};

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "surface-3d rounded-2xl border border-slate-200/90 bg-white p-5 transition-all duration-200 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status, className }) {
  const badgeClasses =
    STATUS_CLASS_MAP[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap shadow-[0_2px_4px_-1px_rgba(16,42,67,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]",
        badgeClasses,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

export function Alert({ type = "info", title, children, className }) {
  const styles = {
    info: "border-blue-200 bg-blue-50/80 text-blue-950",
    success: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
    warning: "border-amber-200 bg-amber-50/80 text-amber-950",
    error: "border-rose-200 bg-rose-50/80 text-rose-950",
  };
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-xs leading-relaxed sm:text-sm",
        styles[type] || styles.info,
        className
      )}
    >
      {title ? <div className="mb-1 font-bold">{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-xs ring-1 ring-slate-200">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <p className="text-sm font-bold text-[#102A43]">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
