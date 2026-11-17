import { useState } from "react";
import { cn } from "@/utils/cn";
import type { DocumentChunk } from "@/types/document.type";
import Badge from "@/components/ui/Badge";

const LONG_TEXT = 220;

export default function ChunkCard({ chunk }: { chunk: DocumentChunk }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = chunk.content.length > LONG_TEXT;

  return (
    <article className="rounded-card border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">Chunk #{chunk.index}</Badge>
        <Badge>Page {chunk.pageNumber}</Badge>
        <h3 className="min-w-0 truncate text-sm font-medium text-ink">
          {chunk.sectionTitle}
        </h3>
      </div>
      <p
        className={cn(
          "mt-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink-muted",
          !expanded && isLong && "line-clamp-3",
        )}
      >
        {chunk.content}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </article>
  );
}
