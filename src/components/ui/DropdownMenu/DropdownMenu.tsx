import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}

/** Menu thao tác cho từng dòng bảng. Render qua portal để không bị bảng (overflow) cắt. */
export default function DropdownMenu({
  items,
  label = "Actions",
}: {
  items: MenuItem[];
  label?: string;
}) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPos(null), []);

  const toggle = () => {
    if (pos) return close();
    const rect = buttonRef.current!.getBoundingClientRect();
    const height = items.length * 36 + 12;
    const top =
      rect.bottom + height > window.innerHeight
        ? Math.max(8, rect.top - height - 4)
        : rect.bottom + 4;
    setPos({ top, right: window.innerWidth - rect.right });
  };

  useEffect(() => {
    if (!pos) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      )
        return;
      close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        onClick={toggle}
        className="flex size-8 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-50 w-52 rounded-card border border-line bg-surface p-1.5 shadow-pop"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-control px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  item.tone === "danger"
                    ? "text-danger hover:bg-danger-soft"
                    : "text-ink hover:bg-slate-100",
                )}
              >
                {item.icon && <item.icon className="size-4 shrink-0" />}
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
