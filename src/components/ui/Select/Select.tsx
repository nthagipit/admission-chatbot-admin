import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        className={cn(
          "h-10 appearance-none rounded-control border border-line bg-surface pr-9 pl-3 text-sm text-ink transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted" />
    </div>
  );
}
