import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-soft text-green-800",
  warning: "bg-warning-soft text-amber-800",
  danger: "bg-danger-soft text-red-800",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
