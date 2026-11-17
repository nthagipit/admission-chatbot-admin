import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-slate-100 text-slate-600",
};

interface StatCardProps {
  label: string;
  value?: number;
  icon: LucideIcon;
  tone?: Tone;
}

/** `value` = undefined → hiển thị skeleton (đang tải). */
export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-control",
          tones[tone],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-ink-muted">{label}</p>
        {value === undefined ? (
          <Skeleton className="mt-1.5 h-6 w-14" />
        ) : (
          <p className="text-2xl font-semibold text-ink tabular-nums">
            {value.toLocaleString("en-US")}
          </p>
        )}
      </div>
    </Card>
  );
}
