import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "../Button";
import { cn } from "@/utils/cn";

export default function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-5" />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-ink">
        Couldn’t load this data
      </h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
