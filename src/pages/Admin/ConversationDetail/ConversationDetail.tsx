import { ArrowLeft, Lock, MessagesSquare } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { conversationApi } from "@/apis/conversation.api";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { formatDateTime } from "@/utils/format";
import MessageBubble from "../components/MessageBubble";

export default function ConversationDetail() {
  const { id = "" } = useParams();

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationApi.getConversationById(id),
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
  });

  const detail = response?.data?.data;

  const back = (
    <Link
      to="/admin/conversations"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4" />
      Back to Conversations
    </Link>
  );

  if (isError && !detail)
    return (
      <div>
        {back}
        <Card>
          <ErrorState
            message={
              (error as Error)?.message || "Failed to load conversation."
            }
            onRetry={() => refetch()}
          />
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      {back}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          {isLoading || !detail ? (
            <Skeleton className="h-10 w-1/2" />
          ) : (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar
                  name={detail.conversation.userName}
                  src={detail.conversation.userAvatarUrl}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-ink">
                    {detail.conversation.title}
                  </h2>
                  <p className="truncate text-xs text-ink-muted">
                    <Link
                      to={`/admin/users/${detail.conversation.userId}`}
                      className="hover:text-primary-700"
                    >
                      {detail.conversation.userName}
                    </Link>
                    {" · "}Started {formatDateTime(detail.conversation.createdAt)}
                  </p>
                </div>
              </div>
              <Badge>
                <Lock className="size-3" />
                Read-only
              </Badge>
            </>
          )}
        </div>

        <div className="space-y-6 bg-canvas px-5 py-6">
          {isLoading || !detail ? (
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton
                key={i}
                className={i % 2 ? "ml-auto h-12 w-2/3" : "h-16 w-3/4"}
              />
            ))
          ) : detail.messages.length === 0 ? (
            <EmptyState
              icon={MessagesSquare}
              title="No messages in this conversation"
            />
          ) : (
            detail.messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                userName={detail.conversation.userName}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line bg-surface px-5 py-3 text-xs text-ink-muted">
          <Lock className="size-3.5 shrink-0" />
          You can review this conversation but can’t send messages on behalf of
          the user.
        </div>
      </Card>
    </div>
  );
}
