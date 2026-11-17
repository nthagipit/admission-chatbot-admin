import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}
interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const iconColor: Record<ToastTone, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-primary-600",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback(
    (id: number) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );
  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 6000 : 4000);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex items-start gap-3 rounded-card border border-line bg-surface p-3.5 shadow-pop"
            >
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", iconColor[toast.tone])}
              />
              <p className="flex-1 text-sm text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="text-ink-muted transition-colors hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
