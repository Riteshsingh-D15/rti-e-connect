"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One-click clipboard copy button with instant visual confirmation.
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  compact = false,
  className,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
    } catch {
      try {
        const input = document.createElement("textarea");
        input.value = String(value);
        input.setAttribute("readonly", "");
        input.style.position = "absolute";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
      } catch {
        // Clipboard denied in restricted context
      }
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        title={copied ? copiedLabel : `Copy ${value}`}
        aria-label={copied ? `${value} copied` : `Copy ${value}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold transition-all",
          copied
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-[#2563EB]",
          className
        )}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        <span>{copied ? copiedLabel : "Copy"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? `${value} copied` : `${label} ${value}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:translate-y-0.5",
        copied
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-[#2563EB]",
        className
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
