import {
  AlertTriangle,
  ArrowLeft,
  FileSearch,
  FileText,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { documentApi } from "@/apis/document.api";
import StatusBadge from "@/components/shared/StatusBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/api-error";
import { formatBytes, formatDateTime } from "@/utils/format";
import ChunkCard from "../components/ChunkCard";

const CHUNKS_PER_PAGE = 8;

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

export default function DocumentDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [chunkPage, setChunkPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 1. Fetch thông tin chi tiết tài liệu qua TanStack Query
  const {
    data: documentData,
    isLoading: isDocLoading,
    isError: isDocError,
    error: docError,
    refetch: refetchDoc,
  } = useQuery({
    queryKey: ["document", id],
    queryFn: () => documentApi.get(id),
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
  });

  const d = documentData;
  const status = d?.status;

  // Theo dõi tiến trình xử lý
  useEffect(() => {
    if (status !== "PROCESSING") return;
    const timer = setInterval(() => void refetchDoc(), 3000);
    return () => clearInterval(timer);
  }, [status, refetchDoc]);

  // 2. Fetch chunks theo phân trang qua TanStack Query (PagebleData)
  const {
    data: chunksData,
    isLoading: isChunksLoading,
    isError: isChunksError,
    error: chunksError,
    refetch: refetchChunks,
  } = useQuery({
    queryKey: ["document-chunks", id, chunkPage],
    queryFn: () =>
      documentApi.getChunks(id, { page: chunkPage, page_size: CHUNKS_PER_PAGE }),
    enabled: Boolean(id && status === "COMPLETED"),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
  });

  const chunkList = chunksData?.data?.data;
  const chunkItems = chunkList?.items ?? [];
  const totalChunks = Number(chunkList?.total ?? 0);

  const run = async (message: string, action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      toast.success(message);
      void refetchDoc();
      void refetchChunks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await documentApi.remove(id);
      toast.success("Document deleted.");
      navigate("/admin/knowledge-base", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const back = (
    <Link
      to="/admin/knowledge-base"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4" />
      Back to Knowledge Base
    </Link>
  );

  if (isDocError && !d) {
    return (
      <div>
        {back}
        <Card>
          <ErrorState
            message={(docError as Error)?.message || "Failed to load document."}
            onRetry={() => refetchDoc()}
          />
        </Card>
      </div>
    );
  }

  if (isDocLoading || !d) {
    return (
      <div>
        {back}
        <Card className="p-6">
          <Skeleton className="h-16 w-1/2" />
        </Card>
      </div>
    );
  }

  return (
    <div>
      {back}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-slate-100 text-ink-muted">
              <FileText className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-lg font-semibold text-ink">
                  {d.name}
                </h1>
                <Badge tone="neutral">{d.fileType}</Badge>
                <StatusBadge status={d.status} />
              </div>
              <p className="truncate text-xs text-ink-muted">{d.fileName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() =>
                run(
                  d.enabled ? "Document disabled." : "Document enabled.",
                  () => documentApi.update(id, { enabled: !d.enabled }),
                )
              }
            >
              {d.enabled ? (
                <PowerOff className="size-3.5" />
              ) : (
                <Power className="size-3.5" />
              )}
              {d.enabled ? "Disable" : "Enable"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy || d.status === "PROCESSING"}
              onClick={() =>
                run("Reprocessing started.", () => documentApi.reprocess(id))
              }
            >
              <RefreshCw className="size-3.5" />
              Reprocess
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {d.status === "FAILED" && (
          <div className="mt-4 flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 p-3">
            <AlertTriangle className="size-4 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Processing failed
              </p>
              <p className="mt-0.5 text-sm text-red-800">
                {d.errorMessage ??
                  "No error details were provided by the backend."}
              </p>
            </div>
          </div>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 md:grid-cols-4">
          <Info label="Document name">{d.name}</Info>
          <Info label="File name">{d.fileName}</Info>
          <Info label="File size">{formatBytes(d.fileSize)}</Info>
          <Info label="Upload date">{formatDateTime(d.uploadedAt)}</Info>
          <Info label="Processing status">
            <StatusBadge status={d.status} />
          </Info>
          <Info label="Total pages">{d.totalPages ?? "—"}</Info>
          <Info label="Total chunks">{d.totalChunks ?? "—"}</Info>
          <Info label="Availability">{d.enabled ? "Enabled" : "Disabled"}</Info>
        </dl>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="px-5 pt-5">
            <h2 className="text-sm font-semibold text-ink">Document preview</h2>
          </div>
          <div className="p-5 pt-3">
            {d.previewUrl ? (
              <iframe
                title={`Preview of ${d.name}`}
                src={d.previewUrl}
                className="h-[560px] w-full rounded-control border border-line"
              />
            ) : (
              <EmptyState
                icon={FileSearch}
                title="Preview isn't available"
                description="The backend doesn't provide a preview for this document yet. Review the extracted chunks instead."
                className="py-10"
              />
            )}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-semibold text-ink">Document chunks</h2>
            {d.totalChunks != null && (
              <span className="text-xs text-ink-muted">
                {d.totalChunks} total
              </span>
            )}
          </div>
          <div className="space-y-3 p-5 pt-3">
            {d.status === "PROCESSING" && (
              <EmptyState
                icon={RefreshCw}
                title="Processing in progress"
                description="Chunks appear here once the document has been processed."
                className="py-10"
              />
            )}
            {d.status === "FAILED" && (
              <EmptyState
                icon={FileSearch}
                title="No chunks were created"
                description="Fix the problem above, then reprocess the document."
                className="py-10"
              />
            )}
            {d.status === "COMPLETED" && isChunksError && chunkItems.length === 0 && (
              <ErrorState
                message={
                  (chunksError as Error)?.message || "Failed to load chunks."
                }
                onRetry={() => refetchChunks()}
                className="py-10"
              />
            )}
            {d.status === "COMPLETED" &&
              isChunksLoading &&
              chunkItems.length === 0 &&
              Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            {d.status === "COMPLETED" &&
              !isChunksLoading &&
              chunkItems.length === 0 && (
                <EmptyState
                  icon={FileSearch}
                  title="This document has no chunks"
                  className="py-10"
                />
              )}
            {chunkItems.map((chunk) => (
              <ChunkCard key={chunk.id} chunk={chunk} />
            ))}
          </div>
          {totalChunks > 0 && (
            <Pagination
              page={chunkPage}
              pageSize={CHUNKS_PER_PAGE}
              total={totalChunks}
              onPageChange={setChunkPage}
            />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete document?"
        description={`"${d.name}" will be removed from the knowledge base and the assistant will stop using it. This cannot be undone.`}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
