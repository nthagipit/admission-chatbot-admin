import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  className?: string;
  children: ReactNode;
}

export function ChartCard({
  title,
  description,
  loading,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
        )}
      </div>
      <div className="p-5 pt-4">
        {loading ? <Skeleton className="h-60 w-full" /> : children}
      </div>
    </Card>
  );
}
