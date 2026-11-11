import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#2563EB] text-white shadow-[0_4px_0_0_#1D4ED8,0_8px_16px_-4px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 hover:bg-[#1D4ED8] active:translate-y-[2px] active:shadow-[0_1px_0_0_#1E40AF]",
        navy:
          "bg-[#102A43] text-white shadow-[0_4px_0_0_#0A1C2E,0_8px_16px_-4px_rgba(16,42,67,0.32)] hover:-translate-y-0.5 hover:bg-[#1B3B5A] active:translate-y-[2px] active:shadow-[0_1px_0_0_#0A1C2E]",
        secondary:
          "border border-slate-200/80 bg-slate-100 text-[#102A43] shadow-[0_2px_0_0_#CBD5E1] hover:-translate-y-0.5 hover:bg-slate-200 active:translate-y-[1px] active:shadow-none",
        outline:
          "border border-slate-200 bg-white text-[#102A43] shadow-[0_3px_0_0_#E2E8F0,0_4px_10px_-3px_rgba(16,42,67,0.08)] hover:-translate-y-0.5 hover:border-blue-200 hover:bg-slate-50 active:translate-y-[1.5px] active:shadow-none",
        ghost:
          "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-[#102A43] active:scale-[0.98]",
        success:
          "bg-emerald-600 text-white shadow-[0_4px_0_0_#047857,0_8px_16px_-4px_rgba(5,150,105,0.32)] hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-[2px] active:shadow-[0_1px_0_0_#047857]",
        warning:
          "bg-[#F59E0B] text-slate-950 shadow-[0_4px_0_0_#D97706,0_8px_16px_-4px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:bg-amber-400 active:translate-y-[2px] active:shadow-[0_1px_0_0_#B45309]",
        saffron:
          "bg-[#F59E0B] text-slate-950 shadow-[0_4px_0_0_#D97706,0_8px_16px_-4px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:bg-amber-400 active:translate-y-[2px] active:shadow-[0_1px_0_0_#B45309]",
        glass:
          "border border-white/25 bg-white/15 text-white shadow-[0_6px_16px_-6px_rgba(2,6,23,0.35)] hover:-translate-y-0.5 hover:bg-white/25 active:translate-y-[1px]",
        destructive:
          "bg-rose-600 text-white shadow-[0_4px_0_0_#BE123C,0_8px_16px_-4px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-[2px] active:shadow-[0_1px_0_0_#9F1239]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
