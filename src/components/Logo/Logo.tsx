import { GraduationCap } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-600 text-white shadow-card">
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-ink">
            Admission AI
          </p>
          <p className="truncate text-xs text-ink-muted">Administration</p>
        </div>
      )}
    </div>
  );
}
