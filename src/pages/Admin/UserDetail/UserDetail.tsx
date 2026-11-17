import {
  ArrowLeft,
  MessagesSquare,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { conversationApi } from "@/apis/conversation.api";
import { userApi } from "@/apis/user.api";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";
import { formatDateTime } from "@/utils/format";
import { useUserActions } from "../User/useUserActions";

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

export default function UserDetail() {
  const { id = "" } = useParams();

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUserById(id),
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
  });

  const {
    data: conversationsData,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["user-conversations", id],
    queryFn: () =>
      conversationApi.getAllConversations({
        page: 1,
        page_size: 5,
        user_id: id,
      }),
    enabled: Boolean(id),
    staleTime: 3 * 60 * 1000,
  });

  const actions = useUserActions(() => {
    void refetchUser();
  });

  const conversationList = conversationsData?.data?.data;
  const conversationItems = conversationList?.items ?? [];
  const totalConversations = Number(
    conversationList?.total ?? conversationItems.length,
  );

  const back = (
    <Link
      to="/admin/users"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
    >
      <ArrowLeft className="size-4" />
      Back to Users
    </Link>
  );

  if (isUserError && !user) {
    return (
      <div>
        {back}
        <Card>
          <ErrorState
            message={
              (userError as Error)?.message || "Failed to load user profile."
            }
            onRetry={() => refetchUser()}
          />
        </Card>
      </div>
    );
  }

  if (isUserLoading || !user) {
    return (
      <div>
        {back}
        <Card className="p-6">
          <Skeleton className="h-16 w-1/2" />
        </Card>
      </div>
    );
  }

  const self = actions.isSelf(user);
  const isUserAdmin = user.role === "ADMIN";
  const isEnabled = user.enabled !== false;
  const isGoogle = user.authProvider === "GOOGLE";

  return (
    <div>
      {back}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar
              name={user.fullName}
              src={user.avatarUrl}
              className="size-14 text-base"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">
                  {user.fullName}
                </h2>
                <Badge tone={isUserAdmin ? "primary" : "neutral"}>
                  {isUserAdmin ? "Admin" : "User"}
                </Badge>
                <Badge tone={isEnabled ? "success" : "danger"}>
                  {isEnabled ? "Active" : "Disabled"}
                </Badge>
              </div>
              <p className="truncate text-sm text-ink-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={self}
              onClick={() => actions.requestRoleChange(user)}
            >
              <ShieldCheck className="size-3.5" />
              {isUserAdmin ? "Change to user" : "Make administrator"}
            </Button>
            <Button
              variant={isEnabled ? "danger" : "primary"}
              size="sm"
              disabled={self}
              onClick={() => actions.requestToggle(user)}
            >
              {isEnabled ? (
                <UserX className="size-3.5" />
              ) : (
                <UserCheck className="size-3.5" />
              )}
              {isEnabled ? "Disable account" : "Enable account"}
            </Button>
          </div>
        </div>
        {self && (
          <p className="mt-4 text-xs text-ink-muted">
            This is your own account, so its role and status can’t be changed
            here.
          </p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 md:grid-cols-4">
          <Info label="Auth provider">{isGoogle ? "Google" : "Local"}</Info>
          <Info label="Role">{isUserAdmin ? "Administrator" : "User"}</Info>
          <Info label="Created at">{formatDateTime(user.createdAt)}</Info>
          <Info label="Conversations">{totalConversations}</Info>
        </dl>
      </Card>

      <Card className="mt-6">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-ink">
            Recent conversations
          </h2>
          {totalConversations > 0 && (
            <Link
              to={`/admin/conversations?user_id=${user.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          )}
        </div>
        {isConversationsError && conversationItems.length === 0 ? (
          <ErrorState
            message={
              (conversationsError as Error)?.message ||
              "Failed to load user's conversations."
            }
            onRetry={() => refetchConversations()}
            className="py-8"
          />
        ) : isConversationsLoading && conversationItems.length === 0 ? (
          <div className="space-y-3 p-5 pt-0">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : conversationItems.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title="No conversations yet"
            description="This user hasn’t chatted with the assistant."
            className="py-8"
          />
        ) : (
          <ul className="divide-y divide-line">
            {conversationItems.map((c) => {
              return (
                <li key={c.id}>
                  <Link
                    to={`/admin/conversations/${c.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-ink">
                      {c.title || "Untitled Conversation"}
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted">
                      {/* {messagesCount} messages · {formatRelative(dateVal)} */}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {actions.dialogs}
    </div>
  );
}
