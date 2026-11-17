import { Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { DocumentStatus } from "@/types/document.type";
import type { BadgeTone } from "@/components/ui/Badge/Badge";

const CONFIG: Record<DocumentStatus, { label: string; tone: BadgeTone }> = {
  PROCESSING: { label: "Processing", tone: "warning" },
  COMPLETED: { label: "Completed", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { label, tone } = CONFIG[status];
  return (
    <Badge tone={tone}>
      {status === "PROCESSING" && (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      )}
      {label}
    </Badge>
  );
}
