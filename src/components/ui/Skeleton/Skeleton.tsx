import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-control bg-slate-200/70", className)}
    />
  );
}

export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div role="status" aria-label="Loading" className="divide-y divide-line">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-6 px-4 py-4">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4", c === 0 ? "w-1/3" : "w-20 flex-1")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
