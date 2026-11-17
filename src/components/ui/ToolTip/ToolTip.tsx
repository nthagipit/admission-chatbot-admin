import type { ReactNode } from "react";

interface TooltipProps {
  label: string;
  disabled?: boolean;
  children: ReactNode;
}

/** Tooltip bên phải phần tử, dùng cho sidebar thu gọn. Không clip nếu cha không overflow-hidden. */
export function Tooltip({ label, disabled, children }: TooltipProps) {
  if (disabled) return <>{children}</>;
  return (
    <span className="group/tip relative flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-control bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-pop transition-opacity group-focus-within/tip:opacity-100 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
