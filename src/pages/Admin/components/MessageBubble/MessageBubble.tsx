import { Bot, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui/Avatar";
import type { ChatMessage } from "@/types/conversation";
import { cn } from "@/utils/cn";
import { formatTime } from "@/utils/format";

export function MessageBubble({
  message,
  userName,
}: {
  message: ChatMessage;
  userName: string;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {isUser ? (
        <Avatar name={userName} size="sm" />
      ) : (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white"
          aria-label="Assistant"
        >
          <Bot className="size-4" />
        </span>
      )}
      <div
        className={cn(
          "flex max-w-[78%] flex-col gap-1.5",
          isUser && "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-card px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "rounded-tr-sm bg-primary-600 text-white"
              : "rounded-tl-sm border border-line bg-surface text-ink",
          )}
        >
          {message.content}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <>
            <span className="text-xs text-ink-muted">Sources:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {message.citations.map((c, idx) => {
                const title = c.documentName || c.documentTitle || "Document";
                const content = (
                  <>
                    <FileText className="size-3 shrink-0" />
                    <span className="truncate">{title}</span>
                    <span className="shrink-0 font-medium">
                      · Page {c.pageNumber}
                    </span>
                  </>
                );

                return c.documentId ? (
                  <Link
                    key={`${c.documentId}-${c.pageNumber}-${idx}`}
                    to={`/admin/knowledge-base/${c.documentId}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-slate-50 px-2.5 py-1 text-xs text-ink-muted transition-colors hover:border-primary-500 hover:text-primary-700"
                  >
                    {content}
                  </Link>
                ) : (
                  <span
                    key={`${title}-${c.pageNumber}-${idx}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-slate-50 px-2.5 py-1 text-xs text-ink-muted"
                    title={c.section ? `Section: ${c.section}` : undefined}
                  >
                    {content}
                  </span>
                );
              })}
            </div>
          </>
        )}
        <time dateTime={message.createdAt} className="text-xs text-ink-muted">
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
