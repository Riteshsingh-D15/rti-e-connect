import { ArrowUpRight } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";

const TONE_MAP = {
  blue: {
    iconWrap:
      "bg-gradient-to-br from-blue-50 to-blue-100/80 text-[#2563EB] ring-blue-200/80 shadow-[0_6px_12px_-4px_rgba(37,99,235,0.28)]",
    detail: "text-[#2563EB]",
    bar: "bg-[#2563EB]",
  },
  navy: {
    iconWrap:
      "bg-gradient-to-br from-slate-100 to-slate-200/70 text-[#102A43] ring-slate-300/80 shadow-[0_6px_12px_-4px_rgba(16,42,67,0.22)]",
    detail: "text-slate-600",
    bar: "bg-[#102A43]",
  },
  amber: {
    iconWrap:
      "bg-gradient-to-br from-amber-50 to-amber-100/90 text-amber-700 ring-amber-200 shadow-[0_6px_12px_-4px_rgba(245,158,11,0.3)]",
    detail: "text-amber-700",
    bar: "bg-[#F59E0B]",
  },
  emerald: {
    iconWrap:
      "bg-gradient-to-br from-emerald-50 to-emerald-100/90 text-emerald-700 ring-emerald-200 shadow-[0_6px_12px_-4px_rgba(16,185,129,0.28)]",
    detail: "text-emerald-700",
    bar: "bg-emerald-600",
  },
  rose: {
    iconWrap:
      "bg-gradient-to-br from-rose-50 to-rose-100/90 text-rose-700 ring-rose-200 shadow-[0_6px_12px_-4px_rgba(225,29,72,0.25)]",
    detail: "text-rose-700",
    bar: "bg-rose-600",
  },
};

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}) {
  const palette = TONE_MAP[tone] || TONE_MAP.blue;

  return (
    <TiltCard
      intensity={6}
      scale={1.018}
      className="group overflow-hidden p-5 hover:border-blue-300/70 hover:shadow-[0_20px_36px_-14px_rgba(16,42,67,0.2)]"
    >
      <div className={`absolute top-0 right-0 left-0 h-1 ${palette.bar} opacity-85`} />
      <div className="tilt-3d-pop flex items-start justify-between gap-3 pt-1">
        <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
          {title}
        </span>
        {Icon ? (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${palette.iconWrap}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        ) : null}
      </div>
      <div className="tilt-3d-pop mt-4">
        <div className="text-3xl font-black tracking-tight text-[#102A43] tabular-nums">
          {value}
        </div>
        {detail ? (
          <div
            className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${palette.detail}`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
            <span>{detail}</span>
          </div>
        ) : null}
      </div>
    </TiltCard>
  );
}
