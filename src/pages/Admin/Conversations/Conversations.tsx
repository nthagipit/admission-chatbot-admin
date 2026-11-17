import { Eye, MessagesSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { cn } from "@/utils/cn";
import { formatDateTime, formatRelative } from "@/utils/format";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ErrorState from "@/components/ui/ErrorState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { td, th, tr } from "@/components/ui/Table/TableStyle";
import Avatar from "@/components/ui/Avatar";
import { useDebouncedValue } from "@/hooks/useDebounceValue";
import SearchInput from "@/components/ui/SearchInput";
import { conversationApi } from "@/apis/conversation.api";
import Pagination from "@/components/ui/Pagination";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ConversationQueryConfig } from "@/types/conversation.type";
import { useConversationQueryConfig } from "@/hooks/useQueryConfig";

export default function Conversations() {
  const queryConfig = useConversationQueryConfig();
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

  const {
    data: conversationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversations", queryConfig],
    queryFn: () =>
      conversationApi.getAllConversations(
        queryConfig as ConversationQueryConfig,
      ),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
  });

  const listData = conversationsData?.data?.data;
  const items = listData?.items ?? [];
  const filtered = Boolean(queryConfig.search || queryConfig.user_id);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
  };

  const handleRemoveUserFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("user_id");
      next.set("page", "1");
      return next;
    });
  };

  return (
    <div>
      <p className="mb-6 text-sm text-ink-muted">
        Review conversations between students and the admission assistant. This
        view is read-only.
      </p>

      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <SearchInput
            value={searchValue}
            onChange={(v) => setSearchValue(v)}
            placeholder="Search by user or title"
            className="w-full sm:w-80"
          />
          {queryConfig.user_id && (
            <Badge tone="primary" className="h-8 pr-1.5">
              Filtered by user
              <button
                type="button"
                aria-label="Remove user filter"
                className="rounded-full p-0.5 hover:bg-primary-100"
                onClick={handleRemoveUserFilter}
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
        </div>

        <div className="border-t border-line">
          {isError && !listData ? (
            <ErrorState
              message={
                (error as Error)?.message || "Failed to load conversations."
              }
              onRetry={() => refetch()}
            />
          ) : isLoading && !listData ? (
            <TableSkeleton rows={6} cols={6} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title={
                filtered
                  ? "No conversations match your filters"
                  : "No conversations yet"
              }
              description={
                filtered
                  ? "Try a different search term."
                  : "Conversations appear here once students start chatting with the assistant."
              }
            />
          ) : (
            <div
              className={cn(
                "overflow-x-auto transition-opacity",
                isLoading && "opacity-60",
              )}
            >
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr>
                    <th className={th}>User</th>
                    <th className={th}>Conversation title</th>
                    <th className={th}>Total messages</th>
                    <th className={th}>Created at</th>
                    <th className={th}>Last activity</th>
                    <th className={`${th} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className={tr}>
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={c.fullName || "User"}
                            src={c.avatarUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {c.fullName || "User"}
                            </p>
                            <p className="truncate text-xs text-ink-muted">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`${td} max-w-xs`}>
                        <Link
                          to={`/admin/conversations/${c.id}`}
                          className="block truncate font-medium hover:text-primary-700"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className={`${td} tabular-nums`}>
                        {c.totalMessages}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className={`${td} whitespace-nowrap text-ink-muted`}>
                        {formatRelative(c.updatedAt || c.createdAt)}
                      </td>
                      <td className={`${td} text-right`}>
                        <Link to={`/admin/conversations/${c.id}`}>
                          <Button variant="secondary" size="sm">
                            <Eye className="size-3.5" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {listData && listData.total > 0 && (
          <Pagination
            page={Number(listData.page || 1)}
            pageSize={Number(listData.page_size || 10)}
            total={Number(listData.total || 0)}
            onPageChange={handlePageChange}
          />
        )}
      </Card>
    </div>
  );
}
