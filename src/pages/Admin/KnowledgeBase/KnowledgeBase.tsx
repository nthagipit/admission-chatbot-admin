import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FileX,
  Files,
  AlertTriangle,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import type {
  DocumentQueryConfig,
  KnowledgeDocument,
} from "@/types/document.type";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import type { MenuItem } from "@/components/ui/DropdownMenu/DropdownMenu";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useDebouncedValue } from "@/hooks/useDebounceValue";
import { td, th, tr } from "@/components/ui/Table/TableStyle";
import { getErrorMessage } from "@/utils/api-error";
import { cn } from "@/utils/cn";
import { formatBytes, formatDateTime } from "@/utils/format";
import { documentApi } from "@/apis/document.api";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DropdownMenu from "@/components/ui/DropdownMenu";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import UploadDocumentModal from "../components/UploadDocumentModal";
import StatCard from "../components/StartCard";
import Pagination from "@/components/ui/Pagination";
import { useDocumentQueryConfig } from "@/hooks/useQueryConfig";

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryConfig = useDocumentQueryConfig();
  const [, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(queryConfig.search ?? "");
  const [prevSearchParam, setPrevSearchParam] = useState(queryConfig.search);

  if (prevSearchParam !== queryConfig.search) {
    setPrevSearchParam(queryConfig.search);
    setSearchValue(queryConfig.search ?? "");
  }

  const debouncedSearch = useDebouncedValue(searchValue, 350);

  // Cập nhật URL params khi debounce search thay đổi
  useEffect(() => {
    const currentParam = queryConfig.search ?? "";
    const trimmed = debouncedSearch.trim();
    if (trimmed !== currentParam) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set("search", trimmed);
        } else {
          next.delete("search");
        }
        next.set("page", "1");
        return next;
      });
    }
  }, [debouncedSearch, queryConfig.search, setSearchParams]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<
    KnowledgeDocument[] | null
  >(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // 1. Fetch danh sách tài liệu qua TanStack Query (PagebleData giống User)
  const {
    data: documentsData,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ["documents", queryConfig],
    queryFn: () =>
      documentApi.getAllDocuments(queryConfig as DocumentQueryConfig),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
  });

  // 2. Fetch thống kê tài liệu
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ["document-stats"],
    queryFn: () => documentApi.stats(),
    staleTime: 60 * 1000,
  });

  const stats = statsData ?? {
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  };
  const listData = documentsData?.data?.data;
  const items = listData?.items ?? [];
  const total = Number(listData?.total ?? items.length);
  const page = Number(listData?.page ?? queryConfig.page ?? 1);
  const pageSize = Number(listData?.page_size ?? queryConfig.page_size ?? 10);

  const hasProcessing = items.some((doc) => doc.status === "PROCESSING");
  const filtered = Boolean(
    queryConfig.search ||
    queryConfig.status ||
    queryConfig.file_type ||
    queryConfig.sort,
  );

  // Poll 4s/lần khi còn tài liệu PROCESSING
  useEffect(() => {
    if (!hasProcessing) return;
    const timer = setInterval(() => {
      void refetchDocuments();
      void refetchStats();
    }, 4000);
    return () => clearInterval(timer);
  }, [hasProcessing, refetchDocuments, refetchStats]);

  const reloadAll = () => {
    void refetchDocuments();
    void refetchStats();
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
    setSelected(new Set());
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("status", val);
      else next.delete("status");
      next.set("page", "1");
      return next;
    });
    setSelected(new Set());
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("file_type", val);
      else next.delete("file_type");
      next.set("page", "1");
      return next;
    });
    setSelected(new Set());
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("sort", val);
      else next.delete("sort");
      next.set("page", "1");
      return next;
    });
    setSelected(new Set());
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("status");
      next.delete("file_type");
      next.delete("sort");
      next.set("page", "1");
      return next;
    });
    setSelected(new Set());
  };

  const runAction = async (
    id: string,
    successMessage: string,
    action: () => Promise<unknown>,
  ) => {
    setBusyId(id);
    try {
      await action();
      toast.success(successMessage);
      reloadAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargets) return;
    setDeleting(true);
    try {
      await Promise.all(deleteTargets.map((doc) => documentApi.remove(doc.id)));
      toast.success(
        deleteTargets.length === 1
          ? "Document deleted."
          : `${deleteTargets.length} documents deleted.`,
      );
      setDeleteTargets(null);
      setSelected(new Set());
      reloadAll();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const menuItems = (doc: KnowledgeDocument): MenuItem[] => [
    {
      label: "View details",
      icon: Eye,
      onSelect: () => navigate(`/admin/knowledge-base/${doc.id}`),
    },
    {
      label: "Reprocess",
      icon: RefreshCw,
      disabled: doc.status === "PROCESSING",
      onSelect: () =>
        runAction(doc.id, "Reprocessing started.", () =>
          documentApi.reprocess(doc.id),
        ),
    },
    {
      label: doc.enabled ? "Disable" : "Enable",
      icon: doc.enabled ? PowerOff : Power,
      onSelect: () =>
        runAction(
          doc.id,
          doc.enabled ? "Document disabled." : "Document enabled.",
          () => documentApi.update(doc.id, { enabled: !doc.enabled }),
        ),
    },
    {
      label: "Delete",
      icon: Trash2,
      tone: "danger",
      onSelect: () => setDeleteTargets([doc]),
    },
  ];

  const allSelected =
    items.length > 0 && items.every((doc) => selected.has(doc.id));
  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(items.map((doc) => doc.id)) : new Set());
  const toggleOne = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const deleteDescription =
    deleteTargets?.length === 1
      ? `"${deleteTargets[0].name}" will be removed from the knowledge base and the assistant will stop using it. This cannot be undone.`
      : `${deleteTargets?.length ?? 0} documents will be removed from the knowledge base and the assistant will stop using them. This cannot be undone.`;

  return (
    <div>
      <PageHeader
        description="Manage documents used by the AI admission assistant."
        actions={
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" />
            Upload Document
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Documents"
          value={stats.total}
          icon={Files}
          tone="primary"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Processing"
          value={stats.processing}
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={AlertTriangle}
          tone="danger"
        />
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput
            value={searchValue}
            onChange={(val) => setSearchValue(val)}
            placeholder="Search documents"
            className="w-full sm:w-72"
          />
          <Select
            label="Filter by status"
            value={queryConfig.status ?? ""}
            onChange={handleStatusChange}
            options={[
              { value: "", label: "All statuses" },
              { value: "COMPLETED", label: "Completed" },
              { value: "PROCESSING", label: "Processing" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
          <Select
            label="Filter by file type"
            value={queryConfig.file_type ?? ""}
            onChange={handleFileTypeChange}
            options={[
              { value: "", label: "All file types" },
              { value: "PDF", label: "PDF" },
            ]}
          />
          <Select
            label="Sort by upload date"
            value={queryConfig.sort ?? "newest"}
            onChange={handleSortChange}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between border-t border-line bg-primary-50 px-4 py-2.5">
            <p className="text-sm font-medium text-primary-700">
              {selected.size} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  setDeleteTargets(items.filter((doc) => selected.has(doc.id)))
                }
              >
                <Trash2 className="size-3.5" />
                Delete selected
              </Button>
            </div>
          </div>
        )}

        <div className="border-t border-line">
          {isDocumentsError && items.length === 0 ? (
            <ErrorState
              message={
                (documentsError as Error)?.message ||
                "Failed to load documents."
              }
              onRetry={() => refetchDocuments()}
            />
          ) : isDocumentsLoading && items.length === 0 ? (
            <TableSkeleton rows={6} cols={6} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={filtered ? FileX : FileText}
              title={
                filtered
                  ? "No documents match your filters"
                  : "No documents yet"
              }
              description={
                filtered
                  ? "Try a different search or clear the filters."
                  : "Upload a PDF to start building the assistant's knowledge."
              }
              action={
                filtered ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <Upload className="size-3.5" />
                    Upload Document
                  </Button>
                )
              }
            />
          ) : (
            <div
              className={cn(
                "overflow-x-auto transition-opacity",
                isDocumentsLoading && "opacity-60",
              )}
            >
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr>
                    <th className={`${th} w-10`}>
                      <Checkbox
                        label="Select all documents on this page"
                        checked={allSelected}
                        indeterminate={selected.size > 0 && !allSelected}
                        onChange={toggleAll}
                      />
                    </th>
                    <th className={th}>Document name</th>
                    <th className={th}>File type</th>
                    <th className={th}>File size</th>
                    <th className={th}>Uploaded at</th>
                    <th className={th}>Status</th>
                    <th className={`${th} w-16 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((doc) => (
                    <tr
                      key={doc.id}
                      className={cn(
                        tr,
                        selected.has(doc.id) && "bg-primary-50/50",
                        busyId === doc.id && "opacity-60",
                      )}
                    >
                      <td className={td}>
                        <Checkbox
                          label={`Select ${doc.name}`}
                          checked={selected.has(doc.id)}
                          onChange={(checked) => toggleOne(doc.id, checked)}
                        />
                      </td>
                      <td className={`${td} max-w-sm`}>
                        <Link
                          to={`/admin/knowledge-base/${doc.id}`}
                          className="group flex items-center gap-3"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-slate-100 text-ink-muted">
                            <FileText className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium text-ink group-hover:text-primary-700">
                                {doc.name}
                              </span>
                              {!doc.enabled && (
                                <Badge tone="neutral">Disabled</Badge>
                              )}
                            </div>
                            <span className="truncate text-xs text-ink-muted">
                              {doc.fileName}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className={td}>
                        <Badge tone="neutral">{doc.fileType}</Badge>
                      </td>
                      <td className={`${td} text-ink-muted`}>
                        {formatBytes(doc.fileSize)}
                      </td>
                      <td className={`${td} text-ink-muted whitespace-nowrap`}>
                        {formatDateTime(doc.uploadedAt)}
                      </td>
                      <td className={td}>
                        <StatusBadge
                          status={doc.status}
                          // errorMessage={doc.errorMessage || ""}
                        />
                      </td>
                      <td className={`${td} text-right`}>
                        <DropdownMenu
                          items={menuItems(doc)}
                          label={`Actions for ${doc.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {total > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {uploadOpen && (
        <UploadDocumentModal
          onClose={() => setUploadOpen(false)}
          onUploaded={(doc) => {
            setUploadOpen(false);
            toast.success(`"${doc.name}" uploaded. Processing has started.`);
            reloadAll();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTargets}
        title={
          deleteTargets?.length === 1 ? "Delete document?" : "Delete documents?"
        }
        description={deleteDescription}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargets(null)}
      />
    </div>
  );
}
