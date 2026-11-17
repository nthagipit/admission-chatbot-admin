import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Crumb } from "@/utils/route-meta";

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-xs text-ink-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1"
            >
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-medium text-ink" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
