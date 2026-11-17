import {
  AlertTriangle,
  CheckCircle2,
  Upload,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import type { ActivityItem, ActivityType } from "@/types/dashboard";
import { cn } from "@/utils/cn";
import { formatRelative } from "@/utils/format";

const META: Record<ActivityType, { icon: LucideIcon; style: string }> = {
  DOCUMENT_UPLOADED: { icon: Upload, style: "bg-primary-50 text-primary-600" },
  DOCUMENT_COMPLETED: {
    icon: CheckCircle2,
    style: "bg-success-soft text-success",
  },
  DOCUMENT_FAILED: { icon: AlertTriangle, style: "bg-danger-soft text-danger" },
  USER_REGISTERED: { icon: UserPlus, style: "bg-slate-100 text-slate-600" },
};

export function RecentActivities({ items }: { items?: ActivityItem[] }) {
  return (
    <Card>
      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-ink">Recent activities</h2>
      </div>
      <ul className="p-5 pt-3">
        {!items &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex gap-3 py-2.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-8 flex-1" />
            </li>
          ))}
        {items?.map((item) => {
          const meta = META[item.type] ?? META.DOCUMENT_UPLOADED;
          const Icon = meta.icon;
          const style = meta.style;
          return (
            <li key={item.id} className="flex items-start gap-3 py-2.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  style,
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-ink">{item.message}</p>
                <p className="text-xs text-ink-muted">
                  {formatRelative(item.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
