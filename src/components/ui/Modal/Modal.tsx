import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** false = không đóng được bằng Escape / click nền / nút X (vd. đang submit) */
  dismissible?: boolean;
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
  dismissible = true,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col rounded-card bg-surface shadow-pop focus:outline-none",
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
