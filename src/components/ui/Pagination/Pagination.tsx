import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

function pageList(page: number, pages: number) {
  const numbers = [...new Set([1, pages, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  numbers.forEach((p, i) => {
    if (i > 0 && p - numbers[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const btn =
  "flex size-8 items-center justify-center rounded-control text-sm transition-colors disabled:opacity-40";

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <p className="text-sm text-ink-muted">
        Showing{" "}
        <span className="font-medium text-ink">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-ink">{total}</span>
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          className={cn(btn, "text-ink-muted hover:bg-slate-100")}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, pages).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-ink-muted">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                btn,
                item === page
                  ? "bg-primary-600 font-medium text-white"
                  : "text-ink-muted hover:bg-slate-100",
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className={cn(btn, "text-ink-muted hover:bg-slate-100")}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
